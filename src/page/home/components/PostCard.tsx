import PostInteractions from "../../../component/common/post-interactions";
import OriginalPost from "../../../component/common/post-interactions/OriginalPost";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { createPortal } from "react-dom";
import { DesignIcon } from "./DesignAsset";
import UserAvatar from "./UserAvatar";
import Composer from "./Composer";
import { privacyLabels } from "../config";
import { useHome, usePostActions } from "../actions";
import type { PostCardProps, PostMedia } from "../../../component/type/post";

function Media({ media, onReload, single }: { media: PostMedia; onReload: () => void; single: boolean }) {
    const [failed, setFailed] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (!viewerOpen) return;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setViewerOpen(false);
        };
        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, [viewerOpen]);

    if (failed) return <div className="home-media-error"><p className="text-danger">Không tải được {media.name}. Liên kết có thể đã hết hạn.</p><button className="text-danger" onClick={onReload}>Tải lại bảng tin</button></div>;
    const mediaClass = "d-block w-100 rounded-2 object-cover";
    if (media.type.startsWith("video/")) {
        return <video className={mediaClass} src={media.url} controls preload="metadata" onError={() => setFailed(true)} aria-label={media.name} />;
    }

    return (
        <>
            <button
                type="button"
                className={`${single ? "d-flex align-items-center justify-content-center" : "d-block"} w-100 p-0 border-0 bg-transparent overflow-hidden rounded-2 cursor-pointer`}
                aria-label={`Mở ảnh ${media.name}`}
                onClick={() => { setZoom(1); setViewerOpen(true); }}
            >
                <img className={mediaClass} src={media.url} alt={media.name} loading="lazy" onError={() => setFailed(true)} />
            </button>
            {viewerOpen && createPortal(
                <div className="modal-backdrop" role="presentation" onClick={event => { if (event.target === event.currentTarget) setViewerOpen(false); }}>
                    <section
                        className="modal-dialog modal-xl d-flex flex-column bg-dark overflow-hidden"
                        style={{ width: "min(92vw, 1200px)", maxWidth: "none", height: "min(92dvh, 900px)" }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Ảnh ${media.name}`}
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="d-flex align-items-center justify-content-end gap-2 p-3 flex-shrink-0">
                            <button type="button" className="btn btn-sm btn-icon btn-light" aria-label="Thu nhỏ ảnh" title="Thu nhỏ" disabled={zoom <= 1} onClick={() => setZoom(current => Math.max(1, current - 0.25))}>
                                <ZoomOut size={18} />
                            </button>
                            <button type="button" className="btn btn-sm btn-icon btn-light" aria-label="Phóng to ảnh" title="Phóng to" disabled={zoom >= 4} onClick={() => setZoom(current => Math.min(4, current + 0.25))}>
                                <ZoomIn size={18} />
                            </button>
                            <button type="button" className="btn btn-sm btn-icon btn-light" aria-label="Đóng ảnh" title="Đóng" onClick={() => setViewerOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className="d-flex flex-grow-1 align-items-center justify-content-center overflow-hidden min-h-0">
                            <img
                                src={media.url}
                                alt={media.name}
                                className="object-contain"
                                style={{ maxWidth: "100%", maxHeight: "100%", transform: `scale(${zoom})`, transition: "transform 150ms ease" }}
                            />
                        </div>
                    </section>
                </div>,
                document.body,
            )}
        </>
    );
}
export default function PostCard(props: PostCardProps) {
    const { post, onReload, onStateChange } = props;
    const { announce } = useHome();
    const { liking, toggleLike, editing, setEditing, deleting, error, saveEdit, remove } = usePostActions(props);
    const createdAt = new Date(post.createdAt);

    if (editing) {
        return (
            <article className="card p-5 mb-4 shadow-sm border-0">
                <h2 className="fs-6 fw-bold text-gray-800 mb-3">Chỉnh sửa bài viết</h2>
                <Composer post={post} onPost={saveEdit} onCancel={() => setEditing(false)} />
            </article>
        );
    }

    return (
        <article className="card p-5 mb-4 shadow-sm border-0" id={post.id}>
            <header className="d-flex align-items-center gap-3 mb-3">
                <Link to={`/profile/${post.author.id}`} aria-label={`Xem trang cá nhân của ${post.author.name}`} className="text-decoration-none flex-shrink-0">
                    <UserAvatar name={post.author.name} src={post.author.avatar} size={44} />
                </Link>
                <div className="d-flex flex-column min-w-0 flex-grow-1">
                    <div className="d-flex align-items-center flex-wrap gap-1 fs-6">
                        <Link to={`/profile/${post.author.id}`} className="fw-bold text-gray-800 text-hover-primary text-decoration-none text-truncate">
                            {post.author.name}
                        </Link>
                        {post.group && (
                            <>
                                <span className="text-muted fs-7 mx-0.5">▶</span>
                                <Link to={`/groups/${post.group.id}`} className="fw-bold text-primary text-hover-primary text-decoration-none text-truncate">
                                    {post.group.name}
                                </Link>
                            </>
                        )}
                    </div>
                    <small className="fs-8 text-muted">
                        <time dateTime={post.createdAt}>{createdAt.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}</time> · {privacyLabels[post.privacy]}{post.updatedAt !== post.createdAt && " · Đã chỉnh sửa"}
                    </small>
                </div>
                {post.canEdit && (
                    <details className="position-relative ms-auto">
                        <summary className="btn btn-sm btn-icon btn-light" aria-label={`Tùy chọn bài viết của ${post.author.name}`}>
                            <DesignIcon id="3352:673" />
                        </summary>
                        <div className="position-absolute end-0 top-100 mt-1 card shadow-lg p-2 border-0 z-3 min-w-150px d-flex flex-column gap-1 bg-white">
                            <button type="button" className="btn btn-sm btn-flush text-start p-2 fs-7 text-gray-700 text-hover-primary rounded-2" onClick={() => setEditing(true)} disabled={deleting}>
                                Chỉnh sửa bài viết
                            </button>
                            <button type="button" className="btn btn-sm btn-flush text-start p-2 fs-7 text-danger text-hover-danger rounded-2" onClick={remove} disabled={deleting}>
                                {deleting ? "Đang xóa..." : "Xóa bài viết"}
                            </button>
                        </div>
                    </details>
                )}
            </header>

            {post.content && (
                <div className="fs-6 text-gray-800 mb-3 lh-base">
                    <p className="m-0">{post.content}</p>
                </div>
            )}

            {!!post.media.length && (
                <div className={`home-post-media d-grid gap-2 mt-3 rounded-3 overflow-hidden ${post.media.length === 1 ? "has-one" : ""}`}>
                    {post.media.map(media => <Media key={media.id + media.url} media={media} onReload={onReload} single={post.media.length === 1} />)}
                </div>
            )}

            <OriginalPost post={post} />

            <div className="d-flex align-items-center justify-content-between py-2 border-top border-bottom border-gray-100 fs-8 text-muted my-2">
                <span>{post.likes} lượt thích</span>
                <span>{post.comments} bình luận</span>
            </div>

            <PostInteractions post={post} variant="home" onStateChange={onStateChange} onNotice={announce} onReposted={onReload}>
                <button
                    className={`btn btn-flush fs-13 d-flex align-items-center justify-content-center gap-1.5 py-2 ${post.liked ? "is-liked text-primary fw-bold" : "text-gray-700"}`}
                    aria-pressed={post.liked}
                    aria-busy={liking}
                    disabled={liking}
                    onClick={toggleLike}
                >
                    <DesignIcon id="3352:710" />
                    {post.liked ? "Đã thích" : "Thích"}
                </button>
            </PostInteractions>

            {error && <p className="card p-3 border-dashed border-danger text-danger fs-13 mt-3 mb-0" role="alert">{error}</p>}
        </article>
    );
}

