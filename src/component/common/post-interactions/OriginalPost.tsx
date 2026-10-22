import { Link } from "react-router";
import type { FeedPost } from "../../type/post";
import "./style.scss";

export default function OriginalPost({ post }: { post: FeedPost }) {
    if (!post.isRepost) return null;
    const original = post.original;
    return <section className="post-original" aria-label="Bài viết gốc">
        {!original ? <p>Bài gốc không còn khả dụng hoặc bạn không có quyền xem.</p> : <>
            <header><Link to={"/profile/" + original.author.id}><strong>{original.author.name}</strong></Link><Link to={"/posts/" + original.id}><time dateTime={original.createdAt}>{new Date(original.createdAt).toLocaleString("vi-VN")}</time></Link></header>
            {original.content && <p>{original.content}</p>}
            <div className="post-original-media">{original.media.map(media => media.type.startsWith("video/") ? <video key={media.id} src={media.url} controls preload="metadata" aria-label={media.name} /> : <a key={media.id} href={media.url} target="_blank" rel="noreferrer"><img src={media.url} alt={media.name} loading="lazy" /></a>)}</div>
            <Link to={"/posts/" + original.id}>Xem bài viết gốc</Link>
        </>}
    </section>;
}
