/** Pantalla de práctica determinista disponible sin voz ni red. */

import type { Preferences } from "@speakflow/configuration";
import { Badge, Button } from "@speakflow/design-system";
import {
  Captions,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Send,
  Square,
  Volume2,
  VolumeX,
  Waves,
} from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import type { CompletedSession, SessionSetup } from "./appTypes";
import { findScenario, translate } from "./catalog";
import { ConversationTranscript } from "./ConversationTranscript";
import { openingFor, replyFor, type TutorTurn } from "./deterministicTutor";

/**
 * Alternativa determinista de práctica que funciona sin micrófono ni API de voz.
 *
 * El alumno escribe como si hablara. Cada envío añade su turno y una respuesta
 * predecible, lo que hace posible enseñar y probar el flujo completo offline.
 */
export function TutorSession({
  onComplete,
  preferences,
  setup,
}: {
  onComplete: (session: CompletedSession) => void;
  preferences: Preferences;
  setup: SessionSetup;
}) {
  const scenario = findScenario(setup.scenarioId);
  const startedAtRef = useRef(new Date().toISOString());
  const [status, setStatus] = useState<"active" | "paused" | "processing">(
    "active",
  );
  const [turns, setTurns] = useState<TutorTurn[]>([openingFor(scenario)]);
  const [message, setMessage] = useState("");
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(preferences.captionsEnabled);

  /** Añade un turno no vacío y programa la respuesta local del tutor. */
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || status !== "active") return;
    const learnerCount =
      turns.filter((turn) => turn.speaker === "learner").length + 1;
    setTurns((current) => [
      ...current,
      { id: learnerCount * 2 - 1, speaker: "learner", text },
    ]);
    setMessage("");
    setStatus("processing");
    window.setTimeout(() => {
      setTurns((current) => [...current, replyFor(scenario, learnerCount)]);
      setStatus("active");
    }, 250);
  };

  return (
    <section className="session" aria-labelledby="session-title">
      <header className="session__header">
        <div>
          <p className="eyebrow">Tutor local determinista</p>
          <h1 id="session-title">{translate(scenario.titleKey)}</h1>
        </div>
        <Badge tone={status === "processing" ? "warning" : "success"}>
          {status === "processing"
            ? "Pensando"
            : status === "paused"
              ? "En pausa"
              : "En sesión"}
        </Badge>
      </header>

      <div className="session__stage">
        <div aria-hidden="true" className={`voice-orb voice-orb--${status}`}>
          <Waves size={52} strokeWidth={1.5} />
        </div>
        <p>
          {status === "processing"
            ? "Preparando una respuesta consistente…"
            : status === "paused"
              ? "La práctica está en pausa."
              : "Escribe en inglés como si estuvieras hablando."}
        </p>
      </div>

      {captions && (
        <ConversationTranscript
          label="Transcripción de la conversación"
          turns={turns}
        />
      )}

      <form className="utterance-form" onSubmit={submit}>
        <label className="field">
          <span>Tu respuesta en inglés</span>
          <textarea
            disabled={status !== "active"}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Type what you would say…"
            rows={3}
            value={message}
          />
        </label>
        <Button disabled={!message.trim() || status !== "active"} type="submit">
          <Send aria-hidden="true" size={18} />
          Enviar respuesta
        </Button>
      </form>

      <div className="session-controls" aria-label="Controles de sesión">
        <button
          aria-label={status === "paused" ? "Reanudar" : "Pausar"}
          onClick={() =>
            setStatus((current) => (current === "paused" ? "active" : "paused"))
          }
          type="button"
        >
          {status === "paused" ? <Play /> : <Pause />}
          <span>{status === "paused" ? "Reanudar" : "Pausar"}</span>
        </button>
        <button
          aria-pressed={muted}
          onClick={() => setMuted((current) => !current)}
          type="button"
        >
          {muted ? <VolumeX /> : <Volume2 />}
          <span>{muted ? "Activar" : "Silenciar"}</span>
        </button>
        <button
          onClick={() => {
            const lastTutorTurn = [...turns]
              .reverse()
              .find((turn) => turn.speaker === "tutor");
            if (lastTutorTurn) {
              setTurns((current) => [
                ...current,
                { ...lastTutorTurn, id: current.length + 100 },
              ]);
            }
          }}
          type="button"
        >
          <RotateCcw />
          <span>Repetir</span>
        </button>
        <button type="button">
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
          onClick={() =>
            onComplete({
              setup,
              startedAtUtc: startedAtRef.current,
              endedAtUtc: new Date().toISOString(),
              turns: turns.map(({ speaker, text }) => ({ speaker, text })),
              inputTokens: 0,
              outputTokens: 0,
            })
          }
          type="button"
        >
          <Square />
          <span>Terminar</span>
        </button>
      </div>
    </section>
  );
}
