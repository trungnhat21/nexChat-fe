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
    return <header className="home-header">
        <div className="home-header-start">
            <Link to="/home" className="home-brand" aria-label="NexChat — Trang chủ"><DesignImage id="3352:1019" /><span>NexChat</span></Link>
            <div className={`home-search ${searchFocused ? "is-suggestions-open" : ""}`} ref={searchRef}>
                <DesignIcon id="3352:1027" />
                <Input name="feedSearch" aria-label="Tìm kiếm bạn bè, bài viết, hashtag..." maxLength={200} placeholder="Tìm kiếm bạn bè, bài viết, hashtag..." value={search} onFocus={() => setSearchFocused(true)} onKeyDown={handleSearchKeyDown} onChange={event => { setSearch(event.target.value); setSearchFocused(true); }} inputClassName="home-search-field" compact />
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
            <Link to="/home" aria-current={pathname === "/home" ? "page" : undefined}>Bảng tin</Link>
            <Link to="/friends" aria-current={pathname === "/friends" ? "page" : undefined}>Bạn bè</Link>
            {["Video", "Nhóm"].map(label => <button key={label} onClick={() => openPanel(label)}>{label}</button>)}
        </nav>
        <div className="home-header-end">
            <Button className="home-primary home-create-button" onClick={() => focusComposer(navigate)}><DesignIcon id="3352:1039" />Đăng bài</Button>
            <button className="home-icon-button" aria-label={`Tin nhắn, ${unreadMessageCount} chưa đọc`} onClick={() => navigate("/messages")}><DesignIcon id="3352:1045" />{unreadMessageCount > 0 && <span className="home-badge">{unreadMessageCount > 99 ? "99+" : unreadMessageCount}</span>}</button>
            <div className="home-notification-wrap" ref={notificationsRef}>
                <button className="home-icon-button" aria-label={`Thông báo, ${unreadCount} chưa đọc`} aria-haspopup="dialog" aria-expanded={isOpen} onClick={() => isOpen ? closeNotifications() : openNotifications()}><DesignIcon id="3352:1050" />{unreadCount > 0 && <span className="home-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>}</button>
                {isOpen && <section className="home-notification-panel" role="dialog" aria-label="Thông báo">
                    <header><h2>Thông báo</h2><span>{unreadCount > 0 ? `${unreadCount} chưa đọc` : "Mới nhất"}</span></header>
                    <div className="home-notification-list">
                        {!notifications.length && <p className="home-notification-empty">Bạn chưa có thông báo nào.</p>}
                        {notifications.map(notification => {
                            const actor = notification.actor;
                            const actorName = actor ? [actor.last_name, actor.first_name].filter(Boolean).join(" ") || actor.user_name || "Người dùng" : "Hệ thống";
                            return <button key={notification.id} className={`home-notification-item ${notification.isRead ? "is-read" : "is-unread"}`} onClick={() => void openNotification(notification.id, notification.type, notification.referenceId, actor?.id)}>
                                {actor?.avatar ? <img src={actor.avatar} alt="" /> : <span className="home-notification-avatar">{actorName.slice(0, 1).toUpperCase()}</span>}
                                <span className="home-notification-copy"><strong>{actorName}</strong><span>{notificationText(notification.type, actorName)}</span><small>{new Date(notification.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</small></span>
                                {!notification.isRead && <i aria-label="Chưa đọc" />}
                            </button>;
                        })}
                    </div>
                </section>}
            </div>
            <div className="home-account" ref={accountMenuRef}>
                <button type="button" className="home-profile-button" ref={accountButtonRef} aria-label="Tài khoản của bạn" aria-haspopup="menu" aria-expanded={accountMenuOpen} aria-controls={accountMenuOpen ? "home-account-menu" : undefined} onClick={() => setAccountMenuOpen(!accountMenuOpen)} onKeyDown={event => {
                    if (event.key === "ArrowDown") { event.preventDefault(); openAccountMenu(); }
                }}>
                    <UserAvatar name={[user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.userName || "Tài khoản"} src={user?.avatar} size={32} /><DesignIcon id="3352:1058" />
                </button>
                {accountMenuOpen && <div className="home-account-menu" id="home-account-menu" role="menu" aria-label="Tài khoản">
                    <button type="button" role="menuitem" ref={logoutButtonRef} disabled={loggingOut} onClick={handleLogout}>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</button>
                </div>}
            </div>
        </div>
    </header>;
}
