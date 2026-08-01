/** Contenedor visual adaptable a la semántica de la sección que representa. */

import type { HTMLAttributes } from "react";

/** Propiedades HTML y elemento permitido para la tarjeta. */
export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "section" | "div";
}

/** Renderiza una tarjeta como `article`, `section` o `div` conservando atributos. */
export function Card({
  as: Element = "article",
  className = "",
  ...props
}: CardProps) {
  return <Element className={`sf-card ${className}`.trim()} {...props} />;
}
