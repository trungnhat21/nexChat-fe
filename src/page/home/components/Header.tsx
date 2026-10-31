import UserAvatar from "./UserAvatar";
import { Link, useLocation, useNavigate } from "react-router";
import Button from "../../../component/UI/Button/Button";
import Input from "../../../component/UI/Input/Input";
import { DesignIcon, DesignImage } from "./DesignAsset";
import { focusComposer, useHeaderActions, useHome } from "../actions";
import { useNotificationCenter } from "../notification-center-context";
import { useEffect, useRef, useState } from "react";
import SearchSuggestions from "./SearchSuggestions";

function notificationText(type: string, actorName: string) {
    if (type === "friend_request") return `${actorName} đã gửi lời mời kết bạn.`;
    if (type === "friend_accept") return `${actorName} đã chấp nhận lời mời kết bạn.`;
    if (type === "new_post") return `${actorName} vừa đăng bài viết mới.`;
    if (type === "message") return `${actorName} đã gửi cho bạn một tin nhắn.`;
    if (type === "comment") return `${actorName} đã bình luận.`;
    if (type === "comment_reaction") return `${actorName} đã bày tỏ cảm xúc với bình luận của bạn.`;
    if (type === "post_reaction") return `${actorName} đã thích bài viết của bạn.`;
    return "Bạn có thông báo mới.";
}

