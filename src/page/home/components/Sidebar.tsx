import { navigationLinks, shortcuts } from "../config";
import { Link } from "react-router";
import { Avatar, DesignIcon } from "./DesignAsset";
import { useHome } from "../actions";

export default function Sidebar() {
    const { openPanel } = useHome();
    return <aside className="home-left" aria-label="Hồ sơ và lối tắt">
        <section className="home-card home-user-card">
            <Link className="home-user-summary" to="/profile">
                <Avatar id="3352:474" size={48} online />
                <span><strong>Lê Minh Tâm <DesignIcon id="3352:481" /></strong><small>@minhtam.tech</small></span>
            </Link>
            <div className="home-user-stats"><button onClick={() => openPanel("Người theo dõi")}><strong>1.2k</strong><span>Người theo dõi</span></button><button onClick={() => openPanel("Đang theo dõi")}><strong>384</strong><span>Đang theo dõi</span></button></div>
        </section>
        <nav className="home-card home-side-nav" aria-label="Menu cá nhân">
            {navigationLinks.map((item, index) => {
                const content = <><span><DesignIcon id={item.icon} />{item.label}</span>{index === 0 ? <i className="home-active-dot" /> : item.badge && <span className={`home-side-badge ${item.badge === "Hot" ? "is-hot" : item.badge === "5" ? "is-muted" : ""}`}>{item.badge}</span>}</>;
                return index === 0 ? <Link key={item.label} to="/home" aria-current="page">{content}</Link> : <button key={item.label} onClick={() => openPanel(item.label)}>{content}</button>;
            })}
        </nav>
        <section className="home-card home-shortcuts">
            <div className="home-widget-heading"><h2>LỐI TẮT NHANH</h2><button onClick={() => openPanel("Tùy chỉnh lối tắt")}>Tùy chỉnh</button></div>
            {shortcuts.map(([initials, name, members]) => <button className="home-shortcut" key={name} onClick={() => openPanel(name)}><span className={`home-group-icon home-group-${initials.toLowerCase()}`}>{initials}</span><span><strong>{name}</strong><small>{members}</small></span></button>)}
        </section>
    </aside>;
}
