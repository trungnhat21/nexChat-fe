import { createContext, useContext } from "react";
import type { AppNotification } from "../../component/type/notification";
import type { AcceptedFriend } from "../../axios/friends";

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
};

export const NotificationCenterContext = createContext<NotificationCenterValue>({
    notifications: [], unreadCount: 0, isOpen: false, onlineFriends: [], onlineFriendsLoading: false, unreadMessageCount: 0,
    openNotifications: () => undefined, closeNotifications: () => undefined, markRead: async () => undefined,
});

export function useNotificationCenter() { return useContext(NotificationCenterContext); }
