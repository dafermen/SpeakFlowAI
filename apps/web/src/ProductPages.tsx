/** Pantallas de descubrimiento y preparación anteriores a una sesión. */

import type { LearnerProgress } from "@speakflow/api-client";
import type { Preferences } from "@speakflow/configuration";
import { Badge, Button, Card } from "@speakflow/design-system";
import {
  ArrowLeft,
  ChevronRight,
  Mic,
  Sparkles,
  TrendingUp,
  Waves,
} from "lucide-react";
import { useState } from "react";

import type { SessionSetup } from "./appTypes";
import {
  modeIcons,
  modes,
  scenarios,
  translate,
  findScenario,
} from "./catalog";
import { SummaryItem } from "./sharedComponents";

/** Inicio personalizado con práctica recomendada y resumen de progreso. */
export function Home({
  displayName,
  onStart,
  progress,
}: {
  displayName: string;
  onStart: () => void;
  progress: LearnerProgress | null;
}) {
  const recommended = scenarios[0]!;
  return (
    <div className="page-stack">
      <section className="home-hero">
        <div>
          <p className="eyebrow">Tu siguiente paso</p>
          <h1>
            {displayName ? `Hola, ${displayName}.` : "Hola."} Hablemos en
            inglés.
          </h1>
          <p>
            Una práctica corta y enfocada vale más que esperar el momento
            perfecto.
          </p>
          <Button onClick={onStart} size="large">
            <Mic aria-hidden="true" size={20} />
            Iniciar práctica
          </Button>
        </div>
        <div className="home-hero__orb" aria-hidden="true">
          <Waves size={56} strokeWidth={1.5} />
        </div>
      </section>

      <section aria-labelledby="recommended-title">
        <div className="section-heading section-heading--row">
          <div>
            <p className="eyebrow">Recomendado</p>
            <h2 id="recommended-title">{translate(recommended.titleKey)}</h2>
          </div>
          <Badge tone="active">{recommended.durationMinutes} min</Badge>
        </div>
        <Card className="recommended-card">
          <div>
            <h3>Objetivo de hoy</h3>
            <p>{translate(recommended.objectiveKey)}</p>
          </div>
          <Button onClick={onStart} variant="secondary">
            Preparar sesión
            <ChevronRight aria-hidden="true" size={18} />
          </Button>
        </Card>
      </section>

      <section className="empty-progress" aria-labelledby="progress-title">
        <TrendingUp aria-hidden="true" size={28} />
        <div>
          <h2 id="progress-title">
            {progress?.total_sessions
              ? `${progress.total_sessions} sesiones · ${progress.total_minutes} minutos practicados`
              : "Tu progreso empieza con la primera conversación"}
          </h2>
          <p>
            {progress?.total_sessions
              ? `Ya completaste ${progress.learner_turns} intervenciones en inglés.`
              : "Completa una práctica y aquí aparecerá tu avance."}
          </p>
        </div>
      </section>
    </div>
  );
}

/** Catálogo local que enlaza cada modo con su escenario publicado. */
export function Catalog({
  onSelect,
}: {
  onSelect: (modeId: string, scenarioId: string) => void;
}) {
  return (
    <section className="page-stack" aria-labelledby="catalog-title">
      <div className="section-heading">
        <p className="eyebrow">Biblioteca local</p>
        <h1 id="catalog-title">Elige cómo quieres practicar.</h1>
        <p>Cuatro situaciones breves, validadas y disponibles sin conexión.</p>
      </div>
      <div className="mode-grid">
        {modes.map((mode) => {
          const scenario = scenarios.find((item) => item.modeId === mode.id)!;
          return (
            <Card className="mode-card" key={mode.id}>
              <span aria-hidden="true" className="mode-card__icon">
                {modeIcons[mode.icon]}
              </span>
              <div>
                <div className="mode-card__title">
                  <h2>{translate(mode.titleKey)}</h2>
                  {mode.recommended && (
                    <Badge tone="success">Recomendado</Badge>
                  )}
                </div>
                <p>{translate(mode.summaryKey)}</p>
                <h3>{translate(scenario.titleKey)}</h3>
                <p>{translate(scenario.summaryKey)}</p>
              </div>
              <Button onClick={() => onSelect(mode.id, scenario.id)}>
                Elegir práctica
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

/** Pantalla que elige dificultad, duración y proveedor antes de hablar. */
export function Setup({
  initialScenarioId,
  onBack,
  onStart,
  preferences,
}: {
  initialScenarioId: string;
  onBack: () => void;
  onStart: (setup: SessionSetup) => void;
  preferences: Preferences;
}) {
  const scenario = findScenario(initialScenarioId);
  const [difficulty, setDifficulty] = useState<SessionSetup["difficulty"]>(
    (preferences.englishLevel === "unsure"
      ? scenario.difficulty[0]!
      : preferences.englishLevel) as SessionSetup["difficulty"],
  );
  const [duration, setDuration] = useState(scenario.durationMinutes);
  return (
    <section className="page-stack narrow-page" aria-labelledby="setup-title">
      <button className="text-button" onClick={onBack} type="button">
        <ArrowLeft aria-hidden="true" size={18} />
        Volver a prácticas
      </button>
      <div className="section-heading">
        <p className="eyebrow">Antes de hablar</p>
        <h1 id="setup-title">{translate(scenario.titleKey)}</h1>
        <p>{translate(scenario.objectiveKey)}</p>
      </div>
      <Card className="setup-card">
        <div className="form-grid">
          <label className="field">
            <span>Dificultad</span>
            <select
              onChange={(event) =>
                setDifficulty(event.target.value as SessionSetup["difficulty"])
              }
              value={difficulty}
            >
              {scenario.difficulty.map((level) => (
                <option key={level} value={level}>
                  {level.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Duración</span>
            <select
              onChange={(event) => setDuration(Number(event.target.value))}
              value={duration}
            >
              <option value={5}>5 minutos</option>
              <option value={scenario.durationMinutes}>
                {scenario.durationMinutes} minutos
              </option>
              <option value={15}>15 minutos</option>
            </select>
          </label>
        </div>
        <dl className="session-facts">
          <SummaryItem label="Tutor" value={preferences.tutorVoiceId} />
          <SummaryItem label="Velocidad" value={preferences.speakingSpeed} />
          <SummaryItem
            label="Subtítulos"
            value={preferences.captionsEnabled ? "Activados" : "Desactivados"}
          />
        </dl>
        <div className="notice">
          <Sparkles aria-hidden="true" size={18} />
          La voz usa WebRTC y solicita permiso de micrófono solo al iniciar. Si
          la API aún no tiene credencial, puedes continuar con la demo local.
        </div>
        <div className="setup-actions">
          <Button
            onClick={() =>
              onStart({
                scenarioId: scenario.id,
                difficulty,
                duration,
                provider: "realtime",
              })
            }
            size="large"
          >
            <Mic aria-hidden="true" size={19} />
            Comenzar con voz
          </Button>
          <Button
            onClick={() =>
              onStart({
                scenarioId: scenario.id,
                difficulty,
                duration,
                provider: "deterministic",
              })
            }
            variant="secondary"
          >
            Usar demo local
          </Button>
        </div>
      </Card>
    </section>
  );
}
