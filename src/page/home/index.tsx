import { Link, useParams } from "react-router";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Discovery from "./components/Discovery";
import Stories from "./components/Stories";
import Composer from "./components/Composer";
import PostCard from "./components/PostCard";
import { useHomeFeedActions, useHomeLayoutActions } from "./actions";
import { HomeContext } from "./config";
import "./style.scss";
import { NotificationCenterProvider } from "./NotificationCenter";

export default function HomePage() {
    const { postId } = useParams<{ postId: string }>();
    const { search, setSearch, notice, setNotice, panel, setPanel, dialogRef, user } = useHomeLayoutActions();
    const { changePostState, likePost, query, visiblePosts, addPost, editPost, removePost, loading, loadingMore, error, nextCursor, loadMore, reload } = useHomeFeedActions(search);

    return <NotificationCenterProvider userId={user?.id}><HomeContext.Provider value={{ user, search, setSearch, announce: setNotice, openPanel: setPanel }}>
        <div className="pulse-home">
            <a className="home-skip-link" href="#home-feed">Chuyển đến bảng tin</a>
            <Header />
            <main className="home-grid">
                <Sidebar />
                <div className="home-feed" id="home-feed" tabIndex={-1}>
                    {!postId && <><Stories /><Composer onPost={addPost} /></>}
                    {query && <div className="home-search-result"><span>{visiblePosts.length} bài viết phù hợp với “{search}”</span><button onClick={() => setSearch("")}>Xóa tìm kiếm</button></div>}
                    {loading && <section className="home-card home-empty" role="status">Đang tải bài viết...</section>}
                    {error && <section className="home-card home-feed-error" role="alert"><p>{error}</p><button onClick={reload}>Thử lại</button><Link to="/">Đăng nhập</Link></section>}
                    {!loading && visiblePosts.map(post => <PostCard key={post.id} post={post} onStateChange={changePostState} onLike={likePost} onUpdate={editPost} onDelete={removePost} onReload={reload} />)}
                    {!loading && nextCursor && <button className="home-load-more" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "Đang tải..." : "Xem thêm bài viết"}</button>}
                    {!loading && !error && visiblePosts.length === 0 && <section className="home-card home-empty"><h2>Chưa tìm thấy bài viết</h2><p>{query ? "Thử tìm theo tác giả, nội dung hoặc hashtag khác." : "Hãy chia sẻ bài viết đầu tiên của bạn."}</p></section>}
                </div>
                <Discovery />
            </main>
            <footer className="home-footer"><span><strong>Pulse</strong> © 2024 Pulse Social Network. Bản quyền được bảo lưu.</span><nav aria-label="Thông tin"><button onClick={() => setPanel("Điều khoản")}>Điều khoản</button><button onClick={() => setPanel("Quyền riêng tư")}>Quyền riêng tư</button><button onClick={() => setPanel("Hỗ trợ")}>Hỗ trợ</button><button onClick={() => setPanel("Cộng đồng")}>Cộng đồng</button></nav></footer>
            <div className="home-toast" role="status" aria-live="polite">{notice}</div>
            <dialog ref={dialogRef} className="home-dialog" aria-labelledby="home-dialog-title" onCancel={() => setPanel("")} onClose={() => setPanel("")} onClick={event => { if (event.target === event.currentTarget) setPanel(""); }}>
                <div className="home-dialog-body"><div className="home-widget-heading"><h2 id="home-dialog-title">{panel}</h2><button aria-label="Đóng" onClick={() => setPanel("")}>✕</button></div><p>Tính năng này chưa được hỗ trợ. Bạn có thể tạo, chỉnh sửa, xóa bài viết và đính kèm ảnh/video trên bảng tin.</p><button className="home-primary" onClick={() => setPanel("")}>Đã hiểu</button></div>
            </dialog>
        </div>
    </HomeContext.Provider></NotificationCenterProvider>;
}
