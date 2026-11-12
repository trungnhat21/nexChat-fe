import { Link } from "react-router";
import { DesignIcon } from "./DesignAsset";
import { trends } from "../config";
import { useDiscoveryActions } from "../actions";
import { useNotificationCenter } from "../notification-center-context";
import { useFloatingChat } from "../floating-chat-context";

export default function Discovery() {
    const { friends, busy, openPanel, setSearch, refreshFriends, toggleFollow, openProfile } = useDiscoveryActions();
    const { onlineFriends, onlineFriendsLoading } = useNotificationCenter();
    const { openChat } = useFloatingChat();

    return (
        <aside className="home-right" aria-label="Khám phá cộng đồng">
            {/* 1. Xu hướng hôm nay */}
            <section className="card shadow-sm mb-4 border-0 p-3 home-trending">
                <div className="home-widget-heading">
                    <h2>
                        <DesignIcon id="3352:873" />
                        Xu hướng hôm nay
                    </h2>
                    <button type="button" onClick={() => openPanel("Tất cả xu hướng")}>
                        Xem tất cả
                    </button>
                </div>
                <div className="home-trends">
                    {trends.map(trend => (
                        <div className="home-trend" key={trend.tag}>
                            <button type="button" onClick={() => setSearch(trend.tag)}>
                                <small>{trend.category}</small>
                                <strong>{trend.tag}</strong>
                                <small>{trend.count}</small>
                            </button>
                            <button type="button" aria-label={`Tùy chọn ${trend.tag}`} onClick={() => openPanel(trend.tag)}>
                                <DesignIcon id={trend.icon} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Gợi ý kết bạn */}
            <section className="card shadow-sm mb-4 border-0 p-4 home-suggestions">
                <div className="home-widget-heading">
                    <h2 className="fw-semibold" style={{ fontWeight: 600 }}>Gợi ý kết bạn</h2>
                    <button type="button" onClick={refreshFriends}>
                        Làm mới
                    </button>
                </div>
                <div className="home-friend-list">
                    {friends.map(friend => (
                        <div className="home-friend" key={friend.id}>
                            <button type="button" className="home-friend-person" onClick={() => openProfile(friend.id)}>
                                <span className="home-friend-avatar">
                                    {friend.avatar ? (
                                        <img src={friend.avatar} alt={friend.name} />
                                    ) : (
                                        <span>{friend.name.slice(0, 1).toUpperCase()}</span>
                                    )}
                                </span>
                                <span className="home-friend-info">
                                    <span className="fw-semibold text-gray-800" style={{ fontWeight: 600 }}>{friend.name}</span>
                                    <small>
                                        {(friend as any).mutualFriends || (friend as any).mutualCount
                                            ? `${(friend as any).mutualFriends || (friend as any).mutualCount} bạn chung`
                                            : friend.friendStatus === "friends"
                                                ? "Bạn bè"
                                                : friend.friendStatus === "incoming"
                                                    ? "Đã gửi lời mời"
                                                    : friend.friendStatus === "outgoing"
                                                        ? "Đã gửi"
                                                        : "Gợi ý cho bạn"}
                                    </small>
                                </span>
                            </button>
                            <div className="home-friend-actions">
                                {friend.friendStatus !== "blocked" && (
                                    <button
                                        type="button"
                                        className="home-follow fw-semibold"
                                        style={{ fontWeight: 600 }}
                                        aria-pressed={friend.following}
                                        disabled={busy.includes(friend.id)}
                                        onClick={() => void toggleFollow(friend)}
                                    >
                                        {friend.following ? "Đang theo dõi" : "Theo dõi"}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {friends.length === 0 && <p className="home-suggestions-empty">Chưa có gợi ý kết bạn.</p>}
                </div>
            </section>

            {/* 3. Bạn bè trực tuyến */}
            <section className="card shadow-sm mb-4 border-0 p-3 home-online">
                <div className="home-widget-heading mb-2">
                    <h2>
                        Bạn bè trực tuyến
                        <span className="w-8px h-8px rounded-circle bg-success d-inline-block ms-1" />
                    </h2>
                    <small className="fs-8 text-muted">{onlineFriendsLoading ? "Đang tải…" : `${onlineFriends.length} online`}</small>
                </div>
                <div className="d-flex flex-column gap-1">
                    {onlineFriends.map(friend => (
                        <Link
                            key={friend.id}
                            to={`/messages?userId=${encodeURIComponent(friend.id)}`}
                            onClick={event => { event.preventDefault(); openChat(friend); }}
                            aria-label={`Mở cuộc trò chuyện với ${friend.name}`}
                            className="d-flex align-items-center gap-3 p-2 rounded-2 text-gray-800 text-hover-primary text-decoration-none hover-bg-light"
                        >
                            <span className="position-relative d-inline-flex flex-shrink-0">
                                {friend.avatar ? (
                                    <img src={friend.avatar} alt="" className="w-36px h-36px rounded-circle object-fit-cover" />
                                ) : (
                                    <span className="w-36px h-36px rounded-circle bg-light-primary text-primary d-flex align-items-center justify-content-center fw-bold fs-7">
                                        {friend.name.trim().split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase()}
                                    </span>
                                )}
                                <span className="position-absolute bottom-0 end-0 w-10px h-10px bg-success border border-2 border-white rounded-circle" />
                            </span>
                            <span className="fs-6 fw-medium text-truncate">{friend.name}</span>
                        </Link>
                    ))}
                    {!onlineFriendsLoading && onlineFriends.length === 0 && (
                        <p className="text-center text-muted fs-7 py-3 m-0">Không có bạn bè nào đang trực tuyến.</p>
                    )}
                </div>
            </section>
        </aside>
    );
}

