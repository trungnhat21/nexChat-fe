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
    lableRight?: React.ReactNode
};
export default function Input({
    label,
    type = "text",
    placeholder,
    icon,
    value,
    onChange,
    lableRight
}: inputProps) {
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
                    <KTIcon iconName={icon}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                    />
                )}
                <input type={type} placeholder={placeholder} value={value} onChange={onChange} className="w-full border rounded-lg p-4 pl-10 bg-input" />
            </div>

        </div>
    )
}