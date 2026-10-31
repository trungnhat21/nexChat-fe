export type FriendTabType = "requests" | "suggestions" | "all";

export interface ReceivedFriendRequest {
    id: string; // friendship request id
    requesterId: string;
    addresseeId: string;
    status: string;
    createAt?: string;
    createdAt?: string;
    requester: {
        id: string;
        email?: string;
        user_name?: string | null;
        first_name?: string | null;
        last_name?: string | null;
        avatar: string | null;
    };
}

export interface FriendUser {
    id: string;
    friendshipId?: string;
    name: string;
    username?: string | null;
    email?: string;
    avatar: string | null;
}

export interface FriendTabConfig {
    id: FriendTabType;
    label: string;
    count?: number;
}
