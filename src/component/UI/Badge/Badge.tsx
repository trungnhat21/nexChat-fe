import React from "react";
import clsx from "clsx";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info"
  | "dark"
  | "light-primary"
  | "light-secondary"
  | "light-success"
  | "light-danger"
  | "light-warning"
  | "light-info"
  | "light-dark";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  circle?: boolean;
  square?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "light-primary",
  size = "md",
  circle = false,
  square = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <span
      className={clsx(
        "badge",
        variant && `badge-${variant}`,
        size && size !== "md" && `badge-${size}`,
        circle && "badge-circle",
        square && "badge-square",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
