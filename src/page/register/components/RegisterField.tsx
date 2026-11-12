import Input from "../../../component/UI/Input/Input";
import { registerAssets } from "../config";
import type { RegisterFieldProps } from "../../../component/type/register";

export default function RegisterField({
    formik,
    name,
    label,
    placeholder,
    type = "text",
    autoComplete,
    icon,
    plain,
    passwordVisible,
    onTogglePassword,
}: RegisterFieldProps) {
    const error = formik.touched[name] && formik.errors[name];
    return (
        <div className="register-field mb-1">
            <label htmlFor={`register-${name}`} className="form-label fs-8 fw-semibold text-gray-800 mb-1">
                {label}
            </label>
            <div className={`register-input-shell${plain ? " is-plain" : ""}${error ? " is-invalid border border-danger" : ""}`}>
                {icon && <img className="register-input-icon me-2" src={registerAssets[icon]} alt="" />}
                <div className="register-input-control">
                    <Input
                        compact
                        variant="transparent"
                        id={`register-${name}`}
                        {...formik.getFieldProps(name)}
                        type={onTogglePassword ? (passwordVisible ? "text" : "password") : type}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                        inputClassName="register-input"
                        aria-required={name !== "phone"}
                        aria-invalid={!!error}
                        aria-describedby={error ? `register-${name}-error` : undefined}
                    />
                </div>
                {onTogglePassword && (
                    <button
                        type="button"
                        className="btn btn-sm btn-flush link-primary fs-8 fw-semibold ms-1"
                        aria-label={`${passwordVisible ? "Ẩn" : "Hiện"} ${label.toLowerCase()}`}
                        aria-pressed={passwordVisible}
                        onClick={onTogglePassword}
                    >
                        {passwordVisible ? "Ẩn" : "Hiện"}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-danger fs-8 mt-1 mb-0" id={`register-${name}-error`}>
                    {error}
                </p>
            )}
        </div>
    );
}
