/** Dashboard, revisión final y preferencias posteriores al onboarding. */

import type {
  LearnerProgress,
  PracticeSessionReview,
} from "@speakflow/api-client";
import type { Preferences } from "@speakflow/configuration";
import { Badge, Button, Card } from "@speakflow/design-system";
import { Check, RefreshCw, Sparkles, TrendingUp, WifiOff } from "lucide-react";

import { findScenario, modes, translate } from "./catalog";
import { LearningPhraseList } from "./LearningPhraseList";
import { SummaryItem } from "./sharedComponents";

/**
 * Presenta carga, error, estado vacío o métricas de progreso.
 *
 * Mantener esos estados en un componente evita que `App` mezcle decisiones de
 * datos con el marcado de cada alternativa visual.
 */
export function ProgressDashboard({
  error,
  loading,
  onPractice,
  onRetry,
  progress,
}: {
  error: boolean;
  loading: boolean;
  onPractice: () => void;
  onRetry: () => void;
  progress: LearnerProgress | null;
}) {
  if (loading) {
    return (
      <section className="completion-card" aria-live="polite">
        <TrendingUp aria-hidden="true" size={36} />
        <p className="eyebrow">Actualizando progreso</p>
        <h1>Reuniendo tus prácticas.</h1>
      </section>
    );
  }

  if (error) {
    return (
      <section className="completion-card">
        <WifiOff aria-hidden="true" size={36} />
        <h1>No pudimos cargar tu progreso.</h1>
        <p>Comprueba que la API local esté activa y vuelve a intentarlo.</p>
        <Button onClick={onRetry}>Reintentar</Button>
      </section>
    );
  }

  if (!progress || progress.total_sessions === 0) {
    return (
      <section className="completion-card">
        <TrendingUp aria-hidden="true" size={36} />
        <p className="eyebrow">Tu progreso</p>
        <h1>Tu primera conversación abrirá este espacio.</h1>
        <p>
          Aquí verás minutos, intervenciones, constancia y áreas de enfoque.
        </p>
        <Button onClick={onPractice} size="large">
          Iniciar práctica
        </Button>
      </section>
    );
  }

  return (
    <section
      className="progress page-stack"
      aria-labelledby="progress-page-title"
    >
      <div className="section-heading section-heading--row">
        <div>
          <p className="eyebrow">Tu progreso</p>
          <h1 id="progress-page-title">Cada conversación suma.</h1>
          <p>
            Una vista simple de lo que ya practicaste y qué conviene repetir.
          </p>
        </div>
        <Button onClick={onPractice}>Nueva práctica</Button>
      </div>

      <div className="progress__metrics">
        <Card>
          <strong>{progress.total_sessions}</strong>
          <span>sesiones</span>
        </Card>
        <Card>
          <strong>{progress.total_minutes}</strong>
          <span>minutos</span>
        </Card>
        <Card>
          <strong>{progress.learner_turns}</strong>
          <span>intervenciones</span>
        </Card>
        <Card>
          <strong>{progress.current_streak_days}</strong>
          <span>días de constancia</span>
        </Card>
      </div>

      <div className="progress__columns">
        <Card className="review__section">
          <h2>Modos practicados</h2>
          <ul className="progress__breakdown">
            {progress.sessions_by_mode.map((item) => {
              const mode = modes.find((candidate) => candidate.id === item.id);
              return (
                <li key={item.id}>
                  <span>{mode ? translate(mode.titleKey) : item.id}</span>
                  <Badge tone="active">{item.count}</Badge>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="review__section">
          <h2>Áreas para reforzar</h2>
          <ul className="progress__focus">
            {progress.focus_areas.map((item) => (
              <li key={item.id}>
                <p>{item.id}</p>
                <span>{item.count} sesiones</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <section aria-labelledby="recent-sessions-title">
        <div className="section-heading">
          <p className="eyebrow">Historial</p>
          <h2 id="recent-sessions-title">Sesiones recientes</h2>
        </div>
        <div className="progress__history">
          {progress.recent_sessions.map((item) => {
            const scenario = findScenario(item.scenario_id);
            return (
              <Card key={item.id}>
                <div className="progress__history-heading">
                  <div>
                    <h3>{translate(scenario.titleKey)}</h3>
                    <p>
                      {new Intl.DateTimeFormat("es", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(item.ended_at_utc))}
                    </p>
                  </div>
                  <Badge>{item.difficulty.toUpperCase()}</Badge>
                </div>
                <p>{item.summary}</p>
                <dl className="session-facts">
                  <SummaryItem
                    label="Duración"
                    value={`${Math.max(1, Math.ceil(item.duration_seconds / 60))} min`}
                  />
                  <SummaryItem
                    label="Intervenciones"
                    value={String(item.learner_turn_count)}
                  />
                  <SummaryItem
                    label="Correcciones"
                    value={String(item.correction_count)}
                  />
                </dl>
              </Card>
            );
          })}
        </div>
      </section>
    </section>
  );
}

/**
 * Revisión final de una práctica guardada o conservada temporalmente en memoria.
 *
 * Cuando `saved` es falso, el feedback sigue disponible y `onRetry` vuelve a
 * intentar la misma entrada pendiente sin inventar una sesión remota.
 */
export function SessionReview({
  loading,
  onHome,
  onNext,
  onRepeat,
  onRetry,
  review,
  saved,
}: {
  loading: boolean;
  onHome: () => void;
  onNext: () => void;
  onRepeat: () => void;
  onRetry: () => void;
  review: PracticeSessionReview | null;
  saved: boolean;
}) {
  if (loading || review === null) {
    return (
      <section className="completion-card" aria-live="polite">
        <span className="completion-card__check">
          <Sparkles aria-hidden="true" size={32} />
        </span>
        <p className="eyebrow">Preparando tu revisión</p>
        <h1>Estamos organizando lo que practicaste.</h1>
        <p>Esto solo toma un momento.</p>
      </section>
    );
  }

  return (
    <section className="review page-stack" aria-labelledby="review-title">
      <header className="review__hero">
        <span className="completion-card__check">
          <Check aria-hidden="true" size={32} />
        </span>
        <div>
          <p className="eyebrow">Sesión completada</p>
          <h1 id="review-title">Tu revisión está lista.</h1>
          <p>{review.feedback.summary}</p>
        </div>
        <Badge tone={saved ? "success" : "warning"}>
          {saved ? "Guardada" : "Copia local"}
        </Badge>
      </header>

      {!saved && (
        <div className="voice-error" role="status">
          <WifiOff aria-hidden="true" size={22} />
          <div>
            <strong>La API no respondió</strong>
            <p>
              Puedes revisar el feedback ahora e intentar guardarlo otra vez.
            </p>
          </div>
          <Button onClick={onRetry} variant="secondary">
            <RefreshCw aria-hidden="true" size={17} />
            Reintentar guardado
          </Button>
        </div>
      )}

      <div className="review__summary-grid">
        <Card>
          <p className="eyebrow">Lo mejor</p>
          <h2>Fortaleza</h2>
          <p>{review.feedback.strength}</p>
        </Card>
        <Card>
          <p className="eyebrow">Siguiente paso</p>
          <h2>Enfoque</h2>
          <p>{review.feedback.focus_area}</p>
        </Card>
      </div>

      <Card className="review__section">
        <h2>Correcciones útiles</h2>
        {review.feedback.corrections.length === 0 ? (
          <p>No detectamos una corrección prioritaria en esta sesión.</p>
        ) : (
          <ul className="review__items">
            {review.feedback.corrections.map((item, index) => (
              <li key={`${item.original}-${index}`}>
                <span className="review__before">{item.original}</span>
                <strong>{item.improved}</strong>
                <p>{item.explanation}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="review__detail-grid">
        <Card className="review__section">
          <h2>Vocabulario</h2>
          {review.feedback.vocabulary.length === 0 ? (
            <p>La próxima sesión añadirá vocabulario contextual.</p>
          ) : (
            <dl className="review__vocabulary">
              {review.feedback.vocabulary.map((item) => (
                <div key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.meaning_es}</dd>
                  <dd>{item.example}</dd>
                </div>
              ))}
            </dl>
          )}
        </Card>
        <Card className="review__section">
          <h2>Frases para reutilizar</h2>
          <LearningPhraseList phrases={review.feedback.improved_phrases} />
        </Card>
      </div>

      <footer className="review__actions">
        <p>
          {review.retain_transcript
            ? "La transcripción se guardó porque activaste esa preferencia."
            : "Guardamos resultados y feedback, no la transcripción cruda."}
        </p>
        <div className="review__action-buttons">
          <Button onClick={onNext} size="large">
            Practicar siguiente escenario
          </Button>
          <Button onClick={onRepeat} variant="secondary">
            Repetir este escenario
          </Button>
          <Button onClick={onHome} variant="ghost">
            Volver al inicio
          </Button>
        </div>
      </footer>
    </section>
  );
}

/** Preferencias locales de apariencia, subtítulos, ayuda y retención consentida. */
export function Settings({
  onChange,
  preferences,
}: {
  onChange: (changes: Partial<Preferences>) => void;
  preferences: Preferences;
}) {
  return (
    <section
      className="page-stack narrow-page"
      aria-labelledby="settings-title"
    >
      <div className="section-heading">
        <p className="eyebrow">Preferencias locales</p>
        <h1 id="settings-title">Ajusta tu experiencia.</h1>
      </div>
      <Card className="setup-card">
        <label className="field">
          <span>Tema visual</span>
          <select
            onChange={(event) =>
              onChange({ theme: event.target.value as Preferences["theme"] })
            }
            value={preferences.theme}
          >
            <option value="system">Usar el sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </label>
        <label className="toggle">
          <input
            checked={preferences.captionsEnabled}
            onChange={(event) =>
              onChange({ captionsEnabled: event.target.checked })
            }
            type="checkbox"
          />
          <span>Mostrar subtítulos por defecto</span>
        </label>
        <label className="toggle">
          <input
            checked={preferences.spanishHelpEnabled}
            onChange={(event) =>
              onChange({ spanishHelpEnabled: event.target.checked })
            }
            type="checkbox"
          />
          <span>Permitir ayuda breve en español</span>
        </label>
        <label className="toggle toggle--stacked">
          <input
            checked={preferences.transcriptRetentionEnabled}
            onChange={(event) =>
              onChange({ transcriptRetentionEnabled: event.target.checked })
            }
            type="checkbox"
          />
          <span>
            Guardar transcripciones de práctica
            <small>
              Desactivado por defecto. Nunca guardamos el audio; solo texto
              cuando lo autorizas.
            </small>
          </span>
        </label>
      </Card>
    </section>
  );
}
