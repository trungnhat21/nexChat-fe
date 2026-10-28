import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";
import { createDirectConversation, listConversations, listMessages, sendDirectMessage } from "../../axios/messages";
import { getCurrentUser } from "../../axios/auth";
import { getAcceptedFriends, type AcceptedFriend } from "../../axios/friends";
import { getAccessToken } from "../../axios/index";
import type { CurrentUser } from "../../component/type/auth";
import type { ChatMessage, DirectConversation } from "../../component/type/message";
import { io, type Socket } from "socket.io-client";

function readableError(error: unknown, fallback: string) {
    if (isAxiosError(error)) {
        const message: unknown = error.response?.data?.message;
        if (typeof message === "string" && error.response?.status !== 500) return message;
    }
    return fallback;
}

function sortRecent(rows: DirectConversation[]) {
    return [...rows].sort((a, b) => {
        const leftId = a.lastMessage?.id;
        const rightId = b.lastMessage?.id;
        if (leftId && rightId && /^\d+$/.test(leftId) && /^\d+$/.test(rightId)) {
            const left = BigInt(leftId);
            const right = BigInt(rightId);
            if (left !== right) return left > right ? -1 : 1;
        }
        const timeDifference = Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
        if (timeDifference) return timeDifference;
        if (a.lastMessage || b.lastMessage) return a.lastMessage ? -1 : 1;
        return BigInt(a.id) === BigInt(b.id) ? 0 : BigInt(a.id) > BigInt(b.id) ? -1 : 1;
    });
}

