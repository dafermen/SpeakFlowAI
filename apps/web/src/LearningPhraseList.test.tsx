import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LearningPhraseList } from "./LearningPhraseList";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("LearningPhraseList", () => {
  it("copies and pronounces a reusable phrase when the browser supports it", async () => {
    const originalClipboard = navigator.clipboard;
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    const speak = vi.fn();
    vi.stubGlobal("speechSynthesis", { cancel: vi.fn(), speak });
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class {
        lang = "";
        rate = 1;
        constructor(readonly text: string) {}
      },
    );

    render(<LearningPhraseList phrases={["Could I have a latte?"]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Copiar: Could I have a latte?" }),
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("Could I have a latte?"),
    );
    expect(screen.getByText("Copiada")).toBeVisible();

    fireEvent.click(
      screen.getByRole("button", { name: "Escuchar: Could I have a latte?" }),
    );
    expect(speak).toHaveBeenCalledOnce();

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: originalClipboard,
    });
  });
});
