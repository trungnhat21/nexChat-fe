import { useState } from "react";
import { Link } from "react-router";
import {
    ShieldCheck,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowRight,
    Heart,
    Users,
    Activity,
} from "lucide-react";

import googleIcon from "../../_metronic/assets/images/google_icon.svg";
import appleIcon from "../../_metronic/assets/images/apple_icon.svg";
import preview_login from "../../_metronic/assets/images/preview_login.svg";
import nexchatLogo from "../../_metronic/assets/images/home/nexchat-logo.svg";
import avatar1 from "../../_metronic/assets/images/home/avatar-ha-my.png";
import avatar2 from "../../_metronic/assets/images/home/avatar-phuong-thao.png";
import avatar3 from "../../_metronic/assets/images/home/avatar-quang-huy.png";

import { useLoginActions } from "./actions";
import "./style.scss";

export default function LoginPage() {
    const { formik, showPassword, setShowPassword } = useLoginActions();
    const [rememberMe, setRememberMe] = useState(true);

    return (
        <main className="login-page">
            <div className="login-container">
                {/* Cột trái: Giới thiệu thương hiệu & Tương tác cộng đồng NexChat */}
                <section className="login-hero" aria-label="Giới thiệu thương hiệu NexChat">
                    <div className="ambient-glow-1" aria-hidden="true" />
                    <div className="ambient-glow-2" aria-hidden="true" />

                    <div className="login-hero-header">
                        <div className="login-brand-row">
                            <div className="login-logo-box">
                                <img src={nexchatLogo} alt="NexChat Logo" />
                            </div>
                            <span className="login-brand-name">NexChat</span>
                            <span className="login-brand-badge">MẠNG XÃ HỘI 3.0</span>
                        </div>

                        <h2 className="login-hero-title">
                            Chào mừng bạn trở lại với
                            <span>NexChat</span>
                        </h2>

                        <p className="login-hero-desc">
                            Nền tảng kết nối nhịp đập thế hệ mới. Khám phá những làn sóng
                            xu hướng, chia sẻ khoảnh khắc chân thực và chạm tới cộng đồng
                            đam mê cùng tần số.
                        </p>
                    </div>

                    {/* Visual Minh họa Tương tác Sinh động */}
                    <div className="login-showcase-card">
                        <div className="login-showcase-image-wrap">
                            <img src={preview_login} alt="Xem trước bản tin NexChat" />
                            <div className="login-showcase-overlay" />
                            <div className="login-showcase-footer">
                                <span className="login-likes">
                                    <Heart size={14} /> 3.4k lượt thả tim
                                </span>
                                <span className="login-hashtag">#KhamPhaNexChat</span>
                            </div>
                        </div>

                        <div className="login-activity-stream">
                            <div className="login-avatar-stack">
                                <img src={avatar1} alt="Người dùng 1" />
                                <img src={avatar2} alt="Người dùng 2" />
                                <img src={avatar3} alt="Người dùng 3" />
                            </div>
                            <p>Minh Anh và 148 người khác vừa tham gia phòng âm thanh "GenZ Indie Beat"</p>
                            <span className="login-active-dot" title="Đang diễn ra" />
                        </div>
                    </div>

                    {/* Thống kê cộng đồng nổi bật */}
                    <div className="login-stats-row">
                        <div className="login-stat-card">
                            <div className="login-stat-top">
                                <Users size={18} className="text-[#ACEDFF]" />
                                <strong>+500K</strong>
                            </div>
                            <span>NGƯỜI DÙNG NĂNG ĐỘNG</span>
                        </div>

                        <div className="login-stat-card">
                            <div className="login-stat-top">
                                <Activity size={18} className="text-[#FFB2B7]" />
                                <strong>+2M</strong>
                            </div>
                            <span>KẾT NỐI MỖI NGÀY</span>
                        </div>
                    </div>
                </section>

                {/* Cột phải: Form Đăng Nhập */}
                <section className="login-form-col" aria-labelledby="login-title">
                    <div className="login-security-badge">
                        <ShieldCheck size={14} />
                        <span>Xác thực bảo mật đa tầng</span>
                    </div>

                    <h1 id="login-title" className="login-form-title">
                        Đăng nhập tài khoản
                    </h1>
                    <p className="login-form-desc">
                        Tiếp tục kết nối, tương tác và sẻ chia khoảnh khắc cùng bạn bè.
                    </p>

                    {/* Đăng nhập 1 chạm mạng xã hội */}
                    <div className="login-social-buttons">
                        <button type="button" className="btn btn-light-primary btn-flex rounded-pill w-100 py-3 fs-7 fw-semibold">
                            <img src={googleIcon} alt="Google" className="w-18px h-18px me-2" />
                            <span>Google</span>
                        </button>
                        <button type="button" className="btn btn-light-primary btn-flex rounded-pill w-100 py-3 fs-7 fw-semibold">
                            <img src={appleIcon} alt="Apple ID" className="w-18px h-18px me-2" />
                            <span>Apple ID</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="separator separator-content my-6">
                        <span className="text-gray-500 fs-8 fw-semibold px-3 text-uppercase">HOẶC ĐĂNG NHẬP VỚI EMAIL</span>
                    </div>

                    {/* Form Fields */}
                    <form onSubmit={formik.handleSubmit} noValidate>
                        {/* Email / Số điện thoại */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <label htmlFor="login-email" className="form-label fs-7 fw-semibold text-gray-800 mb-0">Email hoặc Số điện thoại</label>
                            </div>
                            <div className="position-relative d-flex align-items-center">
                                <Mail size={18} className="position-absolute start-0 ms-4 text-gray-500 z-1 pointer-events-none" />
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="name@example.com"
                                    className="form-control form-control-solid ps-12 rounded-3 h-48px fs-7"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={formik.isSubmitting}
                                />
                            </div>
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-danger fs-7 mt-1" role="alert">
                                    {formik.errors.email}
                                </p>
                            )}
                        </div>

                        {/* Mật khẩu */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                                <label htmlFor="login-password" className="form-label fs-7 fw-semibold text-gray-800 mb-0">Mật khẩu</label>
                                <Link to="/forgot-password" className="link-primary fs-7 fw-semibold">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                            <div className="position-relative d-flex align-items-center">
                                <Lock size={18} className="position-absolute start-0 ms-4 text-gray-500 z-1 pointer-events-none" />
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Nhập mật khẩu của bạn"
                                    className="form-control form-control-solid ps-12 pe-12 rounded-3 h-48px fs-7"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    disabled={formik.isSubmitting}
                                />
                                <button
                                    type="button"
                                    className="btn btn-sm btn-icon btn-flush position-absolute end-0 me-3 text-gray-500"
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formik.touched.password && formik.errors.password && (
                                <p className="text-danger fs-7 mt-1" role="alert">
                                    {formik.errors.password}
                                </p>
                            )}
                        </div>

                        {/* Nhớ đăng nhập */}
                        <label className="form-check form-check-custom form-check-solid mb-5 cursor-pointer">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                name="rememberMe"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                            />
                            <span className="form-check-label fs-7 text-gray-700 user-select-none">Ghi nhớ đăng nhập trong 30 ngày</span>
                        </label>

                        {/* Nút Đăng nhập Chính */}
                        <button
                            type="submit"
                            className="btn btn-primary w-100 rounded-pill h-48px mb-5 fs-6 fw-bold"
                            disabled={formik.isSubmitting}
                            data-kt-indicator={formik.isSubmitting ? "on" : "off"}
                        >
                            <span className="indicator-label">
                                <span>Đăng nhập ngay</span>
                                <ArrowRight size={18} className="ms-2" />
                            </span>
                            <span className="indicator-progress">
                                <span className="spinner-border spinner-border-sm align-middle me-2"></span>
                                <span>Đang đăng nhập...</span>
                            </span>
                        </button>
                    </form>

                    {/* Chân trang Form */}
                    <p className="text-center text-gray-600 fs-7 mt-4 mb-3">
                        Chưa có tài khoản NexChat?{" "}
                        <Link to="/register" className="link-primary fw-bold">Đăng ký miễn phí ngay</Link>
                    </p>

                    {/* Thông tin bổ sung & chính sách */}
                    <p className="text-center text-gray-500 fs-8 lh-base m-0">
                        Bằng việc tiếp tục, bạn đồng ý với{" "}
                        <Link to="/terms" className="link-primary">Điều khoản Dịch vụ</Link> và{" "}
                        <Link to="/privacy" className="link-primary">Chính sách Quyền riêng tư</Link> của NexChat.
                    </p>
                </section>
            </div>
        </main>
    );
}
