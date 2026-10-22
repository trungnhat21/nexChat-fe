import { useEffect, useRef, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { createComment, deleteComment, editComment, listComments, repostPost, setPostSaved } from "../../../axios/posts";
import { confirmDelete } from "../../../utils/swal";
import type { PostComment, PostInteractionsProps, PostPrivacy } from "../../type/post";

function actionError(error: unknown) {
    if (isAxiosError(error)) {
        if (error.response?.status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        const message: unknown = error.response?.data?.message;
        if (typeof message === "string" && error.response?.status !== 500) return message;
    }
    return "Không thể thực hiện. Vui lòng thử lại.";
}
export function usePostInteractions({ post, onStateChange, onNotice, onReposted }: PostInteractionsProps) {
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [text, setText] = useState("");
    const [editing, setEditing] = useState<string | null>(null);
    const [editText, setEditText] = useState("");
    const [busy, setBusy] = useState("");
    const [error, setError] = useState("");
    const [shareOpen, setShareOpen] = useState(false);
    const [repostText, setRepostText] = useState("");
    const [privacy, setPrivacy] = useState<PostPrivacy>("public");
    const [copied, setCopied] = useState(false);
    const [repostedId, setRepostedId] = useState("");
    const lock = useRef(false);
    const loadingRef = useRef(false);
    const active = useRef(true);
    const controller = useRef<AbortController | null>(null);
    useEffect(() => {
        active.current = true;
        return () => { active.current = false; controller.current?.abort(); };
    }, []);
    async function loadComments(more = false) {
        if (loadingRef.current) return;
        loadingRef.current = true; setLoading(true); setError("");
        controller.current?.abort();
        controller.current = new AbortController();
        try {
            const result = await listComments(post.id, more ? nextCursor ?? undefined : undefined, controller.current.signal);
            if (!active.current) return;
            setComments(previous => more ? [...previous, ...result.comments.filter(comment => !previous.some(item => item.id === comment.id))] : result.comments);
            setNextCursor(result.nextCursor); setLoaded(true);
            onStateChange(post.id, { comments: result.total });
        } catch (error) { if (active.current) setError(actionError(error)); }
        finally { loadingRef.current = false; if (active.current) setLoading(false); }
    }
    function toggleComments() {
        setCommentsOpen(previous => !previous);
        if (!commentsOpen && !loaded) void loadComments();
    }
    async function perform(key: string, work: () => Promise<void>) {
        if (lock.current) return;
        lock.current = true; setBusy(key); setError("");
        try { await work(); }
        catch (error) { if (active.current) setError(actionError(error)); }
        finally { lock.current = false; if (active.current) setBusy(""); }
    }
    function submitComment(event: FormEvent) {
        event.preventDefault();
        if (!text.trim()) return;
        void perform("comment", async () => {
            const result = await createComment(post.id, text.trim());
            if (!active.current) return;
            if (result.comment) setComments(previous => [result.comment!, ...previous.filter(item => item.id !== result.comment!.id)]);
            setText(""); onStateChange(post.id, { comments: result.total });
        });
    }
    function saveEdit(event: FormEvent) {
        event.preventDefault();
        if (!editing || !editText.trim()) return;
        void perform("edit", async () => {
            const result = await editComment(post.id, editing, editText.trim());
            if (!active.current) return;
            setComments(previous => previous.map(item => item.id === editing && result.comment ? result.comment : item));
            setEditing(null); onStateChange(post.id, { comments: result.total });
        });
    }
    async function removeComment(comment: PostComment) {
        if (lock.current || !await confirmDelete("Xóa bình luận này?")) return;
        void perform("delete", async () => {
            const result = await deleteComment(post.id, comment.id);
            if (!active.current) return;
            setComments(previous => previous.filter(item => item.id !== comment.id));
            if (editing === comment.id) setEditing(null);
            onStateChange(post.id, { comments: result.total });
        });
    }
    function toggleSaved() {
        void perform("save", async () => {
            const result = await setPostSaved(post.id, !post.saved);
            if (active.current) onStateChange(post.id, { saved: result.saved });
        });
    }
    async function copyLink() {
        setCopied(false); setError("");
        try { await navigator.clipboard.writeText(window.location.origin + "/posts/" + post.id); setCopied(true); onNotice("Đã sao chép liên kết bài viết."); }
        catch { setError("Không thể sao chép. Bạn có thể mở liên kết bài viết rồi sao chép URL."); }
    }
    function submitRepost(event: FormEvent) {
        event.preventDefault();
        void perform("repost", async () => {
            const result = await repostPost(post.id, repostText.trim(), privacy);
            if (!active.current) return;
            setRepostedId(result.id); setRepostText("");
            onNotice("Đã đăng lại trên nexChat."); onReposted?.();
        });
    }
    return { commentsOpen, toggleComments, comments, loaded, loading, nextCursor, loadComments, text, setText,
        editing, setEditing, editText, setEditText, busy, error, shareOpen, setShareOpen, repostText, setRepostText, privacy, setPrivacy,
        copied, repostedId, submitComment, saveEdit, removeComment, toggleSaved, copyLink, submitRepost };
}
