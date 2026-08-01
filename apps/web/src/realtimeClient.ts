/**
 * Adaptador WebRTC que traduce la interfaz del navegador a eventos simples de React.
 *
 * Este módulo controla micrófono, negociación SDP, audio remoto, canal de datos,
 * reconexión y normalización de errores. Nunca recibe la clave de OpenAI.
 */

/** Estados observables de una sesión de voz desde antes del permiso hasta su cierre. */
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

/** Fragmento o transcripción final que la interfaz muestra como un turno. */
export interface VoiceTranscript {
  id: string;
  speaker: "learner" | "tutor";
  text: string;
  final: boolean;
}

/** Uso acumulado reportado por el proveedor para visibilidad de coste. */
export interface VoiceUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/** Funciones con las que el adaptador comunica cambios sin depender de React. */
export interface RealtimeCallbacks {
  onError: (code: string) => void;
  onStateChange: (state: VoiceConnectionState) => void;
  onTranscript: (transcript: VoiceTranscript) => void;
  onUsage: (usage: VoiceUsage) => void;
}

/** Preferencias necesarias para construir una nueva sesión de voz. */
export interface RealtimeStartOptions {
  scenarioId: string;
  speakingSpeed: "slow" | "normal" | "fast";
  voiceId: string;
}

/** Etapa de arranque usada para convertir excepciones en mensajes accionables. */
export type RealtimeStartStage =
  "microphone" | "webrtc-initialization" | "api-request" | "webrtc-negotiation";

// Errores deliberados del cliente que pueden atravesar un bloque `catch` sin perder categoría.
const KNOWN_START_ERROR_CODES = new Set([
  "missing_sdp",
  "not_configured",
  "session_limit",
  "session_start_failed",
]);

// Alfabetos no compatibles con una práctica cuyo objetivo explícito es inglés.
const NON_ENGLISH_SCRIPT_PATTERNS = [
  /\p{Script=Arabic}/u,
  /\p{Script=Cyrillic}/u,
  /\p{Script=Devanagari}/u,
  /\p{Script=Han}/u,
  /\p{Script=Hangul}/u,
  /\p{Script=Hebrew}/u,
  /\p{Script=Hiragana}/u,
  /\p{Script=Katakana}/u,
  /\p{Script=Thai}/u,
];

/**
 * Limpia la transcripción del alumno y oculta alfabetos incompatibles con inglés.
 *
 * @param transcript Texto asíncrono entregado por el proveedor.
 * @returns Texto recortado o una indicación segura para repetir el turno.
 */
export function normalizeLearnerTranscript(transcript: string): string {
  const normalized = transcript.trim();
  if (
    !NON_ENGLISH_SCRIPT_PATTERNS.some((pattern) => pattern.test(normalized))
  ) {
    return normalized;
  }
  return "No pude transcribir este turno en inglés. Inténtalo otra vez.";
}

/** Lee una propiedad textual de una excepción desconocida sin forzar un cast inseguro. */
function errorProperty(error: unknown, property: "message" | "name"): string {
  if (!error || typeof error !== "object" || !(property in error)) return "";
  const value = (error as Record<string, unknown>)[property];
  return typeof value === "string" ? value : "";
}

/** Indica si restricciones avanzadas de audio fallaron y conviene intentar audio básico. */
export function shouldRetryBasicMicrophone(error: unknown): boolean {
  return ["OverconstrainedError", "ConstraintNotSatisfiedError"].includes(
    errorProperty(error, "name"),
  );
}

/**
 * Convierte una excepción de arranque en un código estable para la interfaz.
 *
 * La etapa permite distinguir, por ejemplo, una API inalcanzable de una oferta
 * WebRTC inválida aunque ambas puedan originarse como `TypeError` del navegador.
 */
export function normalizeRealtimeStartError(
  error: unknown,
  stage: RealtimeStartStage,
): string {
  const errorName = errorProperty(error, "name");
  const errorMessage = errorProperty(error, "message");

  if (KNOWN_START_ERROR_CODES.has(errorMessage)) {
    return errorMessage === "missing_sdp"
      ? "webrtc_initialization_failed"
      : errorMessage;
  }

  if (stage === "microphone") {
    if (
      ["NotAllowedError", "SecurityError", "PermissionDeniedError"].includes(
        errorName,
      )
    ) {
      return "microphone_denied";
    }
    if (["NotFoundError", "DevicesNotFoundError"].includes(errorName)) {
      return "microphone_not_found";
    }
    if (shouldRetryBasicMicrophone(error)) return "microphone_constraints";
    if (
      ["NotReadableError", "TrackStartError", "AbortError"].includes(errorName)
    ) {
      return "microphone_unavailable";
    }
    return "microphone_unsupported";
  }

  if (stage === "api-request") return "api_unreachable";
  if (stage === "webrtc-negotiation") return "webrtc_negotiation_failed";
  return "webrtc_initialization_failed";
}

/**
 * Invoca una implementación de `fetch` con el receptor global exigido por Chrome.
 *
 * Guardar `window.fetch` como propiedad y llamarlo con otro `this` produce
 * `Illegal invocation`; esta función centraliza la corrección.
 */
export function fetchWithBrowserContext(
  fetcher: typeof fetch,
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return fetcher.call(globalThis, input, init);
}

/** Subconjunto tolerante del protocolo de eventos que consume este cliente. */
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

