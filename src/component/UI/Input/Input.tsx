import "./Input.scss"
import { KTIcon } from "../../../_metronic/helpers/components/KTIcon";
import type React from "react";

type inputProps = {
    label?: string;
    type?: string;
    placeholder?: string;
    icon?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    lableRight?: React.ReactNode
    rightIcon?: React.ReactNode
    name?: string

};
export default function Input({
    label,
    type = "text",
    placeholder,
    icon,
    value,
    onChange,
    lableRight,
    rightIcon,
    onBlur,
    name

}: inputProps) {
    if (type === "checkbox") {
        return (
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    className="cursor-pointer"
                />

                <span className="fs-14">
                    {label}
                </span>
            </label>
        )
    }
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                {label && (
                    <label className="text-sm">
                        {label}
                    </label>
                )}

                {lableRight}
            </div>
            <div className="relative">

                {icon && (
                    <KTIcon
                        iconName={icon}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                    />
                )}
                <input
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="w-full border rounded-lg p-4 pl-10 bg-input"
                />

                {rightIcon && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {rightIcon}
                    </div>
                )}

            </div>

        </div>
    )
}