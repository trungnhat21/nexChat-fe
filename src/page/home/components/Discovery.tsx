import { Link } from "react-router";
import { DesignIcon } from "./DesignAsset";
import { trends } from "../config";
import { useDiscoveryActions } from "../actions";
import { useNotificationCenter } from "../notification-center-context";
import { useFloatingChat } from "../floating-chat-context";

export default function Discovery() {
    const { friends, busy, openPanel, setSearch, refreshFriends, friendAction, toggleFollow, openProfile } = useDiscoveryActions();
    const { onlineFriends, onlineFriendsLoading } = useNotificationCenter();
    const { openChat } = useFloatingChat();
    return <aside className="home-right" aria-label="Khám phá cộng đồng">
        <section className="home-card home-trending">
            <div className="home-widget-heading"><h2><DesignIcon id="3352:873" />Xu hướng hôm nay</h2><button onClick={() => openPanel("Tất cả xu hướng")}>Xem tất cả</button></div>
            <div className="home-trends">{trends.map(trend => <div className="home-trend" key={trend.tag}><button onClick={() => setSearch(trend.tag)}><small>{trend.category}</small><strong>{trend.tag}</strong><small>{trend.count}</small></button><button aria-label={`Tùy chọn ${trend.tag}`} onClick={() => openPanel(trend.tag)}><DesignIcon id={trend.icon} /></button></div>)}</div>
        </section>
        <section className="home-card home-suggestions">
            <div className="home-widget-heading"><h2>Gợi ý kết bạn</h2><button onClick={refreshFriends}>Làm mới</button></div>
            <div className="home-friend-list">{friends.map(friend => <div className="home-friend" key={friend.id}>
                <button className="home-friend-person" onClick={() => openProfile(friend.id)}><span className="home-friend-avatar">{friend.avatar ? <img src={friend.avatar} alt="" /> : friend.name.slice(0, 1)}</span><span><strong>{friend.name}</strong><small>{friend.friendStatus === "friends" ? "Bạn bè" : friend.friendStatus === "incoming" ? "Đã gửi lời mời cho bạn" : friend.friendStatus === "outgoing" ? "Đã gửi lời mời" : "Gợi ý cho bạn"}</small></span></button>
                <div className="home-friend-actions">
                    {friend.friendStatus === "none" && <button className="home-follow" disabled={busy.includes(friend.id)} onClick={() => void friendAction(friend, "request")}>Thêm bạn</button>}
                    {friend.friendStatus === "outgoing" && <button className="home-follow" disabled={busy.includes(friend.id)} onClick={() => void friendAction(friend, "cancel")}>Đã gửi</button>}
                    {friend.friendStatus === "incoming" && <><button className="home-follow" disabled={busy.includes(friend.id)} onClick={() => void friendAction(friend, "accept")}>Chấp nhận</button><button className="home-follow" disabled={busy.includes(friend.id)} onClick={() => void friendAction(friend, "reject")}>Từ chối</button></>}
                    {friend.friendStatus === "friends" && <button className="home-follow" disabled={busy.includes(friend.id)} onClick={() => void friendAction(friend, "unfriend")}>Bạn bè</button>}
                    {friend.friendStatus !== "blocked" && <button className="home-follow" aria-pressed={friend.following} disabled={busy.includes(friend.id)} onClick={() => void toggleFollow(friend)}>{friend.following ? "Đang theo dõi" : "Theo dõi"}</button>}
                </div>
            </div>)}{friends.length === 0 && <p className="home-suggestions-empty">Chưa có gợi ý kết bạn.</p>}</div>
        </section>
        <section className="home-card home-online"><div className="home-widget-heading"><h2>Bạn bè trực tuyến <i className="home-status-dot" /></h2><small>{onlineFriendsLoading ? "Đang tải…" : `${onlineFriends.length} online`}</small></div><div className="home-online-list">{onlineFriends.map(friend => <Link key={friend.id} to={`/messages?userId=${encodeURIComponent(friend.id)}`} onClick={event => { event.preventDefault(); openChat(friend); }} aria-label={`Mở cuộc trò chuyện với ${friend.name}`}><span className="home-online-person"><span className="home-online-avatar">{friend.avatar ? <img src={friend.avatar} alt="" /> : <span>{friend.name.trim().split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase()}</span>}<i className="home-online-dot" /></span>{friend.name}</span></Link>)}{!onlineFriendsLoading && onlineFriends.length === 0 && <p className="home-online-empty">Không có bạn bè nào đang trực tuyến.</p>}</div></section>
    </aside>;
}
