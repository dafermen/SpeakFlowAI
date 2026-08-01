/** Orquestador raíz: conecta pantallas con preferencias, API y navegación. */

import {
  SpeakFlowApiClient,
  type CompleteSessionInput,
  type LearnerProgress,
  type LearnerProfileInput,
  type PracticeSessionReview,
} from "@speakflow/api-client";
import {
  createBrowserPreferencesStorage,
  type Preferences,
} from "@speakflow/configuration";
import { Badge } from "@speakflow/design-system";
import { BookOpen, Moon, Settings2, Sun, Waves } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  API_BASE_URL,
  type AppProps,
  type CompletedSession,
  type SessionSetup,
  type View,
} from "./appTypes";
import { findScenario, scenarios } from "./catalog";
import { buildFallbackReview } from "./feedbackFallback";
import { Onboarding } from "./Onboarding";
import { Catalog, Home, Setup } from "./ProductPages";
import { RealtimeTutorSession } from "./RealtimeTutorSession";
import { ProgressDashboard, SessionReview, Settings } from "./ReviewPages";
import { ProductNavigation } from "./sharedComponents";
import { TutorSession } from "./TutorSession";

/**
 * Orquestador raíz de navegación, preferencias, API, sesiones y progreso.
 *
 * Las dependencias opcionales permiten probar este componente con memoria y un
 * cliente falso. En producción se crean adaptadores reales solo una vez mediante
 * `useMemo`.
 */
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
  // Estado duradero cargado de LocalStorage y estado efímero de navegación/datos.
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

  // El atributo global permite que los tokens CSS resuelvan el tema elegido.
  useEffect(() => {
    if (preferences.theme === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = preferences.theme;
    }
  }, [preferences.theme]);

  /** Actualiza la interfaz inmediatamente y luego intenta guardar el mismo valor. */
  const updatePreferences = (changes: Partial<Preferences>) => {
    const next = { ...preferences, ...changes };
    setPreferences(next);
    const result = storage.save(next);
    if (!result.ok) {
      setNotice("No pudimos guardar este cambio en el navegador.");
    }
  };

  /** Abre la preparación del escenario y recuerda la elección localmente. */
  const prepareScenario = (scenarioId: string) => {
    const scenario = findScenario(scenarioId);
    setSelectedScenarioId(scenario.id);
    updatePreferences({
      lastModeId: scenario.modeId,
      lastScenarioId: scenario.id,
    });
    setView("setup");
  };

  /** Guarda una sesión o crea una revisión local recuperable si falla la API. */
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

  /** Normaliza la salida de cualquier tutor al contrato `CompleteSessionInput`. */
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

  /** Refresca el dashboard manteniendo separados carga, resultado y error. */
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

  // Inicio y Progreso muestran datos recientes después de completar onboarding.
  useEffect(() => {
    if (
      preferences.onboardingCompleted &&
      (view === "home" || view === "progress")
    ) {
      void loadProgress();
    }
  }, [loadProgress, preferences.onboardingCompleted, view]);

  /**
   * Confirma preferencias localmente y sincroniza el perfil cuando la API responde.
   *
   * El acceso a la aplicación no depende de la red: un fallo remoto deja un aviso
   * y conserva la configuración en el navegador.
   */
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

  // Antes de finalizar onboarding no se monta el shell principal del producto.
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
              onBrowse={() => setView("catalog")}
              onStart={prepareScenario}
              preferences={preferences}
              progress={progress}
            />
          )}
          {view === "catalog" && (
            <Catalog
              onSelect={(_modeId, scenarioId) => prepareScenario(scenarioId)}
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
              onNext={() => {
                const currentIndex = scenarios.findIndex(
                  (item) => item.id === review?.scenario_id,
                );
                const nextIndex =
                  currentIndex < 0 ? 0 : (currentIndex + 1) % scenarios.length;
                prepareScenario(scenarios[nextIndex]!.id);
              }}
              onRepeat={() => review && prepareScenario(review.scenario_id)}
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
