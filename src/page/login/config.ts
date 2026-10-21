import * as Yup from "yup";
import type { LoginPayload } from "../../component/type/auth";

export const initialValues: LoginPayload = {
            email: "",
            password: "",
        };

export const validationSchema = Yup.object({
            email: Yup.string()
                .email("email không đúng định dạng")
                .required("Vui lòng nhập email"),
            password: Yup.string()
                .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
                .required("Vui lòng nhập mật khẩu")
        });
