/** Etiqueta visual breve para estados y metadatos. */

import type { HTMLAttributes } from "react";

/** Propiedades de `span` más el tono semántico de color. */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "active" | "success" | "warning" | "danger";
}

/** Renderiza una etiqueta sin imponer su texto ni atributos de accesibilidad. */
export function Badge({
  className = "",
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`sf-badge sf-badge--${tone} ${className}`.trim()}
      {...props}
    />
  );
}
