import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { DesignIcon } from "./DesignAsset";
import { useHome } from "../actions";
import { deleteStory, getStoryViewers, listStories, publishStory, reactToStory, removeStoryReaction, viewStory } from "../../../axios/stories";
import type { StoryItem, StoryVisibility } from "../../../component/type/story";
import { confirmDelete } from "../../../utils/swal";

const maxStoryBytes = 25 * 1024 * 1024;
const storyReactions = ["❤️", "👍", "😂", "😮", "😢", "😡"];
const supportedStoryTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
const visibilityOptions: Array<[StoryVisibility, string]> = [["friends", "Bạn bè"], ["public", "Công khai"], ["followers", "Người theo dõi"], ["private", "Chỉ mình tôi"]];

function initials(name: string) {
    return name.trim().split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase() || "?";
}

export default function Stories() {
    const { user, announce } = useHome();
    const [stories, setStories] = useState<StoryItem[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadError, setLoadError] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [visibility, setVisibility] = useState<StoryVisibility>("friends");
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formError, setFormError] = useState("");
    const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
    const [viewers, setViewers] = useState<Array<{ id: string; name: string; avatar: string | null; viewedAt: string }>>([]);
    const [viewerLoading, setViewerLoading] = useState(false);
    const [mediaLoading, setMediaLoading] = useState(false);
    const [reactionLoading, setReactionLoading] = useState(false);
    const [storyActionError, setStoryActionError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [accountAvatarFailed, setAccountAvatarFailed] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const viewerVideoRef = useRef<HTMLVideoElement>(null);
    const loadingMoreRef = useRef(false);
    const objectUrlRef = useRef<string | null>(null);
    const activeRef = useRef(true);

    const loadFirstPage = useCallback(async () => {
        try {
            const page = await listStories();
            if (activeRef.current) { setStories(page.stories); setNextCursor(page.nextCursor); setLoadError(""); }
        } catch {
            if (activeRef.current) setLoadError("Không tải được tin. Vui lòng thử lại.");
        } finally {
            if (activeRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        activeRef.current = true;
        void listStories().then(page => {
            if (activeRef.current) { setStories(page.stories); setNextCursor(page.nextCursor); }
        }).catch(() => {
            if (activeRef.current) setLoadError("Không tải được tin. Vui lòng thử lại.");
        }).finally(() => {
            if (activeRef.current) setLoading(false);
        });
        return () => {
            activeRef.current = false;
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        };
    }, [loadFirstPage]);

    const loadMore = useCallback(async () => {
        if (!nextCursor || loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        setLoadError("");
        try {
            const page = await listStories(nextCursor);
            if (activeRef.current) {
                setStories(current => [...current, ...page.stories.filter(story => !current.some(item => item.id === story.id))]);
                setNextCursor(page.nextCursor);
            }
        } catch {
            if (activeRef.current) setLoadError("Không tải thêm được tin. Hãy lướt đến cuối để thử lại.");
        } finally {
            loadingMoreRef.current = false;
            if (activeRef.current) setLoadingMore(false);
        }
    }, [nextCursor]);

    function onStoriesScroll() {
        const element = scrollRef.current;
        if (!element || element.scrollLeft <= 0 || !nextCursor || loadingMoreRef.current) return;
        if (element.scrollLeft + element.clientWidth >= element.scrollWidth - 32) void loadMore();
    }

    function selectFile(event: ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0] ?? null;
        event.target.value = "";
        setFormError("");
        if (!selected) return;
        if (!supportedStoryTypes.includes(selected.type)) { setFormError("Chỉ hỗ trợ ảnh JPEG, PNG, GIF, WebP và video MP4, WebM."); return; }
        if (!selected.size || selected.size > maxStoryBytes) { setFormError("Dung lượng tin tối đa 25 MB."); return; }
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = URL.createObjectURL(selected);
        setPreviewUrl(objectUrlRef.current);
        setFile(selected);
    }

    async function submitStory(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!file || uploading) { if (!file) setFormError("Hãy chọn ảnh hoặc video cho tin của bạn."); return; }
        setUploading(true);
        setFormError("");
        setUploadProgress(0);
        try {
            const created = await publishStory(file, caption.trim(), visibility, setUploadProgress);
            setStories(current => [created, ...current.filter(item => item.id !== created.id)]);
            setCreateOpen(false);
            setFile(null); setPreviewUrl(null); setCaption(""); setVisibility("friends"); setUploadProgress(100);
            if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
            announce("Đã đăng tin.");
        } catch (error: unknown) {
            const response = (error as { response?: { data?: { message?: unknown } } })?.response;
            const message = response?.data?.message;
            const detail = Array.isArray(message) ? message.filter((item): item is string => typeof item === "string").join(" ") : typeof message === "string" ? message : null;
            setFormError(detail || "Không thể đăng tin. Hãy kiểm tra kết nối và thử lại.");
        } finally {
            setUploading(false);
        }
    }

    async function openStory(story: StoryItem) {
        setActiveStory(story);
        setMediaLoading(true);
        setStoryActionError("");
        setViewers([]);
        setViewerLoading(true);
        try {
            const viewedStory = await viewStory(story.id);
            setActiveStory(viewedStory);
            setStories(current => current.map(item => item.id === viewedStory.id ? viewedStory : item));
            if (viewedStory.canDelete) {
                try { setViewers(await getStoryViewers(story.id)); }
                catch { setStoryActionError("Không tải được danh sách người xem."); }
            }
        } catch {
            setStoryActionError("Tin không còn khả dụng hoặc bạn không có quyền xem tin này.");
        } finally {
            setViewerLoading(false);
        }
    }

    async function moveStory(direction: -1 | 1) {
        if (!activeStory) return;
        const index = stories.findIndex(story => story.id === activeStory.id);
        const target = stories[index + direction];
        if (target) await openStory(target);
        else if (direction > 0) setActiveStory(null);
    }

    async function toggleStoryReaction(reaction: string) {
        if (!activeStory || reactionLoading) return;
        setReactionLoading(true);
        setStoryActionError("");
        try {
            const updated = activeStory.myReaction === reaction
                ? await removeStoryReaction(activeStory.id)
                : await reactToStory(activeStory.id, reaction);
            setActiveStory(updated);
            setStories(current => current.map(item => item.id === updated.id ? updated : item));
        } catch {
            setStoryActionError("Không thể cập nhật cảm xúc. Vui lòng thử lại.");
        } finally {
            setReactionLoading(false);
        }
    }

    useEffect(() => {
        if (!activeStory || mediaLoading || activeStory.mediaType.startsWith("video/")) return;
        const timer = window.setTimeout(() => void moveStory(1), 20_000);
        return () => window.clearTimeout(timer);
    }, [activeStory?.id, activeStory?.mediaType, mediaLoading, stories]);

    useEffect(() => {
        const video = viewerVideoRef.current;
        if (!video) return;
        if (viewerLoading || mediaLoading) {
            video.pause();
            return;
        }
        void video.play().catch(() => undefined);
    }, [activeStory?.id, activeStory?.mediaType, viewerLoading, mediaLoading]);

    async function removeActiveStory() {
        if (!activeStory || !activeStory.canDelete || deleting) return;
        if (!await confirmDelete("Xóa tin này?")) return;
        setDeleting(true);
        setStoryActionError("");
        try {
            await deleteStory(activeStory.id);
            setStories(current => current.filter(item => item.id !== activeStory.id));
            setActiveStory(null);
            announce("Đã xóa tin.");
        } catch {
            setStoryActionError("Không thể xóa tin. Vui lòng thử lại.");
        } finally {
            setDeleting(false);
        }
    }

    const ownerName = activeStory?.owner.name ?? "";
    const currentUserName = [user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.userName || "Bạn";
    const canMovePrevious = activeStory ? stories.findIndex(item => item.id === activeStory.id) > 0 : false;
    const canMoveNext = activeStory ? stories.findIndex(item => item.id === activeStory.id) < stories.length - 1 : false;

    return <>
        <section className="home-stories" aria-label="Tin của bạn bè" ref={scrollRef} onScroll={onStoriesScroll}>
            <button className="home-story home-story-create" onClick={() => { setFormError(""); setCreateOpen(true); }}>
                <span className="home-story-create-avatar">{user?.avatar && !accountAvatarFailed ? <img src={user.avatar} alt="" onError={() => setAccountAvatarFailed(true)} /> : initials(currentUserName)}</span>
                <span className="home-story-add"><DesignIcon id="3352:588" /></span>
                <strong>Tạo tin</strong>
            </button>
            {stories.map(story => <button key={story.id} className={`home-story ${story.viewed ? "is-viewed" : "is-unviewed"}`} onClick={() => void openStory(story)} aria-label={`Xem tin của ${story.owner.name}`}>
                {story.mediaType.startsWith("video/") ? <video className="home-story-media" src={story.mediaUrl} muted autoPlay loop playsInline preload="metadata" /> : <img className="home-story-media" src={story.mediaUrl} alt="" />}
                <span className="home-story-gradient" />
                <span className="home-story-avatar">{story.owner.avatar ? <img src={story.owner.avatar} alt="" /> : initials(story.owner.name)}</span>
                <span className="home-story-name">{story.owner.name}</span>
            </button>)}
            {loadingMore && <div className="home-story-loading" role="status">Đang tải…</div>}
            {!loading && stories.length === 0 && <div className="home-story-empty">{loadError ? <><p>{loadError}</p><button onClick={() => { setLoading(true); void loadFirstPage(); }}>Thử lại</button></> : "Chưa có tin nào đang hoạt động."}</div>}
            {loadError && stories.length > 0 && <button className="home-story-retry" onClick={() => void loadMore()}>{loadError}</button>}
            {loading && <span className="home-story-loading" role="status">Đang tải tin…</span>}
        </section>

        {createOpen && <div className="story-create-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !uploading) setCreateOpen(false); }}>
            <form className="story-create-dialog" role="dialog" aria-modal="true" aria-labelledby="story-create-title" onSubmit={event => void submitStory(event)}>
                <header><h2 id="story-create-title">Tạo tin</h2><button type="button" aria-label="Đóng" disabled={uploading} onClick={() => setCreateOpen(false)}>×</button></header>
                <label className="story-file-picker">{previewUrl && file ? file.type.startsWith("video/") ? <video src={previewUrl} controls /> : <img src={previewUrl} alt="Xem trước tin" /> : <span>Chọn ảnh hoặc video (tối đa 25 MB)</span>}
                    <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm" onChange={selectFile} disabled={uploading} />
                </label>
                <label className="story-caption-label">Chú thích <textarea value={caption} onChange={event => setCaption(event.target.value)} maxLength={500} rows={3} disabled={uploading} placeholder="Thêm vài dòng cho tin của bạn…" /></label>
                <label className="story-visibility-label">Ai có thể xem?
                    <select value={visibility} onChange={event => setVisibility(event.target.value as StoryVisibility)} disabled={uploading}>{visibilityOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                </label>
                {uploading && <div className="story-upload-progress"><progress value={uploadProgress} max={100} /><span>{uploadProgress < 99 ? `Đang tải lên ${uploadProgress}%` : "Đang lưu tin…"}</span></div>}
                {formError && <p role="alert" className="story-error">{formError}</p>}
                <footer><button type="button" disabled={uploading} onClick={() => setCreateOpen(false)}>Hủy</button><button className="home-primary" type="submit" disabled={uploading || !file}>{uploading ? "Đang đăng…" : "Đăng tin"}</button></footer>
            </form>
        </div>}

        {activeStory && <div className="story-viewer-backdrop" role="dialog" aria-modal="true" aria-label={`Tin của ${ownerName}`} onMouseDown={event => { if (event.target === event.currentTarget) setActiveStory(null); }} onKeyDown={event => {
            if (event.key === "Escape") setActiveStory(null);
            if (event.key === "ArrowLeft") void moveStory(-1);
            if (event.key === "ArrowRight") void moveStory(1);
        }} tabIndex={-1}>
            <button className="story-viewer-close" aria-label="Đóng tin" onClick={() => setActiveStory(null)}>×</button>
            {canMovePrevious && <button className="story-viewer-nav story-viewer-prev" aria-label="Tin trước" onClick={() => void moveStory(-1)}>‹</button>}
            <div className="story-viewer-content">
                <div className="story-viewer-progress" aria-hidden="true">{stories.map(story => <span key={story.id} className={story.id === activeStory.id ? "is-current" : stories.findIndex(item => item.id === story.id) < stories.findIndex(item => item.id === activeStory.id) ? "is-complete" : ""}><i /></span>)}</div>
                <header><span className="story-viewer-avatar">{activeStory.owner.avatar ? <img src={activeStory.owner.avatar} alt="" /> : initials(ownerName)}</span><strong>{ownerName}</strong><time>{new Date(activeStory.createdAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}</time>
                    {activeStory.canDelete && <><span className="story-view-count">{activeStory.viewCount} lượt xem</span><button disabled={deleting} onClick={() => void removeActiveStory()}>{deleting ? "Đang xóa…" : "Xóa tin"}</button></>}
                </header>
                <div className="story-viewer-media">{activeStory.mediaType.startsWith("video/") ? <video ref={viewerVideoRef} key={activeStory.id} src={activeStory.mediaUrl} controls={!viewerLoading && !mediaLoading} playsInline onLoadedData={() => setMediaLoading(false)} onEnded={() => void moveStory(1)} onError={() => { setMediaLoading(false); setStoryActionError("Không tải được video."); }} /> : <img src={activeStory.mediaUrl} alt={activeStory.caption || `Tin của ${ownerName}`} onLoad={() => setMediaLoading(false)} onError={() => { setMediaLoading(false); setStoryActionError("Không tải được ảnh."); }} />}
                    {activeStory.caption && <p>{activeStory.caption}</p>}
                    {mediaLoading && <span className="story-viewer-loading">Đang tải media…</span>}
                    {storyActionError && <p className="story-error" role="alert">{storyActionError}</p>}
                </div>
                <section className="story-reactions" aria-label="Thả cảm xúc">
                    {storyReactions.map(reaction => <button key={reaction} type="button" disabled={reactionLoading} aria-pressed={activeStory.myReaction === reaction} onClick={() => void toggleStoryReaction(reaction)}>{reaction}{activeStory.reactionCounts?.[reaction] ? <span>{activeStory.reactionCounts[reaction]}</span> : null}</button>)}
                </section>
                {activeStory.canDelete && <section className="story-viewer-viewers" aria-label="Danh sách người xem"><strong>Người đã xem</strong>{viewerLoading ? <p>Đang tải danh sách người xem…</p> : viewers.length ? viewers.map(viewer => <span key={viewer.id}>{viewer.avatar ? <img src={viewer.avatar} alt="" /> : <i>{initials(viewer.name)}</i>}{viewer.name}<small>{new Date(viewer.viewedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</small></span>) : <p>Chưa có lượt xem.</p>}</section>}
            </div>
            {canMoveNext && <button className="story-viewer-nav story-viewer-next" aria-label="Tin tiếp theo" onClick={() => void moveStory(1)}>›</button>}
        </div>}
    </>;
}
