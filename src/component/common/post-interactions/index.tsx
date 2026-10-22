import { Link } from "react-router";
import { Bookmark, MessageCircle, Share2 } from "lucide-react";
import { usePostInteractions } from "./actions";
import { commentLimit, postPrivacyOptions, repostLimit } from "./config";
import type { PostInteractionsProps } from "../../type/post";
import "./style.scss";

export default function PostInteractions(props: PostInteractionsProps) {
    const { post, variant, children } = props;
    const a = usePostInteractions(props);
    return <div className="post-interactions">
        <div className={variant + "-post-actions"}>
            {children}
            <button aria-expanded={a.commentsOpen} onClick={a.toggleComments}><MessageCircle size={16} />Bình luận ({post.comments})</button>
            <button aria-expanded={a.shareOpen} onClick={() => a.setShareOpen(previous => !previous)}><Share2 size={16} />Chia sẻ</button>
            <button aria-pressed={post.saved} className={post.saved ? "is-saved" : undefined} disabled={!!a.busy} onClick={a.toggleSaved}><Bookmark size={16} />{post.saved ? "Đã lưu" : "Lưu"}</button>
        </div>
        {a.error && <p className="post-interaction-error" role="alert">{a.error}</p>}
        {a.shareOpen && <section className="post-share-panel" aria-label="Chia sẻ bài viết">
            <h3>Chia sẻ liên kết</h3><div className="post-inline-actions"><button onClick={a.copyLink}>{a.copied ? "Đã sao chép" : "Sao chép liên kết"}</button><Link to={"/posts/" + post.id}>Mở bài viết</Link></div>
            <form onSubmit={a.submitRepost}><h3>Đăng lại trên nexChat</h3><p>Bài mới tham chiếu bài gốc. Nội dung gốc chỉ hiển thị với người có quyền xem.</p>
                <textarea aria-label="Nội dung đăng lại" placeholder="Thêm lời chia sẻ..." value={a.repostText} maxLength={repostLimit} onChange={event => a.setRepostText(event.target.value)} rows={2} disabled={!!a.busy} />
                <div className="post-inline-actions"><label>Ai có thể xem? <select aria-label="Quyền riêng tư bài đăng lại" value={a.privacy} onChange={event => a.setPrivacy(event.target.value as typeof a.privacy)} disabled={!!a.busy}>{postPrivacyOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><button type="submit" disabled={!!a.busy}>{a.busy === "repost" ? "Đang đăng..." : "Đăng lại"}</button></div>
            </form>{a.repostedId && <Link to={"/posts/" + a.repostedId}>Xem bài vừa đăng lại</Link>}
        </section>}
        {a.commentsOpen && <section className="post-comments" aria-label="Bình luận bài viết">
            <form onSubmit={a.submitComment}><label htmlFor={variant + "-comment-" + post.id}>Viết bình luận</label><textarea id={variant + "-comment-" + post.id} value={a.text} onChange={event => a.setText(event.target.value)} maxLength={commentLimit} rows={2} required disabled={!!a.busy} /><div className="post-inline-actions"><small>{a.text.length}/{commentLimit}</small><button type="submit" disabled={!!a.busy || !a.text.trim() || a.loading}>{a.busy === "comment" ? "Đang gửi..." : "Gửi bình luận"}</button></div></form>
            {a.loading && <p role="status">Đang tải bình luận...</p>}
            {!a.loaded && !a.loading && <button onClick={() => a.loadComments()}>Thử tải lại bình luận</button>}
            {a.loaded && !a.comments.length && <p>Chưa có bình luận. Hãy là người đầu tiên bình luận.</p>}
            {a.comments.map(comment => <article className="post-comment" key={comment.id}>
                <header>{comment.author.avatar && <img src={comment.author.avatar} alt="" loading="lazy" />}<Link to={"/profile/" + comment.author.id}><strong>{comment.author.name}</strong></Link><time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}</time>{comment.updatedAt !== comment.createdAt && <small>Đã chỉnh sửa</small>}</header>
                {a.editing === comment.id ? <form onSubmit={a.saveEdit}><textarea aria-label="Chỉnh sửa bình luận" value={a.editText} onChange={event => a.setEditText(event.target.value)} maxLength={commentLimit} rows={2} required disabled={!!a.busy} /><div className="post-inline-actions"><button type="submit" disabled={!!a.busy || !a.editText.trim()}>Lưu bình luận</button><button type="button" disabled={!!a.busy} onClick={() => a.setEditing(null)}>Hủy</button></div></form> : <p>{comment.content}</p>}
                {comment.canEdit && <div className="post-inline-actions"><button disabled={!!a.busy} onClick={() => { a.setEditing(comment.id); a.setEditText(comment.content); }}>Chỉnh sửa</button><button disabled={!!a.busy} onClick={() => a.removeComment(comment)}>Xóa</button></div>}
            </article>)}
            {a.nextCursor && <button disabled={a.loading || !!a.busy} onClick={() => a.loadComments(true)}>Xem thêm bình luận</button>}
        </section>}
    </div>;
}
