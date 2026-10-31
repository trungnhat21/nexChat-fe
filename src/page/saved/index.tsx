import { Link } from "react-router";
import Header from "../home/components/Header";
import Sidebar from "../home/components/Sidebar";
import Discovery from "../home/components/Discovery";
import PostCard from "../home/components/PostCard";
import { HomeContext } from "../home/config";
import { useSavedActions } from "./actions";
import { savedDescription, savedTitle } from "./config";
import "../home/style.scss";

export default function SavedPage() {
    const { layout, feed } = useSavedActions();
    const { user, search, setSearch, notice, setNotice } = layout;

    return (
        <HomeContext.Provider value={{ user, search, setSearch, announce: setNotice, openPanel: setNotice }}>
            <div className="nexchat-home nexchat-saved">
                <Header />
                <main className="home-grid">
                    <Sidebar />
                    <div className="home-feed" id="home-feed">
                        <section className="card p-6 mb-4">
                            <h1 className="fs-24 fw-bold mb-2 text-gray-900">{savedTitle}</h1>
                            <p className="text-gray-600 m-0 fs-14">{savedDescription}</p>
                        </section>

                        {feed.loading && (
                            <section className="card p-6 text-center text-gray-500 mb-4" role="status">
                                Đang tải bài đã lưu...
                            </section>
                        )}

                        {feed.error && (
                            <section className="card p-6 border-dashed border-danger mb-4 text-center" role="alert">
                                <p className="text-danger fw-semibold mb-3">{feed.error}</p>
                                <div className="d-flex justify-content-center gap-2">
                                    <button className="btn btn-sm btn-light-primary" onClick={feed.reload}>Thử lại</button>
                                    <Link to="/" className="btn btn-sm btn-outline">Đăng nhập</Link>
                                </div>
                            </section>
                        )}

                        {!feed.loading && feed.visiblePosts.map(post => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onLike={feed.likePost}
                                onStateChange={feed.changePostState}
                                onUpdate={feed.editPost}
                                onDelete={feed.removePost}
                                onReload={feed.reload}
                            />
                        ))}

                        {!feed.loading && !feed.error && !feed.visiblePosts.length && (
                            <section className="card p-8 text-center mb-4">
                                <h2 className="fs-18 fw-bold text-gray-800 mb-2">Chưa có bài viết đã lưu</h2>
                                <p className="text-gray-500 fs-14 mb-4">Nhấn Lưu ở bài viết để thêm vào danh sách cá nhân.</p>
                                <div>
                                    <Link to="/home" className="btn btn-primary btn-sm">Về bảng tin</Link>
                                </div>
                            </section>
                        )}

                        {!feed.loading && feed.nextCursor && (
                            <button
                                className="btn btn-light-primary w-100 py-3 rounded-lg fw-bold"
                                disabled={feed.loadingMore}
                                onClick={feed.loadMore}
                            >
                                {feed.loadingMore ? "Đang tải..." : "Xem thêm bài đã lưu"}
                            </button>
                        )}
                    </div>
                    <Discovery />
                </main>
                <div className="home-toast" role="status" aria-live="polite">{notice}</div>
            </div>
        </HomeContext.Provider>
    );
}
