import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { logout } from "../../axios/auth";
import { initialProfile, pollOptions, profileLimits } from "./config";
import type { ProfileComment, ProfileDialog, ProfileNotice, ProfilePostProps, ProfileTab } from "../../component/type/profile";

function useLocalImage(onNotice: ProfileNotice) {
    const [src, setSrc] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);
    function onChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!file.type.startsWith("image/") || file.size > profileLimits.imageSize) {
            onNotice("Vui lòng chọn ảnh dưới 10 MB.");
            return;
        }
        setSrc(URL.createObjectURL(file));
        onNotice("Ảnh đã đổi trong bản xem thử, chưa tải lên máy chủ.");
    }
    return { src, inputRef, onChange };
}

export function useProfileActions() {
    const [details, setDetails] = useState(initialProfile);
    const [draft, setDraft] = useState(initialProfile);
    const [activeTab, setActiveTab] = useState<ProfileTab>("posts");
    const [savedPosts, setSavedPosts] = useState<string[]>([]);
    const [dialog, setDialog] = useState<ProfileDialog>(null);
    const [notice, setNotice] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const navigate = useNavigate();
    const cover = useLocalImage(setNotice);
    const avatar = useLocalImage(setNotice);

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), profileLimits.noticeDuration);
        return () => window.clearTimeout(timer);
    }, [notice]);
    useEffect(() => {
        if (dialog && !dialogRef.current?.open) dialogRef.current?.showModal();
        if (!dialog) dialogRef.current?.close();
    }, [dialog]);

    function editProfile() {
        setDraft(details);
        setDialog({ kind: "edit", title: "Chỉnh sửa trang cá nhân" });
    }
    function saveProfile(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!draft.name.trim() || !draft.handle.trim()) return;
        setDetails({ ...draft, name: draft.name.trim(), handle: draft.handle.trim() });
        setDialog(null);
        setNotice("Đã cập nhật hồ sơ trong bản xem thử, chưa lưu lên máy chủ.");
    }
    function toggleSave(postId: string) {
        setSavedPosts(previous => previous.includes(postId) ? previous.filter(id => id !== postId) : [...previous, postId]);
        setNotice("Đã cập nhật bài viết đã lưu trong bản xem thử.");
        setDialog(null);
    }
    async function shareProfile() {
        try {
            await navigator.clipboard.writeText(window.location.origin + "/profile");
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
    return { details, draft, setDraft, activeTab, setActiveTab, savedPosts, dialog, setDialog, notice, setNotice, dialogRef, cover, avatar, editProfile, saveProfile, toggleSave, shareProfile, loggingOut, handleLogout };
}

export function useProfilePostActions({ post, onNotice, onOpen }: ProfilePostProps) {
    const [liked, setLiked] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState<ProfileComment[]>([]);
    const [comment, setComment] = useState("");
    const commentInputRef = useRef<HTMLInputElement>(null);
    function toggleLike() {
        setLiked(previous => !previous);
        onNotice("Đã cập nhật lượt thích trong bản xem thử.");
    }
    function openComments() {
        setCommentsOpen(true);
        requestAnimationFrame(() => commentInputRef.current?.focus());
    }
    function submitComment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!comment.trim()) return;
        setComments(previous => [...previous, { id: crypto.randomUUID(), text: comment.trim() }]);
        setComment("");
        onNotice("Bình luận chỉ được lưu trong bản xem thử.");
    }
    async function sharePost() {
        try {
            await navigator.clipboard.writeText(window.location.origin + "/profile#" + post.id);
            onNotice("Đã sao chép liên kết bài viết.");
        } catch { onOpen({ kind: "notice", title: "Chia sẻ bài viết" }); }
    }
    return { liked, commentsOpen, comments, comment, setComment, commentInputRef, toggleLike, openComments, submitComment, sharePost };
}

export function useProfilePollActions(onNotice: ProfileNotice) {
    const [selected, setSelected] = useState(0);
    function selectOption(index: number) {
        setSelected(index);
        onNotice("Đã cập nhật bình chọn trong bản xem thử, chưa lưu lên máy chủ.");
    }
    function percentage(index: number) {
        return Math.round((pollOptions[index].votes + Number(selected === index) - Number(index === 0)) / 528 * 100);
    }
    return { selected, selectOption, percentage };
}
