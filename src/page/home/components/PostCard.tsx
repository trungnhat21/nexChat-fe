import { useState } from "react";
import { DesignIcon } from "./DesignAsset";
import UserAvatar from "./UserAvatar";
import Composer from "./Composer";
import { privacyLabels } from "../config";
import { usePostActions } from "../actions";
import type { PostCardProps, PostMedia } from "../../../component/type/post";

function Media({ media, onReload }: { media: PostMedia; onReload: () => void }) {
    const [failed, setFailed] = useState(false);
    if (failed) return <div className="home-media-error"><p>Không tải được {media.name}. Liên kết có thể đã hết hạn.</p><button onClick={onReload}>Tải lại bảng tin</button></div>;
    return media.type.startsWith("video/") ? <video src={media.url} controls preload="metadata" onError={() => setFailed(true)} aria-label={media.name} /> : <a href={media.url} target="_blank" rel="noreferrer"><img src={media.url} alt={media.name} loading="lazy" onError={() => setFailed(true)} /></a>;
}
export default function PostCard(props: PostCardProps) {
    const { post, onReload } = props;
    const { editing, setEditing, deleting, error, saveEdit, remove, share, openPanel } = usePostActions(props);
    const createdAt = new Date(post.createdAt);
    if (editing) return <article className="home-card home-post-editor"><h2>Chỉnh sửa bài viết</h2><Composer post={post} onPost={saveEdit} onCancel={() => setEditing(false)} /></article>;
    return <article className="home-card home-post" id={post.id}>
        <header className="home-post-header">
            <UserAvatar name={post.author.name} src={post.author.avatar} size={44} />
            <div className="home-post-author"><div><strong>{post.author.name}</strong></div><small><time dateTime={post.createdAt}>{createdAt.toLocaleString("vi-VN", { dateStyle: "medium", timeStyle: "short" })}</time> · {privacyLabels[post.privacy]}{post.updatedAt !== post.createdAt && " · Đã chỉnh sửa"}</small></div>
            {post.canEdit && <details className="home-post-menu"><summary className="home-icon-button" aria-label={`Tùy chọn bài viết của ${post.author.name}`}><DesignIcon id="3352:673" /></summary><div><button onClick={() => setEditing(true)} disabled={deleting}>Chỉnh sửa bài viết</button><button className="home-delete-post" onClick={remove} disabled={deleting}>{deleting ? "Đang xóa..." : "Xóa bài viết"}</button></div></details>}
        </header>
        {post.content && <div className="home-post-content"><p>{post.content}</p></div>}
        {!!post.media.length && <div className={`home-post-media ${post.media.length === 1 ? "has-one" : ""}`}>{post.media.map(media => <Media key={media.id + media.url} media={media} onReload={onReload} />)}</div>}
        <div className="home-post-stats"><span>{post.likes} lượt thích</span><span>{post.comments} bình luận</span></div>
        <div className="home-post-actions">
            <button onClick={() => openPanel("Thích bài viết")}><DesignIcon id="3352:710" />Thích</button>
            <button onClick={() => openPanel("Bình luận")}><DesignIcon id="3352:715" />Bình luận</button>
            <button onClick={share}><DesignIcon id="3352:720" />Chia sẻ</button>
            <button onClick={() => openPanel("Lưu bài viết")}><DesignIcon id="3352:725" />Lưu</button>
        </div>
        {error && <p className="home-feed-error" role="alert">{error}</p>}
    </article>;
}
