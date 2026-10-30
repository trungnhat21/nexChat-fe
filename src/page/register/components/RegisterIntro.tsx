import { registerAssets } from "../config";

export default function RegisterIntro() {
    return <aside className="register-intro" aria-label="Giới thiệu NexChat">
        <div className="register-intro-top">
            <div className="register-brand"><img src={registerAssets.logo} alt="NexChat" /><span>NexChat</span></div>
            <div className="register-generation"><img src={registerAssets.signal} alt="" />Mạng xã hội thế hệ mới</div>
            <h2>Chạm nhịp sống số,<br /><span>kết nối đam mê.</span></h2>
            <p className="register-description">Gia nhập cộng đồng sáng tạo với hơn 10 triệu thành viên.<br />Chia sẻ từng khoảnh khắc, bắt nhịp xu hướng và khám phá tiềm năng không giới hạn.</p>
            <div className="register-features">
                <div className="register-feature"><span className="register-feature-icon"><img src={registerAssets.chat} alt="" /></span><div><h3>Trò chuyện thời gian thực</h3><p>Tốc độ tức thì, mã hóa an toàn đầu cuối.</p></div></div>
                <div className="register-feature"><span className="register-feature-icon"><img src={registerAssets.discover} alt="" /></span><div><h3>Khám phá theo sở thích</h3><p>Bảng tin cá nhân hóa thông minh cùng AI.</p></div></div>
            </div>
        </div>
        <div className="register-community"><div className="register-members">{(["member-1", "member-2", "member-3"] as const).map(key => <span className={`register-member ${key}`} key={key}><img src={registerAssets[key]} alt="" /></span>)}</div><div><strong>+18.5k bạn bè mới</strong><p>Vừa đăng ký trong tuần này</p></div></div>
    </aside>;
}
