import { Link } from "react-router";
import type { FeedPost } from "../../type/post";

export default function OriginalPost({ post }: { post: FeedPost }) {
    if (!post.isRepost) return null;
    const original = post.original;

    return (
        <section className="card p-4 my-3 border bg-light rounded-lg" aria-label="Bài viết gốc">
            {!original ? (
                <p className="text-gray-500 fs-13 m-0">Bài gốc không còn khả dụng hoặc bạn không có quyền xem.</p>
            ) : (
                <>
                    <header className="d-flex align-items-center gap-2 flex-wrap mb-2">
                        <Link to={"/profile/" + original.author.id} className="text-gray-900 fw-bold fs-14 text-decoration-none">
                            {original.author.name}
                        </Link>
                        <span className="text-gray-400">·</span>
                        <Link to={"/posts/" + original.id} className="text-gray-500 fs-12 text-decoration-none">
                            <time dateTime={original.createdAt}>
                                {new Date(original.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                            </time>
                        </Link>
                    </header>
                    {original.content && <p className="fs-14 text-gray-800 mb-3" style={{ whiteSpace: "pre-wrap" }}>{original.content}</p>}
                    <div className="d-grid gap-2 mb-2">
                        {original.media.map(media =>
                            media.type.startsWith("video/") ? (
                                <video key={media.id} src={media.url} controls preload="metadata" className="w-100 rounded-lg max-h-96 object-contain bg-black" aria-label={media.name} />
                            ) : (
                                <a key={media.id} href={media.url} target="_blank" rel="noreferrer">
                                    <img src={media.url} alt={media.name} loading="lazy" className="w-100 rounded-lg max-h-96 object-contain" />
                                </a>
                            )
                        )}
                    </div>
                    <Link to={"/posts/" + original.id} className="btn btn-sm btn-flush text-primary fw-semibold p-0">
                        Xem bài viết gốc →
                    </Link>
                </>
            )}
        </section>
    );
}
