import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";
import { Button } from "./Button";

describe("design-system foundations", () => {
  it("keeps a disabled primary action accessible", () => {
    render(<Button disabled>Iniciar práctica</Button>);

    expect(
      screen.getByRole("button", { name: "Iniciar práctica" }),
    ).toBeDisabled();
  });

  it("exposes status text independently of color", () => {
    render(<Badge tone="active">Te escucho</Badge>);

    expect(screen.getByText("Te escucho")).toBeVisible();
  });
});
