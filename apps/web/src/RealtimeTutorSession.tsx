/** Pantalla y ciclo de vida de una práctica de voz WebRTC. */

import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import type { Preferences } from "@speakflow/configuration";
import { Badge, Button } from "@speakflow/design-system";
import {
  Captions,
  Gauge,
  Mic,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
  Waves,
  WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  API_BASE_URL,
  type CompletedSession,
  type SessionSetup,
} from "./appTypes";
import { findScenario, translate } from "./catalog";
import {
  WebRtcRealtimeClient,
  type VoiceConnectionState,
  type VoiceTranscript,
  type VoiceUsage,
} from "./realtimeClient";

/** Etiquetas visibles de la máquina de estados WebRTC. */
const stateLabels: Record<VoiceConnectionState, string> = {
  idle: "Lista",
  "requesting-permission": "Solicitando micrófono",
  connecting: "Conectando",
  listening: "Escuchando",
  processing: "Pensando",
  speaking: "Hablando",
  paused: "En pausa",
  reconnecting: "Reconectando",
  ended: "Finalizada",
  error: "Conexión interrumpida",
};

/** Mensajes seguros y accionables asociados con códigos normalizados de voz. */
const voiceErrorMessages: Record<string, string> = {
  microphone_denied:
    "El navegador no recibió permiso para usar el micrófono. Revisa el permiso del sitio e inténtalo otra vez.",
  microphone_not_found:
    "Windows no informó ningún micrófono disponible. Conecta o habilita un dispositivo de entrada e inténtalo otra vez.",
  microphone_unavailable:
    "El micrófono está ocupado o Windows no pudo iniciarlo. Cierra otras aplicaciones que lo estén usando y vuelve a intentar.",
  microphone_constraints:
    "El micrófono no admite la configuración solicitada. SpeakFlowAI intentó también el modo de compatibilidad básico.",
  microphone_unsupported:
    "Este navegador no permite capturar el micrófono en esta página. Usa Chrome actualizado y revisa los permisos del sitio.",
  not_configured:
    "La voz todavía no tiene una credencial configurada en la API local.",
  session_limit:
    "Alcanzaste el límite temporal de inicios de sesión. Espera unos minutos.",
  connection_lost:
    "La conexión de voz se interrumpió. Puedes intentar reconectarla.",
  session_start_failed:
    "No pudimos iniciar la voz. Comprueba que la API local esté activa.",
  api_unreachable:
    "La página no pudo comunicarse con la API local en el puerto 8000. Comprueba que siga activa y vuelve a intentar.",
  webrtc_initialization_failed:
    "El navegador no pudo preparar la conexión de voz WebRTC. Cierra otras sesiones de voz y vuelve a intentar.",
  webrtc_negotiation_failed:
    "El navegador recibió la sesión, pero no pudo completar la conexión WebRTC. Vuelve a intentarlo en una sesión nueva.",
  data_channel_error:
    "El canal de control de la conversación se interrumpió. Intenta reconectarlo.",
  provider_rate_limit:
    "OpenAI aplicó un límite temporal. Espera un momento antes de reintentar.",
  provider_quota:
    "La cuenta de OpenAI no tiene cuota disponible. Revisa la facturación o los límites de uso.",
  provider_error:
    "OpenAI interrumpió la conversación. Puedes intentar iniciar una sesión nueva.",
  invalid_provider_event:
    "Se recibió una respuesta de voz incompleta. Intenta iniciar una sesión nueva.",
};

/**
 * Pantalla de conversación por voz que posee un `WebRtcRealtimeClient`.
 *
 * Convierte callbacks del adaptador en estado React, fusiona transcripciones
 * parciales, controla tiempo y entrega un `CompletedSession` al terminar.
 */
