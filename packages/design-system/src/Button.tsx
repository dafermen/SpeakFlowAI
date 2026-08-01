/** Botón accesible que aplica variantes visuales sin ocultar atributos HTML. */

import { forwardRef, type ButtonHTMLAttributes } from "react";

/** Propiedades nativas más las decisiones visuales del sistema de diseño. */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
}

/**
 * Botón reutilizable con tipo seguro `button` por defecto.
 *
 * Reenvía la referencia para foco programático y conserva eventos, ARIA y demás
 * propiedades nativas mediante `...props`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className = "",
      type = "button",
      variant = "primary",
      size = "medium",
      ...props
    },
    ref,
  ) {
    return (
      <button
        className={`sf-button sf-button--${variant} sf-button--${size} ${className}`.trim()}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
