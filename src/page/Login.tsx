import Input from "../component/UI/Input/Input";

export default function LoginPgae() {
    return (
        //items-center : can giữa theo chiều dọc
        // justify-center: can giữa theo chiều ngang
        // flex: đặt nó nằm trên 1 hàng
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex w-[900px] h-[500px] rounded-2xl overflow-hidden">

                {/* left */}
                <div className="w-1/2 bg-blue-500 p-8">
                    hi
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
                        />
                    </div>
                    
                     <div className="mt-3">
                        <Input
                            label="Mật khẩu"
                            placeholder="Nhập mật khẩu của bạn"
                            type="password"
                            icon="lock"
                        />
                    </div>

                </div>
            </div>
        </div>

    )
}