import { ProfileIcon, ProfileImage } from "./ProfileAsset";
import ProfilePoll from "./ProfilePoll";
import { useProfilePostActions } from "../actions";
import type { ProfilePostProps } from "../../../component/type/profile";

export default function ProfilePostCard(props: ProfilePostProps) {
    const { post, details, avatarSrc, onOpen, onNotice } = props;
    const { liked, commentsOpen, comments, comment, setComment, commentInputRef, toggleLike, openComments, submitComment, sharePost } = useProfilePostActions(props);
    return <article className={`profile-post profile-post-${post.kind}`} id={post.id}>
        {post.kind === "pinned" && <div className="profile-pinned"><ProfileIcon id="3360:608" />Bài viết đã ghim</div>}
        <header className="profile-post-header">
            <ProfileImage id={post.assets.avatar} src={avatarSrc} className="profile-post-avatar" alt={details.name} />
            <div><strong className="profile-post-name">{details.name}<ProfileIcon id={post.assets.verified} /></strong><span className="profile-post-time">{post.time}<span>•</span><ProfileIcon id={post.assets.globe} /></span></div>
            <button className="profile-icon-button profile-post-more" aria-label="Tùy chọn bài viết" onClick={() => onOpen({ kind: "post", title: "Tùy chọn bài viết", postId: post.id })}><ProfileIcon id={post.assets.more} /></button>
        </header>
        <p className="profile-post-content">{post.content}</p>
        {post.tags && <div className="profile-post-tags">{post.tags.map(tag => <button key={tag} onClick={() => onOpen({ kind: "notice", title: tag })}>{tag}</button>)}</div>}
        {post.kind === "pinned" && <button className="profile-link-card" onClick={() => onOpen({ kind: "notice", title: "VN-Tech Labs Ecosystem 2025" })}><span className="profile-link-icon"><ProfileIcon id="3360:646" /></span><span><strong>VN-Tech Labs Ecosystem 2025</strong><span>Cộng đồng nghiên cứu và phát triển sản phẩm công nghệ cao</span></span><ProfileIcon id="3360:653" /></button>}
        {post.kind === "poll" && <ProfilePoll onNotice={onNotice} onDiscuss={openComments} />}
        {post.kind === "image" && <button className="profile-showcase-button" aria-label="Xem ảnh Pulse Mobile Workspace" onClick={() => onOpen({ kind: "image", title: "Pulse Mobile Workspace", image: "3360:806" })}><ProfileImage id="3360:806" className="profile-showcase" alt="Giao diện Pulse Mobile Workspace phiên bản 2.0" /></button>}
        <div className="profile-post-metrics"><button onClick={() => onOpen({ kind: "notice", title: "Người thích bài viết" })}><span className="profile-reactions"><span><ProfileIcon id={post.assets.reaction} /></span>{post.assets.heart && <span><ProfileIcon id={post.assets.heart} /></span>}</span>{post.likes + Number(liked)}</button><span><button onClick={openComments}>{post.comments + comments.length} bình luận</button><button onClick={sharePost}>{post.shares} chia sẻ</button></span></div>
        <div className="profile-post-actions"><button className={liked ? "is-liked" : ""} aria-pressed={liked} onClick={toggleLike}><ProfileIcon id={post.assets.like} />{liked ? "Đã thích" : "Thích"}</button><button aria-expanded={commentsOpen} onClick={openComments}><ProfileIcon id={post.assets.comment} />Bình luận</button><button onClick={sharePost}><ProfileIcon id={post.assets.share} />Chia sẻ</button></div>
        {commentsOpen && <section className="profile-comments" aria-label="Bình luận"><form onSubmit={submitComment}><input ref={commentInputRef} aria-label="Viết bình luận" value={comment} onChange={event => setComment(event.target.value)} placeholder="Viết bình luận..." maxLength={2000} /><button type="submit">Gửi</button></form>{comments.map(item => <div className="profile-comment" key={item.id}><strong>{details.name}</strong><p>{item.text}</p></div>)}<small>Bình luận trong bản xem thử chưa lưu lên máy chủ.</small></section>}
    </article>;
}
