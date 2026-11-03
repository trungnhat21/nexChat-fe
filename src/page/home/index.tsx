import { Link, useParams, useSearchParams } from "react-router";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Discovery from "./components/Discovery";
import Stories from "./components/Stories";
import Composer from "./components/Composer";
import PostCard from "./components/PostCard";
import { useHomeFeedActions, useHomeLayoutActions } from "./actions";
import { HomeContext } from "./config";
import type { FeedFilters } from "./components/SearchFilterCard";
import "./style.scss";

export default function HomePage() {
    const { postId } = useParams<{ postId: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const urlSort = searchParams.get("sort");
    const initialSort: FeedFilters["sort"] =
        urlSort === "relevance" ? "relevance" : "latest";
    const urlPeriod = searchParams.get("period");
    const initialPeriod: FeedFilters["period"] =
        urlPeriod === "24h" || urlPeriod === "day"
            ? "24h"
            : urlPeriod === "week" || urlPeriod === "month"
              ? urlPeriod
              : "all";
    const initialMediaOnly = searchParams.get("mediaOnly") === "true";

    const filters: FeedFilters = {
        sort: initialSort,
        period: initialPeriod,
        mediaOnly: initialMediaOnly,
    };

    const handleFiltersChange = (newFilters: FeedFilters) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (newFilters.sort && newFilters.sort !== "latest") {
                next.set("sort", newFilters.sort);
            } else {
                next.delete("sort");
            }
            if (newFilters.period && newFilters.period !== "all") {
                next.set("period", newFilters.period);
            } else {
                next.delete("period");
            }
            if (newFilters.mediaOnly) {
                next.set("mediaOnly", "true");
            } else {
                next.delete("mediaOnly");
            }
            return next;
        }, { replace: true });
    };

    const { search, setSearch, notice, setNotice, panel, setPanel, dialogRef, user } = useHomeLayoutActions();
    const { changePostState, likePost, visiblePosts, addPost, editPost, removePost, loading, loadingMore, error, nextCursor, loadMore, reload } = useHomeFeedActions("", false, filters);

    return (
        <HomeContext.Provider value={{ user, search, setSearch, announce: setNotice, openPanel: setPanel }}>
            <div className="nexchat-home">
                <a className="home-skip-link" href="#home-feed">Chuyển đến bảng tin</a>
                <Header />
                <main className="home-grid">
                    <Sidebar filters={filters} onFiltersChange={handleFiltersChange} />
                    <div className="home-feed" id="home-feed" tabIndex={-1}>
                        {!postId && (
                            <>
                                <Stories />
                                <Composer onPost={addPost} />
                            </>
                        )}
                        {loading && (
                            <div className="card shadow-sm mb-4 p-8 text-center border-0 text-muted fs-6" role="status">
                                Đang tải bài viết...
                            </div>
                        )}
                        {error && (
                            <div className="card shadow-sm mb-4 p-5 border border-dashed border-danger text-center" role="alert">
                                <p className="text-danger fs-7 mb-3">{error}</p>
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                    <button type="button" className="btn btn-sm btn-light-danger fw-semibold" onClick={reload}>
                                        Thử lại
                                    </button>
                                    <Link to="/" className="btn btn-sm btn-light fw-semibold">
                                        Đăng nhập
                                    </Link>
                                </div>
                            </div>
                        )}
                        {!loading && visiblePosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onStateChange={changePostState}
                                onLike={likePost}
                                onUpdate={editPost}
                                onDelete={removePost}
                                onReload={reload}
                            />
                        ))}
                        {!loading && nextCursor && (
                            <button
                                type="button"
                                className="btn btn-light-primary w-100 py-3 mb-4 shadow-sm fw-bold fs-6"
                                disabled={loadingMore}
                                onClick={loadMore}
                            >
                                {loadingMore ? "Đang tải..." : "Xem thêm bài viết"}
                            </button>
                        )}
                        {!loading && !error && visiblePosts.length === 0 && (
                            <div className="card shadow-sm mb-4 p-8 text-center border-0">
                                <h2 className="fs-5 fw-bold text-gray-800 mb-2">Chưa tìm thấy bài viết</h2>
                                <p className="text-muted fs-6 mb-0">Hãy chia sẻ bài viết đầu tiên của bạn.</p>
                            </div>
                        )}
                    </div>
                    <Discovery />
                </main>
                <footer className="home-footer">
                    <span><strong>NexChat</strong> © 2024 NexChat Social Network. Bản quyền được bảo lưu.</span>
                    <nav aria-label="Thông tin">
                        {["Điều khoản", "Quyền riêng tư", "Hỗ trợ", "Cộng đồng"].map(item => (
                            <button key={item} type="button" onClick={() => setPanel(item)}>
                                {item}
                            </button>
                        ))}
                    </nav>
                </footer>
                <div className="home-toast" role="status" aria-live="polite">{notice}</div>
                <dialog
                    ref={dialogRef}
                    className="home-dialog"
                    aria-labelledby="home-dialog-title"
                    onCancel={() => setPanel("")}
                    onClose={() => setPanel("")}
                    onClick={event => { if (event.target === event.currentTarget) setPanel(""); }}
                >
                    <div className="home-dialog-body">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                            <h2 className="fs-5 fw-bold text-gray-800 m-0" id="home-dialog-title">{panel}</h2>
                            <button type="button" className="btn btn-sm btn-icon btn-light" aria-label="Đóng" onClick={() => setPanel("")}>✕</button>
                        </div>
                        <p className="text-gray-600 fs-6 my-4">
                            Tính năng này chưa được hỗ trợ. Bạn có thể tạo, chỉnh sửa, xóa bài viết và đính kèm ảnh/video trên bảng tin.
                        </p>
                        <div className="text-end">
                            <button type="button" className="btn btn-primary btn-sm px-4" onClick={() => setPanel("")}>
                                Đã hiểu
                            </button>
                        </div>
                    </div>
                </dialog>
            </div>
        </HomeContext.Provider>
    );
}

