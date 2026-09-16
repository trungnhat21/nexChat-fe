import "./Input.scss"
import { KTIcon } from "../../../_metronic/helpers/components/KTIcon";

type inputProps = {
    label?: string;
    type?: string;
    placeholder?: string;
    icon?: string;

};
export default function Input({
    label,
    type = "text",
    placeholder,
    icon
}: inputProps) {
    return (
        <div>
            {label && (<label className="text-sm">{label}</label>)}
            <div className="relative">
                {icon && (
                    <KTIcon iconName={icon}
                        className="absolute left-4 top-1/2 -translate-y-1/2"
                    />
                )}
                <input type={type} placeholder={placeholder} className="w-full border rounded-lg p-4 pl-10 bg-input" />
            </div>

        </div>
    )
}