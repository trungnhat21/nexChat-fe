import { Link } from "react-router";
import Button from "../../../component/UI/Button/Button";
import Input from "../../../component/UI/Input/Input";
import { Avatar, DesignIcon, DesignImage } from "./DesignAsset";
import { focusComposer, useHome } from "../actions";

export default function Header() {
    const { search, setSearch, openPanel } = useHome();
    return <header className="home-header">
        <div className="home-header-start">
            <Link to="/home" className="home-brand" aria-label="Pulse — Trang chủ"><DesignImage id="3352:1019" /><span>Pulse</span></Link>
            <div className="home-search">
                <DesignIcon id="3352:1027" />
                <Input name="feedSearch" aria-label="Tìm kiếm trong bảng tin mẫu" placeholder="Tìm kiếm bạn bè, bài viết, hashtag..." value={search} onChange={event => setSearch(event.target.value)} inputClassName="home-search-field" compact />
            </div>
        </div>
        <nav className="home-top-nav" aria-label="Điều hướng chính">
            <Link to="/home" aria-current="page">Bảng tin</Link>
            {["Khám phá", "Video", "Nhóm"].map(label => <button key={label} onClick={() => openPanel(label)}>{label}</button>)}
        </nav>
        <div className="home-header-end">
            <Button className="home-primary home-create-button" onClick={focusComposer}><DesignIcon id="3352:1039" />Đăng bài</Button>
            <button className="home-icon-button" aria-label="Tin nhắn, 2 chưa đọc" onClick={() => openPanel("Tin nhắn")}><DesignIcon id="3352:1045" /><span className="home-badge">2</span></button>
            <button className="home-icon-button" aria-label="Thông báo, 3 chưa đọc" onClick={() => openPanel("Thông báo")}><DesignIcon id="3352:1050" /><span className="home-badge">3</span></button>
            <button className="home-profile-button" aria-label="Tài khoản của bạn" onClick={() => openPanel("Tài khoản của bạn")}><Avatar id="3352:1056" size={32} online /><DesignIcon id="3352:1058" /></button>
        </div>
    </header>;
}
