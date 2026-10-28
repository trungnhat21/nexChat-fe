import { createContext, useContext } from "react";
import type { AppNotification } from "../../component/type/notification";
import type { AcceptedFriend } from "../../axios/friends";
import type { Socket } from "socket.io-client";

export type NotificationCenterValue = {
    notifications: AppNotification[];
    unreadCount: number;
    isOpen: boolean;
    openNotifications: () => void;
    closeNotifications: () => void;
    markRead: (id: string) => Promise<void>;
    onlineFriends: AcceptedFriend[];
    onlineFriendsLoading: boolean;
    unreadMessageCount: number;
    socket: Socket | null;
};

export const NotificationCenterContext = createContext<NotificationCenterValue>({
    notifications: [], unreadCount: 0, isOpen: false, onlineFriends: [], onlineFriendsLoading: false, unreadMessageCount: 0, socket: null,
    openNotifications: () => undefined, closeNotifications: () => undefined, markRead: async () => undefined,
});

export function useNotificationCenter() { return useContext(NotificationCenterContext); }
