import api from "./index";
import type { RelationshipState, SuggestedUser } from "../component/type/relationship";

export async function getRelationship(userId: string) { return (await api.get<{ relationship: RelationshipState }>(`/friends/relationship/${userId}`)).data.relationship; }
export async function getFriendSuggestions() { return (await api.get<{ users: SuggestedUser[] }>("/friends/suggestions")).data.users; }
export async function sendFriendRequest(userId: string) {
    return (await api.post<{ success: boolean; friendship: { id: string; requesterId: string; addresseeId: string; status: string } }>("/friends/request", { addresseeId: userId })).data;
}
export async function cancelFriendRequest(requestId: string) { return api.delete(`/friends/requests/${requestId}`); }
export async function acceptFriendRequest(requestId: string) { return api.patch(`/friends/requests/${requestId}/accept`); }
export async function rejectFriendRequest(requestId: string) { return api.patch(`/friends/requests/${requestId}/reject`); }
export async function unfriend(userId: string) { return api.delete(`/friends/${userId}`); }
export async function followUser(userId: string) { return api.post(`/friends/follow/${userId}`); }
export async function unfollowUser(userId: string) { return api.delete(`/friends/follow/${userId}`); }
