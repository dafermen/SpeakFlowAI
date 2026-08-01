import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ConversationTranscript } from "./ConversationTranscript";

const turns = [
  { id: 1, speaker: "tutor" as const, text: "How can I help you?" },
  { id: 2, speaker: "learner" as const, text: "A coffee, please." },
];

afterEach(cleanup);

describe("ConversationTranscript", () => {
  it("keeps the latest turn visible when the conversation grows", () => {
    const { rerender } = render(
      <ConversationTranscript label="Conversation" turns={turns.slice(0, 1)} />,
    );
    const list = screen.getByRole("list", { name: "Conversation" });
    const scrollTo = vi.fn();
    Object.defineProperty(list, "scrollTo", {
      configurable: true,
      value: scrollTo,
    });
    Object.defineProperty(list, "scrollHeight", {
      configurable: true,
      value: 500,
    });

    rerender(<ConversationTranscript label="Conversation" turns={turns} />);

    expect(scrollTo).toHaveBeenCalledWith({ behavior: "auto", top: 500 });
    expect(screen.getByText("A coffee, please.")).toBeVisible();
  });

  it("respects manual reading and offers a return to the latest turn", () => {
    render(<ConversationTranscript label="Conversation" turns={turns} />);
    const list = screen.getByRole("list", { name: "Conversation" });
    Object.defineProperties(list, {
      clientHeight: { configurable: true, value: 200 },
      scrollHeight: { configurable: true, value: 600 },
      scrollTop: { configurable: true, value: 100, writable: true },
    });

    fireEvent.scroll(list);
    expect(
      screen.getByRole("button", { name: "Volver al final" }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Volver al final" }));
    expect(
      screen.queryByRole("button", { name: "Volver al final" }),
    ).not.toBeInTheDocument();
  });

  it("lets the learner exclude an incorrect transcription from review", () => {
    const onToggleExclude = vi.fn();
    render(
      <ConversationTranscript
        label="Conversation"
        onToggleExclude={onToggleExclude}
        turns={turns}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Esto no fue lo que dije" }),
    );

    expect(onToggleExclude).toHaveBeenCalledWith(2);
  });
});
