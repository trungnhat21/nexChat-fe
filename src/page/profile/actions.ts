import { uploadProfileImage } from "../../axios/profile";
import { isAxiosError } from "axios";
import { listPosts } from "../../axios/posts";
import type { CurrentUser } from "../../component/type/auth";
import type { FeedPost, ProfileAuthor } from "../../component/type/post";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { getCurrentUser, logout } from "../../axios/auth";
import { initialProfile, profileLimits } from "./config";
import type { ProfileDialog, ProfileImageKind, ProfileNotice, ProfilePostProps, ProfileTab } from "../../component/type/profile";

function useProfileImage(kind: ProfileImageKind, enabled: boolean, ownerId: string | undefined, onNotice: ProfileNotice, onUploaded: (kind: ProfileImageKind, url: string) => void) {
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const busy = useRef(false);
    const active = useRef(true);
    const target = useRef({ enabled, ownerId });
    useEffect(() => { target.current = { enabled, ownerId }; }, [enabled, ownerId]);
    useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
    async function onChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file || !enabled || busy.current) return;
        if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type) || !file.size || file.size > profileLimits.imageSize) {
            onNotice("Chọn ảnh JPEG, PNG, GIF hoặc WebP có dung lượng tối đa 10 MB.");
            return;
        }
        busy.current = true; setUploading(true);
        try {
            const result = await uploadProfileImage(kind, file);
            if (active.current && target.current.enabled && target.current.ownerId === ownerId) {
                onUploaded(kind, result.url);
                onNotice(kind === "avatar" ? "Đã lưu ảnh đại diện." : "Đã lưu ảnh bìa.");
            }
        } catch (error) {
            if (active.current && target.current.enabled && target.current.ownerId === ownerId) {
                const message: unknown = isAxiosError(error) ? error.response?.data?.message : null;
                onNotice(typeof message === "string" ? message : "Không thể tải ảnh lên. Ảnh hiện tại được giữ nguyên, vui lòng thử lại.");
            }
        } finally { busy.current = false; if (active.current) setUploading(false); }
    }
    return { inputRef, onChange, uploading };
}

