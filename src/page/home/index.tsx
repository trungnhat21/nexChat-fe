import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Discovery from "./components/Discovery";
import Stories from "./components/Stories";
import Composer from "./components/Composer";
import PostCard from "./components/PostCard";
import { useHomeFeedActions, useHomeLayoutActions } from "./actions";
import { HomeContext } from "./config";
import "./style.scss";

export default function HomePage() {
    const { search, setSearch, notice, setNotice, panel, setPanel, dialogRef } = useHomeLayoutActions();
    const { query, visiblePosts, addPost } = useHomeFeedActions({ search, setSearch });

    return <HomeContext.Provider value={{ search, setSearch, announce: setNotice, openPanel: setPanel }}>
        <div className="pulse-home">
            <a className="home-skip-link" href="#home-feed">Chuyển đến bảng tin</a>
            <Header />
            <main className="home-grid">
                <Sidebar />
                <div className="home-feed" id="home-feed" tabIndex={-1}>
                    <Stories />
                    <Composer onPost={addPost} />
                    {query && <div className="home-search-result"><span>{visiblePosts.length} bài viết phù hợp với “{search}”</span><button onClick={() => setSearch("")}>Xóa tìm kiếm</button></div>}
                    {visiblePosts.map(post => <PostCard key={post.id} post={post} />)}
                    {visiblePosts.length === 0 && <section className="home-card home-empty"><h2>Chưa tìm thấy bài viết</h2><p>Thử tìm theo tác giả, nội dung hoặc hashtag trong bảng tin mẫu.</p></section>}
                </div>
                <Discovery />
            </main>
            <footer className="home-footer"><span><strong>Pulse</strong> © 2024 Pulse Social Network. Bản quyền được bảo lưu.</span><nav aria-label="Thông tin"><button onClick={() => setPanel("Điều khoản")}>Điều khoản</button><button onClick={() => setPanel("Quyền riêng tư")}>Quyền riêng tư</button><button onClick={() => setPanel("Hỗ trợ")}>Hỗ trợ</button><button onClick={() => setPanel("Cộng đồng")}>Cộng đồng</button></nav></footer>
            <div className="home-toast" role="status" aria-live="polite">{notice}</div>
            <dialog ref={dialogRef} className="home-dialog" aria-labelledby="home-dialog-title" onCancel={() => setPanel("")} onClose={() => setPanel("")} onClick={event => { if (event.target === event.currentTarget) setPanel(""); }}>
                <div className="home-dialog-body"><div className="home-widget-heading"><h2 id="home-dialog-title">{panel}</h2><button aria-label="Đóng" onClick={() => setPanel("")}>✕</button></div><p>Đây là bản xem thử giao diện Pulse. Tính năng này chưa kết nối dữ liệu máy chủ.</p><button className="home-primary" onClick={() => setPanel("")}>Đã hiểu</button></div>
            </dialog>
        </div>
    </HomeContext.Provider>;
}
