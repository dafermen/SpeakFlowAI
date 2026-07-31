import { describe, expect, it } from "vitest";

import {
  DEFAULT_PREFERENCES,
  PREFERENCES_KEY,
  PreferencesStorage,
  type StorageLike,
} from "./preferences";

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const fixedClock = () => new Date("2026-07-30T12:00:00.000Z");

describe("PreferencesStorage", () => {
  it("returns safe defaults when the key is missing", () => {
    const result = new PreferencesStorage(
      new MemoryStorage(),
      fixedClock,
    ).load();

    expect(result).toEqual({
      ok: true,
      value: DEFAULT_PREFERENCES,
      recovery: "missing",
    });
  });

  it("saves, validates and reloads a versioned envelope", () => {
    const adapter = new PreferencesStorage(new MemoryStorage(), fixedClock);

    expect(adapter.patch({ englishLevel: "b1", theme: "dark" })).toMatchObject({
      ok: true,
    });
    expect(adapter.load()).toEqual({
      ok: true,
      value: {
        ...DEFAULT_PREFERENCES,
        englishLevel: "b1",
        theme: "dark",
      },
      recovery: "none",
    });
  });

  it("recovers from corrupted values without throwing", () => {
    const storage = new MemoryStorage();
    storage.setItem(PREFERENCES_KEY, "{not-json");

    expect(new PreferencesStorage(storage, fixedClock).load()).toEqual({
      ok: true,
      value: DEFAULT_PREFERENCES,
      recovery: "corrupted",
    });
  });

  it("does not overwrite a future schema version", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        schemaVersion: 99,
        updatedAt: fixedClock().toISOString(),
        data: {},
      }),
    );
    const adapter = new PreferencesStorage(storage, fixedClock);

    expect(adapter.patch({ theme: "light" })).toEqual({
      ok: false,
      error: "unsupported-version",
    });
  });

  it("migrates version one preferences without losing values", () => {
    const storage = new MemoryStorage();
    const versionOneData = Object.fromEntries(
      Object.entries(DEFAULT_PREFERENCES).filter(
        ([key]) => key !== "onboardingDraft",
      ),
    );
    storage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        schemaVersion: 1,
        updatedAt: fixedClock().toISOString(),
        data: { ...versionOneData, englishLevel: "b2" },
      }),
    );

    expect(new PreferencesStorage(storage, fixedClock).load()).toMatchObject({
      ok: true,
      value: { englishLevel: "b2", onboardingDraft: null },
    });
  });

  it("migrates version two with transcript retention disabled", () => {
    const storage = new MemoryStorage();
    const versionTwoData = Object.fromEntries(
      Object.entries(DEFAULT_PREFERENCES).filter(
        ([key]) => key !== "transcriptRetentionEnabled",
      ),
    );
    storage.setItem(
      PREFERENCES_KEY,
      JSON.stringify({
        schemaVersion: 2,
        updatedAt: fixedClock().toISOString(),
        data: versionTwoData,
      }),
    );

    expect(new PreferencesStorage(storage, fixedClock).load()).toMatchObject({
      ok: true,
      value: { transcriptRetentionEnabled: false },
    });
  });

  it("clears only the SpeakFlowAI preference key", () => {
    const storage = new MemoryStorage();
    storage.setItem(PREFERENCES_KEY, "{}");
    storage.setItem("another-product", "keep");

    expect(new PreferencesStorage(storage, fixedClock).clear()).toEqual({
      ok: true,
    });
    expect(storage.getItem(PREFERENCES_KEY)).toBeNull();
    expect(storage.getItem("another-product")).toBe("keep");
  });
});
