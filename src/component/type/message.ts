export type MessagePerson = { id: string; name: string; avatar: string | null; online?: boolean };

export type ChatMessage = {
    id: string;
    conversationId: string;
    clientMessageId: string | null;
    messageType?: "text" | "image" | "audio" | "file" | "system";
    content: string;
    createdAt: string;
    isMine: boolean;
    isRead?: boolean;
    status?: "sent" | "delivered" | "read" | null;
    sender: MessagePerson | null;
    attachments?: ChatAttachment[];
    delivery?: "sending" | "failed";
};

export type ChatAttachment = { url: string; mimeType: string | null; name: string | null; size: number | null; durationMs: number | null };

export type DirectConversation = {
    id: string;
    participant: MessagePerson;
    lastMessage: ChatMessage | null;
    updatedAt: string;
    unreadCount: number;
};

export type MessagePage = { success: boolean; messages: ChatMessage[]; hasMore: boolean; nextCursor: string | null };
export type ConversationsResponse = { success: boolean; conversations: DirectConversation[] };
