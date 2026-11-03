import React from "react";
import clsx from "clsx";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  flush?: boolean;
  bordered?: boolean;
  dashed?: boolean;
  shadow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  flush = false,
  bordered = false,
  dashed = false,
  shadow = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={clsx(
        "card",
        flush && "card-flush",
        bordered && "card-bordered",
        dashed && "card-dashed",
        shadow && "card-shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardHeader: React.FC<CardHeaderProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={clsx("card-header", className)} {...props}>
      {children}
    </div>
  );
};

export interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  subtitle,
  icon,
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={clsx("card-title", className)} {...props}>
      {icon && <span className="flex items-center text-primary">{icon}</span>}
      <div className="flex flex-col">
        {typeof children === "string" ? <h3>{children}</h3> : children}
        {subtitle && <span className="card-subtitle mt-0.5">{subtitle}</span>}
      </div>
    </div>
  );
};

export interface CardToolbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardToolbar: React.FC<CardToolbarProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={clsx("card-toolbar", className)} {...props}>
      {children}
    </div>
  );
};

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  scroll?: boolean;
}

export const CardBody: React.FC<CardBodyProps> = ({
  scroll = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <div
      className={clsx("card-body", scroll && "card-scroll", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({
  className = "",
  children,
  ...props
}) => {
  return (
    <div className={clsx("card-footer", className)} {...props}>
      {children}
    </div>
  );
};

export default Card;
