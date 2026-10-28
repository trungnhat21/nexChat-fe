import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Minus, MoreHorizontal, Phone, Send, Video, X } from "lucide-react";
import type { AcceptedFriend } from "../../../axios/friends";
import { createDirectConversation, listMessages, sendDirectMessage } from "../../../axios/messages";
import type { ChatMessage } from "../../../component/type/message";
import { useNotificationCenter } from "../notification-center-context";

function initials(name: string) {
    return name.trim().split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase() || "?";
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function appendUnique(current: ChatMessage[], message: ChatMessage) {
    const found = current.findIndex(item => item.id === message.id || (message.clientMessageId && item.clientMessageId === message.clientMessageId));
    if (found < 0) return [...current, message];
    const next = [...current];
    next[found] = message;
    return next;
}

export default function FloatingChat({ friend, minimized, onMinimizedChange, onClose }: { friend: AcceptedFriend; minimized: boolean; onMinimizedChange: (minimized: boolean) => void; onClose: () => void }) {
    const navigate = useNavigate();
    const { socket } = useNotificationCenter();
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [typing, setTyping] = useState(false);
    const [connected, setConnected] = useState(Boolean(socket?.connected));
    const historyRef = useRef<HTMLDivElement>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const typingSentRef = useRef(false);
    const conversationRef = useRef<string | null>(null);
    const socketRef = useRef(socket);

    useEffect(() => { socketRef.current = socket; }, [socket]);
    useEffect(() => { conversationRef.current = conversationId; }, [conversationId]);

    useEffect(() => {
        let disposed = false;
        void (async () => {
            try {
                const conversation = await createDirectConversation(friend.id);
                if (disposed) return;
                setConversationId(conversation.conversationId);
                const page = await listMessages(conversation.conversationId);
                if (disposed) return;
                const normalized = page.messages.map(message => ({ ...message, isMine: message.sender?.id !== friend.id }));
                setMessages(normalized);
                for (const message of normalized) {
                    if (!message.isMine && /^\d+$/.test(message.id)) socketRef.current?.emit("message:delivered", { conversationId: conversation.conversationId, messageId: message.id });
                }
            } catch {
                if (!disposed) setError("Không thể tải cuộc trò chuyện. Vui lòng thử lại.");
            } finally {
                if (!disposed) setLoading(false);
            }
        })();
        return () => { disposed = true; };
    }, [friend.id]);

    useEffect(() => {
        if (!socket || !conversationId) return;
        const conversation = conversationId;
        const join = () => {
            setConnected(true);
            socket.emit("conversation:open", { conversationId: conversation });
        };
        const onDisconnect = () => { setConnected(false); setTyping(false); };
        const onMessage = (event: { conversationId?: string; message?: ChatMessage }) => {
            if (event?.conversationId !== conversation || !event.message) return;
            const isMine = event.message.sender?.id !== friend.id;
            const message = { ...event.message, conversationId: conversation, isMine };
            setMessages(current => appendUnique(current, message));
            if (!isMine && /^\d+$/.test(message.id)) socket.emit("message:delivered", { conversationId: conversation, messageId: message.id });
        };
        const onStatus = (event: { conversationId?: string; messageId?: string; messageIds?: string[]; status?: "delivered" | "read" }) => {
            if (event?.conversationId !== conversation || !event.status) return;
            const ids = new Set([event.messageId, ...(event.messageIds ?? [])].filter((id): id is string => typeof id === "string"));
            setMessages(current => current.map(message => ids.has(message.id) ? { ...message, status: event.status, isRead: message.isRead || event.status === "read" } : message));
        };
        const onTyping = (event: { conversationId?: string; userId?: string; isTyping?: boolean }) => {
            if (event?.conversationId === conversation && event.userId === friend.id) setTyping(Boolean(event.isTyping));
        };
        socket.on("connect", join);
        socket.on("disconnect", onDisconnect);
        socket.on("message:new", onMessage);
        socket.on("message:status", onStatus);
        socket.on("typing:update", onTyping);
        if (socket.connected) join();
        return () => {
            if (typingSentRef.current) socket.emit("typing:stop", { conversationId: conversation });
            socket.emit("conversation:close");
            socket.off("connect", join);
            socket.off("disconnect", onDisconnect);
            socket.off("message:new", onMessage);
            socket.off("message:status", onStatus);
            socket.off("typing:update", onTyping);
        };
    }, [socket, conversationId, friend.id]);

    useEffect(() => {
        const root = historyRef.current;
        if (!root || !conversationId || !socket || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(entries => {
            const ids = entries.filter(entry => entry.isIntersecting && entry.intersectionRatio >= 0.6)
                .map(entry => (entry.target as HTMLElement).dataset.messageId)
                .filter((id): id is string => Boolean(id));
            if (!ids.length || !socket.connected) return;
            socket.timeout(7000).emit("message:read", { conversationId, messageIds: ids }, (timeout: Error | null, result?: { success: boolean; readIds: string[] }) => {
                if (timeout || !result?.success) return;
                const readIds = new Set(result.readIds);
                setMessages(current => current.map(message => readIds.has(message.id) ? { ...message, isRead: true, status: "read" } : message));
            });
        }, { root, threshold: [0, 0.6, 1] });
        root.querySelectorAll<HTMLElement>("[data-message-id][data-unread='true']").forEach(element => observer.observe(element));
        return () => observer.disconnect();
    }, [conversationId, messages, socket]);

    useLayoutEffect(() => {
        const history = historyRef.current;
        if (history) history.scrollTop = history.scrollHeight;
    }, [messages, loading, minimized]);

    const stopTyping = useCallback(() => {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        if (typingSentRef.current && conversationRef.current) socketRef.current?.emit("typing:stop", { conversationId: conversationRef.current });
        typingSentRef.current = false;
    }, []);

    useEffect(() => () => {
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        if (typingSentRef.current && conversationRef.current) socketRef.current?.emit("typing:stop", { conversationId: conversationRef.current });
    }, []);

    function updateDraft(value: string) {
        setDraft(value);
        const activeSocket = socketRef.current;
        if (!value.trim() || !conversationId || !activeSocket?.connected) {
            stopTyping();
            return;
        }
        if (!typingSentRef.current) {
            activeSocket.emit("typing:start", { conversationId });
            typingSentRef.current = true;
        }
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(stopTyping, 1400);
    }

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const content = draft.trim();
        if (!conversationId || !content || sending) return;
        if (typeof navigator !== "undefined" && !navigator.onLine) {
            setError("Bạn đang ngoại tuyến. Hãy kết nối lại để gửi tin nhắn.");
            return;
        }
        stopTyping();
        setError("");
        setDraft("");
        const clientMessageId = crypto.randomUUID();
        const pending: ChatMessage = {
            id: `pending:${clientMessageId}`, conversationId, clientMessageId, content, createdAt: new Date().toISOString(), isMine: true, delivery: "sending",
            sender: { id: "me", name: "Bạn", avatar: null },
        };
        setMessages(current => appendUnique(current, pending));
        setSending(true);
        try {
            const result = await sendDirectMessage(conversationId, content, clientMessageId);
            const sent = { ...result.message, isMine: true, delivery: undefined };
            setMessages(current => appendUnique(current, sent));
        } catch {
            setMessages(current => current.map(message => message.clientMessageId === clientMessageId ? { ...message, delivery: "failed" } : message));
            setDraft(content);
            setError("Chưa gửi được tin nhắn. Bạn có thể thử gửi lại.");
        } finally {
            setSending(false);
        }
    }

    async function retryMessage(message: ChatMessage) {
        if (!message.clientMessageId || !conversationId || sending) return;
        setSending(true);
        setMessages(current => current.map(item => item.clientMessageId === message.clientMessageId ? { ...item, delivery: "sending" } : item));
        try {
            const result = await sendDirectMessage(conversationId, message.content, message.clientMessageId);
            setMessages(current => appendUnique(current, { ...result.message, isMine: true, delivery: undefined }));
            setError("");
        } catch {
            setMessages(current => current.map(item => item.clientMessageId === message.clientMessageId ? { ...item, delivery: "failed" } : item));
            setError("Vẫn chưa gửi được tin nhắn. Vui lòng thử lại.");
        } finally { setSending(false); }
    }

    const openCall = (kind: "audio" | "video") => {
        onClose();
        navigate(`/messages?userId=${encodeURIComponent(friend.id)}`, { state: { startCall: kind } });
    };

    return <section className={`floating-chat ${minimized ? "is-minimized" : ""}`} aria-label={`Trò chuyện với ${friend.name}`}>
        {minimized ? <div className="floating-chat-bubble">
            <button type="button" className="floating-chat-bubble-open" onClick={() => onMinimizedChange(false)} aria-label={`Mở cuộc trò chuyện với ${friend.name}`} title={`Trò chuyện với ${friend.name}`}>
                <span className="floating-chat-avatar"><span className="floating-chat-avatar-image">{friend.avatar ? <img src={friend.avatar} alt="" /> : initials(friend.name)}</span><i /></span>
            </button>
            <button type="button" className="floating-chat-bubble-close" aria-label="Đóng cuộc trò chuyện" title="Đóng" onClick={event => { event.stopPropagation(); onClose(); }}><X size={13} /></button>
        </div> : <>
        <header className="floating-chat-header">
            <span className="floating-chat-avatar"><span className="floating-chat-avatar-image">{friend.avatar ? <img src={friend.avatar} alt="" /> : initials(friend.name)}</span><i /></span>
            <span className="floating-chat-identity"><strong>{friend.name}</strong><small>{connected ? "Đang hoạt động" : "Đang kết nối lại…"}</small></span>
            <div className="floating-chat-actions">
                {!minimized && <><button type="button" title="Gọi thoại" aria-label="Gọi thoại" onClick={() => openCall("audio")}><Phone size={16} /></button><button type="button" title="Gọi video" aria-label="Gọi video" onClick={() => openCall("video")}><Video size={16} /></button><button type="button" title="Tùy chọn" aria-label="Tùy chọn"><MoreHorizontal size={17} /></button></>}
                <button type="button" title="Thu nhỏ" aria-label="Thu nhỏ cửa sổ chat" onClick={() => onMinimizedChange(true)}><Minus size={16} /></button>
                <button type="button" title="Đóng" aria-label="Đóng cửa sổ chat" onClick={onClose}><X size={17} /></button>
            </div>
        </header>
            <div className="floating-chat-history" ref={historyRef} aria-live="polite">
                {loading && <p className="floating-chat-state" role="status">Đang tải tin nhắn…</p>}
                {!loading && !error && messages.length === 0 && <p className="floating-chat-state">Hãy gửi lời chào để bắt đầu trò chuyện.</p>}
                {!loading && messages.map(message => <article key={message.id} data-message-id={message.id} data-unread={!message.isMine && !message.isRead ? "true" : "false"} className={`floating-chat-row ${message.isMine ? "is-mine" : "is-theirs"}`}>
                    {!message.isMine && <span className="floating-chat-message-avatar">{friend.avatar ? <img src={friend.avatar} alt="" /> : initials(friend.name)}</span>}
                    <div className="floating-chat-message-content">
                        <p>{message.content}</p>
                        <span className="floating-chat-message-meta"><time>{formatTime(message.createdAt)}</time>{message.delivery === "sending" && " · Đang gửi"}{message.delivery === "failed" && <button type="button" onClick={() => void retryMessage(message)}> · Thử lại</button>}{message.isMine && !message.delivery && message.status === "read" && " · Đã xem"}</span>
                    </div>
                </article>)}
                {typing && <p className="floating-chat-typing"><i /><i /><i /> {friend.name} đang nhập…</p>}
                <div className="floating-chat-bottom" />
            </div>
            <form className="floating-chat-composer" onSubmit={event => void submit(event)}>
                {error && <p role="alert">{error}</p>}
                <textarea value={draft} onChange={event => updateDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Nhập tin nhắn…" aria-label="Nhập tin nhắn" maxLength={4000} rows={1} disabled={!conversationId || loading} />
                <button type="submit" aria-label="Gửi tin nhắn" disabled={!draft.trim() || sending || !conversationId}><Send size={17} /></button>
            </form>
        </>}
    </section>;
}
