export type AppNotification = {
    id: string;
    type: "friend_request" | "friend_accept" | "new_post" | "message" | "post_reaction" | "comment" | "comment_reaction";
    referenceId: string | null;
    isRead: boolean;
    createdAt: string;
    actor: { id: string; user_name: string | null; first_name: string | null; last_name: string | null; avatar: string | null } | null;
};
