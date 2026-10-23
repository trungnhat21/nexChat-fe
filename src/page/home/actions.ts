import { useContext, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router";
import { getCurrentUser, logout } from "../../axios/auth";
import { createPost, deletePost, getPost, listPosts, listSavedPosts, setPostLike, updatePost } from "../../axios/posts";
import { acceptFriendRequest, cancelFriendRequest, followUser, getFriendSuggestions, rejectFriendRequest, sendFriendRequest, unfollowUser, unfriend } from "../../axios/friends";
import type { SuggestedUser } from "../../component/type/relationship";
import { confirmDelete } from "../../utils/swal";
import { HomeContext, postLimits, mediaTypes } from "./config";
import type { CurrentUser } from "../../component/type/auth";
import type { ComposerProps, FeedPost, NewPostMedia, PostCardProps, PostDraft, PostPrivacy, PostStateChange, UploadProgress } from "../../component/type/post";

export function useHome() { return useContext(HomeContext); }
export function focusComposer() {
    const field = document.getElementById("home-compose");
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
    field?.focus({ preventScroll: true });
}
export function postError(error: unknown) {
    if (isAxiosError(error)) {
        if (error.response?.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        const message: unknown = error.response?.data?.message;
        if (typeof message === "string" && error.response?.status !== 500) return message;
        if (!error.response) return "Không kết nối được máy chủ. Nội dung của bạn vẫn được giữ để thử lại.";
    }
    return "Không thể lưu thay đổi. Vui lòng thử lại.";
}
export function useHomeLayoutActions() {
    const [search, setSearch] = useState("");
    const [notice, setNotice] = useState("");
    const [panel, setPanel] = useState("");
    const [user, setUser] = useState<CurrentUser | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);
    useEffect(() => {
        let active = true;
        void getCurrentUser().then(response => { if (active) setUser(response.data.currentUser); }).catch(() => {});
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), 4500);
        return () => window.clearTimeout(timer);
    }, [notice]);
    useEffect(() => {
        if (panel && !dialogRef.current?.open) dialogRef.current?.showModal();
        if (!panel) dialogRef.current?.close();
    }, [panel]);
    return { search, setSearch, notice, setNotice, panel, setPanel, dialogRef, user };
}
export function useHomeFeedActions(search: string, savedOnly = false) {
    const { postId } = useParams<{ postId: string }>();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [revision, setRevision] = useState(0);
    const generation = useRef(0);
    const query = search.trim();
    useEffect(() => {
        let active = true;
        generation.current++;
        const controller = new AbortController();
        const timer = window.setTimeout(() => {
            setLoading(true); setError("");
            void (postId ? getPost(postId, controller.signal).then(result => ({ posts: [result.post], nextCursor: null })) : savedOnly ? listSavedPosts(query, undefined, controller.signal) : listPosts(query, undefined, controller.signal)).then(result => {
                if (active) { setPosts(result.posts); setNextCursor(result.nextCursor); }
            }).catch(error => { if (active) setError(postError(error)); })
                .finally(() => { if (active) setLoading(false); });
        }, query ? 250 : 0);
        return () => { active = false; window.clearTimeout(timer); controller.abort(); };
    }, [query, revision, postId, savedOnly]);

    async function loadMore() {
        if (!nextCursor || loadingMore) return;
        const version = generation.current;
        setLoadingMore(true); setError("");
        try {
            const result = await (savedOnly ? listSavedPosts(query, nextCursor) : listPosts(query, nextCursor));
            if (version === generation.current) {
                setPosts(previous => [...previous, ...result.posts.filter(post => !previous.some(existing => existing.id === post.id))]);
                setNextCursor(result.nextCursor);
            }
        } catch (error) { if (version === generation.current) setError(postError(error)); }
        finally { setLoadingMore(false); }
    }
    const changePostState: PostStateChange = (id, patch) => {
        setPosts(previous => previous.map(post => post.id === id ? { ...post, ...patch } : post).filter(post => !savedOnly || post.saved));
    };
    async function likePost(id: string, liked: boolean) {
        const version = generation.current;
        const result = await setPostLike(id, liked);
        if (version !== generation.current) return;
        setPosts(previous => previous.map(post => post.id === id ? { ...post, liked: result.liked, likes: result.likes } : post));
    }
    async function addPost(draft: PostDraft, onProgress: UploadProgress) {
        const post = await createPost(draft, onProgress);
        setPosts(previous => [post, ...previous.filter(item => item.id !== post.id)]);
    }
    async function editPost(id: string, draft: PostDraft, onProgress: UploadProgress) {
        const post = await updatePost(id, draft, onProgress);
        setPosts(previous => previous.map(item => item.id === id ? post : item));
    }
    async function removePost(id: string) {
        await deletePost(id);
        setPosts(previous => previous.filter(post => post.id !== id));
    }
    const normalized = query.toLocaleLowerCase("vi");
    const visiblePosts = posts.filter(post => (post.author.name + " " + post.content).toLocaleLowerCase("vi").includes(normalized));
    return { changePostState, likePost, query, visiblePosts, addPost, editPost, removePost, loading, loadingMore, error, nextCursor, loadMore, reload: () => setRevision(previous => previous + 1) };
}
export function useComposerActions({ onPost, post }: ComposerProps) {
    const [text, setText] = useState(post?.content ?? "");
    const [privacy, setPrivacy] = useState<PostPrivacy>(post?.privacy ?? "public");
    const [files, setFiles] = useState<NewPostMedia[]>([]);
    const [retained, setRetained] = useState(post?.media ?? []);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const urls = useRef(new Set<string>());
    const { announce } = useHome();
    useEffect(() => {
        const objectUrls = urls.current;
        return () => { objectUrls.forEach(url => URL.revokeObjectURL(url)); objectUrls.clear(); };
    }, []);
    function addFiles(event: ChangeEvent<HTMLInputElement>) {
        const added = Array.from(event.target.files ?? []);
        event.target.value = "";
        if (!added.length) return;
        if (added.length + files.length + retained.length > postLimits.files) { setError("Tối đa 5 file mỗi bài viết."); return; }
        if (added.some(file => !mediaTypes.includes(file.type) || !file.size || file.size > postLimits.fileBytes)) { setError("Chọn ảnh JPEG, PNG, GIF, WebP hoặc video MP4, WebM có dung lượng tối đa 25 MB/file."); return; }
        const total = [...files.map(item => item.file), ...added, ...retained].reduce((sum,file) => sum + file.size,0);
        if (total > postLimits.totalBytes) { setError("Tổng media tối đa 50 MB."); return; }
        setError("");
        setFiles(previous => [...previous, ...added.map(file => { const url = URL.createObjectURL(file); urls.current.add(url); return { id: crypto.randomUUID(), file, url }; })]);
    }
    function removeFile(id: string) {
        const file = files.find(item => item.id === id);
        if (file) { URL.revokeObjectURL(file.url); urls.current.delete(file.url); }
        setFiles(previous => previous.filter(item => item.id !== id));
    }
    async function submitPost(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (submitting) return;
        if (!post?.isRepost && !text.trim() && !files.length && !retained.length) { setError("Hãy nhập nội dung hoặc đính kèm ảnh/video."); return; }
        setSubmitting(true); setError(""); setProgress(0);
        try {
            await onPost({ content: text.trim(), privacy, files: files.map(item => item.file), keepMediaIds: retained.map(item => item.id) }, setProgress);
            urls.current.forEach(url => URL.revokeObjectURL(url)); urls.current.clear();
            setText(""); setFiles([]); setRetained([]); setPrivacy("public");
            announce(post ? "Đã cập nhật bài viết." : "Đã đăng bài viết.");
        } catch (error) { setError(postError(error)); }
        finally { setSubmitting(false); }
    }
    return { text, setText, privacy, setPrivacy, files, retained, setRetained, fileInputRef, addFiles, removeFile, submitPost, submitting, error, progress };
}
export function usePostActions({ post, onUpdate, onDelete, onLike }: PostCardProps) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const { announce } = useHome();
    const likeBusy = useRef(false);
    const [liking, setLiking] = useState(false);
    async function toggleLike() {
        if (likeBusy.current) return;
        likeBusy.current = true; setLiking(true); setError("");
        try { await onLike(post.id, !post.liked); }
        catch (error) { setError(postError(error)); }
        finally { likeBusy.current = false; setLiking(false); }
    }
    async function saveEdit(draft: PostDraft, onProgress: UploadProgress) { await onUpdate(post.id, draft, onProgress); setEditing(false); }
    async function remove() {
        if (deleting) return;
        const confirmed = await confirmDelete("Xóa bài viết này?");
        if (!confirmed) return;
        setDeleting(true); setError("");
        try { await onDelete(post.id); announce("Đã xóa bài viết."); }
        catch (error) { setError(postError(error)); }
        finally { setDeleting(false); }
    }
    return { liking, toggleLike, editing, setEditing, deleting, error, saveEdit, remove };
}
export function useDiscoveryActions() {
    const [friends, setFriends] = useState<SuggestedUser[]>([]);
    const [busy, setBusy] = useState<string[]>([]);
    const { openPanel, announce, setSearch } = useHome();
    const navigate = useNavigate();
    async function loadSuggestions() {
        try { setFriends(await getFriendSuggestions()); }
        catch { announce("Không tải được gợi ý kết bạn."); }
    }
    useEffect(() => {
        let active = true;
        void getFriendSuggestions().then(users => { if (active) setFriends(users); }).catch(() => { if (active) announce("Không tải được gợi ý kết bạn."); });
        return () => { active = false; };
    }, [announce]);
    function refreshFriends() { void loadSuggestions(); }
    async function friendAction(user: SuggestedUser, action: "request" | "accept" | "reject" | "cancel" | "unfriend") {
        if (busy.includes(user.id)) return;
        setBusy(current => [...current, user.id]);
        try {
            if (action === "request") await sendFriendRequest(user.id);
            if (action === "accept" && user.requestId) await acceptFriendRequest(user.requestId);
            if (action === "reject" && user.requestId) await rejectFriendRequest(user.requestId);
            if (action === "cancel" && user.requestId) await cancelFriendRequest(user.requestId);
            if (action === "unfriend") await unfriend(user.id);
            await loadSuggestions();
        } catch { announce("Không thể cập nhật lời mời kết bạn."); }
        finally { setBusy(current => current.filter(id => id !== user.id)); }
    }
    async function toggleFollow(user: SuggestedUser) {
        if (busy.includes(user.id)) return;
        setBusy(current => [...current, user.id]);
        try { if (user.following) await unfollowUser(user.id); else await followUser(user.id); await loadSuggestions(); }
        catch { announce("Không thể cập nhật theo dõi."); }
        finally { setBusy(current => current.filter(id => id !== user.id)); }
    }
    return { friends, busy, openPanel, setSearch, refreshFriends, friendAction, toggleFollow, openProfile: (id: string) => navigate("/profile/" + id) };
}

