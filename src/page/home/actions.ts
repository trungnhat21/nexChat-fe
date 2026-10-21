import { useContext, useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { logout } from "../../axios/auth";
import { HomeContext } from "./config";
import { initialPosts, originalVotes, postHashtags, sampleComments, suggestedFriends } from "./config";
import type { Comment, ComposerProps, FeedPost, HomeContextValue } from "../../component/type/home";

export function useHome() {
    return useContext(HomeContext);
}

export function focusComposer() {
    const field = document.getElementById("home-compose");
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
    field?.focus({ preventScroll: true });
}

export function useHomeLayoutActions() {
    const [search, setSearch] = useState("");
    const [notice, setNotice] = useState("");
    const [panel, setPanel] = useState("");
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), 4500);
        return () => window.clearTimeout(timer);
    }, [notice]);

    useEffect(() => {
        if (panel && !dialogRef.current?.open) dialogRef.current?.showModal();
        if (!panel) dialogRef.current?.close();
    }, [panel]);

    return { search, setSearch, notice, setNotice, panel, setPanel, dialogRef };
}

export function useHomeFeedActions({ search, setSearch }: Pick<HomeContextValue, "search" | "setSearch">) {
    const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
    const query = search.trim().toLocaleLowerCase("vi");
    const visiblePosts = posts.filter(post => `${post.author} ${post.content} ${post.kind === "image" ? postHashtags.join(" ") : ""}`.toLocaleLowerCase("vi").includes(query));

    function addPost(content: string) {
        const post: FeedPost = {
            id: crypto.randomUUID(), author: "Lê Minh Tâm", avatar: "3352:623",
            role: "Bài viết xem thử • Chưa lưu lên máy chủ", time: "Vừa xong",
            content, kind: "text", likes: 0, comments: 0,
        };
        setPosts(previous => [post, ...previous]);
    }

    return { search, setSearch, query, visiblePosts, addPost };
}

export function useComposerActions({ onPost }: ComposerProps) {
    const [text, setText] = useState("");
    const { announce, openPanel } = useHome();

    function submitPost(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!text.trim()) { focusComposer(); return; }
        onPost(text.trim());
        setText("");
        announce("Đã thêm bài viết vào bản xem thử. Nội dung chưa lưu lên máy chủ.");
    }

    return { text, setText, submitPost, openPanel };
}

export function usePollActions() {
    const [selected, setSelected] = useState(0);
    const { announce } = useHome();
    const totalVotes = originalVotes.reduce((sum, votes) => sum + votes, 0);

    function selectOption(index: number) {
        setSelected(index);
        announce("Đã cập nhật lựa chọn trong bản xem thử, chưa lưu lên máy chủ.");
    }

    function getPercentage(index: number) {
        return Math.round(((originalVotes[index] + Number(selected === index) - Number(index === 0)) / totalVotes) * 100);
    }

    return { selected, selectOption, getPercentage };
}

export function useCommentActions() {
    const [liked, setLiked] = useState(false);
    return { liked, toggleLike: () => setLiked(previous => !previous) };
}

export function usePostActions(post: FeedPost) {
    const isImage = post.kind === "image";
    const [liked, setLiked] = useState(isImage);
    const [saved, setSaved] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(isImage);
    const [comments, setComments] = useState<Comment[]>(isImage ? sampleComments : []);
    const [draft, setDraft] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { announce, openPanel, setSearch } = useHome();
    const likeCount = post.likes + Number(liked) - Number(isImage);
    const commentCount = post.comments + comments.length - (isImage ? sampleComments.length : 0);

    function reply(author?: string) {
        setCommentsOpen(true);
        if (author) setDraft(`@${author} `);
        requestAnimationFrame(() => inputRef.current?.focus());
    }

    async function share() {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/home#${post.id}`);
            announce("Đã sao chép liên kết bài viết.");
        } catch { openPanel("Chia sẻ bài viết"); }
    }

    function toggleLike() {
        setLiked(previous => !previous);
        announce("Đã cập nhật lượt thích trong bản xem thử.");
    }

    function toggleSave() {
        setSaved(previous => !previous);
        announce(saved ? "Đã bỏ lưu trong bản xem thử." : "Đã lưu trong bản xem thử, chưa lưu lên máy chủ.");
    }

    function submitComment(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!draft.trim()) return;
        const comment: Comment = {
            id: crypto.randomUUID(), author: "Lê Minh Tâm", avatar: "3352:731",
            text: draft.trim(), time: "Vừa xong", likes: 0,
        };
        setComments(previous => [...previous, comment]);
        setDraft("");
        announce("Đã thêm bình luận trong bản xem thử, chưa lưu lên máy chủ.");
    }

    function insertEmoji() {
        setDraft(previous => `${previous} 😊`);
        inputRef.current?.focus();
    }

    return { isImage, liked, saved, commentsOpen, comments, draft, setDraft, inputRef, openPanel, setSearch, likeCount, commentCount, reply, share, toggleLike, toggleSave, submitComment, insertEmoji };
}

export function useDiscoveryActions() {
    const [following, setFollowing] = useState<string[]>([]);
    const [offset, setOffset] = useState(0);
    const { openPanel, announce, setSearch } = useHome();
    const friends = [...suggestedFriends.slice(offset), ...suggestedFriends.slice(0, offset)];

    function refreshFriends() {
        setOffset(previous => (previous + 1) % suggestedFriends.length);
        announce("Đã đổi thứ tự gợi ý mẫu.");
    }

    function toggleFollow(name: string) {
        setFollowing(previous => previous.includes(name) ? previous.filter(item => item !== name) : [...previous, name]);
        announce("Đã cập nhật theo dõi trong bản xem thử, chưa lưu lên máy chủ.");
    }

    return { following, friends, openPanel, setSearch, refreshFriends, toggleFollow };
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
