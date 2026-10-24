import Input from "../../../component/UI/Input/Input";
import { registerAssets } from "../config";
import type { RegisterFieldProps } from "../../../component/type/register";

export default function RegisterField({ formik, name, label, placeholder, type = "text", autoComplete, icon, plain, passwordVisible, onTogglePassword }: RegisterFieldProps) {
    const error = formik.touched[name] && formik.errors[name];
    return <div className="register-field">
        <label htmlFor={`register-${name}`}>{label}</label>
        <div className={`register-input-shell${plain ? " is-plain" : ""}${error ? " is-invalid" : ""}`}>
            {icon && <img className="register-input-icon" src={registerAssets[icon]} alt="" />}
            <div className="register-input-control"><Input compact id={`register-${name}`} {...formik.getFieldProps(name)}
                type={onTogglePassword ? passwordVisible ? "text" : "password" : type}
                placeholder={placeholder} autoComplete={autoComplete} inputClassName="register-input"
                aria-required={name !== "phone"} aria-invalid={!!error} aria-describedby={error ? `register-${name}-error` : undefined}
            /></div>
            {onTogglePassword && <button type="button" className="register-password-toggle" aria-label={`${passwordVisible ? "Ẩn" : "Hiện"} ${label.toLowerCase()}`} aria-pressed={passwordVisible} onClick={onTogglePassword}>{passwordVisible ? "Ẩn" : "Hiện"}</button>}
        </div>
        {error && <p className="register-error" id={`register-${name}-error`}>{error}</p>}
    </div>;
}
