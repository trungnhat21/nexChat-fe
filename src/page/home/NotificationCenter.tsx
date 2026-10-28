import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "../../axios/index";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "../../axios/notifications";
import type { AppNotification } from "../../component/type/notification";
import { getAcceptedFriends, type AcceptedFriend } from "../../axios/friends";
import { listConversations } from "../../axios/messages";
import { getCurrentUser } from "../../axios/auth";
import { NotificationCenterContext } from "./notification-center-context";

export function NotificationCenterProvider({ userId, children }: { userId?: string; children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [friends, setFriends] = useState<AcceptedFriend[]>([]);
    const [friendsUserId, setFriendsUserId] = useState<string | undefined>();
    const [presence, setPresence] = useState<Record<string, boolean>>({});
    const [presenceUserId, setPresenceUserId] = useState<string | undefined>();
    const [onlineFriendsLoading, setOnlineFriendsLoading] = useState(true);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [realtimeSocket, setRealtimeSocket] = useState<Socket | null>(null);
    const [sessionUserId, setSessionUserId] = useState<string | undefined>();
    const activeUserId = userId ?? sessionUserId;
    const openRef = useRef(false);
    const activeRef = useRef(false);
    const socketRef = useRef<Socket | null>(null);
    const presenceSnapshotReceivedRef = useRef(false);
    const pendingPresenceUpdatesRef = useRef(new Map<string, boolean>());
    const unreadRequestRef = useRef(0);

    useEffect(() => {
        if (userId) return;
        let disposed = false;
        const resolveUser = () => {
            void getCurrentUser().then(response => {
                if (!disposed) setSessionUserId(response.data.currentUser.id);
            }).catch(() => {
                if (!disposed) setSessionUserId(undefined);
            });
        };
        resolveUser();
        window.addEventListener("nexchat:auth-change", resolveUser);
        return () => {
            disposed = true;
            window.removeEventListener("nexchat:auth-change", resolveUser);
        };
    }, [userId]);

    const refreshUnreadMessages = useCallback(async () => {
        const request = ++unreadRequestRef.current;
        const result = await listConversations();
        if (!activeRef.current || request !== unreadRequestRef.current) return;
        setUnreadMessageCount(result.conversations.reduce((total, conversation) => total + conversation.unreadCount, 0));
    }, []);

    const refreshNotifications = useCallback(async () => {
        const result = await listNotifications();
        // Use the notification rows as the source of truth. A separate count
        // request can race with reads and leave a badge for an empty list.
        if (activeRef.current && !openRef.current) {
            setNotifications(result.notifications);
            setUnreadCount(result.notifications.filter(notification => !notification.isRead).length);
        }
    }, []);

    const loadAndMarkVisible = useCallback(async () => {
        const result = await listNotifications();
        if (!activeRef.current) return;
        setNotifications(result.notifications);
        // Derive the count from the same rows shown in the panel. This also
        // avoids a mismatched count if the two server-side reads race with a
        // concurrent mark-read action.
        setUnreadCount(result.notifications.filter(notification => !notification.isRead).length);
        await markAllNotificationsRead();
        if (activeRef.current) {
            setNotifications(current => current.map(notification => ({ ...notification, isRead: true })));
            setUnreadCount(0);
        }
    }, []);

    useEffect(() => {
        activeRef.current = true;
        if (!activeUserId) return () => { activeRef.current = false; };
        let disposed = false;
        void getAcceptedFriends().then(result => {
            if (!disposed) { setFriends(result); setFriendsUserId(activeUserId); }
        }).catch(() => {
            if (!disposed) { setFriends([]); setFriendsUserId(activeUserId); }
        }).finally(() => {
            if (!disposed) setOnlineFriendsLoading(false);
        });
        void (async () => {
            // Refresh the initial badge independently. If REST is temporarily
            // unavailable (for example during a schema migration), still set
            // up the socket so realtime can recover as soon as it is ready.
            void refreshNotifications().catch(() => undefined);
            void refreshUnreadMessages().catch(() => undefined);
            const token = getAccessToken();
            if (!token || disposed) return;
            const socketUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            const socket = io(socketUrl, { auth: { token }, withCredentials: true, reconnection: true });
            socketRef.current = socket;
            setRealtimeSocket(socket);
            socket.on("connect", () => {
                presenceSnapshotReceivedRef.current = false;
                pendingPresenceUpdatesRef.current.clear();
                socket.emit("presence:watch");
                void refreshUnreadMessages().catch(() => undefined);
            });
            socket.on("presence:snapshot", (snapshot: Record<string, boolean>) => {
                if (snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)) {
                    setPresence({ ...snapshot, ...Object.fromEntries(pendingPresenceUpdatesRef.current) });
                    pendingPresenceUpdatesRef.current.clear();
                    presenceSnapshotReceivedRef.current = true;
                    setPresenceUserId(activeUserId);
                }
            });
            socket.on("presence:update", (event: { userId?: string; isOnline?: boolean }) => {
                if (event?.userId && typeof event.isOnline === "boolean") {
                    if (!presenceSnapshotReceivedRef.current) pendingPresenceUpdatesRef.current.set(event.userId, event.isOnline);
                    setPresence(current => ({ ...current, [event.userId!]: event.isOnline! }));
                    setPresenceUserId(activeUserId);
                }
            });
            socket.on("message:new", (event: { conversationId?: string; message?: { id?: string; sender?: { id?: string } | null } }) => {
                if (event?.conversationId && event.message?.id && event.message.sender?.id !== activeUserId) {
                    socket.emit("message:delivered", { conversationId: event.conversationId, messageId: event.message.id });
                }
                void refreshUnreadMessages().catch(() => undefined);
            });
            socket.on("message:status", (event: { status?: string }) => {
                if (event?.status === "read") void refreshUnreadMessages().catch(() => undefined);
            });
            socket.on("notification:new", () => {
                if (openRef.current) void loadAndMarkVisible().catch(() => undefined);
                else void refreshNotifications().catch(() => undefined);
            });
            socket.on("connect_error", () => {
                void refreshNotifications().then(() => {
                    const refreshedToken = getAccessToken();
                    if (refreshedToken) socket.auth = { token: refreshedToken };
                }).catch(() => undefined);
            });
        })();
        return () => {
            disposed = true;
            activeRef.current = false;
            socketRef.current?.disconnect();
            socketRef.current = null;
            setRealtimeSocket(null);
        };
    }, [activeUserId, refreshNotifications, loadAndMarkVisible, refreshUnreadMessages]);

    const openNotifications = useCallback(() => {
        openRef.current = true;
        setIsOpen(true);
        void loadAndMarkVisible().catch(() => refreshNotifications().catch(() => undefined));
    }, [loadAndMarkVisible, refreshNotifications]);
    const closeNotifications = useCallback(() => { openRef.current = false; setIsOpen(false); }, []);
    const markRead = useCallback(async (id: string) => {
        const notification = notifications.find(item => item.id === id);
        if (!notification || notification.isRead) return;
        await markNotificationRead(id);
        setNotifications(current => current.map(item => item.id === id ? { ...item, isRead: true } : item));
        setUnreadCount(count => Math.max(0, count - 1));
    }, [notifications]);

    const onlineFriends = friendsUserId === activeUserId && presenceUserId === activeUserId
        ? friends.filter(friend => presence[friend.id] === true)
        : [];
    const isLoadingOnlineFriends = Boolean(activeUserId) && (onlineFriendsLoading || friendsUserId !== activeUserId);
    return <NotificationCenterContext.Provider value={{ notifications, unreadCount, isOpen, openNotifications, closeNotifications, markRead, onlineFriends, onlineFriendsLoading: isLoadingOnlineFriends, unreadMessageCount, socket: realtimeSocket }}>{children}</NotificationCenterContext.Provider>;
}
