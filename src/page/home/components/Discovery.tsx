import { Avatar, DesignIcon } from "./DesignAsset";
import { onlineFriends, trends } from "../config";
import { useDiscoveryActions } from "../actions";

export default function Discovery() {
    const { following, friends, openPanel, setSearch, refreshFriends, toggleFollow } = useDiscoveryActions();
    return <aside className="home-right" aria-label="Khám phá cộng đồng">
        <section className="home-card home-trending">
            <div className="home-widget-heading"><h2><DesignIcon id="3352:873" />Xu hướng hôm nay</h2><button onClick={() => openPanel("Tất cả xu hướng")}>Xem tất cả</button></div>
            <div className="home-trends">{trends.map(trend => <div className="home-trend" key={trend.tag}><button onClick={() => setSearch(trend.tag)}><small>{trend.category}</small><strong>{trend.tag}</strong><small>{trend.count}</small></button><button aria-label={`Tùy chọn ${trend.tag}`} onClick={() => openPanel(trend.tag)}><DesignIcon id={trend.icon} /></button></div>)}</div>
        </section>
        <section className="home-card home-suggestions">
            <div className="home-widget-heading"><h2>Gợi ý kết bạn</h2><button onClick={refreshFriends}>Làm mới</button></div>
            <div className="home-friend-list">{friends.map(friend => <div className="home-friend" key={friend.name}><button className="home-friend-person" onClick={() => openPanel(`Hồ sơ ${friend.name}`)}><Avatar id={friend.avatar} /><span><strong>{friend.name}</strong><small>{friend.mutual} bạn chung</small></span></button><button className="home-follow" aria-pressed={following.includes(friend.name)} onClick={() => toggleFollow(friend.name)}>{following.includes(friend.name) ? "Đang theo dõi" : "Theo dõi"}</button></div>)}</div>
        </section>
        <section className="home-card home-online">
            <div className="home-widget-heading"><h2>Bạn bè trực tuyến <i className="home-status-dot" /></h2><small>14 online</small></div>
            <div className="home-online-list">{onlineFriends.map(friend => <button key={friend.name} onClick={() => openPanel(`Nhắn tin với ${friend.name}`)}><span><Avatar id={friend.avatar} size={32} online />{friend.name}</span><DesignIcon id={friend.icon} /></button>)}</div>
        </section>
    </aside>;
}
