import { Link } from "react-router";
import { X } from "lucide-react";
import type { FeedPost, PostComment } from "../../type/post";
import type { usePostInteractions } from "./actions";

type InteractionState = ReturnType<typeof usePostInteractions>;
type Props = { post: FeedPost; state: InteractionState; onClose: () => void };

function CommentItem({ comment, state }: { comment: PostComment; state: InteractionState }) {
    const date = new Date(comment.createdAt);
    return <article className="post-comment" key={comment.id}>
        <div className="post-comment-row">
            <Link className="post-comment-avatar" to={`/profile/${comment.author.id}`} aria-label={`Trang cá nhân ${comment.author.name}`}>
                {comment.author.avatar ? <img src={comment.author.avatar} alt="" /> : <span>{comment.author.name.slice(0, 1).toUpperCase()}</span>}
            </Link>
            <div className="post-comment-body">
                <div className="post-comment-bubble"><Link to={`/profile/${comment.author.id}`}><strong>{comment.author.name}</strong></Link>
                    {state.editing === comment.id ? <form onSubmit={state.saveEdit}><textarea aria-label="Chỉnh sửa bình luận" value={state.editText} onChange={event => state.setEditText(event.target.value)} maxLength={2000} required /><div className="post-comment-actions"><button type="submit" disabled={!!state.busy || !state.editText.trim()}>Lưu</button><button type="button" onClick={() => state.setEditing(null)}>Hủy</button></div></form> : <p>{comment.content}</p>}
                </div>
                <div className="post-comment-actions"><time dateTime={comment.createdAt}>{date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</time>
                    {comment.updatedAt !== comment.createdAt && <span>Đã chỉnh sửa</span>}
                    {state.editing !== comment.id && <button type="button" onClick={() => { state.setReplyingTo(comment.id); state.setReplyText(""); }}>Trả lời</button>}
                    {comment.canEdit && state.editing !== comment.id && <><button type="button" disabled={!!state.busy} onClick={() => { state.setEditing(comment.id); state.setEditText(comment.content); }}>Chỉnh sửa</button><button type="button" disabled={!!state.busy} onClick={() => state.removeComment(comment)}>Xóa</button></>}
                </div>
                {state.replyingTo === comment.id && <form className="post-reply-form" onSubmit={event => state.submitReply(event, comment)}><textarea autoFocus aria-label={`Trả lời ${comment.author.name}`} placeholder={`Trả lời ${comment.author.name}...`} value={state.replyText} onChange={event => state.setReplyText(event.target.value)} maxLength={2000} rows={2} required disabled={!!state.busy} /><div className="post-comment-actions"><button type="button" onClick={() => state.setReplyingTo(null)}>Hủy</button><button type="submit" disabled={!!state.busy || !state.replyText.trim()}>{state.busy === "reply" ? "Đang gửi..." : "Trả lời"}</button></div></form>}
                {!!comment.replies?.length && <div className="post-comment-replies">{comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} state={state} />)}</div>}
            </div>
        </div>
    </article>;
}

export default function CommentsDialog({ post, state, onClose }: Props) {
    const media = post.media[0];
    return <div className="post-comments-backdrop" role="presentation" onClick={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => { if (event.key === "Escape") onClose(); }}>
        <section className="post-comments-dialog" role="dialog" aria-modal="true" aria-labelledby={`comments-title-${post.id}`}>
            <header className="post-comments-header"><h2 id={`comments-title-${post.id}`}>Bài viết của {post.author.name}</h2><button type="button" aria-label="Đóng bình luận" onClick={onClose}><X size={22} /></button></header>
            {media && <div className="post-comments-media">{media.type.startsWith("video/") ? <video src={media.url} controls preload="metadata" /> : <img src={media.url} alt={media.name || "Ảnh trong bài viết"} />}</div>}
            {post.content && <p className="post-comments-post-content">{post.content}</p>}
            <div className="post-comments-summary"><span>{post.likes} lượt thích</span><span>{post.comments} bình luận</span></div>
            <div className="post-comments-list" aria-live="polite">
                {state.error && <p className="post-interaction-error" role="alert">{state.error}</p>}
                {state.loading && <p role="status">Đang tải bình luận...</p>}
                {!state.loaded && !state.loading && <button type="button" onClick={() => void state.loadComments()}>Thử tải lại bình luận</button>}
                {state.loaded && !state.comments.length && <p>Chưa có bình luận. Hãy là người đầu tiên bình luận.</p>}
                {state.comments.map(comment => <CommentItem key={comment.id} comment={comment} state={state} />)}
                {state.nextCursor && <button type="button" className="post-comments-more" disabled={state.loading || !!state.busy} onClick={() => void state.loadComments(true)}>Xem thêm bình luận</button>}
            </div>
            <form className="post-comments-composer" onSubmit={state.submitComment}>
                <textarea aria-label="Viết bình luận" placeholder="Viết bình luận..." value={state.text} onChange={event => state.setText(event.target.value)} maxLength={2000} rows={2} required disabled={!!state.busy} />
                <div className="post-comment-actions"><small>{state.text.length}/2000</small><button type="submit" disabled={!!state.busy || !state.text.trim() || state.loading}>{state.busy === "comment" ? "Đang gửi..." : "Gửi bình luận"}</button></div>
            </form>
        </section>
    </div>;
}
