import api from "./index";
import type { ChatMessage, ConversationsResponse, MessagePage } from "../component/type/message";

export async function listConversations() {
    return (await api.get<ConversationsResponse>("/conversations")).data;
}

export async function createDirectConversation(recipientId: string) {
    return (await api.post<{ success: boolean; conversationId: string; reused: boolean }>("/conversations/direct", { recipientId })).data;
}

export async function listMessages(conversationId: string, before?: string) {
    const params = before ? { before, limit: 30 } : { limit: 30 };
    return (await api.get<MessagePage>(`/conversations/${conversationId}/messages`, { params })).data;
}

export async function markConversationRead(conversationId: string, messageIds: string[]) {
    return (await api.patch<{ success: boolean; readIds: string[] }>(`/conversations/${conversationId}/read`, { messageIds })).data;
}

export async function sendDirectMessage(conversationId: string, content: string, clientMessageId: string, files: File[] = [], messageType: "image" | "audio" = "image", durationMs?: number) {
    if (!files.length) return (await api.post<{ success: boolean; message: ChatMessage }>(`/conversations/${conversationId}/messages`, { content, clientMessageId })).data;
    const form = new FormData();
    form.append("content", content);
    form.append("clientMessageId", clientMessageId);
    form.append("messageType", messageType);
    if (durationMs !== undefined) form.append("durationMs", String(durationMs));
    files.forEach(file => form.append("media", file, file.name));
    return (await api.post<{ success: boolean; message: ChatMessage }>(`/conversations/${conversationId}/messages`, form, { headers: { "Content-Type": "multipart/form-data" } })).data;
}

