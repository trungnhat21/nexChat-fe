import React from "react";
import clsx from "clsx";

export type SelectOption = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

export type SelectVariant = "solid" | "outline";
export type SelectSize = "sm" | "md" | "lg";

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  variant?: SelectVariant;
  solid?: boolean;
  size?: SelectSize;
  containerClassName?: string;
  selectClassName?: string;
  compact?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      variant = "solid",
      solid,
      size,
      containerClassName = "",
      selectClassName = "",
      compact = false,
      children,
      id,
      required,
      className,
      ...selectAttributes
    },
    ref
  ) => {
    const effectiveVariant = solid ? "solid" : variant;

    return (
      <div className={clsx("w-full", containerClassName)}>
        {(!compact || label) && label && (
          <label
            htmlFor={id}
            className={clsx("form-label mb-1.5 text-sm", required && "required")}
          >
            {label}
          </label>
        )}

        <select
          ref={ref}
          id={id}
          required={required}
          className={clsx(
            "form-select",
            effectiveVariant === "solid" && "form-select-solid",
            size && size !== "md" && `form-select-${size}`,
            error && "border-red-500 focus:border-red-500",
            selectClassName
          )}
          {...selectAttributes}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        {error ? (
          <div className="text-red-500 text-xs mt-1 font-medium">{error}</div>
        ) : helperText ? (
          <div className="text-gray-500 text-xs mt-1">{helperText}</div>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
