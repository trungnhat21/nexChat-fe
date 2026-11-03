import type { FormikProps } from "formik";
import type { RegisterPayload } from "./auth";
import type { registerAssets } from "../../page/register/config";

export type RegisterFormValues = RegisterPayload & {
    phone: string;
    confirmPassword: string;
    enable2FA: boolean;
    consent: boolean;
};
export type RegisterAssetName = keyof typeof registerAssets;
export type RegisterFieldName = Exclude<keyof RegisterFormValues, "enable2FA" | "consent">;
export type RegisterFieldProps = {
    formik: FormikProps<RegisterFormValues>;
    name: RegisterFieldName;
    label: string;
    placeholder: string;
    type?: string;
    autoComplete?: string;
    icon?: RegisterAssetName;
    plain?: boolean;
    passwordVisible?: boolean;
    onTogglePassword?: () => void;
};
export type RegisterNotice = { title: string; message: string } | null;