export function RealtimeTutorSession({
  onComplete,
  onFallback,
  preferences,
  setup,
}: {
  onComplete: (session: CompletedSession) => void;
  onFallback: () => void;
  preferences: Preferences;
  setup: SessionSetup;
}) {
  const scenario = findScenario(setup.scenarioId);
  // Las referencias sobreviven renders sin provocar uno nuevo al cambiar.
  const clientRef = useRef<WebRtcRealtimeClient | null>(null);
  const startedAtRef = useRef(new Date().toISOString());
  const finishedRef = useRef(false);
  const [state, setState] = useState<VoiceConnectionState>("idle");
  const [errorCode, setErrorCode] = useState("");
  const [transcripts, setTranscripts] = useState<VoiceTranscript[]>([]);
  const [usage, setUsage] = useState<VoiceUsage>({
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  });
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(preferences.captionsEnabled);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.min(setup.duration, 15) * 60,
  );

  // Desmontar la pantalla siempre libera micrófono, WebRTC y audio remoto.
  useEffect(
    () => () => {
      clientRef.current?.stop(false);
    },
    [],
  );

  // En móvil nativo, pasar a segundo plano pausa la pista por privacidad.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let disposed = false;
    let removeListener: (() => Promise<void>) | undefined;
    void CapacitorApp.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) clientRef.current?.setPaused(true);
    }).then((handle) => {
      if (disposed) {
        void handle.remove();
      } else {
        removeListener = () => handle.remove();
      }
    });
    return () => {
      disposed = true;
      void removeListener?.();
    };
  }, []);

  /** Acumula deltas del tutor y reemplaza cada turno cuando llega su versión final. */
  const upsertTranscript = (next: VoiceTranscript) => {
    setTranscripts((current) => {
      const existing = current.find((item) => item.id === next.id);
      if (!existing) return [...current, next];
      return current.map((item) =>
        item.id === next.id
          ? {
              ...next,
              text: next.final ? next.text : `${item.text}${next.text}`,
            }
          : item,
      );
    });
  };

  /** Crea un cliente nuevo y conecta sus cuatro canales de eventos con React. */
  const start = () => {
    setErrorCode("");
    const client = new WebRtcRealtimeClient(
      {
        onError: (code) => setErrorCode(code),
        onStateChange: (nextState) => {
          setState(nextState);
          if (nextState !== "error") setErrorCode("");
        },
        onTranscript: upsertTranscript,
        onUsage: setUsage,
      },
      API_BASE_URL,
    );
    clientRef.current = client;
    void client.start({
      scenarioId: setup.scenarioId,
      speakingSpeed: preferences.speakingSpeed,
      voiceId: preferences.tutorVoiceId,
    });
  };

  /** Cierra una sola vez y transforma transcripciones finales en turnos persistibles. */
  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clientRef.current?.stop();
    onComplete({
      setup,
      startedAtUtc: startedAtRef.current,
      endedAtUtc: new Date().toISOString(),
      turns: transcripts
        .filter((item) => item.final && item.text.trim())
        .map((item) => ({ speaker: item.speaker, text: item.text.trim() })),
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });
  }, [onComplete, setup, transcripts, usage.inputTokens, usage.outputTokens]);

  // El reloj solo avanza mientras la conversación está activa y finaliza en cero.
  useEffect(() => {
    if (!["listening", "processing", "speaking"].includes(state)) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          finish();
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finish, state]);

  return (
    <section className="session" aria-labelledby="voice-session-title">
      <header className="session__header">
        <div>
          <p className="eyebrow">Tutor de voz · WebRTC</p>
          <h1 id="voice-session-title">{translate(scenario.titleKey)}</h1>
        </div>
        <div className="session__status">
          <Badge tone={state === "error" ? "danger" : "active"}>
            {stateLabels[state]}
          </Badge>
          <span aria-label="Tiempo restante">
            {Math.floor(remainingSeconds / 60)}:
            {String(remainingSeconds % 60).padStart(2, "0")}
          </span>
        </div>
      </header>

      <div className="session__stage">
        <div aria-hidden="true" className={`voice-orb voice-orb--${state}`}>
          {state === "error" ? (
            <WifiOff size={48} strokeWidth={1.5} />
          ) : (
            <Waves size={52} strokeWidth={1.5} />
          )}
        </div>
        {state === "idle" ? (
          <>
            <p>
              Activa el micrófono cuando estés listo. El audio viaja por WebRTC
              y la clave de OpenAI permanece en el backend.
            </p>
            <Button onClick={start} size="large">
              <Mic aria-hidden="true" size={19} />
              Activar micrófono
            </Button>
          </>
        ) : (
          <p>{stateLabels[state]}…</p>
        )}
      </div>

      {errorCode && (
        <div className="voice-error" role="alert">
          <WifiOff aria-hidden="true" size={22} />
          <div>
            <strong>No se pudo mantener la sesión de voz</strong>
            <p>
              {voiceErrorMessages[errorCode] ??
                "Ocurrió un error recuperable en la sesión."}
            </p>
          </div>
          <div className="voice-error__actions">
            <Button
              onClick={() => void clientRef.current?.reconnect()}
              variant="secondary"
            >
              <RefreshCw aria-hidden="true" size={17} />
              Reintentar
            </Button>
            <Button onClick={onFallback} variant="ghost">
              Usar demo local
            </Button>
          </div>
        </div>
      )}

      {captions && (
        <ol className="transcript" aria-label="Subtítulos de la conversación">
          {transcripts.length === 0 && (
            <li className="transcript__empty">
              Los subtítulos aparecerán cuando empiece la conversación.
            </li>
          )}
          {transcripts.map((transcript) => (
            <li
              className={`turn turn--${transcript.speaker}`}
              key={transcript.id}
            >
              <strong>{transcript.speaker === "tutor" ? "Tutor" : "Tú"}</strong>
              <span>{transcript.text}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="session-controls" aria-label="Controles de sesión">
        <button
          aria-label={state === "paused" ? "Reanudar" : "Pausar"}
          disabled={["idle", "connecting", "error"].includes(state)}
          onClick={() => {
            const paused = state !== "paused";
            clientRef.current?.setPaused(paused);
          }}
          type="button"
        >
          {state === "paused" ? <Play /> : <Pause />}
          <span>{state === "paused" ? "Reanudar" : "Pausar"}</span>
        </button>
        <button
          aria-pressed={muted}
          onClick={() => {
            const next = !muted;
            setMuted(next);
            clientRef.current?.setMuted(next);
          }}
          type="button"
        >
          {muted ? <VolumeX /> : <Volume2 />}
          <span>{muted ? "Activar" : "Silenciar"}</span>
        </button>
        <button
          onClick={() => clientRef.current?.requestRepeat()}
          type="button"
        >
          <RotateCcw />
          <span>Repetir</span>
        </button>
        <button
          onClick={() => clientRef.current?.requestSlowerSpeech()}
          type="button"
        >
          <Gauge />
          <span>Más lento</span>
        </button>
        <button
          aria-pressed={captions}
          onClick={() => setCaptions((current) => !current)}
          type="button"
        >
          <Captions />
          <span>Subtítulos</span>
        </button>
        <button
          className="session-controls__end"
          onClick={finish}
          type="button"
        >
          <Square />
          <span>Terminar</span>
        </button>
      </div>
      <p className="usage-note">
        Límite: {Math.min(setup.duration, 15)} min · Salida acotada por turno ·
        Uso reportado: {usage.totalTokens} tokens
      </p>
    </section>
  );
}
