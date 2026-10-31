import UserAvatar from "./UserAvatar";
import { navigationLinks, shortcuts } from "../config";
import { Link, useLocation } from "react-router";
import { DesignIcon } from "./DesignAsset";
import { useHome } from "../actions";
import { useNotificationCenter } from "../notification-center-context";
import SearchFilterCard, { type FeedFilters } from "./SearchFilterCard";
import { Users } from "lucide-react";

export default function Sidebar({ filters, onFiltersChange }: { filters?: FeedFilters; onFiltersChange?: (filters: FeedFilters) => void } = {}) {
    const { pathname } = useLocation();
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
                const isHome = index === 0;
                const isFriends = index === 1;
                const isNotifications = index === 2;
                const isMessages = index === 3;
                const isSaved = index === 4;

                const isCurrent = (isHome && pathname === "/home") || (isFriends && pathname === "/friends") || (isSaved && pathname === "/saved");
                const targetPath = isHome ? "/home" : isFriends ? "/friends" : isSaved ? "/saved" : isMessages ? "/messages" : null;

                const iconElement = item.icon === "users" ? (
                    <Users size={18} style={{ color: isCurrent ? "#2563eb" : "#475569" }} />
                ) : (
                    <DesignIcon id={item.icon} />
                );

                const content = (
                    <>
                        <span>{iconElement}{item.label}</span>
                        {isCurrent ? (
                            <i className="home-active-dot" />
                        ) : isNotifications ? (
                            unreadCount > 0 && <span className="home-side-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                        ) : isMessages ? (
                            unreadMessageCount > 0 && <span className="home-side-badge">{unreadMessageCount > 99 ? "99+" : unreadMessageCount}</span>
                        ) : item.badge ? (
                            <span className={`home-side-badge ${item.badge === "5" ? "is-muted" : ""}`}>{item.badge}</span>
                        ) : null}
                    </>
                );

                return targetPath ? (
                    <Link key={item.label} to={targetPath} aria-current={isCurrent ? "page" : undefined}>{content}</Link>
                ) : (
                    <button key={item.label} onClick={() => isNotifications ? openNotifications() : openPanel(item.label)}>{content}</button>
                );
            })}
        </nav>
        {filters && onFiltersChange && <SearchFilterCard filters={filters} onChange={onFiltersChange} />}
        <section className="home-card home-shortcuts">
            <div className="home-widget-heading"><h2>LỐI TẮT NHANH</h2><button onClick={() => openPanel("Tùy chỉnh lối tắt")}>Tùy chỉnh</button></div>
            {shortcuts.map(([initials, name, members]) => <button className="home-shortcut" key={name} onClick={() => openPanel(name)}><span className={`home-group-icon home-group-${initials.toLowerCase()}`}>{initials}</span><span><strong>{name}</strong><small>{members}</small></span></button>)}
        </section>
    </aside>;
}
