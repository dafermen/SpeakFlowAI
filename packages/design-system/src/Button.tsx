import { forwardRef, type ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
}

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
