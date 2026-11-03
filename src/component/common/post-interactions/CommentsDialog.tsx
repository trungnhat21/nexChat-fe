import { Link } from "react-router";
import { X } from "lucide-react";
import type { FeedPost, PostComment } from "../../type/post";
import type { usePostInteractions } from "./actions";

type InteractionState = ReturnType<typeof usePostInteractions>;
type Props = { post: FeedPost; state: InteractionState; onClose: () => void };

function CommentItem({ comment, state }: { comment: PostComment; state: InteractionState }) {
    const date = new Date(comment.createdAt);
    return (
        <article className="py-2.5" key={comment.id}>
            <div className="d-flex align-items-start gap-2.5">
                <Link
                    className="rounded-circle overflow-hidden flex-shrink-0 cursor-pointer d-grid place-items-center bg-gray-200 fw-bold fs-13 text-gray-700 text-decoration-none"
                    style={{ width: 36, height: 36 }}
                    to={`/profile/${comment.author.id}`}
                    aria-label={`Trang cá nhân ${comment.author.name}`}
                >
                    {comment.author.avatar ? (
                        <img src={comment.author.avatar} alt="" className="w-100 h-100 object-cover" />
                    ) : (
                        <span>{comment.author.name.slice(0, 1).toUpperCase()}</span>
                    )}
                </Link>
                <div className="flex-grow-1 min-w-0">
                    <div className="bg-light p-3 rounded-lg d-inline-block max-w-full">
                        <Link to={`/profile/${comment.author.id}`} className="text-gray-900 fw-bold fs-13 text-decoration-none d-block">
                            {comment.author.name}
                        </Link>
                        {state.editing === comment.id ? (
                            <form onSubmit={state.saveEdit} className="mt-2">
                                <textarea
                                    aria-label="Chỉnh sửa bình luận"
                                    className="form-control form-control-solid fs-13"
                                    value={state.editText}
                                    onChange={event => state.setEditText(event.target.value)}
                                    maxLength={2000}
                                    required
                                />
                                <div className="d-flex align-items-center gap-2 mt-2">
                                    <button type="submit" className="btn btn-sm btn-primary" disabled={!!state.busy || !state.editText.trim()}>
                                        Lưu
                                    </button>
                                    <button type="button" className="btn btn-sm btn-light" onClick={() => state.setEditing(null)}>
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <p className="fs-13 text-gray-800 m-0 mt-1" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                                {comment.content}
                            </p>
                        )}
                    </div>

                    <div className="d-flex align-items-center gap-3 fs-11 text-gray-500 mt-1 px-1">
                        <time dateTime={comment.createdAt}>
                            {date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                        </time>
                        {comment.updatedAt !== comment.createdAt && <span>Đã chỉnh sửa</span>}
                        {state.editing !== comment.id && (
                            <button
                                type="button"
                                className="btn btn-flush fs-11 text-primary fw-semibold p-0"
                                onClick={() => { state.setReplyingTo(comment.id); state.setReplyText(""); }}
                            >
                                Trả lời
                            </button>
                        )}
                        {comment.canEdit && state.editing !== comment.id && (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-flush fs-11 text-gray-600 p-0"
                                    disabled={!!state.busy}
                                    onClick={() => { state.setEditing(comment.id); state.setEditText(comment.content); }}
                                >
                                    Chỉnh sửa
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-flush fs-11 text-danger p-0"
                                    disabled={!!state.busy}
                                    onClick={() => state.removeComment(comment)}
                                >
                                    Xóa
                                </button>
                            </>
                        )}
                    </div>

                    {state.replyingTo === comment.id && (
                        <form className="mt-2" onSubmit={event => state.submitReply(event, comment)}>
                            <textarea
                                autoFocus
                                aria-label={`Trả lời ${comment.author.name}`}
                                placeholder={`Trả lời ${comment.author.name}...`}
                                className="form-control form-control-solid fs-13"
                                value={state.replyText}
                                onChange={event => state.setReplyText(event.target.value)}
                                maxLength={2000}
                                rows={2}
                                required
                                disabled={!!state.busy}
                            />
                            <div className="d-flex align-items-center justify-content-end gap-2 mt-2">
                                <button type="button" className="btn btn-sm btn-light" onClick={() => state.setReplyingTo(null)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn btn-sm btn-primary" disabled={!!state.busy || !state.replyText.trim()}>
                                    {state.busy === "reply" ? "Đang gửi..." : "Trả lời"}
                                </button>
                            </div>
                        </form>
                    )}

                    {!!comment.replies?.length && (
                        <div className="ps-3 border-start border-2 border-gray-200 mt-2">
                            {comment.replies.map(reply => (
                                <CommentItem key={reply.id} comment={reply} state={state} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function CommentsDialog({ post, state, onClose }: Props) {
    const media = post.media[0];
    return (
        <div
            className="modal-backdrop"
            role="presentation"
            onClick={event => { if (event.target === event.currentTarget) onClose(); }}
            onKeyDown={event => { if (event.key === "Escape") onClose(); }}
        >
            <section
                className="modal-dialog modal-lg d-flex flex-column"
                style={{ maxHeight: "90vh" }}
                role="dialog"
                aria-modal="true"
                aria-labelledby={`comments-title-${post.id}`}
            >
                <header className="modal-header">
                    <h4 id={`comments-title-${post.id}`} className="modal-title fs-16 fw-bold">
                        Bài viết của {post.author.name}
                    </h4>
                    <button
                        type="button"
                        className="btn btn-sm btn-icon btn-light"
                        aria-label="Đóng bình luận"
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="modal-body p-0 d-flex flex-column" style={{ overflowY: "auto" }}>
                    {media && (
                        <div className="bg-black text-center" style={{ maxHeight: "35vh", overflow: "hidden" }}>
                            {media.type.startsWith("video/") ? (
                                <video src={media.url} controls preload="metadata" className="w-100 object-contain" style={{ maxHeight: "35vh" }} />
                            ) : (
                                <img src={media.url} alt={media.name || "Ảnh trong bài viết"} className="w-100 object-contain" style={{ maxHeight: "35vh" }} />
                            )}
                        </div>
                    )}
                    {post.content && (
                        <p className="p-4 m-0 fs-14 text-gray-800 border-bottom" style={{ whiteSpace: "pre-wrap" }}>
                            {post.content}
                        </p>
                    )}
                    <div className="d-flex align-items-center justify-content-between px-4 py-2 bg-light border-bottom text-gray-500 fs-12">
                        <span>{post.likes} lượt thích</span>
                        <span>{post.comments} bình luận</span>
                    </div>

                    <div className="p-4 d-flex flex-column gap-2" aria-live="polite">
                        {state.error && (
                            <p className="card p-3 border-dashed border-danger text-danger fs-13 m-0" role="alert">
                                {state.error}
                            </p>
                        )}
                        {state.loading && <p className="text-gray-500 fs-13 text-center my-3" role="status">Đang tải bình luận...</p>}
                        {!state.loaded && !state.loading && (
                            <button type="button" className="btn btn-sm btn-light-primary align-self-center my-2" onClick={() => void state.loadComments()}>
                                Thử tải lại bình luận
                            </button>
                        )}
                        {state.loaded && !state.comments.length && (
                            <p className="text-gray-500 fs-13 text-center my-4">Chưa có bình luận. Hãy là người đầu tiên bình luận.</p>
                        )}
                        {state.comments.map(comment => (
                            <CommentItem key={comment.id} comment={comment} state={state} />
                        ))}
                        {state.nextCursor && (
                            <button
                                type="button"
                                className="btn btn-flush fs-13 text-primary fw-semibold my-2"
                                disabled={state.loading || !!state.busy}
                                onClick={() => void state.loadComments(true)}
                            >
                                Xem thêm bình luận
                            </button>
                        )}
                    </div>
                </div>

                <form className="modal-footer d-flex flex-column align-items-stretch p-3 bg-light border-top" onSubmit={state.submitComment}>
                    <textarea
                        aria-label="Viết bình luận"
                        placeholder="Viết bình luận..."
                        className="form-control form-control-solid fs-13"
                        value={state.text}
                        onChange={event => state.setText(event.target.value)}
                        maxLength={2000}
                        rows={2}
                        required
                        disabled={!!state.busy}
                    />
                    <div className="d-flex align-items-center justify-content-between mt-2">
                        <small className="text-gray-400 fs-11">{state.text.length}/2000</small>
                        <button
                            type="submit"
                            className="btn btn-sm btn-primary"
                            disabled={!!state.busy || !state.text.trim() || state.loading}
                        >
                            {state.busy === "comment" ? "Đang gửi..." : "Gửi bình luận"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
