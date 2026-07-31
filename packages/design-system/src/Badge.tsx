import type { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "active" | "success" | "warning" | "danger";
}

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
