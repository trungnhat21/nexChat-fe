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

    return (
        <aside className="home-left" aria-label="Hồ sơ và lối tắt">
            {/* 1. Hồ sơ người dùng tóm tắt */}
            <section className="card shadow-sm mb-4 border-0 p-3">
                <Link className="d-flex align-items-center gap-3 text-gray-800 text-decoration-none" to="/profile">
                    <UserAvatar name={[user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.userName || "Tài khoản"} src={user?.avatar} size={44} />
                    <span className="d-flex flex-column min-w-0">
                        <strong className="fs-5 fw-bold text-gray-800 text-truncate text-hover-primary">
                            {[user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.userName || "Tài khoản của bạn"}
                        </strong>
                        <small className="fs-7 text-muted text-truncate">
                            {user?.userName ? "@" + user.userName : user?.email}
                        </small>
                    </span>
                </Link>
            </section>

            {/* 2. Menu cá nhân */}
            <nav className="card shadow-sm mb-4 border-0 p-2 d-flex flex-column gap-1" aria-label="Menu cá nhân">
                {navigationLinks.map((item, index) => {
                    const isHome = index === 0;
                    const isFriends = index === 1;
                    const isNotifications = index === 2;
                    const isMessages = index === 3;
                    const isSaved = index === 4;

                    const isCurrent = (isHome && pathname === "/home") || (isFriends && pathname === "/friends") || (isSaved && pathname === "/saved");
                    const targetPath = isHome ? "/home" : isFriends ? "/friends" : isSaved ? "/saved" : isMessages ? "/messages" : null;

                    const iconElement = item.icon === "users" ? (
                        <Users size={18} style={{ color: isCurrent ? "#4F46E5" : "#64748b" }} />
                    ) : (
                        <DesignIcon id={item.icon} />
                    );

                    const itemClass = `d-flex align-items-center justify-content-between px-3 py-2.5 rounded-2 text-start w-100 border-0 text-decoration-none transition-all fs-6 ${
                        isCurrent
                            ? "bg-light-primary text-primary fw-bold"
                            : "bg-transparent text-gray-700 text-hover-primary fw-normal"
                    }`;

                    const content = (
                        <>
                            <span className="d-flex align-items-center gap-2.5">
                                {iconElement}
                                <span>{item.label}</span>
                            </span>
                            {isCurrent ? (
                                <span className="w-6px h-6px rounded-circle bg-primary ms-auto" />
                            ) : isNotifications ? (
                                unreadCount > 0 && <span className="badge badge-light-danger badge-sm ms-auto">{unreadCount > 99 ? "99+" : unreadCount}</span>
                            ) : isMessages ? (
                                unreadMessageCount > 0 && <span className="badge badge-light-danger badge-sm ms-auto">{unreadMessageCount > 99 ? "99+" : unreadMessageCount}</span>
                            ) : item.badge ? (
                                <span className={`badge badge-sm ms-auto ${item.badge === "5" ? "badge-light-secondary" : "badge-light-primary"}`}>{item.badge}</span>
                            ) : null}
                        </>
                    );

                    return targetPath ? (
                        <Link key={item.label} to={targetPath} className={itemClass} aria-current={isCurrent ? "page" : undefined}>
                            {content}
                        </Link>
                    ) : (
                        <button key={item.label} type="button" className={itemClass} onClick={() => isNotifications ? openNotifications() : openPanel(item.label)}>
                            {content}
                        </button>
                    );
                })}
            </nav>

            {/* 3. Bộ lọc bài viết (nếu có) */}
            {filters && onFiltersChange && <SearchFilterCard filters={filters} onChange={onFiltersChange} />}

            {/* 4. Lối tắt nhanh */}
            {/* 4. Lối tắt nhanh */}
            <section className="card shadow-sm mb-4 border-0 p-3 home-shortcuts">
                <div className="home-widget-heading">
                    <h2>LỐI TẮT NHANH</h2>
                    <button type="button" onClick={() => openPanel("Tùy chỉnh lối tắt")}>
                        Tùy chỉnh
                    </button>
                </div>
                {shortcuts.map(([initials, name, members]) => (
                    <button
                        type="button"
                        className="home-shortcut"
                        key={name}
                        onClick={() => openPanel(name)}
                    >
                        <span className={`home-group-icon home-group-${initials.toLowerCase()}`}>
                            {initials}
                        </span>
                        <span className="home-shortcut-info">
                            <strong>{name}</strong>
                            <small>{members}</small>
                        </span>
                    </button>
                ))}
            </section>
        </aside>
    );
}

