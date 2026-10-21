import Input from "../../component/UI/Input/Input";
import Button from "../../component/UI/Button/Button";
import googleIcon from "../../_metronic/assets/images/google_icon.svg";
import appleIcon from "../../_metronic/assets/images/apple_icon.svg";
import preview_login from "../../_metronic/assets/images/preview_login.svg";
import { KTIcon } from "../../_metronic/helpers/components/KTIcon";

import { useLoginActions } from "./actions";
import "./style.scss";

export default function LoginPage() {
    const { formik, showPassword, setShowPassword } = useLoginActions();
    return (
        //items-center : can giữa theo chiều dọc
        // justify-center: can giữa theo chiều ngang
        // flex: đặt nó nằm trên 1 hàng
        <div className="login-page">
            <div className="flex w-[900px] min-h-[500px] rounded-2xl overflow-hidden shadow-2xl">

                {/* left */}
                <div className="w-1/2 overflow-hidden">
                    {/* logo */}
                    <div className="flex items-center gap-3">
                        <div>
                            logo
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xl font-bold">
                                Nex
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/15 text-sm">
                                MẠNG XÃ HỘI 3.0
                            </span>
                        </div>
                    </div>
                    {/* title +description */}
                    <div className="mt-8">
                        <h2 className="text-3xl font-bold leading-tight">
                            Chào mừng bạn trở lại với
                            <span className="block text-cyan-300">
                                Nex
                            </span>
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-white/80">
                            Nền tảng kết nối nhịp đập thế hệ mới.
                            Khám phá những làn sóng xu hướng,
                            chia sẻ khoảnh khắc chân thực và chạm tới cộng đồng.
                        </p>
                    </div>
                    {/* 3. Main social card */}
                    <div className="mt-6 ml-10 rounded-2xl bg-black/10 p-3">

                        {/* image / preview */}
                        <div className="h-[100px] rounded-xl bg-white/20">
                            <img
                                src={preview_login}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* reaction */}
                        <div className="mt-3 flex justify-between items-center text-sm">
                            <span>💗 3.4k lượt thả tim</span>

                            <span className="px-2 py-1 rounded-full bg-black/20">
                                #KhamPhaPulse
                            </span>
                        </div>

                        {/* people bar */}
                        <div className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 p-3">
                            <div className="flex">
                                <div className="w-7 h-7 rounded-full bg-white"></div>
                                <div className="-ml-2 w-7 h-7 rounded-full bg-white"></div>
                            </div>

                            <p className="text-xs ">
                                Minh Anh và 148 người khác vừa tham gia phòng âm thanh
                            </p>
                        </div>
                    </div>

                    {/* 4. Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-6">

                        <div className="rounded-2xl bg-white/10 p-4">
                            <div className="text-2xl font-bold">
                                +500K
                            </div>

                            <div className="text-xs text-white/70 mt-1">
                                NGƯỜI DÙNG NĂNG ĐỘNG
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white/10 p-4">
                            <div className="text-2xl font-bold">
                                +2M
                            </div>

                            <div className="text-xs text-white/70 mt-1">
                                KẾT NỐI MỖI NGÀY
                            </div>
                        </div>

                    </div>
                </div>

                {/* right */}
                <div className="w-1/2 bg-white p-8">
                    <h1 className="fs-32 lh-40 text-black font-bold">
                        Đăng nhập tài khoản
                    </h1>
                    <p className="text-sm whitespace-nowrap text-description">Tiếp tục kết nối tương tác và chia sẻ khoảnh khắc cùng bạn bè</p>

                    <div className="flex mt-4 gap-3">
                        <Button
                            className="w-1/2 border border-gray-300 rounded-4xl py-3 flex items-center justify-center fs-14 cursor-pointer bg-input"

                        >
                            <img src={googleIcon} alt="Google" className="w-4 h-4 relative -left-2" />
                            Google
                        </Button>

                        <Button
                            className="w-1/2 border border-gray-300 rounded-4xl flex items-center justify-center fs-14 cursor-pointer bg-input"
                        >
                            <img src={appleIcon} alt="Apple" className="w-4 h-4 relative -left-2" />
                            Apple ID
                        </Button>
                    </div>


                    <form onSubmit={formik.handleSubmit}>

                        <div className="mt-6">
                            <Input
                                name="email"
                                label="Email hoặc số điện thoại"
                                placeholder="email@example.com"
                                type="email"
                                icon="user"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-red-500 fs-12 mt-1">
                                    {formik.errors.email}
                                </div>
                            )}
                        </div>

                        <div className="mt-3">

                            <Input
                                name="password"
                                label="Mật khẩu"
                                lableRight={
                                    <a href="/forgot-password"
                                        className="text-blue-500 fs-14"
                                    >
                                        Quên mật khẩu ?
                                    </a>
                                }
                                placeholder="Nhập mật khẩu của bạn"
                                type={showPassword ? "text" : "password"}
                                icon="lock"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="cursor-pointer"
                                    >
                                        <KTIcon
                                            iconName={showPassword ? "eye-slash" : "eye"}
                                            className="fs-20"
                                        />
                                    </button>
                                }

                            />
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-red-500 fs-12 mt-1">
                                    {formik.errors.password}
                                </div>
                            )}
                        </div>

                        <div className="pt-3 ">
                            <Input
                                type="checkbox"
                                label="Đồng ý chính sách"
                            />
                            <div className="fs-11 lh-17 text-description">
                                Bằng việc tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Quyền riêng tư của Pulse.
                            </div>
                        </div>

                        <Button
                            className="mt-6 w-full bg-blue-500 text-white p-3 rounded-lg cursor-pointer"
                            type="submit"
                            loadding={formik.isSubmitting}
                        >
                            Đăng nhập
                        </Button>
                    </form>

                    <div className="text-center pt-3 fs-15">
                        Chưa có tài khoản Nex? <a className="fs-14 text-blue-500 font-bold" href="/register">Đăng ký miễn phí ngay</a>
                    </div>
                </div>
            </div>
        </div >
    )
}