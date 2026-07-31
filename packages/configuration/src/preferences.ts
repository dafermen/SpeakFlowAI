import { z } from "zod";

export const PREFERENCES_KEY = "speakflow.preferences";
export const PREFERENCES_SCHEMA_VERSION = 3;

const onboardingDraftSchema = z
  .object({
    step: z.number().int().min(0).max(5),
    displayName: z.string().max(80),
    goals: z.array(z.string().min(1).max(80)).max(6),
    topics: z.array(z.string().min(1).max(80)).max(8),
  })
  .strict();

const preferencesV2Schema = z
  .object({
    interfaceLanguage: z.enum(["es", "en"]),
    englishLevel: z.enum(["a2", "b1", "b2", "c1", "unsure"]),
    speakingSpeed: z.enum(["slow", "normal", "fast"]),
    tutorVoiceId: z.string().min(1).max(80),
    theme: z.enum(["system", "light", "dark"]),
    captionsEnabled: z.boolean(),
    spanishHelpEnabled: z.boolean(),
    onboardingCompleted: z.boolean(),
    onboardingDraft: onboardingDraftSchema.nullable(),
    lastModeId: z.string().min(1).max(120).nullable(),
    lastScenarioId: z.string().min(1).max(120).nullable(),
  })
  .strict();

const preferencesSchema = preferencesV2Schema.extend({
  transcriptRetentionEnabled: z.boolean(),
});

const envelopeV1Schema = z
  .object({
    schemaVersion: z.literal(1),
    updatedAt: z.string().datetime({ offset: true }),
    data: preferencesSchema.omit({ onboardingDraft: true }),
  })
  .strict();

const envelopeV2Schema = z
  .object({
    schemaVersion: z.literal(2),
    updatedAt: z.string().datetime({ offset: true }),
    data: preferencesV2Schema,
  })
  .strict();

const envelopeV3Schema = z
  .object({
    schemaVersion: z.literal(PREFERENCES_SCHEMA_VERSION),
    updatedAt: z.string().datetime({ offset: true }),
    data: preferencesSchema,
  })
  .strict();

export type Preferences = z.infer<typeof preferencesSchema>;

export const DEFAULT_PREFERENCES: Readonly<Preferences> = Object.freeze({
  interfaceLanguage: "es",
  englishLevel: "unsure",
  speakingSpeed: "normal",
  tutorVoiceId: "voice-calm-1",
  theme: "system",
  captionsEnabled: true,
  spanishHelpEnabled: true,
  onboardingCompleted: false,
  onboardingDraft: null,
  lastModeId: null,
  lastScenarioId: null,
  transcriptRetentionEnabled: false,
});

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type LoadResult =
  | {
      ok: true;
      value: Preferences;
      recovery: "none" | "missing" | "corrupted";
    }
  | {
      ok: false;
      error: "storage-unavailable" | "unsupported-version";
      value: Preferences;
    };

export type SaveResult =
  | { ok: true; value: Preferences }
  | {
      ok: false;
      error: "storage-unavailable" | "unsupported-version" | "write-failed";
    };

export type ClearResult =
  { ok: true } | { ok: false; error: "storage-unavailable" | "write-failed" };

type Clock = () => Date;

function copyDefaults(): Preferences {
  return { ...DEFAULT_PREFERENCES };
}

function readVersion(raw: unknown): number | null {
  if (
    typeof raw === "object" &&
    raw !== null &&
    "schemaVersion" in raw &&
    typeof raw.schemaVersion === "number"
  ) {
    return raw.schemaVersion;
  }
  return null;
}

export class PreferencesStorage {
  constructor(
    private readonly storage: StorageLike | null,
    private readonly now: Clock = () => new Date(),
  ) {}

  load(): LoadResult {
    if (!this.storage) {
      return {
        ok: false,
        error: "storage-unavailable",
        value: copyDefaults(),
      };
    }

    let serialized: string | null;
    try {
      serialized = this.storage.getItem(PREFERENCES_KEY);
    } catch {
      return {
        ok: false,
        error: "storage-unavailable",
        value: copyDefaults(),
      };
    }

    if (serialized === null) {
      return { ok: true, value: copyDefaults(), recovery: "missing" };
    }

    try {
      const parsed: unknown = JSON.parse(serialized);
      const version = readVersion(parsed);
      if (version !== null && version > PREFERENCES_SCHEMA_VERSION) {
        return {
          ok: false,
          error: "unsupported-version",
          value: copyDefaults(),
        };
      }

      if (version === 1) {
        const envelope = envelopeV1Schema.parse(parsed);
        return {
          ok: true,
          value: {
            ...envelope.data,
            onboardingDraft: null,
            transcriptRetentionEnabled: false,
          },
          recovery: "none",
        };
      }

      if (version === 2) {
        const envelope = envelopeV2Schema.parse(parsed);
        return {
          ok: true,
          value: { ...envelope.data, transcriptRetentionEnabled: false },
          recovery: "none",
        };
      }

      const envelope = envelopeV3Schema.parse(parsed);
      return { ok: true, value: envelope.data, recovery: "none" };
    } catch {
      return { ok: true, value: copyDefaults(), recovery: "corrupted" };
    }
  }

  save(value: Preferences): SaveResult {
    if (!this.storage) {
      return { ok: false, error: "storage-unavailable" };
    }

    const parsed = preferencesSchema.safeParse(value);
    if (!parsed.success) {
      return { ok: false, error: "write-failed" };
    }

    try {
      this.storage.setItem(
        PREFERENCES_KEY,
        JSON.stringify({
          schemaVersion: PREFERENCES_SCHEMA_VERSION,
          updatedAt: this.now().toISOString(),
          data: parsed.data,
        }),
      );
      return { ok: true, value: parsed.data };
    } catch {
      return { ok: false, error: "write-failed" };
    }
  }

  patch(changes: Partial<Preferences>): SaveResult {
    const current = this.load();
    if (!current.ok) {
      return { ok: false, error: current.error };
    }
    return this.save({ ...current.value, ...changes });
  }

  clear(): ClearResult {
    if (!this.storage) {
      return { ok: false, error: "storage-unavailable" };
    }
    try {
      this.storage.removeItem(PREFERENCES_KEY);
      return { ok: true };
    } catch {
      return { ok: false, error: "write-failed" };
    }
  }
}

export function createBrowserPreferencesStorage(): PreferencesStorage {
  const storage = typeof window === "undefined" ? null : window.localStorage;
  return new PreferencesStorage(storage);
}
