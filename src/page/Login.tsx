import { useState } from "react";
import Input from "../component/UI/Input/Input";
import api from "../api/axios";
import { useNavigate } from "react-router";
import Button from "../component/UI/Button/Button";

export default function LoginPgae() {
    //chưa biết user đang nhập gì cần useState
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loadding, setLoadding] = useState(false);

    const navigation = useNavigate();

    const handLogin = async () => {
        try {
            setLoadding(true)
            const response = await api.post("/auth/login", {
                email,
                password
            })
            console.log("login thành công", response.data);
            navigation("/home");
        } catch (error) {
            console.error("login thất bại");
            console.log("response")
        }
        finally { // sẽ chạy trước try cath dù api thành công hay thất bại
            setLoadding(false)
        }
    }
    return (
        //items-center : can giữa theo chiều dọc
        // justify-center: can giữa theo chiều ngang
        // flex: đặt nó nằm trên 1 hàng
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex w-[900px] h-[500px] rounded-2xl overflow-hidden">

                {/* left */}
                <div className="w-1/2 bg-blue-500 p-8">
                    
                </div>

                {/* right */}
                <div className="w-1/2 bg-white p-8">
                    <h1 className="text-xl text-black">
                        Đăng nhập tài khoản
                    </h1>

                    <div className="mt-6">
                        <Input
                            label="Email hoặc số điện thoại"
                            placeholder="email@example.com"
                            type="email"
                            icon="user"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="mt-3">
                        <Input
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu của bạn"
                            type="password"
                            icon="lock"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>


                    <Button
                        className="mt-6 w-full bg-blue-500 text-white p-3 rounded-lg"
                        onClick={handLogin}
                        type="submit"
                        loadding = {loadding}
                    >
                        Đăng nhập
                    </Button>

                </div>
            </div>
        </div>

    )
}