function loadError(error: unknown): string {
    if (isAxiosError(error) && error.response?.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    if (isAxiosError(error) && error.response?.status === 404) return "Không tìm thấy tài khoản này.";
    if (error instanceof Error && !isAxiosError(error)) return error.message;
    return "Không tải được bài viết. Vui lòng thử lại.";
}
export function useProfileActions() {
    const { userId } = useParams<{ userId: string }>();
    const [details, setDetails] = useState(initialProfile);
    const [draft, setDraft] = useState(initialProfile);
    const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
    const [savedPosts, setSavedPosts] = useState<string[]>([]);
    const [dialog, setDialog] = useState<ProfileDialog>(null);
    const [notice, setNotice] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [author, setAuthor] = useState<ProfileAuthor | null>(null);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [total, setTotal] = useState(0);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);
    const generation = useRef(0);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const navigate = useNavigate();
    const isOwner = !!author && currentUser?.id === author.id;
    const avatarSrc = author?.avatar ?? null;
    function applyImage(kind: ProfileImageKind, url: string) {
        setAuthor(previous => previous ? { ...previous, [kind]: url } : previous);
        if (kind === "avatar") {
            setCurrentUser(previous => previous ? { ...previous, avatar: url } : previous);
            setPosts(previous => previous.map(post => post.author.id === author?.id ? { ...post, author: { ...post.author, avatar: url } } : post));
        }
    }
    const cover = useProfileImage("cover", isOwner, author?.id, setNotice, applyImage);
    const avatar = useProfileImage("avatar", isOwner, author?.id, setNotice, applyImage);

    useEffect(() => {
        let active = true;
        generation.current++;
        const controller = new AbortController();
        void Promise.resolve().then(async () => {
            if (!active) return;
            setLoading(true); setError(""); setPosts([]); setAuthor(null); setTotal(0); setNextCursor(null); setDetails(initialProfile);
            try {
                if (userId !== undefined && (!/^[1-9]\d{0,19}$/.test(userId) || BigInt(userId) > 18446744073709551615n)) throw new Error("ID tài khoản không hợp lệ.");
                const session = await getCurrentUser();
                const targetId = userId ?? session.data.currentUser.id;
                const result = await listPosts("", undefined, controller.signal, targetId);
                if (!active) return;
                if (!result.author || result.author.id !== targetId || result.posts.some(post => post.author.id !== targetId)) throw new Error("Bài viết không khớp tài khoản đang xem.");
                setCurrentUser(session.data.currentUser); setAuthor(result.author); setPosts(result.posts);
                setTotal(result.total ?? result.posts.length); setNextCursor(result.nextCursor);
                setDetails({ ...initialProfile, name: result.author.name, handle: result.author.handle ? "@"+result.author.handle : "", bio: result.author.bio ?? "", joined: "Gia nhập " + new Date(result.author.createdAt).toLocaleDateString("vi-VN", { month: "long", year: "numeric" }) });
            } catch (error) { if (active) setError(loadError(error)); }
            finally { if (active) setLoading(false); }
        });
        return () => { active = false; controller.abort(); };
    }, [userId, revision]);
    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), profileLimits.noticeDuration);
        return () => window.clearTimeout(timer);
    }, [notice]);
    useEffect(() => {
        if (dialog && !dialogRef.current?.open) dialogRef.current?.showModal();
        if (!dialog) dialogRef.current?.close();
    }, [dialog]);

    async function loadMore() {
        if (!author || !nextCursor || loadingMore) return;
        const version = generation.current;
        setLoadingMore(true); setError("");
        try {
            const result = await listPosts("", nextCursor, undefined, author.id);
            if (version !== generation.current) return;
            if (result.posts.some(post => post.author.id !== author.id)) throw new Error("Bài viết không khớp tài khoản đang xem.");
            setPosts(previous => [...previous, ...result.posts.filter(post => !previous.some(item => item.id === post.id))]);
            setNextCursor(result.nextCursor);
        } catch (error) { if (version === generation.current) setError(loadError(error)); }
        finally { setLoadingMore(false); }
    }
    function editProfile() {
        if (!isOwner) return;
        setDraft(details); setDialog({ kind: "edit", title: "Chỉnh sửa trang cá nhân" });
    }
    function saveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!isOwner || !draft.name.trim()) return;
        setDetails({ ...draft, name: draft.name.trim(), handle: draft.handle.trim() });
        setDialog(null); setNotice("Đã cập nhật hồ sơ trong bản xem thử, chưa lưu lên máy chủ.");
    }
    function toggleSave(postId: string) {
        setSavedPosts(previous => previous.includes(postId) ? previous.filter(id => id !== postId) : [...previous, postId]);
        setNotice("Đã cập nhật bài viết đã lưu trong bản xem thử."); setDialog(null);
    }
    async function shareProfile() {
        try {
            await navigator.clipboard.writeText(window.location.origin + "/profile/" + (author?.id ?? userId ?? ""));
            setNotice("Đã sao chép liên kết trang cá nhân.");
        } catch { setDialog({ kind: "notice", title: "Chia sẻ trang cá nhân" }); }
    }
    async function handleLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try { await logout(); navigate("/", { replace: true }); }
        catch { setNotice("Không thể đăng xuất. Vui lòng thử lại."); }
        finally { setLoggingOut(false); }
    }
    return { details, draft, setDraft, activeTab, setActiveTab, savedPosts, dialog, setDialog, notice, setNotice, dialogRef, cover, avatar, avatarSrc, editProfile, saveProfile, toggleSave, shareProfile, loggingOut, handleLogout, currentUser, author, isOwner, posts, total, nextCursor, loading, loadingMore, error, loadMore, reload: () => setRevision(previous => previous + 1) };
}
export function useProfilePostActions({ post, onNotice }: ProfilePostProps) {
    async function sharePost() {
        try {
            await navigator.clipboard.writeText(window.location.origin + "/profile/" + post.author.id + "#" + post.id);
            onNotice("Đã sao chép liên kết bài viết.");
        } catch { onNotice("Không thể sao chép liên kết. Vui lòng thử lại."); }
    }
    return { sharePost };
}
