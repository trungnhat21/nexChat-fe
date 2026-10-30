import logo_png from "../../_metronic/assets/images/home/nexchat-logo.svg";
import member_1_png from "../../_metronic/assets/images/register/member-1.png";
import member_2_png from "../../_metronic/assets/images/register/member-2.png";
import member_3_png from "../../_metronic/assets/images/register/member-3.png";
import signal_svg from "../../_metronic/assets/images/register/signal.svg";
import chat_svg from "../../_metronic/assets/images/register/chat.svg";
import discover_svg from "../../_metronic/assets/images/register/discover.svg";
import google_svg from "../../_metronic/assets/images/register/google.svg";
import apple_svg from "../../_metronic/assets/images/register/apple.svg";
import valid_svg from "../../_metronic/assets/images/register/valid.svg";
import email_svg from "../../_metronic/assets/images/register/email.svg";
import phone_svg from "../../_metronic/assets/images/register/phone.svg";
import password_svg from "../../_metronic/assets/images/register/password.svg";
import confirm_password_svg from "../../_metronic/assets/images/register/confirm-password.svg";
import technology_svg from "../../_metronic/assets/images/register/technology.svg";
import photography_svg from "../../_metronic/assets/images/register/photography.svg";
import design_svg from "../../_metronic/assets/images/register/design.svg";
import music_svg from "../../_metronic/assets/images/register/music.svg";
import food_svg from "../../_metronic/assets/images/register/food.svg";
import sport_svg from "../../_metronic/assets/images/register/sport.svg";
import travel_svg from "../../_metronic/assets/images/register/travel.svg";
import cinema_svg from "../../_metronic/assets/images/register/cinema.svg";
import arrow_svg from "../../_metronic/assets/images/register/arrow.svg";
import * as Yup from "yup";
import type { RegisterFormValues } from "../../component/type/register";

export const registerAssets = {
    "logo": logo_png,
    "member-1": member_1_png,
    "member-2": member_2_png,
    "member-3": member_3_png,
    "signal": signal_svg,
    "chat": chat_svg,
    "discover": discover_svg,
    "google": google_svg,
    "apple": apple_svg,
    "valid": valid_svg,
    "email": email_svg,
    "phone": phone_svg,
    "password": password_svg,
    "confirm-password": confirm_password_svg,
    "technology": technology_svg,
    "photography": photography_svg,
    "design": design_svg,
    "music": music_svg,
    "food": food_svg,
    "sport": sport_svg,
    "travel": travel_svg,
    "cinema": cinema_svg,
    "arrow": arrow_svg,
} as const;

export const interests = [
    { id: "technology", label: "Technology" },
    { id: "photography", label: "Nhiếp ảnh" },
    { id: "design", label: "Thiết kế" },
    { id: "music", label: "Âm nhạc" },
    { id: "food", label: "Ẩm thực" },
    { id: "sport", label: "Thể thao" },
    { id: "travel", label: "Du lịch" },
    { id: "cinema", label: "Điện ảnh" },
] as const;

export const initialValues: RegisterFormValues = {
    lastName: "", firstName: "", userName: "", email: "", phone: "",
    password: "", confirmPassword: "", interests: ["technology", "photography", "design"], consent: false,
};
export const handlePattern = /^[a-zA-Z0-9_]{3,30}$/;
export const validationSchema = Yup.object({
    lastName: Yup.string().trim().max(100, "Tối đa 100 ký tự").required("Vui lòng nhập họ và chữ đệm"),
    firstName: Yup.string().trim().max(100, "Tối đa 100 ký tự").required("Vui lòng nhập tên"),
    userName: Yup.string().trim().matches(handlePattern, "Dùng 3–30 chữ cái, chữ số hoặc dấu gạch dưới").required("Vui lòng nhập tên người dùng"),
    email: Yup.string().trim().email("Email không đúng định dạng").max(255, "Email quá dài").required("Vui lòng nhập email"),
    phone: Yup.string().test("phone", "Số điện thoại không hợp lệ", value => !value || /^\+?\d{9,15}$/.test(value.replace(/[\s().-]/g, ""))),
    password: Yup.string().min(8, "Mật khẩu cần ít nhất 8 ký tự").max(64, "Mật khẩu tối đa 64 ký tự").required("Vui lòng nhập mật khẩu"),
    confirmPassword: Yup.string().oneOf([Yup.ref("password")], "Mật khẩu xác nhận không khớp").required("Vui lòng xác nhận mật khẩu"),
    interests: Yup.array().of(Yup.string().oneOf(interests.map(item => item.id))).min(3, "Vui lòng chọn ít nhất 3 sở thích"),
    consent: Yup.boolean().oneOf([true], "Bạn cần đồng ý điều khoản để đăng ký"),
});
export const strengthLabels = ["Chưa nhập mật khẩu", "Yếu (Weak)", "Trung bình (Medium)", "Mạnh (Strong)"];
