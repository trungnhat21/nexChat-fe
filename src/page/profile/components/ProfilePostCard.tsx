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
    return <article className="profile-post profile-live-post card border-0 shadow-sm p-4 mb-4" id={post.id}>
        <header className="profile-post-header d-flex align-items-center gap-3 mb-3">
            <ProfileUserAvatar src={post.author.avatar} className="profile-post-avatar rounded-circle flex-shrink-0" name={post.author.name} />
            <div className="d-flex flex-column">
                <strong className="profile-post-name fs-6 fw-bold text-gray-900">{post.author.name}</strong>
                <span className="profile-post-time fs-8 text-muted d-flex align-items-center gap-1">
                    <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}</time>
                    <span>•</span>
                    {profilePrivacyLabels[post.privacy]}
                </span>
            </div>
            <button type="button" className="btn btn-icon btn-sm btn-light-primary profile-icon-button profile-post-more ms-auto rounded-circle" aria-label="Tùy chọn bài viết" onClick={() => onOpen({ kind: "post", title: "Tùy chọn bài viết", postId: post.id })}>
                <ProfileIcon id={profilePostIcons.more} />
            </button>
        </header>
        {post.content && <p className="profile-post-content fs-7 text-gray-800 mb-3">{post.content}</p>}
        {!!post.media.length && (
            <div className="profile-live-media mb-3">
                {post.media.map(media => media.type.startsWith("video/") ? (
                    <video key={media.id} src={media.url} controls preload="metadata" aria-label={media.name} className="rounded-3 w-100" />
                ) : (
                    <button key={media.id} type="button" className="btn btn-flush p-0 overflow-hidden rounded-3 border-0" aria-label={`Xem ${media.name}`} onClick={() => onOpen({ kind: "image", title: media.name, media })}>
                        <img src={media.url} alt={media.name} loading="lazy" className="w-100 rounded-3" />
                    </button>
                ))}
            </div>
        )}
        <OriginalPost post={post} />
        <div className="profile-post-metrics d-flex align-items-center justify-content-between fs-8 text-muted mt-3 pt-2 border-top">
            <span>{post.likes} lượt thích</span>
            <span>{post.comments} bình luận</span>
        </div>
        <PostInteractions post={post} variant="profile" onStateChange={onStateChange} onNotice={onNotice}>
            <button type="button" className={post.liked ? "is-liked" : undefined} aria-pressed={post.liked} aria-busy={liking} disabled={liking} onClick={toggleLike}>
                <ProfileIcon id={profilePostIcons.like} />{post.liked ? "Đã thích" : "Thích"}
            </button>
        </PostInteractions>
        {likeError && <p role="alert" className="text-danger fs-8 mt-2">{likeError}</p>}
    </article>;
}
