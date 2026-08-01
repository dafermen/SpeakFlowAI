/** Flujo reanudable que prepara el perfil antes de mostrar la aplicación. */

import type { Preferences, PreferencesStorage } from "@speakflow/configuration";
import { Button, Card } from "@speakflow/design-system";
import { ArrowLeft, Check, ChevronRight, Sparkles, Waves } from "lucide-react";
import { type ReactNode, useState } from "react";

import { SummaryItem } from "./sharedComponents";

/** Opciones locales que el onboarding convierte en metas del perfil. */
const goalOptions = [
  "Hablar con más confianza",
  "Trabajar en inglés",
  "Preparar entrevistas",
  "Viajar y conversar",
];
/** Temas iniciales que personalizan el perfil sin llamadas externas. */
const topicOptions = [
  "Vida diaria",
  "Tecnología",
  "Trabajo",
  "Viajes",
  "Cultura",
];
/** Traducción visible de los valores CEFR almacenados en preferencias. */
const levelLabels: Record<Preferences["englishLevel"], string> = {
  unsure: "No estoy seguro",
  a2: "A2 · Básico",
  b1: "B1 · Intermedio",
  b2: "B2 · Intermedio alto",
  c1: "C1 · Avanzado",
};

/** Devuelve un arreglo nuevo añadiendo o retirando una selección múltiple. */
function toggleChoice(values: string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

/**
 * Asistente de seis pasos que crea preferencias y perfil de aprendizaje.
 *
 * Mantiene un borrador reanudable en LocalStorage después de cada cambio. Solo
 * el último paso llama a `onComplete`, que intenta sincronizar también con la API.
 */
export function Onboarding({
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

  /** Actualiza simultáneamente borrador, preferencias de trabajo y almacenamiento. */
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

  /** Bloquea el botón y entrega una configuración final sin el borrador temporal. */
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

  // Cada paso declara su requisito mínimo antes de habilitar Continuar.
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

/** Marco visual compartido por cada paso del onboarding. */
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

/** Distribuye opciones seleccionables de manera responsive. */
function ChoiceGrid({ children }: { children: ReactNode }) {
  return <div className="choice-grid">{children}</div>;
}

/** Botón de selección múltiple que expone su estado mediante `aria-pressed`. */
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
