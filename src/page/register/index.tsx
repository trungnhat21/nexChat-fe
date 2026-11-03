import { Link } from "react-router";
import { ShieldCheck, Copy, Check, ArrowRight } from "lucide-react";
import Input from "../../component/UI/Input/Input";
import RegisterIntro from "./components/RegisterIntro";
import RegisterField from "./components/RegisterField";
import { useRegisterActions } from "./actions";
import { registerAssets, strengthLabels } from "./config";
import "./style.scss";

export default function RegisterPage() {
    const {
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
        handleValid,
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
    } = useRegisterActions();

    const handleError = formik.touched.userName && formik.errors.userName;

    return (
        <main className="register-page">
            <div className="register-layout">
                <RegisterIntro />

                <section className="register-card" aria-labelledby="register-title">
                    {step === "twoFactor" ? (
                        /* Bước 2: Thiết lập bảo mật 2 lớp (2FA) */
                        <div className="register-2fa-setup">
                            <div className="badge badge-light-primary fs-7 fw-bold py-2 px-3 rounded-pill mb-2 d-inline-flex align-items-center gap-2">
                                <ShieldCheck size={16} />
                                <span>Xác thực bảo mật 2 lớp</span>
                            </div>

                            <h1 id="register-title" className="fs-3 fw-bold text-gray-900 mb-2">
                                Thiết lập ứng dụng xác thực (2FA)
                            </h1>
                            <p className="fs-7 text-gray-600 mb-4">
                                Tài khoản <strong>{formik.values.email}</strong> đã sẵn sàng. Hãy liên kết ứng dụng xác thực (Google Authenticator, Microsoft Authenticator hoặc Authy) để tăng cường bảo vệ.
                            </p>

                            <div className="register-2fa-qr-card">
                                <div className="register-2fa-qr-box">
                                    {twoFactorQrUrl ? (
                                        <img src={twoFactorQrUrl} alt="Mã QR 2FA" className="register-2fa-qr-img" />
                                    ) : (
                                        <div className="register-2fa-qr-loading">Đang tải mã QR...</div>
                                    )}
                                </div>

                                <div className="register-2fa-secret-box">
                                    <span className="register-2fa-secret-label">Hoặc nhập mã khóa thủ công:</span>
                                    <div className="register-2fa-secret-row">
                                        <code>{twoFactorSecret || "..."}</code>
                                        <button type="button" className="btn btn-sm btn-light-primary py-1 px-3 fs-8 fw-semibold" onClick={copySecret}>
                                            {copiedSecret ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                                            <span>{copiedSecret ? "Đã chép" : "Sao chép"}</span>
                                        </button>
                                    </div>
                                    <p className="register-2fa-hint">
                                        Mở app Google Authenticator &rarr; Thêm mã khóa &rarr; Quét QR hoặc dán mã trên.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleVerifyTwoFactor} className="register-2fa-verify-form mt-4">
                                <label htmlFor="register-2fa-code" className="form-label fs-7 fw-semibold text-gray-800 mb-2">Nhập mã xác minh 6 chữ số từ app:</label>
                                <div className="register-2fa-input-wrap">
                                    <input
                                        id="register-2fa-code"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={twoFactorCode}
                                        onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        className="register-2fa-code-input form-control form-control-solid fs-2 fw-bolder text-center"
                                        autoFocus
                                    />
                                </div>
                                {twoFactorError && <p className="text-danger fs-7 mt-2 text-center" role="alert">{twoFactorError}</p>}

                                <div className="d-flex flex-column gap-2 mt-4">
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 rounded-pill py-3 fs-7 fw-bold"
                                        disabled={twoFactorCode.length !== 6 || twoFactorVerifying}
                                        data-kt-indicator={twoFactorVerifying ? "on" : "off"}
                                    >
                                        <span className="indicator-label">
                                            <span>Kích hoạt 2FA &amp; Bắt đầu khám phá</span>
                                            <ArrowRight size={16} className="ms-2" />
                                        </span>
                                        <span className="indicator-progress">
                                            <span className="spinner-border spinner-border-sm align-middle me-2"></span>
                                            <span>Đang kích hoạt...</span>
                                        </span>
                                    </button>

                                    <button type="button" className="btn btn-flush text-gray-600 fs-7 py-2" onClick={skipTwoFactor}>
                                        Để sau &rarr; Vào bảng tin NexChat
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Bước 1: Form Đăng Ký Tài Khoản Chính */
                        <div className="register-form-wrap">
                            <div className="register-heading mb-4">
                                <h1 id="register-title" className="fs-2 fw-bold text-gray-900 mb-1">Tạo tài khoản NexChat mới</h1>
                                <p className="text-gray-600 fs-7 m-0">Khám phá thế giới kết nối không giới hạn cùng hàng triệu bạn bè</p>
                            </div>

                            <div className="row g-2 mb-4">
                                <div className="col-6">
                                    <button
                                        type="button"
                                        className="btn btn-light-primary btn-flex rounded-pill w-100 py-2 fs-7 fw-semibold"
                                        onClick={() => openSocial("Google")}
                                    >
                                        <img src={registerAssets.google} alt="" className="w-18px h-18px me-2" />
                                        Tiếp tục với Google
                                    </button>
                                </div>
                                <div className="col-6">
                                    <button
                                        type="button"
                                        className="btn btn-light-primary btn-flex rounded-pill w-100 py-2 fs-7 fw-semibold"
                                        onClick={() => openSocial("Apple")}
                                    >
                                        <img src={registerAssets.apple} alt="" className="w-18px h-18px me-2" />
                                        Tiếp tục với Apple
                                    </button>
                                </div>
                            </div>

                            <div className="separator separator-content my-4">
                                <span className="text-gray-500 fs-8 fw-semibold px-3 text-uppercase">Hoặc điền thông tin cá nhân</span>
                            </div>

                            <form className="register-form" noValidate onSubmit={formik.handleSubmit}>
                                <fieldset disabled={formik.isSubmitting} className="register-fields">
                                    <div className="register-row">
                                        <RegisterField formik={formik} name="lastName" label="Họ và chữ đệm" placeholder="Nguyễn Văn" autoComplete="family-name" plain />
                                        <RegisterField formik={formik} name="firstName" label="Tên gọi" placeholder="An" autoComplete="given-name" plain />
                                    </div>

                                    <div className="register-field mb-1">
                                        <div className="d-flex align-items-center justify-content-between mb-1">
                                            <label htmlFor="register-userName" className="form-label fs-8 fw-semibold text-gray-800 mb-0">Tên người dùng / Handle</label>
                                            {handleValid && (
                                                <span className="badge badge-light-primary fs-9 fw-semibold py-1 px-2" title="Đúng định dạng. Chưa kiểm tra trùng tên.">
                                                    <img src={registerAssets.valid} alt="" className="w-12px h-12px me-1" />Hợp lệ
                                                </span>
                                            )}
                                        </div>
                                        <div className={`register-input-shell${handleError ? " is-invalid border border-danger" : ""}`}>
                                            <span className="register-handle-prefix text-gray-500 fw-semibold">@</span>
                                            <div className="register-input-control">
                                                <Input compact id="register-userName" {...formik.getFieldProps("userName")} placeholder="an_nguyen24" autoComplete="username" inputClassName="register-input" aria-required="true" aria-invalid={!!handleError} aria-describedby={handleError ? "register-userName-error" : undefined} />
                                            </div>
                                        </div>
                                        {handleError && <p className="text-danger fs-8 mt-1 mb-0" id="register-userName-error">{handleError}</p>}
                                    </div>

                                    <div className="register-row">
                                        <RegisterField formik={formik} name="email" label="Địa chỉ Email" placeholder="ban@email.com" type="email" autoComplete="email" icon="email" />
                                        <RegisterField formik={formik} name="phone" label="Số điện thoại" placeholder="0912 345 678" type="tel" autoComplete="tel" icon="phone" />
                                    </div>

                                    <div className="register-row">
                                        <RegisterField formik={formik} name="password" label="Mật khẩu" placeholder="••••••••" autoComplete="new-password" icon="password" passwordVisible={passwordVisible} onTogglePassword={() => setPasswordVisible(!passwordVisible)} />
                                        <RegisterField formik={formik} name="confirmPassword" label="Xác nhận mật khẩu" placeholder="••••••••" autoComplete="new-password" icon="confirm-password" passwordVisible={confirmationVisible} onTogglePassword={() => setConfirmationVisible(!confirmationVisible)} />
                                    </div>

                                    <div className={`register-strength strength-${strength}`} role="meter" aria-label="Độ mạnh mật khẩu" aria-valuemin={0} aria-valuemax={3} aria-valuenow={strength} aria-valuetext={strengthLabels[strength]}>
                                        <div>
                                            <span>Độ mạnh mật khẩu</span>
                                            <strong>{strengthLabels[strength]}</strong>
                                        </div>
                                        <div className="register-strength-bars" aria-hidden="true">
                                            <span /><span /><span />
                                        </div>
                                    </div>

                                    {/* Tùy chọn kích hoạt 2FA ngay khi tạo tài khoản */}
                                    <div className="p-3 rounded-3 bg-light-primary border border-primary border-opacity-25 mb-1">
                                        <label htmlFor="register-enable2fa" className="form-check form-check-custom form-check-solid cursor-pointer align-items-start m-0">
                                            <input
                                                id="register-enable2fa"
                                                name="enable2FA"
                                                type="checkbox"
                                                className="form-check-input mt-1"
                                                checked={formik.values.enable2FA}
                                                onChange={formik.handleChange}
                                            />
                                            <div className="d-flex flex-column gap-1 ms-2">
                                                <span className="fs-7 fw-bold text-gray-900 d-flex align-items-center gap-1">
                                                    <ShieldCheck size={16} className="text-primary" />
                                                    Kích hoạt bảo mật 2 lớp (2FA Authenticator)
                                                </span>
                                                <span className="fs-8 text-gray-600">
                                                    Bảo vệ tài khoản bằng mã OTP 6 số qua Google Authenticator / Authy ngay sau khi đăng ký.
                                                </span>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Điều khoản dịch vụ */}
                                    <div className="register-consent mt-1">
                                        <div className="form-check form-check-custom form-check-solid align-items-start">
                                            <input
                                                id="register-consent"
                                                name="consent"
                                                type="checkbox"
                                                className="form-check-input mt-1"
                                                checked={formik.values.consent}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                aria-invalid={!!(formik.touched.consent && formik.errors.consent)}
                                                aria-describedby={formik.touched.consent && formik.errors.consent ? "register-consent-error" : undefined}
                                            />
                                            <p className="fs-8 text-gray-700 ms-2 mb-0">
                                                <label htmlFor="register-consent" className="cursor-pointer">Tôi đồng ý với </label>
                                                <button type="button" className="btn btn-flush link-primary fs-8 fw-semibold" onClick={() => openPolicy("Điều khoản dịch vụ")}>Điều khoản dịch vụ</button> và <button type="button" className="btn btn-flush link-primary fs-8 fw-semibold" onClick={() => openPolicy("Chính sách bảo mật")}>Chính sách bảo mật</button>
                                                <label htmlFor="register-consent" className="cursor-pointer"> của mạng xã hội NexChat.</label>
                                            </p>
                                        </div>
                                        {formik.touched.consent && formik.errors.consent && <p className="text-danger fs-8 mt-1 mb-0" id="register-consent-error">{formik.errors.consent}</p>}
                                    </div>
                                </fieldset>

                                {serverError && <p className="text-danger fs-7 bg-light-danger p-3 rounded-2 mt-2 mb-0" role="alert">{serverError}</p>}
                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 rounded-pill py-3 mt-3 fs-7 fw-bold"
                                    disabled={formik.isSubmitting}
                                    data-kt-indicator={formik.isSubmitting ? "on" : "off"}
                                >
                                    <span className="indicator-label">
                                        <span>Hoàn tất đăng ký &amp; Bắt đầu khám phá</span>
                                        <img src={registerAssets.arrow} alt="" className="ms-2" />
                                    </span>
                                    <span className="indicator-progress">
                                        <span className="spinner-border spinner-border-sm align-middle me-2"></span>
                                        <span>Đang đăng ký...</span>
                                    </span>
                                </button>
                            </form>

                            <p className="text-center text-gray-600 fs-7 mt-4 mb-0">
                                Đã có tài khoản NexChat? <Link to="/" className="link-primary fw-bold">Đăng nhập tại đây</Link>
                            </p>
                        </div>
                    )}
                </section>
            </div>

            {/* Modal Thông Báo / Chính Sách */}
            <dialog ref={dialogRef} className="register-dialog" style={!notice ? { display: "none" } : undefined} aria-labelledby="register-dialog-title" onCancel={() => setNotice(null)} onClose={() => setNotice(null)} onClick={event => { if (event.target === event.currentTarget) setNotice(null); }}>
                {notice && (
                    <div className="register-dialog-inner">
                        <h2 id="register-dialog-title">{notice.title}</h2>
                        <p>{notice.message}</p>
                        <button type="button" className="btn btn-primary w-100 rounded-pill py-3 fs-7 fw-bold" onClick={() => setNotice(null)}>Đóng</button>
                    </div>
                )}
            </dialog>

            {/* Modal Đăng Ký 1-Chạm qua Google & Apple */}
            {socialModalProvider && (
                <div className="register-social-modal-backdrop" onClick={closeSocial}>
                    <div className="register-social-modal card border-0 shadow-lg p-5 rounded-4" onClick={e => e.stopPropagation()}>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center gap-2">
                                <img
                                    src={socialModalProvider === "Google" ? registerAssets.google : registerAssets.apple}
                                    alt={socialModalProvider}
                                    className="w-24px h-24px"
                                />
                                <h3 className="fs-4 fw-bold text-gray-900 m-0">Đăng ký với {socialModalProvider}</h3>
                            </div>
                            <button type="button" className="btn btn-icon btn-sm btn-light-primary rounded-circle" onClick={closeSocial}>✕</button>
                        </div>

                        <p className="text-muted fs-7 mb-4">
                            NexChat sẽ liên kết thông tin tài khoản {socialModalProvider} của bạn để tạo hồ sơ và tự động đăng nhập an toàn.
                        </p>

                        <div className="d-flex flex-column gap-3 mb-4">
                            <div>
                                <label className="form-label fs-8 fw-semibold text-gray-700 mb-1">Email {socialModalProvider}</label>
                                <input
                                    type="email"
                                    className="form-control rounded-2 p-3 border border-gray-300 fs-7 w-100"
                                    value={socialEmail}
                                    onChange={e => setSocialEmail(e.target.value)}
                                    placeholder={`name@${socialModalProvider === "Google" ? "gmail.com" : "icloud.com"}`}
                                    required
                                />
                            </div>

                            <div>
                                <label className="form-label fs-8 fw-semibold text-gray-700 mb-1">Họ và tên hiển thị</label>
                                <input
                                    type="text"
                                    className="form-control rounded-2 p-3 border border-gray-300 fs-7 w-100"
                                    value={socialName}
                                    onChange={e => setSocialName(e.target.value)}
                                    placeholder="Nguyễn Văn An"
                                    required
                                />
                            </div>
                        </div>

                        <div className="d-flex flex-column gap-2">
                            <button
                                type="button"
                                className="btn btn-primary w-100 rounded-pill py-3 fs-7 fw-bold"
                                disabled={socialLoading || !socialEmail.trim()}
                                data-kt-indicator={socialLoading ? "on" : "off"}
                                onClick={submitSocialAuth}
                            >
                                <span className="indicator-label">Xác nhận đăng ký &amp; Đăng nhập ngay</span>
                                <span className="indicator-progress d-inline-flex align-items-center gap-2">
                                    <span className="spinner-border spinner-border-sm align-middle me-2"></span>
                                    <span>Đang xử lý...</span>
                                </span>
                            </button>
                            <button type="button" className="btn btn-flush text-muted fs-7 py-2" onClick={closeSocial}>
                                Hủy bỏ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
