import PostInteractions from "../../../component/common/post-interactions";
import OriginalPost from "../../../component/common/post-interactions/OriginalPost";
import { useState } from "react";
import { Link } from "react-router";
import { DesignIcon } from "./DesignAsset";
import UserAvatar from "./UserAvatar";
import Composer from "./Composer";
import { privacyLabels } from "../config";
import { useHome, usePostActions } from "../actions";
import type { PostCardProps, PostMedia } from "../../../component/type/post";

function Media({ media, onReload }: { media: PostMedia; onReload: () => void }) {
    const [failed, setFailed] = useState(false);
    if (failed) return <div className="home-media-error"><p>Không tải được {media.name}. Liên kết có thể đã hết hạn.</p><button onClick={onReload}>Tải lại bảng tin</button></div>;
    return media.type.startsWith("video/") ? <video src={media.url} controls preload="metadata" onError={() => setFailed(true)} aria-label={media.name} /> : <a href={media.url} target="_blank" rel="noreferrer"><img src={media.url} alt={media.name} loading="lazy" onError={() => setFailed(true)} /></a>;
}
export default function PostCard(props: PostCardProps) {
    const { post, onReload, onStateChange } = props;
    const { announce } = useHome();
    const { liking, toggleLike, editing, setEditing, deleting, error, saveEdit, remove } = usePostActions(props);
    const createdAt = new Date(post.createdAt);
    if (editing) return <article className="home-card home-post-editor"><h2>Chỉnh sửa bài viết</h2><Composer post={post} onPost={saveEdit} onCancel={() => setEditing(false)} /></article>;
    return <article className="home-card home-post" id={post.id}>
        <header className="home-post-header">
            <Link className="home-post-profile-link" to={`/profile/${post.author.id}`} aria-label={`Xem trang cá nhân của ${post.author.name}`}><UserAvatar name={post.author.name} src={post.author.avatar} size={44} /></Link>
            <div className="home-post-author"><div><Link className="home-post-profile-link" to={`/profile/${post.author.id}`}><strong>{post.author.name}</strong></Link></div><small><time dateTime={post.createdAt}>{createdAt.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}</time> · {privacyLabels[post.privacy]}{post.updatedAt !== post.createdAt && " · Đã chỉnh sửa"}</small></div>
            {post.canEdit && <details className="home-post-menu"><summary className="home-icon-button" aria-label={`Tùy chọn bài viết của ${post.author.name}`}><DesignIcon id="3352:673" /></summary><div><button onClick={() => setEditing(true)} disabled={deleting}>Chỉnh sửa bài viết</button><button className="home-delete-post" onClick={remove} disabled={deleting}>{deleting ? "Đang xóa..." : "Xóa bài viết"}</button></div></details>}
        </header>
        {post.content && <div className="home-post-content"><p>{post.content}</p></div>}
        {!!post.media.length && <div className={`home-post-media ${post.media.length === 1 ? "has-one" : ""}`}>{post.media.map(media => <Media key={media.id + media.url} media={media} onReload={onReload} />)}</div>}
        <OriginalPost post={post} />
        <div className="home-post-stats"><span>{post.likes} lượt thích</span><span>{post.comments} bình luận</span></div>
        <PostInteractions post={post} variant="home" onStateChange={onStateChange} onNotice={announce} onReposted={onReload}>
            <button className={post.liked ? "is-liked" : undefined} aria-pressed={post.liked} aria-busy={liking} disabled={liking} onClick={toggleLike}><DesignIcon id="3352:710" />{post.liked ? "Đã thích" : "Thích"}</button>
        </PostInteractions>
        {error && <p className="home-feed-error" role="alert">{error}</p>}
    </article>;
}
