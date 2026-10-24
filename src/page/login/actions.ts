import { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router";
import { login } from "../../axios/auth";
import { showError } from "../../utils/swal";
import { initialValues, validationSchema } from "./config";
import type { LoginPayload } from "../../component/type/auth";

export function useLoginActions() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const formik = useFormik<LoginPayload>({
        initialValues,
        validationSchema,
        onSubmit: async values => {
            try {
                await login(values);
                navigate("/home");
            } catch {
                showError("Email hoặc mật khẩu không đúng");
            }
        },
    });

    return { formik, showPassword, setShowPassword };
}
