import { removeProfileAvatar, uploadProfileImage } from "../../axios/profile";
import { acceptFriendRequest, cancelFriendRequest, followUser, getRelationship, rejectFriendRequest, unfollowUser, unfriend, sendFriendRequest } from "../../axios/friends";
import { isAxiosError } from "axios";
import { listPosts, setPostLike } from "../../axios/posts";
import type { CurrentUser } from "../../component/type/auth";
import type { FeedPost, PostStateChange, ProfileAuthor } from "../../component/type/post";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { getCurrentUser, logout } from "../../axios/auth";
import { initialProfile, profileLimits } from "./config";
import type { ProfileDialog, ProfileImageKind, ProfileNotice, ProfilePostProps, ProfileTab } from "../../component/type/profile";
import type { RelationshipState } from "../../component/type/relationship";

function useProfileImage(kind: ProfileImageKind, enabled: boolean, ownerId: string | undefined, onNotice: ProfileNotice, onUploaded: (kind: ProfileImageKind, url: string | null) => void) {
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
    async function remove() {
        if (kind !== "avatar" || !enabled || busy.current) return;
        busy.current = true; setUploading(true);
        try {
            await removeProfileAvatar();
            if (active.current && target.current.enabled && target.current.ownerId === ownerId) {
                onUploaded("avatar", null);
                onNotice("ÄÃ£ xÃ³a áº£nh Ä‘áº¡i diá»‡n.");
            }
        } catch (error) {
            if (active.current && target.current.enabled && target.current.ownerId === ownerId) {
                const message: unknown = isAxiosError(error) ? error.response?.data?.message : null;
                onNotice(typeof message === "string" ? message : "KhÃ´ng thá»ƒ xÃ³a áº£nh Ä‘áº¡i diá»‡n. Vui lÃ²ng thá»­ láº¡i.");
            }
        } finally { busy.current = false; if (active.current) setUploading(false); }
    }
    return { inputRef, onChange, remove, uploading };
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
    const [dialog, setDialog] = useState<ProfileDialog>(null);
    const [notice, setNotice] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [author, setAuthor] = useState<ProfileAuthor | null>(null);
    const [relationship, setRelationship] = useState<RelationshipState | null>(null);
    const [relationshipBusy, setRelationshipBusy] = useState(false);
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [total, setTotal] = useState(0);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [loadMoreError, setLoadMoreError] = useState("");
    const [revision, setRevision] = useState(0);
    const generation = useRef(0);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const navigate = useNavigate();
    const isOwner = !!author && currentUser?.id === author.id;
    const avatarSrc = author?.avatar ?? null;
    function applyImage(kind: ProfileImageKind, url: string | null) {
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
            setLoading(true); setError(""); setLoadMoreError(""); setPosts([]); setAuthor(null); setRelationship(null); setTotal(0); setNextCursor(null); setDetails(initialProfile);
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
                try { setRelationship(await getRelationship(targetId)); }
                catch { if (active) setNotice("Không tải được trạng thái quan hệ. Bạn vẫn có thể xem bài viết."); }
            } catch (error) { if (active) setError(loadError(error)); }
            finally { if (active) setLoading(false); }
        });
        return () => { active = false; controller.abort(); };
    }, [userId, revision]);

    async function performFriendAction(action: "request" | "cancel" | "accept" | "reject" | "unfriend") {
        if (!author || relationshipBusy || (action !== "request" && !relationship)) return;
        setRelationshipBusy(true);
        try {
            if (action === "request") {
                const result = await sendFriendRequest(author.id);
                setRelationship(previous => ({ ...previous, friendStatus: "outgoing", requestId: result.friendship.id, following: previous?.following ?? false, followers: previous?.followers ?? 0, followingCount: previous?.followingCount ?? 0, friends: previous?.friends ?? 0 }));
            }
            if (action === "cancel" && relationship?.requestId) await cancelFriendRequest(relationship.requestId);
            if (action === "accept" && relationship?.requestId) await acceptFriendRequest(relationship.requestId);
            if (action === "reject" && relationship?.requestId) await rejectFriendRequest(relationship.requestId);
            if (action === "unfriend") await unfriend(author.id);
            try { setRelationship(await getRelationship(author.id)); }
            catch { if (action !== "request") throw new Error("RELATIONSHIP_REFRESH_FAILED"); }
        } catch (error) {
            const serverMessage = isAxiosError(error) ? error.response?.data?.message : null;
            setNotice(typeof serverMessage === "string" ? serverMessage : "Không thể cập nhật quan hệ. Vui lòng thử lại.");
        }
        finally { setRelationshipBusy(false); }
    }
    async function toggleFollow() {
        if (!author || !relationship || relationshipBusy) return;
        setRelationshipBusy(true);
        try { if (relationship.following) await unfollowUser(author.id); else await followUser(author.id); setRelationship(await getRelationship(author.id)); }
        catch { setNotice("Không thể cập nhật theo dõi. Vui lòng thử lại."); }
        finally { setRelationshipBusy(false); }
    }
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
        setLoadingMore(true); setLoadMoreError("");
        try {
            const result = await listPosts("", nextCursor, undefined, author.id);
            if (version !== generation.current) return;
            if (result.posts.some(post => post.author.id !== author.id)) throw new Error("Bài viết không khớp tài khoản đang xem.");
            setPosts(previous => [...previous, ...result.posts.filter(post => !previous.some(item => item.id === post.id))]);
            setNextCursor(result.nextCursor);
        } catch (error) { if (version === generation.current) setLoadMoreError(loadError(error)); }
        finally { setLoadingMore(false); }
    }
    const changePostState: PostStateChange = (id, patch) => {
        setPosts(previous => previous.map(post => post.id === id ? { ...post, ...patch } : post));
    };
    async function likePost(id: string, liked: boolean) {
        const version = generation.current;
        const result = await setPostLike(id, liked);
        if (version !== generation.current) return;
        setPosts(previous => previous.map(post => post.id === id ? { ...post, liked: result.liked, likes: result.likes } : post));
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
    return { changePostState, likePost, details, draft, setDraft, activeTab, setActiveTab, dialog, setDialog, notice, setNotice, dialogRef, cover, avatar, avatarSrc, editProfile, saveProfile, shareProfile, loggingOut, handleLogout, currentUser, author, isOwner, posts, total, nextCursor, loading, loadingMore, error, loadMoreError, loadMore, relationship, relationshipBusy, performFriendAction, toggleFollow, reload: () => setRevision(previous => previous + 1) };
}
export function useProfilePostActions({ post, onLike }: ProfilePostProps) {
    const likeBusy = useRef(false);
    const [liking, setLiking] = useState(false);
    const [likeError, setLikeError] = useState("");
    async function toggleLike() {
        if (likeBusy.current) return;
        likeBusy.current = true; setLiking(true); setLikeError("");
        try { await onLike(post.id, !post.liked); }
        catch (error) { setLikeError(isAxiosError(error) && error.response?.status === 401 ? "Phiên đăng nhập đã hết hạn." : "Không thể cập nhật lượt thích. Vui lòng thử lại."); }
        finally { likeBusy.current = false; setLiking(false); }
    }
    return { liking, toggleLike, likeError };
}
