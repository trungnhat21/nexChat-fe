import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "../../axios/index";
import { listNotifications, markAllNotificationsRead, markNotificationRead } from "../../axios/notifications";
import type { AppNotification } from "../../component/type/notification";
import { NotificationCenterContext } from "./notification-center-context";

export function NotificationCenterProvider({ userId, children }: { userId: string | undefined; children: ReactNode }) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const openRef = useRef(false);
    const activeRef = useRef(false);
    const socketRef = useRef<Socket | null>(null);

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
        if (!userId) return () => { activeRef.current = false; };
        let disposed = false;
        void (async () => {
            // Refresh the initial badge independently. If REST is temporarily
            // unavailable (for example during a schema migration), still set
            // up the socket so realtime can recover as soon as it is ready.
            void refreshNotifications().catch(() => undefined);
            const token = getAccessToken();
            if (!token || disposed) return;
            const socketUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            const socket = io(socketUrl, { auth: { token }, withCredentials: true, reconnection: true });
            socketRef.current = socket;
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
        };
    }, [userId, refreshNotifications, loadAndMarkVisible]);

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

    return <NotificationCenterContext.Provider value={{ notifications, unreadCount, isOpen, openNotifications, closeNotifications, markRead }}>{children}</NotificationCenterContext.Provider>;
}