export default function Header() {
    const { search, setSearch, openPanel, user } = useHome();
    const { notifications, unreadCount, unreadMessageCount, isOpen, openNotifications, closeNotifications, markRead } = useNotificationCenter();
    const { accountMenuOpen, setAccountMenuOpen, loggingOut, accountMenuRef, accountButtonRef, logoutButtonRef, openAccountMenu, handleLogout } = useHeaderActions();
    const notificationsRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const [searchFocused, setSearchFocused] = useState(false);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    useEffect(() => {
        function onPointerDown(event: PointerEvent) {
            if (event.target instanceof Node && !notificationsRef.current?.contains(event.target)) closeNotifications();
        }
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, [closeNotifications]);
    useEffect(() => {
        function onPointerDown(event: PointerEvent) {
            if (event.target instanceof Node && !searchRef.current?.contains(event.target)) setSearchFocused(false);
        }
        document.addEventListener("pointerdown", onPointerDown);
        return () => document.removeEventListener("pointerdown", onPointerDown);
    }, []);

    async function openNotification(id: string, type: string, referenceId: string | null, actorId?: string) {
        try { await markRead(id); } catch { /* Keep navigation usable if marking the item read fails. */ }
        closeNotifications();
        if (type === "new_post" && referenceId) navigate("/posts/" + referenceId);
        else if (actorId) navigate("/profile/" + actorId);
    }
    function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Escape") setSearchFocused(false);
        if (event.key !== "Enter" || !search.trim()) return;
        event.preventDefault();
        const trimmed = search.trim();
        const key = `nexchat:recent-searches:${user?.id ?? "guest"}`;
        try {
            const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
            const recent = Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string") : [];
            localStorage.setItem(key, JSON.stringify([trimmed, ...recent.filter(item => item.toLocaleLowerCase("vi") !== trimmed.toLocaleLowerCase("vi"))].slice(0, 5)));
        } catch { /* Keep search usable when browser storage is unavailable. */ }
        setSearchFocused(false);
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    }
    return (
        <header className="home-header">
            <div className="home-header-start">
                <Link to="/home" className="home-brand" aria-label="NexChat — Trang chủ">
                    <DesignImage id="3352:1019" />
                    <span>NexChat</span>
                </Link>
                <div className={`home-search position-relative ${searchFocused ? "is-suggestions-open" : ""}`} ref={searchRef}>
                    <DesignIcon id="3352:1027" />
                    <Input
                        name="feedSearch"
                        aria-label="Tìm kiếm bạn bè, bài viết, hashtag..."
                        maxLength={200}
                        placeholder="Tìm kiếm bạn bè, bài viết, hashtag..."
                        value={search}
                        onFocus={() => setSearchFocused(true)}
                        onKeyDown={handleSearchKeyDown}
                        onChange={event => { setSearch(event.target.value); setSearchFocused(true); }}
                        inputClassName="home-search-field"
                        variant="transparent"
                        compact
                    />
                    {searchFocused && (
                        <SearchSuggestions
                            key={user?.id ?? "guest"}
                            query={search}
                            userId={user?.id ?? "guest"}
                            onSelect={value => {
                                setSearch(value);
                                setSearchFocused(false);
                                navigate(`/search?q=${encodeURIComponent(value)}`);
                            }}
                            onClose={() => setSearchFocused(false)}
                        />
                    )}
                </div>
            </div>

            <nav className="home-top-nav" aria-label="Điều hướng chính">
                <Link to="/home" aria-current={pathname === "/home" ? "page" : undefined}>
                    Bảng tin
                </Link>
                <Link to="/friends" aria-current={pathname === "/friends" ? "page" : undefined}>
                    Bạn bè
                </Link>
                {["Video", "Nhóm"].map(label => (
                    <button key={label} type="button" onClick={() => openPanel(label)}>
                        {label}
                    </button>
                ))}
            </nav>

            <div className="home-header-end d-flex align-items-center gap-2">
                <Button variant="primary" size="sm" onClick={() => focusComposer(navigate)}>
                    <DesignIcon id="3352:1039" />
                    <span>Đăng bài</span>
                </Button>
                <button
                    className="btn btn-icon btn-sm btn-light position-relative"
                    aria-label={`Tin nhắn, ${unreadMessageCount} chưa đọc`}
                    onClick={() => navigate("/messages")}
                >
                    <DesignIcon id="3352:1045" />
                    {unreadMessageCount > 0 && (
                        <span className="badge badge-circle badge-danger badge-sm position-absolute top-0 end-0 translate-middle">
                            {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                        </span>
                    )}
                </button>
                <div className="position-relative" ref={notificationsRef}>
                    <button
                        className="btn btn-icon btn-sm btn-light position-relative"
                        aria-label={`Thông báo, ${unreadCount} chưa đọc`}
                        aria-haspopup="dialog"
                        aria-expanded={isOpen}
                        onClick={() => isOpen ? closeNotifications() : openNotifications()}
                    >
                        <DesignIcon id="3352:1050" />
                        {unreadCount > 0 && (
                            <span className="badge badge-circle badge-danger badge-sm position-absolute top-0 end-0 translate-middle">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>
                    {isOpen && (
                        <section className="card shadow-lg border-0 position-absolute end-0 top-100 mt-2 z-3 overflow-hidden bg-white" style={{ width: "360px", maxWidth: "calc(100vw - 32px)" }} role="dialog" aria-label="Thông báo">
                            <div className="card-header py-3 px-4 min-h-auto d-flex align-items-center justify-content-between border-bottom border-gray-100">
                                <h2 className="card-title fs-6 fw-bold text-gray-800 m-0">Thông báo</h2>
                                <span className="fs-9 text-muted">{unreadCount > 0 ? `${unreadCount} chưa đọc` : "Mới nhất"}</span>
                            </div>
                            <div className="card-body p-2 d-flex flex-column gap-1 max-h-400px overflow-y-auto">
                                {!notifications.length && <p className="text-center text-muted fs-8 py-4 m-0">Bạn chưa có thông báo nào.</p>}
                                {notifications.map(notification => {
                                    const actor = notification.actor;
                                    const actorName = actor ? [actor.last_name, actor.first_name].filter(Boolean).join(" ") || actor.user_name || "Người dùng" : "Hệ thống";
                                    return (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            className={`btn btn-flush d-flex align-items-start gap-3 p-2.5 rounded-2 text-start w-100 ${notification.isRead ? "hover-bg-light" : "bg-light-primary"}`}
                                            onClick={() => void openNotification(notification.id, notification.type, notification.referenceId, actor?.id)}
                                        >
                                            {actor?.avatar ? (
                                                <img src={actor.avatar} alt="" className="w-36px h-36px rounded-circle object-fit-cover flex-shrink-0" />
                                            ) : (
                                                <span className="w-36px h-36px rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-7 flex-shrink-0">
                                                    {actorName.slice(0, 1).toUpperCase()}
                                                </span>
                                            )}
                                            <span className="d-flex flex-column min-w-0 flex-grow-1">
                                                <strong className="fs-7 text-gray-800 text-truncate">{actorName}</strong>
                                                <span className="fs-8 text-gray-600 text-truncate-2">{notificationText(notification.type, actorName)}</span>
                                                <small className="fs-9 text-muted mt-1">{new Date(notification.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</small>
                                            </span>
                                            {!notification.isRead && <span className="w-6px h-6px rounded-circle bg-primary mt-2 flex-shrink-0" aria-label="Chưa đọc" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
                <div className="position-relative" ref={accountMenuRef}>
                    <button
                        type="button"
                        className="btn btn-flush d-flex align-items-center gap-1.5 p-1 rounded-pill"
                        ref={accountButtonRef}
                        aria-label="Tài khoản của bạn"
                        aria-haspopup="menu"
                        aria-expanded={accountMenuOpen}
                        aria-controls={accountMenuOpen ? "home-account-menu" : undefined}
                        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                        onKeyDown={event => {
                            if (event.key === "ArrowDown") { event.preventDefault(); openAccountMenu(); }
                        }}
                    >
                        <UserAvatar name={[user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.userName || "Tài khoản"} src={user?.avatar} size={32} />
                        <DesignIcon id="3352:1058" />
                    </button>
                    {accountMenuOpen && (
                        <div className="card shadow-lg border-0 position-absolute end-0 top-100 mt-2 p-2 z-3 min-w-160px bg-white" id="home-account-menu" role="menu" aria-label="Tài khoản">
                            <button
                                type="button"
                                className="btn btn-flush text-start p-2.5 fs-7 text-danger text-hover-danger rounded-2 w-100 hover-bg-light-danger fw-semibold"
                                role="menuitem"
                                ref={logoutButtonRef}
                                disabled={loggingOut}
                                onClick={handleLogout}
                            >
                                {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );

}
