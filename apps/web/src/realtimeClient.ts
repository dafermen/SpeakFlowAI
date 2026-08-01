export type VoiceConnectionState =
  | "idle"
  | "requesting-permission"
  | "connecting"
  | "listening"
  | "processing"
  | "speaking"
  | "paused"
  | "reconnecting"
  | "ended"
  | "error";

export interface VoiceTranscript {
  id: string;
  speaker: "learner" | "tutor";
  text: string;
  final: boolean;
}

export interface VoiceUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface RealtimeCallbacks {
  onError: (code: string) => void;
  onStateChange: (state: VoiceConnectionState) => void;
  onTranscript: (transcript: VoiceTranscript) => void;
  onUsage: (usage: VoiceUsage) => void;
}

export interface RealtimeStartOptions {
  scenarioId: string;
  speakingSpeed: "slow" | "normal" | "fast";
  voiceId: string;
}

interface RealtimeServerEvent {
  type?: string;
  item_id?: string;
  response_id?: string;
  delta?: string;
  transcript?: string;
  error?: { code?: string; type?: string };
  response?: {
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      total_tokens?: number;
    };
  };
}

export function normalizeRealtimeError(
  error?: RealtimeServerEvent["error"],
): string {
  const providerCode = `${error?.code ?? ""} ${error?.type ?? ""}`.toLowerCase();
  if (providerCode.includes("rate_limit")) return "provider_rate_limit";
  if (
    providerCode.includes("quota") ||
    providerCode.includes("billing") ||
    providerCode.includes("insufficient")
  ) {
    return "provider_quota";
  }
  if (
    providerCode.includes("session_expired") ||
    providerCode.includes("session_closed")
  ) {
    return "connection_lost";
  }
  return "provider_error";
}

export function interpretRealtimeEvent(event: RealtimeServerEvent): {
  state?: VoiceConnectionState;
  transcript?: VoiceTranscript;
  usage?: VoiceUsage;
  error?: string;
} {
  switch (event.type) {
    case "input_audio_buffer.speech_started":
      return { state: "listening" };
    case "input_audio_buffer.speech_stopped":
      return { state: "processing" };
    case "output_audio_buffer.started":
      return { state: "speaking" };
    case "output_audio_buffer.stopped":
      return { state: "listening" };
    case "conversation.item.input_audio_transcription.completed":
      return {
        transcript: {
          id: event.item_id ?? crypto.randomUUID(),
          speaker: "learner",
          text: event.transcript ?? "",
          final: true,
        },
      };
    case "response.output_audio_transcript.delta":
    case "response.audio_transcript.delta":
      return {
        transcript: {
          id: event.response_id ?? "tutor-current",
          speaker: "tutor",
          text: event.delta ?? "",
          final: false,
        },
      };
    case "response.output_audio_transcript.done":
    case "response.audio_transcript.done":
      return {
        transcript: {
          id: event.response_id ?? "tutor-current",
          speaker: "tutor",
          text: event.transcript ?? "",
          final: true,
        },
      };
    case "response.done": {
      const usage = event.response?.usage;
      if (!usage) return {};
      return {
        usage: {
          inputTokens: usage.input_tokens ?? 0,
          outputTokens: usage.output_tokens ?? 0,
          totalTokens: usage.total_tokens ?? 0,
        },
      };
    }
    case "error":
      return { error: normalizeRealtimeError(event.error) };
    default:
      return {};
  }
}

export class WebRtcRealtimeClient {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private options: RealtimeStartOptions | null = null;
  private muted = false;
  private paused = false;
  private disconnectTimer: number | null = null;

  constructor(
    private readonly callbacks: RealtimeCallbacks,
    private readonly apiBaseUrl = "http://127.0.0.1:8000",
    private readonly fetcher: typeof fetch = fetch,
    private readonly disconnectGraceMs = 4_000,
  ) {}

