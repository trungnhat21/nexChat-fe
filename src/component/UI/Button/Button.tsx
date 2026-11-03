import React from "react";
import clsx from "clsx";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "dark"
  | "light"
  | "light-primary"
  | "light-secondary"
  | "light-success"
  | "light-danger"
  | "light-warning"
  | "light-info"
  | "light-dark"
  | "outline"
  | "outline-dashed"
  | "outline-primary"
  | "outline-danger"
  | "outline-success"
  | "flush";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadding?: boolean; // Backward compatibility with existing pages
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  iconOnly?: boolean;
  circle?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant,
  size,
  loading,
  loadding,
  loadingText,
  icon,
  iconPosition = "left",
  iconOnly = false,
  circle = false,
  disabled,
  type = "button",
  ...props
}) => {
  const isLoading = Boolean(loading || loadding);

  const buttonClasses = clsx(
    "btn",
    variant && `btn-${variant}`,
    size && size !== "md" && `btn-${size}`,
    iconOnly && "btn-icon",
    circle && "btn-circle",
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || isLoading}
      data-kt-indicator={isLoading ? "on" : undefined}
      {...props}
    >
      <span className="indicator-label">
        {icon && iconPosition === "left" && icon}
        {children}
        {icon && iconPosition === "right" && icon}
      </span>
      {isLoading && (
        <span className="indicator-progress">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          {loadingText ? <span>{loadingText}</span> : children ? <span>{children}</span> : <span>Đang xử lý...</span>}
        </span>
      )}
    </button>
  );
};

export default Button;