import {
  SpeakFlowApiClient,
  type CompleteSessionInput,
  type LearnerProgress,
  type LearnerProfileInput,
  type PracticeSessionReview,
  type SessionTurnInput,
} from "@speakflow/api-client";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import {
  createBrowserPreferencesStorage,
  type Preferences,
  type PreferencesStorage,
} from "@speakflow/configuration";
import { Badge, Button, Card } from "@speakflow/design-system";
import {
  ArrowLeft,
  BookOpen,
  Captions,
  Check,
  ChevronRight,
  CircleUserRound,
  Gauge,
  House,
  MessageCircleMore,
  Mic,
  Moon,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  Settings2,
  Sparkles,
  Square,
  Sun,
  TrendingUp,
  Volume2,
  VolumeX,
  Waves,
  WifiOff,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  findScenario,
  modeIcons,
  modes,
  scenarios,
  translate,
} from "./catalog";
import { openingFor, replyFor, type TutorTurn } from "./deterministicTutor";
import { buildFallbackReview } from "./feedbackFallback";
import {
  WebRtcRealtimeClient,
  type VoiceConnectionState,
  type VoiceTranscript,
  type VoiceUsage,
} from "./realtimeClient";

type View =
  "home" | "catalog" | "setup" | "session" | "review" | "progress" | "settings";
type ApiClient = Pick<
  SpeakFlowApiClient,
  "saveLocalProfile" | "completeSession" | "getProgress"
>;