  async start(options: RealtimeStartOptions): Promise<void> {
    this.options = options;
    this.callbacks.onStateChange("requesting-permission");
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      this.callbacks.onStateChange("connecting");
      const peerConnection = new RTCPeerConnection();
      this.peerConnection = peerConnection;

      const audioElement = document.createElement("audio");
      audioElement.autoplay = true;
      audioElement.setAttribute("playsinline", "");
      audioElement.muted = this.muted;
      this.audioElement = audioElement;
      peerConnection.ontrack = (event) => {
        audioElement.srcObject = event.streams[0] ?? null;
      };
      peerConnection.onconnectionstatechange = () => {
        this.handleConnectionStateChange(peerConnection);
      };
      this.localStream
        .getAudioTracks()
        .forEach((track) => peerConnection.addTrack(track, this.localStream!));

      const dataChannel = peerConnection.createDataChannel("oai-events");
      this.dataChannel = dataChannel;
      dataChannel.addEventListener("open", () => {
        this.clearDisconnectTimer();
        this.callbacks.onStateChange("listening");
      });
      dataChannel.addEventListener("message", (message) => {
        this.handleMessage(String(message.data));
      });
      dataChannel.addEventListener("error", () => {
        this.reportError("data_channel_error");
      });

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      if (!offer.sdp) throw new Error("missing_sdp");
      const query = new URLSearchParams({
        scenario_id: options.scenarioId,
        speaking_speed: options.speakingSpeed,
        voice_id: options.voiceId,
      });
      const response = await this.fetcher(
        `${this.apiBaseUrl}/api/v1/realtime/session?${query}`,
        {
          method: "POST",
          body: offer.sdp,
          headers: { "Content-Type": "application/sdp" },
        },
      );
      if (!response.ok) {
        const code =
          response.status === 503
            ? "not_configured"
            : response.status === 429
              ? "session_limit"
              : "session_start_failed";
        throw new Error(code);
      }
      await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: await response.text(),
      });
    } catch (error) {
      this.stop();
      const code =
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "microphone_denied"
          : error instanceof Error
            ? error.message
            : "session_start_failed";
      this.reportError(code);
    }
  }

  async reconnect(): Promise<void> {
    if (!this.options) return;
    const options = this.options;
    this.callbacks.onStateChange("reconnecting");
    this.stop(false);
    await this.start(options);
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !paused;
    });
    this.callbacks.onStateChange(paused ? "paused" : "listening");
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.audioElement) this.audioElement.muted = muted;
  }

  requestRepeat(): void {
    this.send({
      type: "response.create",
      response: {
        instructions:
          "Repeat your previous message once, a little more slowly, without adding new information.",
      },
    });
  }

  requestSlowerSpeech(): void {
    this.send({
      type: "session.update",
      session: {
        type: "realtime",
        audio: { output: { speed: 0.85 } },
      },
    });
  }

  stop(notify = true): void {
    this.clearDisconnectTimer();
    this.dataChannel?.close();
    this.peerConnection?.close();
    this.localStream?.getTracks().forEach((track) => track.stop());
    this.dataChannel = null;
    this.peerConnection = null;
    this.localStream = null;
    if (this.audioElement) this.audioElement.srcObject = null;
    this.audioElement = null;
    if (notify) this.callbacks.onStateChange("ended");
  }

  private handleMessage(serialized: string): void {
    let event: RealtimeServerEvent;
    try {
      event = JSON.parse(serialized) as RealtimeServerEvent;
    } catch {
      this.reportError("invalid_provider_event");
      return;
    }
    const interpreted = interpretRealtimeEvent(event);
    if (interpreted.state) this.callbacks.onStateChange(interpreted.state);
    if (interpreted.transcript)
      this.callbacks.onTranscript(interpreted.transcript);
    if (interpreted.usage) this.callbacks.onUsage(interpreted.usage);
    if (interpreted.error) this.reportError(interpreted.error);
  }

  private handleConnectionStateChange(
    peerConnection: RTCPeerConnection,
  ): void {
    if (this.paused || this.peerConnection !== peerConnection) return;

    if (peerConnection.connectionState === "failed") {
      this.reportError("connection_lost");
      return;
    }

    if (peerConnection.connectionState === "disconnected") {
      if (this.disconnectTimer !== null) return;
      this.disconnectTimer = window.setTimeout(() => {
        this.disconnectTimer = null;
        if (
          !this.paused &&
          this.peerConnection === peerConnection &&
          peerConnection.connectionState === "disconnected"
        ) {
          this.reportError("connection_lost");
        }
      }, this.disconnectGraceMs);
      return;
    }

    this.clearDisconnectTimer();
  }

  private clearDisconnectTimer(): void {
    if (this.disconnectTimer === null) return;
    window.clearTimeout(this.disconnectTimer);
    this.disconnectTimer = null;
  }

  private reportError(code: string): void {
    this.clearDisconnectTimer();
    this.callbacks.onStateChange("error");
    this.callbacks.onError(code);
  }

  private send(event: object): void {
    if (this.dataChannel?.readyState === "open") {
      this.dataChannel.send(JSON.stringify(event));
    }
  }
}
