import PostInteractions from "../../../component/common/post-interactions";
import OriginalPost from "../../../component/common/post-interactions/OriginalPost";
import { ProfileIcon } from "./ProfileAsset";
import ProfileUserAvatar from "./ProfileUserAvatar";
import { useProfilePostActions } from "../actions";
import { profilePostIcons, profilePrivacyLabels } from "../config";
import type { ProfilePostProps } from "../../../component/type/profile";

export default function ProfilePostCard(props: ProfilePostProps) {
    const { post, onOpen, onStateChange, onNotice } = props;
    const { liking, toggleLike, likeError } = useProfilePostActions(props);
    return <article className="profile-post profile-live-post" id={post.id}>
        <header className="profile-post-header">
            <ProfileUserAvatar src={post.author.avatar} className="profile-post-avatar" name={post.author.name} />
            <div><strong className="profile-post-name">{post.author.name}</strong><span className="profile-post-time"><time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}</time><span>•</span>{profilePrivacyLabels[post.privacy]}</span></div>
            <button className="profile-icon-button profile-post-more" aria-label="Tùy chọn bài viết" onClick={() => onOpen({ kind: "post", title: "Tùy chọn bài viết", postId: post.id })}><ProfileIcon id={profilePostIcons.more} /></button>
        </header>
        {post.content && <p className="profile-post-content">{post.content}</p>}
        {!!post.media.length && <div className="profile-live-media">{post.media.map(media => media.type.startsWith("video/") ? <video key={media.id} src={media.url} controls preload="metadata" aria-label={media.name} /> : <button key={media.id} aria-label={`Xem ${media.name}`} onClick={() => onOpen({ kind: "image", title: media.name, media })}><img src={media.url} alt={media.name} loading="lazy" /></button>)}</div>}
        <OriginalPost post={post} />
        <div className="profile-post-metrics"><span>{post.likes} lượt thích</span><span>{post.comments} bình luận</span></div>
        <PostInteractions post={post} variant="profile" onStateChange={onStateChange} onNotice={onNotice}><button className={post.liked ? "is-liked" : undefined} aria-pressed={post.liked} aria-busy={liking} disabled={liking} onClick={toggleLike}><ProfileIcon id={profilePostIcons.like} />{post.liked ? "Đã thích" : "Thích"}</button></PostInteractions>
        {likeError && <p role="alert">{likeError}</p>}
    </article>;
}
