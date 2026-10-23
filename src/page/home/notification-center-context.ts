import { createContext, useContext } from "react";
import type { AppNotification } from "../../component/type/notification";

export type NotificationCenterValue = {
    notifications: AppNotification[];
    unreadCount: number;
    isOpen: boolean;
    openNotifications: () => void;
    closeNotifications: () => void;
    markRead: (id: string) => Promise<void>;
};

export const NotificationCenterContext = createContext<NotificationCenterValue>({
    notifications: [], unreadCount: 0, isOpen: false,
    openNotifications: () => undefined, closeNotifications: () => undefined, markRead: async () => undefined,
});

export function useNotificationCenter() { return useContext(NotificationCenterContext); }
