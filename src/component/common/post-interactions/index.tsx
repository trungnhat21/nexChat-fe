import { Link } from "react-router";
import { Bookmark, MessageCircle, Share2 } from "lucide-react";
import { usePostInteractions } from "./actions";
import { postPrivacyOptions, repostLimit } from "./config";
import CommentsDialog from "./CommentsDialog";
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
        {a.commentsOpen && <CommentsDialog post={post} state={a} onClose={() => a.setCommentsOpen(false)} />}
    </div>;
}
