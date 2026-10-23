import api from "./index";
import type { AppNotification } from "../component/type/notification";

export async function listNotifications() {
    return (await api.get<{ success: boolean; notifications: AppNotification[]; unreadCount: number }>("/notifications")).data;
}
export async function getUnreadNotificationCount() {
    return (await api.get<{ success: boolean; unreadCount: number }>("/notifications/unread-count")).data.unreadCount;
}
export async function markNotificationRead(id: string) {
    return (await api.patch<{ success: boolean; notification: { id: string; isRead: boolean } }>(`/notifications/${id}/read`)).data;
}
export async function markAllNotificationsRead() {
    return (await api.patch<{ success: boolean; updatedCount: number }>("/notifications/read-all")).data;
}
