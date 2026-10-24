import { Link } from "react-router";
import Header from "../home/components/Header";
import Sidebar from "../home/components/Sidebar";
import Discovery from "../home/components/Discovery";
import PostCard from "../home/components/PostCard";
import { HomeContext } from "../home/config";
import { useSavedActions } from "./actions";
import { savedDescription, savedTitle } from "./config";
import "../home/style.scss";
import "./style.scss";

export default function SavedPage() {
    const { layout, feed } = useSavedActions();
    const { user, search, setSearch, notice, setNotice } = layout;
    return <HomeContext.Provider value={{ user, search, setSearch, announce: setNotice, openPanel: setNotice }}>
        <div className="pulse-home pulse-saved"><Header /><main className="home-grid"><Sidebar />
            <div className="home-feed" id="home-feed"><section className="home-card saved-heading"><h1>{savedTitle}</h1><p>{savedDescription}</p></section>
                {feed.loading && <section className="home-card home-empty" role="status">Đang tải bài đã lưu...</section>}
                {feed.error && <section className="home-card home-feed-error" role="alert"><p>{feed.error}</p><button onClick={feed.reload}>Thử lại</button><Link to="/">Đăng nhập</Link></section>}
                {!feed.loading && feed.visiblePosts.map(post => <PostCard key={post.id} post={post} onLike={feed.likePost} onStateChange={feed.changePostState} onUpdate={feed.editPost} onDelete={feed.removePost} onReload={feed.reload} />)}
                {!feed.loading && !feed.error && !feed.visiblePosts.length && <section className="home-card home-empty"><h2>Chưa có bài viết đã lưu</h2><p>Nhấn Lưu ở bài viết để thêm vào danh sách cá nhân.</p><Link to="/home">Về bảng tin</Link></section>}
                {!feed.loading && feed.nextCursor && <button className="home-load-more" disabled={feed.loadingMore} onClick={feed.loadMore}>{feed.loadingMore ? "Đang tải..." : "Xem thêm bài đã lưu"}</button>}
            </div><Discovery />
        </main><div className="home-toast" role="status" aria-live="polite">{notice}</div></div>
    </HomeContext.Provider>;
}
