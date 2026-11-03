import { Link } from "react-router";
import { Bookmark, MessageCircle, Share2 } from "lucide-react";
import { usePostInteractions } from "./actions";
import { postPrivacyOptions, repostLimit } from "./config";
import CommentsDialog from "./CommentsDialog";
import type { PostInteractionsProps } from "../../type/post";

export default function PostInteractions(props: PostInteractionsProps) {
    const { post, variant, children } = props;
    const a = usePostInteractions(props);

    return (
        <div className="post-interactions">
            <div className={variant + "-post-actions d-grid gap-2"} style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
                {children}
                <button
                    type="button"
                    className="btn btn-flush fs-13 text-gray-700 d-flex align-items-center justify-content-center gap-1.5 py-2"
                    aria-expanded={a.commentsOpen}
                    onClick={a.toggleComments}
                >
                    <MessageCircle size={16} />
                    <span>Bình luận ({post.comments})</span>
                </button>
                <button
                    type="button"
                    className="btn btn-flush fs-13 text-gray-700 d-flex align-items-center justify-content-center gap-1.5 py-2"
                    aria-expanded={a.shareOpen}
                    onClick={() => a.setShareOpen(previous => !previous)}
                >
                    <Share2 size={16} />
                    <span>Chia sẻ</span>
                </button>
                <button
                    type="button"
                    aria-pressed={post.saved}
                    className={`btn btn-flush fs-13 d-flex align-items-center justify-content-center gap-1.5 py-2 rounded-2 ${post.saved ? "text-primary fw-bold" : "text-gray-700"}`}
                    disabled={!!a.busy}
                    onClick={a.toggleSaved}
                >
                    <Bookmark size={16} strokeWidth={post.saved ? 2.5 : 1.8} fill={post.saved ? "currentColor" : "none"} />
                    <span className={post.saved ? "fw-bold" : ""}>{post.saved ? "Đã lưu" : "Lưu"}</span>
                </button>
            </div>

            {a.error && (
                <p className="card p-3 border-dashed border-danger text-danger fs-13 mt-3 mb-0" role="alert">
                    {a.error}
                </p>
            )}

            {a.shareOpen && (
                <section className="card p-4 mt-3 bg-light border shadow-sm" aria-label="Chia sẻ bài viết">
                    <h3 className="fs-14 fw-bold text-gray-800 mb-2">Chia sẻ liên kết</h3>
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <button
                            type="button"
                            className="btn btn-sm btn-light-primary"
                            onClick={a.copyLink}
                        >
                            {a.copied ? "Đã sao chép" : "Sao chép liên kết"}
                        </button>
                        <Link to={"/posts/" + post.id} className="btn btn-sm btn-outline">
                            Mở bài viết
                        </Link>
                    </div>

                    <form onSubmit={a.submitRepost} className="pt-3 border-top">
                        <h3 className="fs-14 fw-bold text-gray-800 mb-1">Đăng lại trên nexChat</h3>
                        <p className="fs-12 text-gray-500 mb-2">
                            Bài mới tham chiếu bài gốc. Nội dung gốc chỉ hiển thị với người có quyền xem.
                        </p>
                        <textarea
                            aria-label="Nội dung đăng lại"
                            className="form-control form-control-solid mb-3"
                            placeholder="Thêm lời chia sẻ..."
                            value={a.repostText}
                            maxLength={repostLimit}
                            onChange={event => a.setRepostText(event.target.value)}
                            rows={2}
                            disabled={!!a.busy}
                        />
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                            <label className="d-flex align-items-center gap-2 fs-12 text-gray-600 m-0">
                                <span>Ai có thể xem?</span>
                                <select
                                    aria-label="Quyền riêng tư bài đăng lại"
                                    className="form-select form-select-solid form-select-sm"
                                    style={{ width: "auto" }}
                                    value={a.privacy}
                                    onChange={event => a.setPrivacy(event.target.value as typeof a.privacy)}
                                    disabled={!!a.busy}
                                >
                                    {postPrivacyOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <button
                                type="submit"
                                className="btn btn-sm btn-primary"
                                disabled={!!a.busy}
                            >
                                {a.busy === "repost" ? "Đang đăng..." : "Đăng lại"}
                            </button>
                        </div>
                    </form>
                    {a.repostedId && (
                        <Link to={"/posts/" + a.repostedId} className="btn btn-sm btn-flush text-primary mt-2">
                            Xem bài vừa đăng lại →
                        </Link>
                    )}
                </section>
            )}

            {a.commentsOpen && <CommentsDialog post={post} state={a} onClose={() => a.setCommentsOpen(false)} />}
        </div>
    );
}
