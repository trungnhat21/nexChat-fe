import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router";
import { register, login, setupTwoFactor, enableTwoFactor, socialLogin } from "../../axios/auth";
import { showSuccess, showError } from "../../utils/swal";
import { handlePattern, initialValues, validationSchema } from "./config";
import type { RegisterFormValues, RegisterNotice } from "../../component/type/register";

export function useRegisterActions() {
    const navigate = useNavigate();
    const [step, setStep] = useState<"form" | "twoFactor">("form");
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [serverError, setServerError] = useState("");
    const [notice, setNotice] = useState<RegisterNotice>(null);

    // 2FA Setup State
    const [twoFactorOtpauth, setTwoFactorOtpauth] = useState("");
    const [twoFactorSecret, setTwoFactorSecret] = useState("");
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [twoFactorError, setTwoFactorError] = useState("");
    const [twoFactorVerifying, setTwoFactorVerifying] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);

    // Social Modal State
    const [socialModalProvider, setSocialModalProvider] = useState<"Google" | "Apple" | null>(null);
    const [socialEmail, setSocialEmail] = useState("");
    const [socialName, setSocialName] = useState("");
    const [socialLoading, setSocialLoading] = useState(false);

    const dialogRef = useRef<HTMLDialogElement>(null);

    const formik = useFormik<RegisterFormValues>({
        initialValues,
        validationSchema,
        onSubmit: async values => {
            setServerError("");
            try {
                await register({
                    email: values.email.trim(),
                    password: values.password,
                    firstName: values.firstName.trim(),
                    lastName: values.lastName.trim(),
                    userName: values.userName.trim(),
                });

                if (values.enable2FA) {
                    // Tự động đăng nhập để lấy session và gọi API thiết lập 2FA
                    await login({
                        email: values.email.trim(),
                        password: values.password,
                    });

                    const setupRes = await setupTwoFactor();
                    if (setupRes.data?.otpauth) {
                        setTwoFactorOtpauth(setupRes.data.otpauth);
                        // Trích xuất mã secret từ otpauth://
                        const match = setupRes.data.otpauth.match(/secret=([A-Z0-9]+)/i);
                        setTwoFactorSecret(match ? match[1] : "");
                        setStep("twoFactor");
                        return;
                    }
                }

                void showSuccess("Đăng ký tài khoản thành công!");
                navigate("/", { replace: true });
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 409) {
                    formik.setFieldError("email", "Email này đã được đăng ký");
                    setServerError("Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.");
                } else {
                    setServerError(
                        isAxiosError(error) && !error.response
                            ? "Không thể kết nối máy chủ. Vui lòng thử lại."
                            : "Chưa thể tạo tài khoản. Vui lòng thử lại sau."
                    );
                }
            }
        },
    });

    useEffect(() => {
        if (notice && !dialogRef.current?.open) dialogRef.current?.showModal();
        if (!notice) dialogRef.current?.close();
    }, [notice]);

    async function handleVerifyTwoFactor(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (twoFactorCode.trim().length !== 6) {
            setTwoFactorError("Vui lòng nhập đủ 6 chữ số OTP");
            return;
        }

        setTwoFactorVerifying(true);
        setTwoFactorError("");
        try {
            await enableTwoFactor(twoFactorCode.trim());
            void showSuccess("Đã kích hoạt bảo mật 2 lớp (2FA) thành công!");
            navigate("/home", { replace: true });
        } catch {
            setTwoFactorError("Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.");
        } finally {
            setTwoFactorVerifying(false);
        }
    }

    function skipTwoFactor() {
        void showSuccess("Tài khoản đã tạo thành công!");
        navigate("/home", { replace: true });
    }

    function copySecret() {
        if (!twoFactorSecret) return;
        navigator.clipboard.writeText(twoFactorSecret);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
    }

    function openSocial(provider: "Google" | "Apple") {
        setSocialModalProvider(provider);
        setSocialEmail(provider === "Google" ? "nguyen.van.an@gmail.com" : "an.nguyen@icloud.com");
        setSocialName("Nguyễn Văn An");
    }

    function closeSocial() {
        setSocialModalProvider(null);
        setSocialLoading(false);
    }

    async function submitSocialAuth() {
        if (!socialEmail.trim()) {
            showError("Vui lòng nhập địa chỉ email");
            return;
        }

        setSocialLoading(true);
        try {
            const parts = socialName.trim().split(" ");
            const firstName = parts.pop() || "User";
            const lastName = parts.join(" ") || "";

            await socialLogin({
                provider: socialModalProvider?.toLowerCase() || "google",
                email: socialEmail.trim(),
                firstName,
                lastName,
            });

            void showSuccess(`Đăng nhập với ${socialModalProvider} thành công!`);
            navigate("/home", { replace: true });
        } catch {
            showError("Đăng nhập bằng tài khoản liên kết thất bại. Vui lòng thử lại.");
        } finally {
            setSocialLoading(false);
        }
    }

    function openPolicy(title: string) {
        setNotice({ title, message: "Nội dung chính sách đang được cập nhật. Vui lòng quay lại sau." });
    }

    const password = formik.values.password;
    const strength = !password ? 0 : password.length < 8 ? 1 : password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 3 : 2;

    const twoFactorQrUrl = twoFactorOtpauth
        ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFactorOtpauth)}`
        : "";

    return {
        step,
        formik,
        passwordVisible,
        setPasswordVisible,
        confirmationVisible,
        setConfirmationVisible,
        serverError,
        notice,
        setNotice,
        dialogRef,
        openSocial,
        openPolicy,
        strength,
        handleValid: handlePattern.test(formik.values.userName.trim()),
        twoFactorOtpauth,
        twoFactorSecret,
        twoFactorCode,
        setTwoFactorCode,
        twoFactorError,
        twoFactorVerifying,
        copiedSecret,
        copySecret,
        handleVerifyTwoFactor,
        skipTwoFactor,
        twoFactorQrUrl,
        socialModalProvider,
        socialEmail,
        setSocialEmail,
        socialName,
        setSocialName,
        socialLoading,
        closeSocial,
        submitSocialAuth,
    };
}
