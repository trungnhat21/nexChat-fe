import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Clapperboard, Heart, MoreHorizontal, Play, Radio, Upload } from "lucide-react";
import { Link } from "react-router";
import { createPost, deletePost, listPosts, setPostLike, updatePost as updatePostApi } from "../../../axios/posts";
import type { FeedPost, PostDraft, PostPrivacy } from "../../../component/type/post";
import PostInteractions from "../../../component/common/post-interactions";
import Composer from "./Composer";
import { confirmDelete } from "../../../utils/swal";
import { HomeContext } from "../config";

const VIDEO_MAX_BYTES = 25 * 1024 * 1024;
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"]);

type VideoEntry = { post: FeedPost; media: FeedPost["media"][number] };

function displayDate(value: string) {
    return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

function displayName(post: FeedPost) {
    return post.author.name || post.author.handle || "Người dùng NexChat";
}

function VideoCard({ post, media, canManage, updatePost, removePost, replacePost, announce }: {
    post: FeedPost;
    media: FeedPost["media"][number];
    canManage: boolean;
    updatePost: (postId: string, patch: Partial<Pick<FeedPost, "liked" | "likes" | "saved" | "comments">>) => void;
    removePost: (postId: string) => void;
    replacePost: (post: FeedPost) => void;
    announce: (message: string) => void;
}) {
    const [playing, setPlaying] = useState(false);
    const [likeBusy, setLikeBusy] = useState(false);
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const player = useRef<HTMLVideoElement>(null);
    const menuRef = useRef<HTMLDetailsElement>(null);
    const tags = post.content.match(/#[\p{L}\p{N}_]+/gu) ?? [];
    const caption = post.content.replace(/#[\p{L}\p{N}_]+/gu, "").trim();

    async function toggleLike() {
        if (likeBusy) return;
        setLikeBusy(true);
        try {
            const result = await setPostLike(post.id, !post.liked);
            updatePost(post.id, { liked: result.liked, likes: result.likes });
        } catch {
            announce("Không cập nhật được lượt thích. Hãy thử lại.");
        } finally {
            setLikeBusy(false);
        }
    }

    function togglePlayback() {
        const video = player.current;
        if (!video) return;
        if (video.paused) void video.play().then(() => setPlaying(true)).catch(() => announce("Không phát được video này."));
        else { video.pause(); setPlaying(false); }
    }

    async function saveEdit(draft: PostDraft, onProgress: (percent: number) => void) {
        const updated = await updatePostApi(post.id, draft, onProgress);
        replacePost(updated);
        setEditing(false);
        announce("Đã cập nhật video.");
    }

    async function removeVideoPost() {
        menuRef.current?.removeAttribute("open");
        if (!(await confirmDelete("Xóa video này?"))) return;
        setDeleting(true);
        try {
            await deletePost(post.id);
            removePost(post.id);
            announce("Đã xóa video.");
        } catch {
            announce("Không xóa được video. Hãy thử lại.");
        } finally { setDeleting(false); }
    }

    if (editing) return <article className="home-video-card card border-0 shadow-sm">
        <h2 className="fs-6 fw-bold text-gray-800 mb-3">Chỉnh sửa video</h2>
        <Composer post={post} onPost={saveEdit} onCancel={() => setEditing(false)} />
    </article>;

    return <article className="home-video-card card border-0 shadow-sm">
        <header className="home-video-author">
            <Link className="home-video-avatar" to={`/profile/${post.author.id}`} aria-label={`Trang cá nhân ${displayName(post)}`}>
                {post.author.avatar ? <img src={post.author.avatar} alt="" /> : <span>{displayName(post).slice(0, 1).toUpperCase()}</span>}
            </Link>
            <div className="home-video-author-copy">
                <Link to={`/profile/${post.author.id}`} className="home-video-author-name">{displayName(post)}</Link>
                <div><time dateTime={post.createdAt}>{displayDate(post.createdAt)}</time><span aria-hidden="true"> · </span><span>{post.privacy === "public" ? "Công khai" : post.privacy === "friends" ? "Bạn bè" : "Chỉ mình tôi"}</span></div>
            </div>
            {canManage && <details className="home-video-menu" ref={menuRef}>
                <summary className="home-video-more" aria-label="Tùy chọn video" aria-disabled={deleting}><MoreHorizontal size={18} /></summary>
                <div className="home-video-menu-items">
                    <button type="button" onClick={() => { menuRef.current?.removeAttribute("open"); setEditing(true); }} disabled={deleting}>Chỉnh sửa video</button>
                    <button type="button" className="is-danger" onClick={() => void removeVideoPost()} disabled={deleting}>{deleting ? "Đang xóa…" : "Xóa video"}</button>
                </div>
            </details>}
        </header>
        {tags.length > 0 && <div className="home-video-tags">{tags.map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}</div>}
        {caption && <p className="home-video-caption">{caption}</p>}
        <div className="home-video-player">
            <video ref={player} src={media.url} poster={post.media.find(item => item.type.startsWith("image/"))?.url} controls playsInline preload="metadata" aria-label={`Video của ${displayName(post)}`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
            {!playing && <button type="button" className="home-video-play" onClick={togglePlayback} aria-label="Phát video"><Play fill="currentColor" size={25} /></button>}
            <span className="home-video-quality">Video</span>
            <button type="button" className="home-video-player-toggle" onClick={togglePlayback} aria-label={playing ? "Tạm dừng video" : "Phát video"}>{playing ? "Tạm dừng" : "Phát"}</button>
        </div>
        <PostInteractions post={post} variant="home" onStateChange={updatePost} onNotice={announce}>
            <button type="button" className={`btn btn-flush fs-13 d-flex align-items-center justify-content-center gap-1.5 py-2 ${post.liked ? "text-danger fw-bold" : "text-gray-700"}`} aria-pressed={post.liked} disabled={likeBusy} onClick={() => void toggleLike()}>
                <Heart size={16} fill={post.liked ? "currentColor" : "none"} /><span>{post.liked ? "Đã thích" : "Thích"}</span>
            </button>
        </PostInteractions>
    </article>;
}

export default function VideoCenter() {
    const { user, announce } = useContext(HomeContext);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [sort, setSort] = useState<"random" | "popular" | "latest">("random");
    const [feedSession, setFeedSession] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    const [privacy, setPrivacy] = useState<PostPrivacy>("public");
    const fileInput = useRef<HTMLInputElement>(null);
    const loadMoreSentinel = useRef<HTMLDivElement>(null);
    const previewUrl = useMemo(() => videoFile ? URL.createObjectURL(videoFile) : "", [videoFile]);

    const loadPosts = useCallback(async (next?: string) => {
        const result = await listPosts({
            sort: "latest",
            mediaOnly: true,
            postType: "video",
            randomize: true,
            ...(next ? { cursor: next, ...(feedSession ? { feedSession } : {}) } : {}),
        });
        setPosts(current => next ? [...current, ...result.posts.filter(post => !current.some(existing => existing.id === post.id))] : result.posts);
        setCursor(result.nextCursor);
        setFeedSession(result.feedSession ?? null);
    }, [feedSession]);

    useEffect(() => {
        let active = true;
        void listPosts({ sort: "latest", mediaOnly: true, postType: "video", randomize: true }).then(result => {
            if (active) { setPosts(result.posts); setCursor(result.nextCursor); setFeedSession(result.feedSession ?? null); }
        }).catch(() => { if (active) setError("Không tải được video. Hãy thử lại."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

    const entries = useMemo<VideoEntry[]>(() => {
        const result = posts.flatMap(post => post.media.filter(media => media.type.startsWith("video/")).map(media => ({ post, media })));
        if (sort === "popular") return result.sort((a, b) => (b.post.likes + b.post.comments) - (a.post.likes + a.post.comments));
        if (sort === "latest") return result.sort((a, b) => Date.parse(b.post.createdAt) - Date.parse(a.post.createdAt));
        return result;
    }, [posts, sort]);

    function updatePost(postId: string, patch: Partial<Pick<FeedPost, "liked" | "likes" | "saved" | "comments">>) {
        setPosts(current => current.map(post => post.id === postId ? { ...post, ...patch } : post));
    }

    const loadMore = useCallback(async () => {
        if (!cursor || loadingMore) return;
        setLoadingMore(true); setError("");
        try { await loadPosts(cursor); }
        catch { setError("Không tải thêm được video. Hãy thử lại."); }
        finally { setLoadingMore(false); }
    }, [cursor, loadPosts, loadingMore]);

    useEffect(() => {
        const sentinel = loadMoreSentinel.current;
        if (!sentinel || !cursor || loading || loadingMore || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) void loadMore();
        }, { root: sentinel.closest(".home-feed"), rootMargin: "180px 0px" });
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [cursor, loading, loadingMore, loadMore]);

    function selectVideo(file?: File) {
        setUploadError("");
        if (!file) return;
        if (!VIDEO_MIME_TYPES.has(file.type)) { setUploadError("Chỉ hỗ trợ video MP4 hoặc WebM."); return; }
        if (file.size > VIDEO_MAX_BYTES) { setUploadError("Video có dung lượng tối đa 25 MB."); return; }
        setVideoFile(file);
    }

    async function submitVideo(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!videoFile || uploading) return;
        setUploading(true); setUploadError("");
        const draft: PostDraft = { content: caption.trim(), privacy, files: [videoFile], keepMediaIds: [], postType: "video" };
        try {
            const post = await createPost(draft, setUploadProgress);
            setPosts(current => [post, ...current.filter(item => item.id !== post.id)]);
            setVideoFile(null); setCaption(""); setUploadProgress(0);
            announce("Đã đăng video lên NexChat.");
        } catch {
            setUploadError("Không đăng được video. Hãy kiểm tra kết nối và thử lại.");
        } finally { setUploading(false); }
    }

    const name = [user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.userName || "Bạn";
    const avatar = user?.avatar;

    return <section className="home-video-center" aria-label="Video">
        <div className="home-video-sticky">
        <form className="home-video-composer card border-0 shadow-sm" onSubmit={event => void submitVideo(event)}>
            <div className="home-video-compose-top">
                <span className="home-video-avatar">{avatar ? <img src={avatar} alt="" /> : name.slice(0, 1).toUpperCase()}</span>
                <textarea value={caption} onChange={event => setCaption(event.target.value)} maxLength={5000} rows={1} placeholder={`${name} ơi, chia sẻ video mới của bạn…`} aria-label="Mô tả video" />
            </div>
            {previewUrl && <div className="home-video-upload-preview"><video src={previewUrl} controls playsInline /><button type="button" onClick={() => setVideoFile(null)} disabled={uploading}>Bỏ video</button></div>}
            <input ref={fileInput} className="home-video-file-input" type="file" accept="video/mp4,video/webm" onChange={event => selectVideo(event.target.files?.[0])} disabled={uploading} />
            <div className="home-video-compose-bottom">
                <div className="home-video-compose-tools">
                    <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading}><Upload className="home-video-icon-upload" size={14} /> Tải video</button>
                    <button type="button" onClick={() => announce("Tính năng phát trực tiếp chưa được hỗ trợ.")}><Radio className="home-video-icon-live" size={14} /> Trực tiếp</button>
                </div>
                <label className="home-video-privacy"><select aria-label="Quyền riêng tư" value={privacy} onChange={event => setPrivacy(event.target.value as PostPrivacy)} disabled={uploading}><option value="public">Công khai</option><option value="friends">Bạn bè</option><option value="private">Chỉ mình tôi</option></select></label>
                <button type="submit" className="btn btn-primary btn-sm" disabled={!videoFile || uploading}>{uploading ? `Đăng ${uploadProgress}%` : "➤ Đăng"}</button>
            </div>
            {uploadError && <p className="home-video-form-error" role="alert">{uploadError}</p>}
            {uploading && <progress className="home-video-progress" max={100} value={uploadProgress} aria-label="Tiến trình tải video" />}
        </form>

        <div className="home-video-heading"><h1>Video mới đăng gần đây</h1><label>Sắp xếp theo:<select value={sort} onChange={event => setSort(event.target.value as "random" | "popular" | "latest")}><option value="random">Ngẫu nhiên</option><option value="popular">Phổ biến nhất</option><option value="latest">Mới nhất</option></select></label></div>
        </div>
        {error && <div className="alert alert-danger d-flex align-items-center justify-content-between" role="alert"><span>{error}</span><button type="button" className="btn btn-sm btn-light-danger" onClick={() => { setLoading(true); setError(""); void loadPosts().catch(() => setError("Không tải được video. Hãy thử lại.")).finally(() => setLoading(false)); }}>Thử lại</button></div>}
        {loading ? <div className="home-video-empty card" role="status">Đang tải video…</div> : entries.length === 0 ? <div className="home-video-empty card"><Clapperboard size={28} /><h2>Chưa có video</h2><p>Video trong các bài viết sẽ xuất hiện tại đây.</p></div> : entries.map(({ post, media }, index) => <VideoCard key={`${post.id}-${media.id}-${index}`} post={post} media={media} canManage={Boolean(user && user.id === post.author.id && post.canEdit)} updatePost={updatePost} removePost={postId => setPosts(current => current.filter(item => item.id !== postId))} replacePost={updated => setPosts(current => current.map(item => item.id === updated.id ? updated : item))} announce={announce} />)}
        {!loading && cursor && <div ref={loadMoreSentinel} className="home-video-load-sentinel" aria-live="polite">{loadingMore ? "Đang tải video…" : ""}</div>}
    </section>;
}