/** Reduce detalles del proveedor a categorías seguras que la UI sabe presentar. */
export function normalizeRealtimeError(
  error?: RealtimeServerEvent["error"],
): string {
  const providerCode =
    `${error?.code ?? ""} ${error?.type ?? ""}`.toLowerCase();
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

/**
 * Traduce un evento del canal de datos a una única actualización de aplicación.
 *
 * Eventos desconocidos producen un objeto vacío. Esto permite que OpenAI añada
 * eventos sin romper clientes anteriores.
 */
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
          text: normalizeLearnerTranscript(event.transcript ?? ""),
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

/**
 * Cliente de una sesión Realtime WebRTC completa.
 *
 * La clase posee recursos del navegador y por eso debe cerrarse con `stop`.
 * Notifica estado, transcripción, uso y errores mediante callbacks inyectados.
 */
export class WebRtcRealtimeClient {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private localStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private options: RealtimeStartOptions | null = null;
  private muted = false;
  private paused = false;
  private disconnectTimer: number | null = null;

  /**
   * Crea el cliente sin pedir todavía permiso de micrófono.
   *
   * @param callbacks Destino de los eventos interpretados.
   * @param apiBaseUrl Backend que media la negociación SDP.
   * @param fetcher Transporte inyectable para pruebas.
   * @param disconnectGraceMs Espera antes de declarar una desconexión transitoria.
   */
  constructor(
    private readonly callbacks: RealtimeCallbacks,
    private readonly apiBaseUrl = "http://127.0.0.1:8000",
    private readonly fetcher: typeof fetch = fetch,
    private readonly disconnectGraceMs = 4_000,
  ) {}

  /**
   * Solicita micrófono, crea WebRTC y negocia la sesión mediante FastAPI.
   *
   * Los fallos se notifican por callback y se limpian todos los recursos parciales;
   * la promesa no propaga detalles sensibles a React.
   */
  async start(options: RealtimeStartOptions): Promise<void> {
    this.options = options;
    this.callbacks.onStateChange("requesting-permission");
    let stage: RealtimeStartStage = "microphone";
    try {
      this.localStream = await this.requestMicrophone();
      this.callbacks.onStateChange("connecting");
      stage = "webrtc-initialization";
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
      stage = "api-request";
      const response = await fetchWithBrowserContext(
        this.fetcher,
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
      stage = "webrtc-negotiation";
      await peerConnection.setRemoteDescription({
        type: "answer",
        sdp: await response.text(),
      });
    } catch (error) {
      this.stop();
      this.reportError(normalizeRealtimeStartError(error, stage));
    }
  }

  /** Cierra recursos actuales e inicia otra conexión con las últimas opciones. */
  async reconnect(): Promise<void> {
    if (!this.options) return;
    const options = this.options;
    this.callbacks.onStateChange("reconnecting");
    this.stop(false);
    await this.start(options);
  }

  /** Habilita o deshabilita la pista de entrada sin terminar la sesión. */
  setPaused(paused: boolean): void {
    this.paused = paused;
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !paused;
    });
    this.callbacks.onStateChange(paused ? "paused" : "listening");
  }

  /** Silencia únicamente el audio remoto que reproduce el elemento HTML. */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.audioElement) this.audioElement.muted = muted;
  }

  /** Pide al tutor repetir su último mensaje con menor velocidad. */
  requestRepeat(): void {
    this.send({
      type: "response.create",
      response: {
        instructions:
          "Repeat your previous message once, a little more slowly, without adding new information.",
      },
    });
  }

  /** Actualiza la velocidad de salida del proveedor para respuestas posteriores. */
  requestSlowerSpeech(): void {
    this.send({
      type: "session.update",
      session: {
        type: "realtime",
        audio: { output: { speed: 0.85 } },
      },
    });
  }

  /**
   * Libera canal, conexión, pistas y elemento de audio.
   *
   * @param notify Controla si también debe publicarse el estado `ended`.
   */
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

  /** Analiza un mensaje JSON del canal y distribuye sus posibles resultados. */
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

  /**
   * Solicita audio con mejoras y reintenta una vez con restricciones básicas.
   *
   * @throws DOMException si no hay soporte, permiso o dispositivo utilizable.
   */
  private async requestMicrophone(): Promise<MediaStream> {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new DOMException(
        "Microphone capture is unavailable",
        "NotSupportedError",
      );
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
    } catch (error) {
      if (!shouldRetryBasicMicrophone(error)) throw error;
      return navigator.mediaDevices.getUserMedia({ audio: true });
    }
  }

  /** Aplica una gracia a `disconnected` y falla inmediatamente ante `failed`. */
  private handleConnectionStateChange(peerConnection: RTCPeerConnection): void {
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

  /** Cancela la detección diferida de desconexión si sigue pendiente. */
  private clearDisconnectTimer(): void {
    if (this.disconnectTimer === null) return;
    window.clearTimeout(this.disconnectTimer);
    this.disconnectTimer = null;
  }

  /** Publica un error controlado después de cancelar recuperaciones pendientes. */
  private reportError(code: string): void {
    this.clearDisconnectTimer();
    this.callbacks.onStateChange("error");
    this.callbacks.onError(code);
  }

  /** Envía un evento solo cuando el canal de control está abierto. */
  private send(event: object): void {
    if (this.dataChannel?.readyState === "open") {
      this.dataChannel.send(JSON.stringify(event));
    }
  }
}
