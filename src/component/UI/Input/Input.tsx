import React from "react";
import clsx from "clsx";
import { KTIcon } from "../../../_metronic/helpers/components/KTIcon";

export type InputVariant = "solid" | "outline" | "flush" | "transparent";
export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  labelRight?: React.ReactNode;
  lableRight?: React.ReactNode; // Backward compatibility
  error?: string;
  helperText?: string;
  icon?: string; // KeenIcon name
  leftElement?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  inputClassName?: string;
  containerClassName?: string;
  compact?: boolean;
  variant?: InputVariant;
  solid?: boolean; // Shortcut for variant="solid"
  size?: InputSize;
  required?: boolean;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      labelRight,
      lableRight,
      error,
      helperText,
      icon,
      leftElement,
      rightIcon,
      rightElement,
      inputClassName,
      containerClassName = "",
      compact = false,
      variant = "solid",
      solid,
      size,
      required,
      type = "text",
      className,
      id,
      ...inputAttributes
    },
    ref
  ) => {
    // Checkbox special case for backward compatibility
    if (type === "checkbox") {
      return (
        <label className={clsx("form-check form-check-custom", solid && "form-check-solid", containerClassName)}>
          <input
            ref={ref}
            type="checkbox"
            id={id}
            className={clsx("form-check-input", inputClassName)}
            {...inputAttributes}
          />
          {label && <span className="form-check-label fs-14">{label}</span>}
        </label>
      );
    }

    const effectiveVariant = solid ? "solid" : variant;
    const finalRight = rightElement || rightIcon;
    const finalLeft = leftElement || (icon ? <KTIcon iconName={icon} className="text-gray-500 fs-18" /> : null);
    const rightLabel = labelRight || lableRight;

    return (
      <div className={clsx("w-full", containerClassName)}>
        {(!compact || label || rightLabel) && (
          <div className="flex items-center justify-between mb-1.5">
            {label && (
              <label
                htmlFor={id}
                className={clsx("form-label mb-0 text-sm", required && "required")}
              >
                {label}
              </label>
            )}
            {rightLabel}
          </div>
        )}

        <div className="relative flex items-center">
          {finalLeft && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center z-10 text-gray-400">
              {finalLeft}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            type={type}
            required={required}
            className={clsx(
              "form-control",
              effectiveVariant === "solid" && "form-control-solid",
              effectiveVariant === "flush" && "form-control-flush",
              effectiveVariant === "transparent" && "form-control-transparent",
              size && size !== "md" && `form-control-${size}`,
              finalLeft ? "pl-11" : "",
              finalRight ? "pr-11" : "",
              error && "border-red-500 focus:border-red-500",
              inputClassName
            )}
            {...inputAttributes}
          />

          {finalRight && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center z-10">
              {finalRight}
            </div>
          )}
        </div>

        {error ? (
          <div className="text-red-500 text-xs mt-1 font-medium">{error}</div>
        ) : helperText ? (
          <div className="text-gray-500 text-xs mt-1">{helperText}</div>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
