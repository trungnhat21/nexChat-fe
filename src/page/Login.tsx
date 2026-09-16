import { useState } from "react";
import Input from "../component/UI/Input/Input";
import api from "../api/axios";
import { useNavigate } from "react-router";
import Button from "../component/UI/Button/Button";
import { showError } from "../utils/swal";
import googleIcon from "../_metronic/assets/images/google_icon.svg";
import appleIcon from "../_metronic/assets/images/apple_icon.svg";
import login_banner from "../_metronic/assets/images/login_banner.svg";
import { KTIcon } from "../_metronic/helpers/components/KTIcon";

import { useFormik } from "formik";
import * as Yup from "yup";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    const navigation = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .email("email không đúng định dạng")
                .required("Vui lòng nhập email"),
            password: Yup.string()
                .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
                .required("Vui lòng nhập mật khẩu")
        }),
        onSubmit: async (value) => {
            try {
                await api.post
                    (
                        "/auth/login",
                        {
                            email: value.email,
                            password: value.password
                        }
                    );
                navigation("/home");
            } catch (error) {
                showError("Email hoặc mật khẩu không đúng")
            }
        }
    });
    return (
        //items-center : can giữa theo chiều dọc
        // justify-center: can giữa theo chiều ngang
        // flex: đặt nó nằm trên 1 hàng
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex w-[900px] min-h-[500px] rounded-2xl overflow-hidden shadow-2xl">

                {/* left */}
                <div className="w-1/2 overflow-hidden">
                    <img
                        src={login_banner}
                        alt="Login banner"
                        className="w-full h-full object-cover"
                    />
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
        </div>

    )
}