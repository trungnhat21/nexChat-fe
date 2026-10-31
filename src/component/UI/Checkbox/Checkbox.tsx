import React from "react";
import clsx from "clsx";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: React.ReactNode;
  solid?: boolean;
  size?: "sm" | "md";
  isSwitch?: boolean;
  containerClassName?: string;
  labelClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      solid = true,
      size = "md",
      isSwitch = false,
      containerClassName = "",
      labelClassName = "",
      className,
      id,
      type = "checkbox",
      ...props
    },
    ref
  ) => {
    return (
      <label
        className={clsx(
          "form-check",
          !isSwitch && "form-check-custom",
          solid && !isSwitch && "form-check-solid",
          isSwitch && "form-switch",
          size === "sm" && "form-check-sm",
          containerClassName
        )}
      >
        <input
          ref={ref}
          id={id}
          type={type}
          className={clsx("form-check-input", className)}
          {...props}
        />
        {label && (
          <span className={clsx("form-check-label select-none", labelClassName)}>
            {label}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";

export const Switch: React.FC<Omit<CheckboxProps, "isSwitch">> = (props) => (
  <Checkbox {...props} isSwitch={true} />
);

export default Checkbox;
