import { Link } from "react-router";
import Button from "../../component/UI/Button/Button";
import Input from "../../component/UI/Input/Input";
import RegisterIntro from "./components/RegisterIntro";
import RegisterField from "./components/RegisterField";
import { useRegisterActions } from "./actions";
import { interests, registerAssets, strengthLabels } from "./config";
import "./style.scss";

export default function RegisterPage() {
    const { formik, passwordVisible, setPasswordVisible, confirmationVisible, setConfirmationVisible, serverError, notice, setNotice, dialogRef, toggleInterest, openSocial, openPolicy, strength, handleValid } = useRegisterActions();
    const handleError = formik.touched.userName && formik.errors.userName;
    return <main className="register-page">
        <div className="register-layout">
            <RegisterIntro />
            <section className="register-card" aria-labelledby="register-title">
                <div className="register-heading"><h1 id="register-title">Tạo tài khoản Pulse mới</h1><p>Khám phá thế giới kết nối không giới hạn cùng hàng triệu bạn bè</p></div>
                <div className="register-social">
                    <Button className="register-social-button" onClick={() => openSocial("Google")}><img src={registerAssets.google} alt="" />Tiếp tục với Google</Button>
                    <Button className="register-social-button" onClick={() => openSocial("Apple")}><img src={registerAssets.apple} alt="" />Tiếp tục với Apple</Button>
                </div>
                <div className="register-divider"><span>Hoặc điền thông tin cá nhân</span></div>
                <form className="register-form" noValidate onSubmit={formik.handleSubmit}>
                    <fieldset disabled={formik.isSubmitting} className="register-fields">
                        <div className="register-row">
                            <RegisterField formik={formik} name="lastName" label="Họ và chữ đệm" placeholder="Nguyễn Văn" autoComplete="family-name" plain />
                            <RegisterField formik={formik} name="firstName" label="Tên gọi" placeholder="An" autoComplete="given-name" plain />
                        </div>
                        <div className="register-field">
                            <div className="register-field-heading"><label htmlFor="register-userName">Tên người dùng / Handle</label>{handleValid && <span className="register-handle-status" title="Đúng định dạng. Chưa kiểm tra trùng tên."><img src={registerAssets.valid} alt="" />Hợp lệ</span>}</div>
                            <div className={`register-input-shell${handleError ? " is-invalid" : ""}`}><span className="register-handle-prefix">@</span><div className="register-input-control"><Input compact id="register-userName" {...formik.getFieldProps("userName")} placeholder="an_nguyen24" autoComplete="username" inputClassName="register-input" aria-required="true" aria-invalid={!!handleError} aria-describedby={handleError ? "register-userName-error" : undefined} /></div></div>
                            {handleError && <p className="register-error" id="register-userName-error">{handleError}</p>}
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
                            <div><span>Độ mạnh mật khẩu</span><strong>{strengthLabels[strength]}</strong></div><div className="register-strength-bars" aria-hidden="true"><span /><span /><span /></div>
                        </div>
                        <div className="register-interests">
                            <div className="register-field-heading"><span id="register-interests-label">Chọn tối thiểu 3 sở thích ban đầu</span><span className="register-selection-count" aria-live="polite">Đã chọn: {formik.values.interests.length}</span></div>
                            <div className="register-interest-list" role="group" aria-labelledby="register-interests-label" aria-describedby={formik.touched.interests && formik.errors.interests ? "register-interests-error" : undefined}>{interests.map(item => <button type="button" key={item.id} className={`register-interest ${formik.values.interests.includes(item.id) ? "is-selected" : ""}`} aria-pressed={formik.values.interests.includes(item.id)} onClick={() => toggleInterest(item.id)}><img src={registerAssets[item.id]} alt="" />{item.label}</button>)}</div>
                            {formik.touched.interests && formik.errors.interests && <p className="register-error" id="register-interests-error">{formik.errors.interests}</p>}
                        </div>
                        <div className="register-consent"><div><input id="register-consent" name="consent" type="checkbox" checked={formik.values.consent} onChange={formik.handleChange} onBlur={formik.handleBlur} aria-invalid={!!(formik.touched.consent && formik.errors.consent)} aria-describedby={formik.touched.consent && formik.errors.consent ? "register-consent-error" : undefined} /><p><label htmlFor="register-consent">Tôi đồng ý với </label><button type="button" onClick={() => openPolicy("Điều khoản dịch vụ")}>Điều khoản dịch vụ</button> và <button type="button" onClick={() => openPolicy("Chính sách bảo mật")}>Chính sách bảo mật</button><label htmlFor="register-consent"> của mạng xã hội Pulse.</label></p></div>{formik.touched.consent && formik.errors.consent && <p className="register-error" id="register-consent-error">{formik.errors.consent}</p>}</div>
                    </fieldset>
                    {serverError && <p className="register-server-error" role="alert">{serverError}</p>}
                    <Button type="submit" className="register-submit" loadding={formik.isSubmitting}>Hoàn tất đăng ký &amp; Bắt đầu khám phá<img src={registerAssets.arrow} alt="" /></Button>
                </form>
                <p className="register-login">Đã có tài khoản Pulse? <Link to="/">Đăng nhập tại đây</Link></p>
            </section>
        </div>
        <dialog ref={dialogRef} className="register-dialog" aria-labelledby="register-dialog-title" onCancel={() => setNotice(null)} onClose={() => setNotice(null)} onClick={event => { if (event.target === event.currentTarget) setNotice(null); }}>
            <h2 id="register-dialog-title">{notice?.title}</h2><p>{notice?.message}</p><Button className="register-submit" onClick={() => setNotice(null)}>Đóng</Button>
        </dialog>
    </main>;
}
