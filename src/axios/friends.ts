import api from "./index";
import type { RelationshipState, SuggestedUser } from "../component/type/relationship";

import type { ReceivedFriendRequest, FriendUser } from "../component/type/friends";

export async function getRelationship(userId: string) { return (await api.get<{ relationship: RelationshipState }>(`/friends/relationship/${userId}`)).data.relationship; }
export async function getFriendSuggestions() { return (await api.get<{ users: SuggestedUser[] }>("/friends/suggestions")).data.users; }
export type AcceptedFriend = { id: string; name: string; avatar: string | null };
export async function getAcceptedFriends() {
    const response = await api.get<{ friends: Array<{ id: string; user_name: string | null; first_name: string | null; last_name: string | null; avatar: string | null }> }>("/friends");
    return response.data.friends.map(friend => ({
        id: friend.id,
        name: [friend.last_name, friend.first_name].filter(Boolean).join(" ") || friend.user_name || "User",
        avatar: friend.avatar,
    }));
}

export async function getReceivedFriendRequests(): Promise<ReceivedFriendRequest[]> {
    const response = await api.get<{ success: boolean; requests: ReceivedFriendRequest[] }>("/friends/requests/received");
    return response.data.requests;
}

export async function getFriendsList(): Promise<FriendUser[]> {
    const response = await api.get<{
        success: boolean;
        friends: Array<{
            id: string;
            friendshipId?: string;
            user_name: string | null;
            first_name: string | null;
            last_name: string | null;
            avatar: string | null;
            email?: string;
        }>;
    }>("/friends");
    return response.data.friends.map(friend => ({
        id: friend.id,
        friendshipId: friend.friendshipId,
        name: [friend.last_name, friend.first_name].filter(Boolean).join(" ") || friend.user_name || "User",
        username: friend.user_name,
        email: friend.email,
        avatar: friend.avatar,
    }));
}
export async function sendFriendRequest(userId: string) {
    return (await api.post<{ success: boolean; friendship: { id: string; requesterId: string; addresseeId: string; status: string } }>("/friends/request", { addresseeId: userId })).data;
}
export async function cancelFriendRequest(requestId: string) { return api.delete(`/friends/requests/${requestId}`); }
export async function acceptFriendRequest(requestId: string) { return api.patch(`/friends/requests/${requestId}/accept`); }
export async function rejectFriendRequest(requestId: string) { return api.patch(`/friends/requests/${requestId}/reject`); }
export async function unfriend(userId: string) { return api.delete(`/friends/${userId}`); }
export async function followUser(userId: string) { return api.post(`/friends/follow/${userId}`); }
export async function unfollowUser(userId: string) { return api.delete(`/friends/follow/${userId}`); }