interface AppProps {
  apiClient?: ApiClient;
  storage?: PreferencesStorage;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const goalOptions = [
  "Hablar con más confianza",
  "Trabajar en inglés",
  "Preparar entrevistas",
  "Viajar y conversar",
];
const topicOptions = [
  "Vida diaria",
  "Tecnología",
  "Trabajo",
  "Viajes",
  "Cultura",
];
const levelLabels: Record<Preferences["englishLevel"], string> = {
  unsure: "No estoy seguro",
  a2: "A2 · Básico",
  b1: "B1 · Intermedio",
  b2: "B2 · Intermedio alto",
  c1: "C1 · Avanzado",
};

function toggleChoice(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function Onboarding({
  onComplete,
  preferences,
  storage,
}: {
  onComplete: (
    preferences: Preferences,
    displayName: string,
    goals: string[],
    topics: string[],
  ) => Promise<void>;
  preferences: Preferences;
  storage: PreferencesStorage;
}) {
  const initialDraft = preferences.onboardingDraft ?? {
    step: 0,
    displayName: "",
    goals: [],
    topics: [],
  };
  const [draft, setDraft] = useState(initialDraft);
  const [workingPreferences, setWorkingPreferences] = useState(preferences);
  const [busy, setBusy] = useState(false);

  const saveDraft = (
    nextDraft: typeof draft,
    preferenceChanges: Partial<Preferences> = {},
  ) => {
    const nextPreferences = {
      ...workingPreferences,
      ...preferenceChanges,
      onboardingDraft: nextDraft,
    };
    setDraft(nextDraft);
    setWorkingPreferences(nextPreferences);
    storage.save(nextPreferences);
  };

  const next = () => saveDraft({ ...draft, step: Math.min(5, draft.step + 1) });
  const back = () => saveDraft({ ...draft, step: Math.max(0, draft.step - 1) });

  const finish = async () => {
    setBusy(true);
    await onComplete(
      {
        ...workingPreferences,
        onboardingCompleted: true,
        onboardingDraft: null,
      },
      draft.displayName.trim(),
      draft.goals,
      draft.topics,
    );
  };

  const canContinue =
    (draft.step !== 0 || draft.displayName.trim().length > 0) &&
    (draft.step !== 2 || draft.goals.length > 0) &&
    (draft.step !== 3 || draft.topics.length > 0);

  return (
    <main className="onboarding" id="main-content">
      <div className="onboarding__brand">
        <span aria-hidden="true" className="brand__mark">
          <Waves size={23} strokeWidth={2.4} />
        </span>
        SpeakFlowAI
      </div>
      <Card className="onboarding__card">
        <div className="onboarding__progress">
          <span>Paso {draft.step + 1} de 6</span>
          <progress max="6" value={draft.step + 1}>
            {draft.step + 1} de 6
          </progress>
        </div>

        {draft.step === 0 && (
          <OnboardingStep
            description="Crearemos una ruta breve para que empieces a hablar desde la primera sesión."
            title="Tu práctica, a tu ritmo."
          >
            <label className="field">
              <span>¿Cómo quieres que te llamemos?</span>
              <input
                autoComplete="name"
                autoFocus
                maxLength={80}
                onChange={(event) =>
                  saveDraft({ ...draft, displayName: event.target.value })
                }
                placeholder="Tu nombre"
                value={draft.displayName}
              />
            </label>
          </OnboardingStep>
        )}

        {draft.step === 1 && (
          <OnboardingStep
            description="No es un examen. Puedes cambiar este dato cuando quieras."
            title="¿Cuál es tu nivel actual?"
          >
            <ChoiceGrid>
              {Object.entries(levelLabels).map(([value, label]) => (
                <ChoiceButton
                  active={workingPreferences.englishLevel === value}
                  key={value}
                  label={label}
                  onClick={() =>
                    saveDraft(draft, {
                      englishLevel: value as Preferences["englishLevel"],
                    })
                  }
                />
              ))}
            </ChoiceGrid>
          </OnboardingStep>
        )}

        {draft.step === 2 && (
          <OnboardingStep
            description="Elige una o varias opciones."
            title="¿Qué quieres conseguir?"
          >
            <ChoiceGrid>
              {goalOptions.map((goal) => (
                <ChoiceButton
                  active={draft.goals.includes(goal)}
                  key={goal}
                  label={goal}
                  onClick={() =>
                    saveDraft({
                      ...draft,
                      goals: toggleChoice(draft.goals, goal),
                    })
                  }
                />
              ))}
            </ChoiceGrid>
          </OnboardingStep>
        )}

        {draft.step === 3 && (
          <OnboardingStep
            description="Usaremos estos temas para recomendarte prácticas."
            title="¿De qué te gustaría hablar?"
          >
            <ChoiceGrid>
              {topicOptions.map((topic) => (
                <ChoiceButton
                  active={draft.topics.includes(topic)}
                  key={topic}
                  label={topic}
                  onClick={() =>
                    saveDraft({
                      ...draft,
                      topics: toggleChoice(draft.topics, topic),
                    })
                  }
                />
              ))}
            </ChoiceGrid>
          </OnboardingStep>
        )}

        {draft.step === 4 && (
          <OnboardingStep
            description="Empieza con una conversación cómoda; después podrás subir el ritmo."
            title="Ajusta tu tutor."
          >
            <div className="form-grid">
              <label className="field">
                <span>Velocidad al hablar</span>
                <select
                  onChange={(event) =>
                    saveDraft(draft, {
                      speakingSpeed: event.target
                        .value as Preferences["speakingSpeed"],
                    })
                  }
                  value={workingPreferences.speakingSpeed}
                >
                  <option value="slow">Lenta</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Rápida</option>
                </select>
              </label>
              <label className="field">
                <span>Voz del tutor</span>
                <select
                  onChange={(event) =>
                    saveDraft(draft, { tutorVoiceId: event.target.value })
                  }
                  value={workingPreferences.tutorVoiceId}
                >
                  <option value="voice-calm-1">Calm · Clara</option>
                  <option value="voice-warm-1">Warm · Cercana</option>
                </select>
              </label>
              <label className="toggle">
                <input
                  checked={workingPreferences.spanishHelpEnabled}
                  onChange={(event) =>
                    saveDraft(draft, {
                      spanishHelpEnabled: event.target.checked,
                    })
                  }
                  type="checkbox"
                />
                <span>Permitir ayuda breve en español</span>
              </label>
            </div>
          </OnboardingStep>
        )}

        {draft.step === 5 && (
          <OnboardingStep
            description="Todo queda guardado localmente y puedes modificarlo después."
            title={`Listo, ${draft.displayName.trim()}.`}
          >
            <div className="summary-list">
              <SummaryItem
                label="Nivel"
                value={levelLabels[workingPreferences.englishLevel]}
              />
              <SummaryItem label="Objetivos" value={draft.goals.join(", ")} />
              <SummaryItem label="Temas" value={draft.topics.join(", ")} />
              <SummaryItem
                label="Ritmo"
                value={workingPreferences.speakingSpeed}
              />
            </div>
          </OnboardingStep>
        )}

        <div className="onboarding__actions">
          {draft.step > 0 && (
            <Button onClick={back} variant="ghost">
              <ArrowLeft aria-hidden="true" size={18} />
              Atrás
            </Button>
          )}
          {draft.step < 5 ? (
            <Button disabled={!canContinue} onClick={next} size="large">
              Continuar
              <ChevronRight aria-hidden="true" size={18} />
            </Button>
          ) : (
            <Button disabled={busy} onClick={() => void finish()} size="large">
              {busy ? "Guardando…" : "Entrar a SpeakFlowAI"}
            </Button>
          )}
        </div>
      </Card>
    </main>
  );
}

function OnboardingStep({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="onboarding-step">
      <p className="eyebrow">
        <Sparkles aria-hidden="true" size={16} />
        Primeros pasos
      </p>
      <h1>{title}</h1>
      <p className="onboarding-step__description">{description}</p>
      {children}
    </section>
  );
}

function ChoiceGrid({ children }: { children: ReactNode }) {
  return <div className="choice-grid">{children}</div>;
}

function ChoiceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className="choice-button"
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      {active && <Check aria-hidden="true" size={18} />}
    </button>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ProductNavigation({
  onNavigate,
  view,
}: {
  onNavigate: (view: View) => void;
  view: View;
}) {
  const navigation = [
    { label: "Inicio", icon: House, destination: "home" as const },
    {
      label: "Practicar",
      icon: MessageCircleMore,
      destination: "catalog" as const,
    },
    { label: "Progreso", icon: TrendingUp, destination: "progress" as const },
    { label: "Más", icon: CircleUserRound, destination: "settings" as const },
  ];
  return (
    <nav aria-label="Navegación principal" className="product-navigation">
      <ul>
        {navigation.map(({ destination, icon: Icon, label }) => {
          const current =
            destination === view ||
            (destination === "catalog" &&
              ["setup", "session", "review"].includes(view));
          return (
            <li key={label}>
              <button
                aria-current={current ? "page" : undefined}
                className="product-navigation__item"
                disabled={destination === null}
                onClick={() => destination && onNavigate(destination)}
                type="button"
              >
                <Icon aria-hidden="true" size={21} strokeWidth={2} />
                <span>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Home({
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

function Catalog({
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

interface SessionSetup {
  scenarioId: string;
  difficulty: "a2" | "b1" | "b2" | "c1";
  duration: number;
  provider: "realtime" | "deterministic";
}

interface CompletedSession {
  setup: SessionSetup;
  startedAtUtc: string;
  endedAtUtc: string;
  turns: SessionTurnInput[];
  inputTokens: number;
  outputTokens: number;
}

function Setup({
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

const voiceErrorMessages: Record<string, string> = {
  microphone_denied:
    "El navegador no recibió permiso para usar el micrófono. Revisa el permiso del sitio e inténtalo otra vez.",
  not_configured:
    "La voz todavía no tiene una credencial configurada en la API local.",
  session_limit:
    "Alcanzaste el límite temporal de inicios de sesión. Espera unos minutos.",
  connection_lost:
    "La conexión de voz se interrumpió. Puedes intentar reconectarla.",
  session_start_failed:
    "No pudimos iniciar la voz. Comprueba que la API local esté activa.",
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

function RealtimeTutorSession({
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

  useEffect(
    () => () => {
      clientRef.current?.stop(false);
    },
    [],
  );

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

function TutorSession({
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
        <ol
          className="transcript"
          aria-label="Transcripción de la conversación"
        >
          {turns.map((turn) => (
            <li className={`turn turn--${turn.speaker}`} key={turn.id}>
              <strong>{turn.speaker === "tutor" ? "Tutor" : "Tú"}</strong>
              <span>{turn.text}</span>
            </li>
          ))}
        </ol>
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

function ProgressDashboard({
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
        <p>Aquí verás minutos, intervenciones, racha y áreas de enfoque.</p>
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
          <span>días de racha</span>
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

function SessionReview({
  loading,
  onHome,
  onRetry,
  review,
  saved,
}: {
  loading: boolean;
  onHome: () => void;
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
          <ul className="review__phrases">
            {review.feedback.improved_phrases.map((phrase) => (
              <li key={phrase}>{phrase}</li>
            ))}
          </ul>
        </Card>
      </div>

      <footer className="review__actions">
        <p>
          {review.retain_transcript
            ? "La transcripción se guardó porque activaste esa preferencia."
            : "Guardamos resultados y feedback, no la transcripción cruda."}
        </p>
        <Button onClick={onHome} size="large">
          Volver al inicio
        </Button>
      </footer>
    </section>
  );
}

function Settings({
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

export function App({
  apiClient: apiClientProp,
  storage: storageProp,
}: AppProps) {
  const storage = useMemo(
    () => storageProp ?? createBrowserPreferencesStorage(),
    [storageProp],
  );
  const apiClient = useMemo(
    () => apiClientProp ?? new SpeakFlowApiClient(API_BASE_URL),
    [apiClientProp],
  );
  const loaded = useMemo(() => storage.load(), [storage]);
  const [preferences, setPreferences] = useState(loaded.value);
  const [displayName, setDisplayName] = useState("");
  const [view, setView] = useState<View>("home");
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    preferences.lastScenarioId ?? scenarios[0]!.id,
  );
  const [sessionSetup, setSessionSetup] = useState<SessionSetup | null>(null);
  const [pendingSession, setPendingSession] =
    useState<CompleteSessionInput | null>(null);
  const [review, setReview] = useState<PracticeSessionReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSaved, setReviewSaved] = useState(false);
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState(false);
  const [notice, setNotice] = useState(
    loaded.ok && loaded.recovery === "corrupted"
      ? "Recuperamos preferencias dañadas usando valores seguros."
      : "",
  );

  useEffect(() => {
    if (preferences.theme === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = preferences.theme;
    }
  }, [preferences.theme]);

  const updatePreferences = (changes: Partial<Preferences>) => {
    const next = { ...preferences, ...changes };
    setPreferences(next);
    const result = storage.save(next);
    if (!result.ok) {
      setNotice("No pudimos guardar este cambio en el navegador.");
    }
  };

  const persistSession = useCallback(
    async (input: CompleteSessionInput) => {
      setReviewLoading(true);
      const result = await apiClient.completeSession(input);
      if (result.ok) {
        setReview(result.value);
        setReviewSaved(true);
      } else {
        setReview(buildFallbackReview(input));
        setReviewSaved(false);
        setNotice(
          "Tu revisión está disponible, pero la sesión aún no se guardó en la API local.",
        );
      }
      setReviewLoading(false);
    },
    [apiClient],
  );

  const completePractice = useCallback(
    (completed: CompletedSession) => {
      const elapsedSeconds = Math.max(
        0,
        Math.ceil(
          (Date.parse(completed.endedAtUtc) -
            Date.parse(completed.startedAtUtc)) /
            1000,
        ),
      );
      const input: CompleteSessionInput = {
        scenario_id: completed.setup.scenarioId,
        mode_id: findScenario(completed.setup.scenarioId).modeId,
        provider:
          completed.setup.provider === "realtime"
            ? "openai-realtime"
            : "deterministic",
        difficulty: completed.setup.difficulty,
        duration_seconds: Math.min(900, elapsedSeconds),
        started_at_utc: completed.startedAtUtc,
        ended_at_utc: completed.endedAtUtc,
        retain_transcript: preferences.transcriptRetentionEnabled,
        input_tokens: completed.inputTokens,
        output_tokens: completed.outputTokens,
        turns: completed.turns,
      };
      setPendingSession(input);
      setReview(null);
      setReviewSaved(false);
      setView("review");
      void persistSession(input);
    },
    [persistSession, preferences.transcriptRetentionEnabled],
  );

  const loadProgress = useCallback(async () => {
    setProgressLoading(true);
    setProgressError(false);
    const result = await apiClient.getProgress();
    if (result.ok) {
      setProgress(result.value);
    } else {
      setProgressError(true);
    }
    setProgressLoading(false);
  }, [apiClient]);

  useEffect(() => {
    if (
      preferences.onboardingCompleted &&
      (view === "home" || view === "progress")
    ) {
      void loadProgress();
    }
  }, [loadProgress, preferences.onboardingCompleted, view]);

  const completeOnboarding = async (
    nextPreferences: Preferences,
    nextDisplayName: string,
    goals: string[],
    topics: string[],
  ) => {
    setPreferences(nextPreferences);
    setDisplayName(nextDisplayName);
    const saveResult = storage.save(nextPreferences);
    if (!saveResult.ok) {
      setNotice(
        "Entraste, pero el navegador no pudo guardar tus preferencias.",
      );
    }
    const profile: LearnerProfileInput = {
      display_name: nextDisplayName || null,
      native_language: "es",
      english_level: nextPreferences.englishLevel,
      goals,
      topics,
      preferred_feedback_style: "balanced",
      tutor_voice_id: nextPreferences.tutorVoiceId,
      speaking_speed: nextPreferences.speakingSpeed,
    };
    const apiResult = await apiClient.saveLocalProfile(profile);
    if (!apiResult.ok) {
      setNotice(
        "Tu configuración quedó guardada en este navegador. El perfil local se sincronizará cuando la API esté disponible.",
      );
    }
  };

  if (!preferences.onboardingCompleted) {
    return (
      <>
        <a className="skip-link" href="#main-content">
          Saltar al contenido
        </a>
        <Onboarding
          onComplete={completeOnboarding}
          preferences={preferences}
          storage={storage}
        />
      </>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <div className="app-shell">
        <aside className="app-shell__sidebar">
          <button
            aria-label="SpeakFlowAI, inicio"
            className="brand brand--button"
            onClick={() => setView("home")}
            type="button"
          >
            <span aria-hidden="true" className="brand__mark">
              <Waves size={23} strokeWidth={2.4} />
            </span>
            <span>SpeakFlowAI</span>
          </button>
          <ProductNavigation onNavigate={setView} view={view} />
          <a className="docs-link" href="/docs/">
            <BookOpen aria-hidden="true" size={19} />
            Documentación
          </a>
        </aside>

        <main className="app-main" id="main-content">
          <header className="app-main__header">
            <button
              aria-label="SpeakFlowAI, inicio"
              className="brand brand--button brand--compact"
              onClick={() => setView("home")}
              type="button"
            >
              <span aria-hidden="true" className="brand__mark">
                <Waves size={21} strokeWidth={2.4} />
              </span>
              <span>SpeakFlowAI</span>
            </button>
            <div className="header-actions">
              <Badge
                aria-label="Estado: experiencia local activa"
                tone="active"
              >
                MVP local
              </Badge>
              <button
                aria-label={
                  preferences.theme === "dark"
                    ? "Cambiar a tema claro"
                    : "Cambiar a tema oscuro"
                }
                className="icon-button"
                onClick={() =>
                  updatePreferences({
                    theme: preferences.theme === "dark" ? "light" : "dark",
                  })
                }
                type="button"
              >
                {preferences.theme === "dark" ? <Sun /> : <Moon />}
              </button>
            </div>
          </header>

          {notice && (
            <div className="status-notice" role="status">
              <Settings2 aria-hidden="true" size={18} />
              <span>{notice}</span>
              <button onClick={() => setNotice("")} type="button">
                Cerrar
              </button>
            </div>
          )}

          {view === "home" && (
            <Home
              displayName={displayName}
              onStart={() => setView("catalog")}
              progress={progress}
            />
          )}
          {view === "catalog" && (
            <Catalog
              onSelect={(modeId, scenarioId) => {
                setSelectedScenarioId(scenarioId);
                updatePreferences({
                  lastModeId: modeId,
                  lastScenarioId: scenarioId,
                });
                setView("setup");
              }}
            />
          )}
          {view === "setup" && (
            <Setup
              initialScenarioId={selectedScenarioId}
              onBack={() => setView("catalog")}
              onStart={(setup) => {
                setSessionSetup(setup);
                setView("session");
              }}
              preferences={preferences}
            />
          )}
          {view === "session" && sessionSetup?.provider === "realtime" && (
            <RealtimeTutorSession
              onComplete={completePractice}
              onFallback={() =>
                setSessionSetup({ ...sessionSetup, provider: "deterministic" })
              }
              preferences={preferences}
              setup={sessionSetup}
            />
          )}
          {view === "session" && sessionSetup?.provider === "deterministic" && (
            <TutorSession
              onComplete={completePractice}
              preferences={preferences}
              setup={sessionSetup}
            />
          )}
          {view === "review" && (
            <SessionReview
              loading={reviewLoading}
              onHome={() => setView("home")}
              onRetry={() =>
                pendingSession && void persistSession(pendingSession)
              }
              review={review}
              saved={reviewSaved}
            />
          )}
          {view === "progress" && (
            <ProgressDashboard
              error={progressError}
              loading={progressLoading}
              onPractice={() => setView("catalog")}
              onRetry={() => void loadProgress()}
              progress={progress}
            />
          )}
          {view === "settings" && (
            <Settings onChange={updatePreferences} preferences={preferences} />
          )}
        </main>

        <div className="app-shell__bottom-navigation">
          <ProductNavigation onNavigate={setView} view={view} />
        </div>
      </div>
    </>
  );
}