export function useMessagesActions() {
    const location = useLocation();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [conversations, setConversations] = useState<DirectConversation[]>([]);
    const [friends, setFriends] = useState<AcceptedFriend[]>([]);
    const [presence, setPresence] = useState<Record<string, boolean>>({});
    const [typingUserId, setTypingUserId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [listError, setListError] = useState("");
    const [messageError, setMessageError] = useState("");
    const [actionError, setActionError] = useState("");
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasOlder, setHasOlder] = useState(false);
    const [olderCursor, setOlderCursor] = useState<string | null>(null);
    const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
    const [callSocket, setCallSocket] = useState<Socket | null>(null);
    const selectedRef = useRef<string | null>(null);
    const userRef = useRef<CurrentUser | null>(null);
    const mountedRef = useRef(false);
    const conversationGeneration = useRef(0);
    const processedRecipient = useRef("");
    const socketRef = useRef<Socket | null>(null);
    const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const typingConversationRef = useRef<string | null>(null);
    const typingActiveRef = useRef(false);
    const readInFlightRef = useRef(new Set<string>());
    const messageStatusesRef = useRef(new Map<string, { status: "delivered" | "read"; isRead: boolean }>());
    const recipientId = new URLSearchParams(location.search).get("userId");

    useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
    useEffect(() => { userRef.current = currentUser; }, [currentUser]);
    useEffect(() => {
        const onlineChanged = () => setOnline(true);
        const offlineChanged = () => setOnline(false);
        window.addEventListener("online", onlineChanged);
        window.addEventListener("offline", offlineChanged);
        return () => {
            window.removeEventListener("online", onlineChanged);
            window.removeEventListener("offline", offlineChanged);
        };
    }, []);

    const refreshConversations = useCallback(async () => {
        const result = await listConversations();
        if (mountedRef.current) setConversations(sortRecent(result.conversations));
        return result.conversations;
    }, []);

    const refreshFriends = useCallback(async () => {
        const result = await getAcceptedFriends();
        if (mountedRef.current) setFriends(result);
        return result;
    }, []);

    const retryConversations = useCallback(async () => {
        setListError("");
        try { await Promise.all([refreshConversations(), refreshFriends()]); }
        catch (error) { setListError(readableError(error, "Không tải được danh sách trò chuyện.")); }
    }, [refreshConversations, refreshFriends]);

    const openConversation = useCallback(async (id: string) => {
        const previousId = selectedRef.current;
        if (previousId && previousId !== id) socketRef.current?.emit("conversation:close");
        if (previousId && previousId !== id && typingActiveRef.current) {
            socketRef.current?.emit("typing:stop", { conversationId: previousId });
            typingActiveRef.current = false;
            typingConversationRef.current = null;
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
        }
        const generation = ++conversationGeneration.current;
        selectedRef.current = id;
        if (socketRef.current?.connected) socketRef.current.emit("conversation:open", { conversationId: id });
        setSelectedId(id);
        setMessages([]);
        setDraft("");
        setMessageError("");
        setActionError("");
        setLoadingMessages(true);
        setHasOlder(false);
        setOlderCursor(null);
        try {
            const result = await listMessages(id);
            if (generation !== conversationGeneration.current || !mountedRef.current) return;
            setMessages(result.messages);
            setHasOlder(result.hasMore);
            setOlderCursor(result.nextCursor);
            setTypingUserId(null);
            for (const message of result.messages) {
                if (!message.isMine && /^\d+$/.test(message.id)) socketRef.current?.emit("message:delivered", { conversationId: id, messageId: message.id });
            }
            void refreshConversations().catch(() => undefined);
        } catch (error) {
            if (generation === conversationGeneration.current) setMessageError(readableError(error, "Không tải được lịch sử tin nhắn. Vui lòng thử lại."));
        } finally {
            if (generation === conversationGeneration.current) setLoadingMessages(false);
        }
    }, [refreshConversations]);

    const markVisibleMessages = useCallback(async (conversationId: string, messageIds: string[]) => {
        const ids = messageIds.filter(id => /^\d+$/.test(id) && !readInFlightRef.current.has(`${conversationId}:${id}`));
        if (!ids.length) return;
        const socket = socketRef.current;
        if (!socket?.connected || selectedRef.current !== conversationId) return;
        ids.forEach(id => readInFlightRef.current.add(`${conversationId}:${id}`));
        socket.timeout(7000).emit("message:read", { conversationId, messageIds: ids }, (error: Error | null, result?: { success: boolean; readIds: string[] }) => {
            if (error || !result?.success) {
                ids.forEach(id => readInFlightRef.current.delete(`${conversationId}:${id}`));
                return;
            }
            const read = new Set(result.readIds);
            setMessages(current => current.map(message => read.has(message.id) ? { ...message, isRead: true } : message));
            void refreshConversations();
        });
    }, [refreshConversations]);

    const updateDraft = useCallback((value: string) => {
        setDraft(value);
        const conversationId = selectedRef.current;
        const socket = socketRef.current;
        const stopTyping = () => {
            if (typingConversationRef.current && typingActiveRef.current) {
                socket?.emit("typing:stop", { conversationId: typingConversationRef.current });
            }
            typingActiveRef.current = false;
            typingConversationRef.current = null;
        };
        if (!value.trim() || !conversationId || !socket?.connected) stopTyping();
        else {
            if (!typingActiveRef.current || typingConversationRef.current !== conversationId) {
                stopTyping();
                socket.emit("typing:start", { conversationId });
                typingActiveRef.current = true;
                typingConversationRef.current = conversationId;
            }
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            typingTimerRef.current = setTimeout(stopTyping, 1400);
        }
    }, []);

    const openFriend = useCallback(async (friend: AcceptedFriend) => {
        setActionError("");
        try {
            const existing = conversations.find(item => item.participant.id === friend.id);
            if (existing) {
                await openConversation(existing.id);
                return;
            }
            const created = await createDirectConversation(friend.id);
            const updated = await refreshConversations();
            const conversation = updated.find(item => item.id === created.conversationId);
            if (!conversation) throw new Error("Conversation was created but not returned in the list.");
            await openConversation(conversation.id);
        } catch (error) {
            setActionError(readableError(error, "Unable to start the conversation."));
        }
    }, [conversations, openConversation, refreshConversations]);

    const loadOlderMessages = useCallback(async () => {
        const conversationId = selectedRef.current;
        if (!conversationId || !olderCursor || !hasOlder || loadingOlder) return false;
        const generation = conversationGeneration.current;
        setLoadingOlder(true);
        setMessageError("");
        try {
            const result = await listMessages(conversationId, olderCursor);
            if (generation !== conversationGeneration.current || !mountedRef.current) return false;
            setMessages(current => {
                const ids = new Set(current.map(message => message.id));
                return [...result.messages.filter(message => !ids.has(message.id)), ...current];
            });
            setHasOlder(result.hasMore);
            setOlderCursor(result.nextCursor);
            return result.messages.length > 0;
        } catch (error) {
            if (generation === conversationGeneration.current) setMessageError(readableError(error, "Không tải được tin nhắn cũ hơn."));
            return false;
        } finally {
            if (generation === conversationGeneration.current) setLoadingOlder(false);
        }
    }, [hasOlder, loadingOlder, olderCursor]);

    const updatePreview = useCallback((conversationId: string, message: ChatMessage) => {
        setConversations(current => sortRecent(current.map(conversation => conversation.id === conversationId
            ? { ...conversation, lastMessage: message, updatedAt: message.createdAt }
            : conversation)));
    }, []);

    const appendMessage = useCallback((message: ChatMessage) => {
        const receipt = messageStatusesRef.current.get(message.id);
        const received = receipt ? { ...message, status: receipt.status, isRead: message.isRead || receipt.isRead } : message;
        setMessages(current => {
            const existing = current.findIndex(item => item.id === received.id || (received.clientMessageId && item.clientMessageId === received.clientMessageId));
            if (existing >= 0) {
                const next = [...current];
                next[existing] = received;
                return next;
            }
            return [...current, received];
        });
        updatePreview(received.conversationId, received);
    }, [updatePreview]);

    const attemptSend = useCallback(async (conversationId: string, content: string, clientMessageId: string) => {
        if (!online) {
            setMessages(current => current.map(message => message.clientMessageId === clientMessageId ? { ...message, delivery: "failed" } : message));
            return;
        }
        setMessages(current => current.map(message => message.clientMessageId === clientMessageId ? { ...message, delivery: "sending" } : message));
        try {
            const result = await sendDirectMessage(conversationId, content, clientMessageId);
            if (mountedRef.current) appendMessage(result.message);
            void refreshConversations().catch(() => undefined);
        } catch {
            if (mountedRef.current) {
                setMessages(current => current.map(message => message.clientMessageId === clientMessageId ? { ...message, delivery: "failed" } : message));
            }
        }
    }, [appendMessage, online, refreshConversations]);

    const send = useCallback(async () => {
        const conversationId = selectedRef.current;
        const content = draft.trim();
        if (!conversationId || !content || !currentUser || content.length > 4000) return;
        const clientMessageId = crypto.randomUUID();
        const pending: ChatMessage = {
            id: `pending:${clientMessageId}`,
            conversationId,
            clientMessageId,
            content,
            createdAt: new Date().toISOString(),
            isMine: true,
            sender: {
                id: currentUser.id,
                name: [currentUser.lastName, currentUser.firstName].filter(Boolean).join(" ") || currentUser.userName || "Bạn",
                avatar: currentUser.avatar,
            },
            delivery: "sending",
        };
        appendMessage(pending);
        updateDraft("");
        setMessageError("");
        await attemptSend(conversationId, content, clientMessageId);
    }, [appendMessage, attemptSend, currentUser, draft, updateDraft]);

    const retry = useCallback((message: ChatMessage) => {
        if (message.clientMessageId) void attemptSend(message.conversationId, message.content, message.clientMessageId);
    }, [attemptSend]);

    useEffect(() => {
        conversationGeneration.current++;
        mountedRef.current = true;
        let disposed = false;
        void (async () => {
            try {
                const session = await getCurrentUser();
                if (disposed) return;
                const user = session.data.currentUser;
                setCurrentUser(user);
                userRef.current = user;

                const token = getAccessToken();
                if (token) {
                    const socketUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
                    const socket = io(socketUrl, { auth: { token }, withCredentials: true, reconnection: true });
                    socketRef.current = socket;
                    setCallSocket(socket);
                    socket.on("connect", () => {
                        socket.emit("presence:watch");
                        const activeConversationId = selectedRef.current;
                        if (activeConversationId) void openConversation(activeConversationId);
                    });
                    socket.on("presence:snapshot", (snapshot: unknown) => {
                        if (snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)) {
                            setPresence(snapshot as Record<string, boolean>);
                        }
                    });
                    socket.on("presence:update", (event: { userId?: string; isOnline?: boolean }) => {
                        if (event?.userId && typeof event.isOnline === "boolean") setPresence(current => ({ ...current, [event.userId!]: event.isOnline! }));
                    });
                    socket.on("typing:update", (event: { conversationId?: string; userId?: string; isTyping?: boolean }) => {
                        if (event?.conversationId !== selectedRef.current || !event.userId || event.userId === userRef.current?.id) return;
                        setTypingUserId(event.isTyping ? event.userId : null);
                    });
                    socket.on("message:status", (event: { conversationId?: string; messageId?: string; messageIds?: string[]; status?: "delivered" | "read" }) => {
                        if (!event?.conversationId || !event.status) return;
                        const ids = new Set([event.messageId, ...(event.messageIds ?? [])].filter((id): id is string => typeof id === "string"));
                        const rank = { delivered: 1, read: 2 };
                        for (const id of ids) {
                            const previous = messageStatusesRef.current.get(id);
                            if (!previous || rank[event.status] >= rank[previous.status]) messageStatusesRef.current.set(id, { status: event.status, isRead: event.status === "read" || Boolean(previous?.isRead) });
                        }
                        const apply = (message: ChatMessage) => {
                            const receipt = ids.has(message.id) ? messageStatusesRef.current.get(message.id) : undefined;
                            return receipt ? { ...message, status: receipt.status, isRead: message.isRead || receipt.isRead } : message;
                        };
                        setMessages(current => current.map(apply));
                        setConversations(current => current.map(conversation => conversation.id === event.conversationId && conversation.lastMessage
                            ? { ...conversation, lastMessage: apply(conversation.lastMessage) }
                            : conversation));
                    });
                    socket.on("message:new", (event: { conversationId?: string; message?: ChatMessage }) => {
                        if (!event?.conversationId || !event.message) return;
                        const normalized = { ...event.message, isMine: event.message.sender?.id === userRef.current?.id };
                        if (!normalized.isMine && /^\d+$/.test(normalized.id)) socket.emit("message:delivered", { conversationId: event.conversationId, messageId: normalized.id });
                        if (selectedRef.current === event.conversationId) {
                            appendMessage(normalized);
                        } else {
                            void refreshConversations().catch(() => undefined);
                        }
                    });
                    socket.on("connect_error", () => {
                        void getCurrentUser().then(() => {
                            const refreshedToken = getAccessToken();
                            if (refreshedToken) socket.auth = { token: refreshedToken };
                        }).catch(() => undefined);
                    });
                    socket.on("disconnect", () => setTypingUserId(null));
                }
                try {
                    const result = await listConversations();
                    if (!disposed) {
                        setConversations(sortRecent(result.conversations));
                        setPresence(current => ({ ...current, ...Object.fromEntries(result.conversations.map(item => [item.participant.id, Boolean(item.participant.online)])) }));
                    }
                } catch (error) {
                    if (!disposed) setListError(readableError(error, "Không tải được danh sách trò chuyện."));
                }
                try { await refreshFriends(); }
                catch (error) { if (!disposed) setListError(readableError(error, "KhÃ´ng táº£i Ä‘Æ°á»£c danh sÃ¡ch báº¡n bÃ¨.")); }
                setLoading(false);
            } catch (error) {
                if (!disposed) {
                    setListError(readableError(error, "Không tải được danh sách trò chuyện."));
                    setLoading(false);
                }
            }
        })();
        return () => {
            disposed = true;
            if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
            if (typingActiveRef.current && typingConversationRef.current) socketRef.current?.emit("typing:stop", { conversationId: typingConversationRef.current });
            if (selectedRef.current) socketRef.current?.emit("conversation:close");
            typingActiveRef.current = false;
            mountedRef.current = false;
            socketRef.current?.disconnect();
            socketRef.current = null;
            setCallSocket(null);
        };
    }, [appendMessage, openConversation, refreshConversations, refreshFriends]);

    useEffect(() => {
        if (!currentUser || !recipientId) return;
        const key = `${currentUser.id}:${recipientId}`;
        if (processedRecipient.current === key) return;
        processedRecipient.current = key;
        if (recipientId === currentUser.id) return;
        void (async () => {
            setActionError("");
            try {
                const result = await createDirectConversation(recipientId);
                await refreshConversations();
                await openConversation(result.conversationId);
            } catch (error) {
                setActionError(readableError(error, "Không thể bắt đầu cuộc trò chuyện."));
            }
        })();
    }, [currentUser, openConversation, recipientId, refreshConversations]);

    const selectedConversation = conversations.find(conversation => conversation.id === selectedId) ?? null;
    const visibleActionError = currentUser && recipientId === currentUser.id
        ? "Bạn không thể nhắn tin với chính mình."
        : actionError;
    return {
        currentUser, conversations, friends, presence, typingUserId, selectedId, selectedConversation, messages, draft, updateDraft, callSocket,
        loading, listError, messageError, actionError: visibleActionError, loadingMessages, loadingOlder,
        hasOlder, online, openConversation, openFriend, loadOlderMessages, markVisibleMessages, send, retry, retryConversations,
    };
}