export function useHeaderActions() {
    const [accountMenuOpen, setAccountMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const accountMenuRef = useRef<HTMLDivElement>(null);
    const accountButtonRef = useRef<HTMLButtonElement>(null);
    const logoutButtonRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const { announce } = useHome();

    useEffect(() => {
        if (!accountMenuOpen) return;
        function closeOutside(event: Event) {
            if (event.target instanceof Node && !accountMenuRef.current?.contains(event.target)) {
                setAccountMenuOpen(false);
            }
        }
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setAccountMenuOpen(false);
                accountButtonRef.current?.focus();
            }
        }
        document.addEventListener("pointerdown", closeOutside);
        document.addEventListener("focusin", closeOutside);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOutside);
            document.removeEventListener("focusin", closeOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [accountMenuOpen]);

    function openAccountMenu() {
        setAccountMenuOpen(true);
        requestAnimationFrame(() => logoutButtonRef.current?.focus());
    }

    async function handleLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
            navigate("/", { replace: true });
        } catch {
            announce("Không thể đăng xuất. Vui lòng thử lại.");
        } finally {
            setLoggingOut(false);
        }
    }

    return { accountMenuOpen, setAccountMenuOpen, loggingOut, accountMenuRef, accountButtonRef, logoutButtonRef, openAccountMenu, handleLogout };
}
