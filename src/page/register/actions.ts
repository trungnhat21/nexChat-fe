import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router";
import { register } from "../../axios/auth";
import { showSuccess } from "../../utils/swal";
import { handlePattern, initialValues, validationSchema } from "./config";
import type { RegisterFormValues, RegisterNotice } from "../../component/type/register";

export function useRegisterActions() {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [serverError, setServerError] = useState("");
    const [notice, setNotice] = useState<RegisterNotice>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const formik = useFormik<RegisterFormValues>({
        initialValues,
        validationSchema,
        onSubmit: async values => {
            setServerError("");
            try {
                await register({
                    email: values.email.trim(), password: values.password,
                    firstName: values.firstName.trim(), lastName: values.lastName.trim(),
                    userName: values.userName.trim(),
                });
                void showSuccess("Đăng ký thành công! Bạn có thể đăng nhập.");
                navigate("/", { replace: true });
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 409) {
                    formik.setFieldError("email", "Email này đã được đăng ký");
                    setServerError("Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.");
                } else {
                    setServerError(isAxiosError(error) && !error.response
                        ? "Không thể kết nối máy chủ. Vui lòng thử lại."
                        : "Chưa thể tạo tài khoản. Vui lòng thử lại sau.");
                }
            }
        },
    });
    useEffect(() => {
        if (notice && !dialogRef.current?.open) dialogRef.current?.showModal();
        if (!notice) dialogRef.current?.close();
    }, [notice]);

    function toggleInterest(id: string) {
        const selected = formik.values.interests;
        void formik.setFieldValue("interests", selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id]);
        void formik.setFieldTouched("interests", true, false);
    }
    function openSocial(provider: string) {
        setNotice({ title: `Tiếp tục với ${provider}`, message: `Đăng ký bằng ${provider} chưa khả dụng. Bạn có thể tạo tài khoản bằng email bên dưới.` });
    }
    function openPolicy(title: string) {
        setNotice({ title, message: "Nội dung chính sách đang được cập nhật. Vui lòng quay lại sau." });
    }
    const password = formik.values.password;
    const strength = !password ? 0 : password.length < 8 ? 1 : password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 3 : 2;
    return {
        formik, passwordVisible, setPasswordVisible, confirmationVisible, setConfirmationVisible,
        serverError, notice, setNotice, dialogRef, toggleInterest, openSocial, openPolicy, strength,
        handleValid: handlePattern.test(formik.values.userName.trim()),
    };
}
