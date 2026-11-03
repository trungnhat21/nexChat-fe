import api from "./index";
import type { FeedPost } from "../component/type/post";

export type GroupPrivacy = "PUBLIC" | "PRIVATE";
export type GroupRole = "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";
export type GroupMemberStatus = "JOINED" | "PENDING" | "BANNED";

export interface GroupMember {
    groupId: string;
    userId: string;
    role: GroupRole;
    status: GroupMemberStatus;
    joinedAt: string;
    user?: {
        id: string;
        userName: string | null;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
    };
}

export interface Group {
    id: string;
    name: string;
    description: string | null;
    cover_image: string | null;
    avatar: string | null;
    privacy: GroupPrivacy;
    requires_approval: boolean;
    creator_id: string;
    created_at: string;
    updated_at: string;
    memberCount?: number;
    membership?: {
        role: GroupRole;
        status: GroupMemberStatus;
        joinedAt?: string;
    } | null;
}

export interface CreateGroupInput {
    name: string;
    description?: string | null;
    cover_image?: string | null;
    avatar?: string | null;
    privacy?: GroupPrivacy;
    requires_approval?: boolean;
}

export interface GroupsResponse {
    success: boolean;
    joined: Group[];
    suggested: Group[];
}

export interface SingleGroupResponse {
    success: boolean;
    group: Group;
}

export interface GroupActionResponse {
    success: boolean;
    message: string;
    membership?: GroupMember;
}

export interface GroupPostsResponse {
    success: boolean;
    posts: FeedPost[];
    nextCursor: string | null;
}

export interface GroupMembersResponse {
    success: boolean;
    total: number;
    page: number;
    limit: number;
    members: GroupMember[];
}

/**
 * Lấy danh sách nhóm đã tham gia và các nhóm gợi ý khám phá
 */
export async function getGroups(): Promise<{ joined: Group[]; suggested: Group[] }> {
    const response = await api.get<GroupsResponse>("/groups");
    return {
        joined: response.data.joined ?? [],
        suggested: response.data.suggested ?? [],
    };
}

/**
 * Tạo nhóm cộng đồng mới
 */
export async function createGroup(data: CreateGroupInput): Promise<Group> {
    const response = await api.post<SingleGroupResponse>("/groups", data);
    return response.data.group;
}

/**
 * Tham gia nhóm (PUBLIC -> JOINED, PRIVATE -> PENDING)
 */
export async function joinGroup(groupId: string): Promise<GroupActionResponse> {
    const response = await api.post<GroupActionResponse>(`/groups/${groupId}/join`);
    return response.data;
}

/**
 * Rời nhóm
 */
export async function leaveGroup(groupId: string): Promise<GroupActionResponse> {
    const response = await api.post<GroupActionResponse>(`/groups/${groupId}/leave`);
    return response.data;
}

/**
 * Lấy chi tiết nhóm
 */
export async function getGroupDetail(groupId: string): Promise<Group> {
    const response = await api.get<SingleGroupResponse>(`/groups/${groupId}`);
    return response.data.group;
}

/**
 * Lấy danh sách bài viết đã duyệt của nhóm (cursor pagination)
 */
export async function getGroupPosts(
    groupId: string,
    cursor?: string,
    limit = 20
): Promise<GroupPostsResponse> {
    const response = await api.get<GroupPostsResponse>(`/groups/${groupId}/posts`, {
        params: { cursor: cursor || undefined, limit },
    });
    return response.data;
}

/**
 * Lấy danh sách bài viết đang chờ duyệt trong nhóm (dành cho Admin/Mod)
 */
export async function getGroupPendingPosts(
    groupId: string,
    cursor?: string,
    limit = 20
): Promise<GroupPostsResponse> {
    const response = await api.get<GroupPostsResponse>(`/groups/${groupId}/pending-posts`, {
        params: { cursor: cursor || undefined, limit },
    });
    return response.data;
}

/**
 * Phê duyệt hoặc từ chối bài viết nhóm
 */
export async function approveGroupPost(
    groupId: string,
    postId: string,
    action: "approve" | "reject"
): Promise<{ success: boolean; message: string; post?: FeedPost }> {
    const response = await api.patch<{ success: boolean; message: string; post?: FeedPost }>(
        `/groups/${groupId}/posts/${postId}/approve`,
        { action }
    );
    return response.data;
}

/**
 * Lấy danh sách thành viên nhóm (kèm phân trang và lọc)
 */
export async function getGroupMembers(
    groupId: string,
    page = 1,
    limit = 20,
    role?: GroupRole,
    status?: GroupMemberStatus
): Promise<GroupMembersResponse> {
    const response = await api.get<GroupMembersResponse>(`/groups/${groupId}/members`, {
        params: { page, limit, role, status },
    });
    return response.data;
}

/**
 * Cập nhật thành viên nhóm (Duyệt PENDING -> JOINED, đổi role)
 */
export async function updateGroupMember(
    groupId: string,
    userId: string,
    data: { role?: GroupRole; status?: GroupMemberStatus }
): Promise<{ success: boolean; message: string; membership: GroupMember }> {
    const response = await api.patch<{ success: boolean; message: string; membership: GroupMember }>(
        `/groups/${groupId}/members/${userId}`,
        data
    );
    return response.data;
}

/**
 * Xóa thành viên khỏi nhóm hoặc từ chối yêu cầu tham gia
 */
export async function removeGroupMember(
    groupId: string,
    userId: string
): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
        `/groups/${groupId}/members/${userId}`
    );
    return response.data;
}

/**
 * Lấy top nhóm có số lượng thành viên nhiều nhất
 */
export async function getTopGroups(limit = 3): Promise<Group[]> {
    try {
        const response = await api.get<{ success: boolean; groups: Group[] }>("/groups/top", {
            params: { limit },
        });
        return response.data.groups ?? [];
    } catch {
        const fallback = await getGroups();
        const all = [...fallback.joined, ...fallback.suggested];
        const unique = Array.from(new Map(all.map((g) => [g.id, g])).values());
        unique.sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0));
        return unique.slice(0, limit);
    }
}
