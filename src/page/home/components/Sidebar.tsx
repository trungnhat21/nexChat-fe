import UserAvatar from "./UserAvatar";
import { navigationLinks, shortcuts } from "../config";
import { Link, useLocation, useNavigate } from "react-router";
import { DesignIcon } from "./DesignAsset";
import { useHome } from "../actions";
import { useNotificationCenter } from "../notification-center-context";
import SearchFilterCard, { type FeedFilters } from "./SearchFilterCard";

export default function Sidebar({ filters, onFiltersChange }: { filters?: FeedFilters; onFiltersChange?: (filters: FeedFilters) => void } = {}) {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { openPanel, user } = useHome();
    const { unreadCount, unreadMessageCount, openNotifications } = useNotificationCenter();
    return <aside className="home-left" aria-label="Hồ sơ và lối tắt">
        <section className="home-card home-user-card">
            <Link className="home-user-summary" to="/profile">
                <UserAvatar name={[user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.userName || "Tài khoản"} src={user?.avatar} size={48} />
                <span><strong>{[user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.userName || "Tài khoản của bạn"}</strong><small>{user?.userName ? "@"+user.userName : user?.email}</small></span>
            </Link>
        </section>
        <nav className="home-card home-side-nav" aria-label="Menu cá nhân">
            {navigationLinks.map((item, index) => {
                const content = <><span><DesignIcon id={item.icon} />{item.label}</span>{(index === 0 && pathname === "/home") || (index === 4 && pathname === "/saved") ? <i className="home-active-dot" /> : index === 2 ? unreadCount > 0 && <span className="home-side-badge">{unreadCount > 99 ? "99+" : unreadCount}</span> : index === 3 ? unreadMessageCount > 0 && <span className="home-side-badge">{unreadMessageCount > 99 ? "99+" : unreadMessageCount}</span> : item.badge && <span className={`home-side-badge ${item.badge === "Hot" ? "is-hot" : item.badge === "5" ? "is-muted" : ""}`}>{item.badge}</span>}</>;
                return index === 0 || index === 4 ? <Link key={item.label} to={index === 0 ? "/home" : "/saved"} aria-current={pathname === (index === 0 ? "/home" : "/saved") ? "page" : undefined}>{content}</Link> : <button key={item.label} onClick={() => index === 2 ? openNotifications() : item.icon === "3352:522" ? navigate("/messages") : openPanel(item.label)}>{content}</button>;
            })}
        </nav>
        {filters && onFiltersChange && <SearchFilterCard filters={filters} onChange={onFiltersChange} />}
        <section className="home-card home-shortcuts">
            <div className="home-widget-heading"><h2>LỐI TẮT NHANH</h2><button onClick={() => openPanel("Tùy chỉnh lối tắt")}>Tùy chỉnh</button></div>
            {shortcuts.map(([initials, name, members]) => <button className="home-shortcut" key={name} onClick={() => openPanel(name)}><span className={`home-group-icon home-group-${initials.toLowerCase()}`}>{initials}</span><span><strong>{name}</strong><small>{members}</small></span></button>)}
        </section>
    </aside>;
}
