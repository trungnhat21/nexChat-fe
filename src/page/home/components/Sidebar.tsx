import { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar";
import { navigationLinks } from "../config";
import { Link, useLocation } from "react-router";
import { useHome } from "../actions";
import { useNotificationCenter } from "../notification-center-context";
import SearchFilterCard, { type FeedFilters } from "./SearchFilterCard";
import { getTopGroups, type Group } from "../../../axios/groups";
import {
    Home,
    Users,
    Bell,
    MessageSquare,
    Bookmark,
    UsersRound,
    Settings,
} from "lucide-react";

export default function Sidebar({ filters, onFiltersChange }: { filters?: FeedFilters; onFiltersChange?: (filters: FeedFilters) => void } = {}) {
    const { pathname } = useLocation();
    const { openPanel, user } = useHome();
    const { unreadCount, unreadMessageCount, openNotifications } = useNotificationCenter();

    // Top groups for dynamic shortcuts
    const [topGroups, setTopGroups] = useState<Group[]>([]);
    const [loadingTopGroups, setLoadingTopGroups] = useState(true);

    useEffect(() => {
        let isMounted = true;
        getTopGroups(3)
            .then((data) => {
                if (isMounted) setTopGroups(data);
            })
            .catch(() => {
                // ignore
            })
            .finally(() => {
                if (isMounted) setLoadingTopGroups(false);
            });
        return () => {
            isMounted = false;
        };
    }, []);

    function renderNavIcon(index: number, isCurrent: boolean) {
        const color = isCurrent ? "#4F46E5" : "#64748b";
        const size = 18;
        switch (index) {
            case 0:
                return <Home size={size} style={{ color }} />;
            case 1:
                return <Users size={size} style={{ color }} />;
            case 2:
                return <Bell size={size} style={{ color }} />;
            case 3:
                return <MessageSquare size={size} style={{ color }} />;
            case 4:
                return <Bookmark size={size} style={{ color }} />;
            case 5:
                return <UsersRound size={size} style={{ color }} />;
            case 6:
                return <Settings size={size} style={{ color }} />;
            default:
                return <Home size={size} style={{ color }} />;
        }
    }

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
                    const isGroups = index === 5;

                    const isCurrent =
                        (isHome && (pathname === "/home" || pathname === "/")) ||
                        (isFriends && (pathname === "/friends" || pathname.startsWith("/friends"))) ||
                        (isSaved && pathname === "/saved") ||
                        (isMessages && (pathname === "/messages" || pathname.startsWith("/messages"))) ||
                        (isGroups && (pathname === "/groups" || pathname.startsWith("/groups")));

                    const targetPath = isHome
                        ? "/home"
                        : isFriends
                        ? "/friends"
                        : isSaved
                        ? "/saved"
                        : isMessages
                        ? "/messages"
                        : isGroups
                        ? "/groups"
                        : null;

                    const iconElement = renderNavIcon(index, isCurrent);

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

            {/* 4. Lối tắt nhanh (Hiển thị 3 nhóm có số thành viên nhiều nhất) */}
            <section className="card shadow-sm mb-4 border-0 p-3 home-shortcuts">
                <div className="home-widget-heading">
                    <h2>LỐI TẮT NHANH</h2>
                    <Link
                        to="/groups"
                        className="text-decoration-none"
                        style={{ color: "var(--home-primary, #4F46E5)", fontSize: "11px", fontWeight: 500 }}
                    >
                        Xem tất cả
                    </Link>
                </div>
                {loadingTopGroups ? (
                    <div className="text-center py-3 text-muted fs-8">Đang tải lối tắt...</div>
                ) : topGroups.length === 0 ? (
                    <div className="text-center py-3 text-muted fs-8">Chưa có nhóm nào.</div>
                ) : (
                    topGroups.map((grp) => {
                        const initials = grp.name.trim().slice(0, 2).toUpperCase();
                        const memberCount = grp.memberCount ?? 1;
                        const memberFormatted =
                            memberCount >= 1000
                                ? `${(memberCount / 1000).toFixed(1)}k thành viên`
                                : `${memberCount} thành viên`;

                        return (
                            <Link
                                to={`/groups/${grp.id}`}
                                className="home-shortcut text-decoration-none"
                                key={grp.id}
                            >
                                {grp.avatar ? (
                                    <img
                                        src={grp.avatar}
                                        alt=""
                                        className="home-group-icon object-fit-cover"
                                    />
                                ) : (
                                    <span
                                        className="home-group-icon"
                                        style={{
                                            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 700,
                                        }}
                                    >
                                        {initials}
                                    </span>
                                )}
                                <span className="home-shortcut-info">
                                    <strong title={grp.name}>{grp.name}</strong>
                                    <small>{memberFormatted}</small>
                                </span>
                            </Link>
                        );
                    })
                )}
            </section>
        </aside>
    );
}
