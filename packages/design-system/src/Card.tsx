import type { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: "article" | "section" | "div";
}

export function Card({
  as: Element = "article",
  className = "",
  ...props
}: CardProps) {
  return <Element className={`sf-card ${className}`.trim()} {...props} />;
}
