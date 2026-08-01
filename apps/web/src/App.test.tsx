import "@testing-library/jest-dom/vitest";
import {
  DEFAULT_PREFERENCES,
  PreferencesStorage,
} from "@speakflow/configuration";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

class MemoryStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function createStorage(completed = false) {
  const storage = new PreferencesStorage(new MemoryStorage());
  storage.save({ ...DEFAULT_PREFERENCES, onboardingCompleted: completed });
  return storage;
}

const successfulApi = {
  saveLocalProfile: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      id: "00000000-0000-0000-0000-000000000001",
      display_name: "Daf",
      native_language: "es",
      english_level: "b1",
      goals: ["Hablar con más confianza"],
      topics: ["Tecnología"],
      preferred_feedback_style: "balanced",
      tutor_voice_id: "voice-calm-1",
      speaking_speed: "normal",
      updated_at_utc: "2026-07-31T00:00:00Z",
    },
  }),
  completeSession: vi.fn().mockImplementation(async (input) => ({
    ok: true,
    value: {
      ...input,
      id: "session-1",
      learner_turn_count: input.turns.filter(
        (turn: { speaker: string }) => turn.speaker === "learner",
      ).length,
      tutor_turn_count: input.turns.filter(
        (turn: { speaker: string }) => turn.speaker === "tutor",
      ).length,
      feedback: {
        summary:
          "Completaste una intervención y practicaste una conversación enfocada.",
        strength: "Respondiste de forma directa.",
        focus_area: "Conecta tus ideas con because.",
        corrections: [],
        vocabulary: [
          {
            term: "decaf",
            meaning_es: "descafeinado",
            example: "A decaf coffee.",
          },
        ],
        improved_phrases: ["Could you please clarify that?"],
        observations: [],
      },
    },
  })),
  getProgress: vi.fn().mockResolvedValue({
    ok: true,
    value: {
      total_sessions: 0,
      total_minutes: 0,
      learner_turns: 0,
      current_streak_days: 0,
      sessions_by_mode: [],
      focus_areas: [],
      recent_sessions: [],
    },
  }),
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("local learner experience", () => {
  it("resumes onboarding state and completes the local profile", async () => {
    const storage = createStorage();
    storage.patch({
      onboardingDraft: {
        step: 2,
        displayName: "Daf",
        goals: [],
        topics: [],
      },
    });

    render(<App apiClient={successfulApi} storage={storage} />);

    expect(
      screen.getByRole("heading", { name: "¿Qué quieres conseguir?" }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Hablar con más confianza" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "Tecnología" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Entrar a SpeakFlowAI" }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Hola, Daf. Hablemos en inglés." }),
      ).toBeVisible(),
    );
    expect(successfulApi.saveLocalProfile).toHaveBeenCalledOnce();
    expect(storage.load().value.onboardingCompleted).toBe(true);
    expect(storage.load().value.onboardingDraft).toBeNull();
  });

  it("runs a complete deterministic practice flow", async () => {
    render(<App apiClient={successfulApi} storage={createStorage(true)} />);

    fireEvent.click(screen.getByRole("button", { name: "Iniciar práctica" }));
    expect(
      screen.getByRole("heading", { name: "Pedir en una cafetería" }),
    ).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Practicar escribiendo" }),
    );

    expect(
      screen.getByText("Hi! Welcome in. What would you like to order today?"),
    ).toBeVisible();
    fireEvent.change(screen.getByLabelText("Tu respuesta en inglés"), {
      target: { value: "I would like a coffee, please." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar respuesta" }));

    await waitFor(() =>
      expect(
        screen.getByText("Of course. What size would you prefer?"),
      ).toBeVisible(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Terminar" }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Tu revisión está lista." }),
      ).toBeVisible(),
    );
    expect(screen.getByText("decaf")).toBeVisible();
    expect(successfulApi.completeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "deterministic",
        retain_transcript: false,
      }),
    );
  });

  it("checks readiness before requesting realtime microphone access", async () => {
    const originalMediaDevices = navigator.mediaDevices;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn() },
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ available: true }), { status: 200 }),
        ),
    );

    render(<App apiClient={successfulApi} storage={createStorage(true)} />);

    fireEvent.click(screen.getByRole("button", { name: "Iniciar práctica" }));
    fireEvent.click(screen.getByRole("button", { name: "Comenzar con voz" }));

    expect(
      screen.getByRole("heading", { name: "Pedir en una cafetería" }),
    ).toBeVisible();
    expect(
      await screen.findByRole("button", { name: "Activar micrófono" }),
    ).toBeVisible();
    expect(screen.getByText(/te pedirá permiso/)).toBeVisible();

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: originalMediaDevices,
    });
    vi.unstubAllGlobals();
  });

  it("opens the progress empty state from primary navigation", async () => {
    render(<App apiClient={successfulApi} storage={createStorage(true)} />);

    fireEvent.click(screen.getAllByRole("button", { name: "Progreso" })[0]!);

    await waitFor(() =>
      expect(
        screen.getByRole("heading", {
          name: "Tu primera conversación abrirá este espacio.",
        }),
      ).toBeVisible(),
    );
    expect(successfulApi.getProgress).toHaveBeenCalled();
  });

  it("keeps a usable review when session persistence is unavailable", async () => {
    const offlineApi = {
      ...successfulApi,
      completeSession: vi
        .fn()
        .mockResolvedValue({ ok: false, error: "network" }),
    };
    render(<App apiClient={offlineApi} storage={createStorage(true)} />);

    fireEvent.click(screen.getByRole("button", { name: "Iniciar práctica" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Practicar escribiendo" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Terminar" }));

    await waitFor(() => expect(screen.getByText("Copia local")).toBeVisible());
    expect(
      screen.getByRole("button", { name: "Reintentar guardado" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Repetir este escenario" }),
    ).toBeVisible();
  });
});
