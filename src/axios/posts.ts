import api from "./index";
import type { CommentPage, CommentResult, SavedResult, PostPrivacy, PostDraft, PostLikeResult, PostPage, PostResult, UploadProgress } from "../component/type/post";

export type PostSort = "relevance" | "latest" | "newest";
export type PostPeriod = "all" | "24h" | "day" | "week" | "month";

export interface ListPostsParams {
    search?: string;
    cursor?: string;
    authorId?: string;
    sort?: PostSort;
    period?: PostPeriod;
    mediaOnly?: boolean;
}

export async function listPosts(
    searchOrParams: string | ListPostsParams = "",
    cursor?: string,
    signal?: AbortSignal,
    authorId?: string
) {
    let params: Record<string, unknown> = {};
    if (typeof searchOrParams === "object" && searchOrParams !== null) {
        params = {
            search: searchOrParams.search || undefined,
            cursor: searchOrParams.cursor || undefined,
            authorId: searchOrParams.authorId || undefined,
            sort: searchOrParams.sort || undefined,
            period: searchOrParams.period && searchOrParams.period !== "all" ? searchOrParams.period : undefined,
            mediaOnly: searchOrParams.mediaOnly ? true : undefined,
        };
    } else {
        params = {
            search: searchOrParams || undefined,
            cursor: cursor || undefined,
            authorId: authorId || undefined,
        };
    }
    const response = await api.get<PostPage>("/posts", { params, signal });
    return response.data;
}
function postForm(draft: PostDraft) {
    const data = new FormData();
    data.append("content", draft.content);
    data.append("privacy", draft.privacy);
    data.append("keepMediaIds", JSON.stringify(draft.keepMediaIds));
    draft.files.forEach(file => data.append("media", file));
    return data;
}
export async function createPost(draft: PostDraft, onProgress: UploadProgress) {
    const response = await api.post<PostResult>("/posts", postForm(draft), { headers: { "Content-Type": undefined }, onUploadProgress: event => { if (event.total) onProgress(Math.min(99, Math.round(event.loaded / event.total * 100))); } });
    return response.data.post;
}
export async function updatePost(id: string, draft: PostDraft, onProgress: UploadProgress) {
    const response = await api.patch<PostResult>("/posts/" + id, postForm(draft), { headers: { "Content-Type": undefined }, onUploadProgress: event => { if (event.total) onProgress(Math.min(99, Math.round(event.loaded / event.total * 100))); } });
    return response.data.post;
}
export async function deletePost(id: string) { await api.delete("/posts/" + id); }

export async function setPostLike(id: string, liked: boolean) {
    const response = liked
        ? await api.put<PostLikeResult>("/posts/" + id + "/like")
        : await api.delete<PostLikeResult>("/posts/" + id + "/like");
    return response.data;
}

export async function getPost(id: string, signal?: AbortSignal) {
    return (await api.get<PostResult>("/posts/" + id, { signal })).data;
}
export async function listSavedPosts(
    searchOrParams: string | ListPostsParams = "",
    cursor?: string,
    signal?: AbortSignal
) {
    let params: Record<string, unknown> = {};
    if (typeof searchOrParams === "object" && searchOrParams !== null) {
        params = {
            search: searchOrParams.search || undefined,
            cursor: searchOrParams.cursor || undefined,
            sort: searchOrParams.sort || undefined,
            period: searchOrParams.period && searchOrParams.period !== "all" ? searchOrParams.period : undefined,
            mediaOnly: searchOrParams.mediaOnly ? true : undefined,
        };
    } else {
        params = {
            search: searchOrParams || undefined,
            cursor: cursor || undefined,
        };
    }
    return (await api.get<PostPage>("/posts/saved", { params, signal })).data;
}
export async function setPostSaved(id: string, saved: boolean) {
    const response = saved ? await api.put<SavedResult>("/posts/" + id + "/save") : await api.delete<SavedResult>("/posts/" + id + "/save");
    return response.data;
}
export async function repostPost(id: string, content: string, privacy: PostPrivacy) {
    return (await api.post<PostResult>("/posts/" + id + "/repost", { content, privacy })).data.post;
}
export async function listComments(id: string, cursor?: string, signal?: AbortSignal) {
    return (await api.get<CommentPage>("/posts/" + id + "/comments", { params: { cursor }, signal })).data;
}
export async function createComment(id: string, content: string, parentCommentId?: string) {
    return (await api.post<CommentResult>("/posts/" + id + "/comments", { content, ...(parentCommentId ? { parentCommentId } : {}) })).data;
}
export async function editComment(postId: string, id: string, content: string) {
    return (await api.patch<CommentResult>("/posts/" + postId + "/comments/" + id, { content })).data;
}
export async function deleteComment(postId: string, id: string) {
    return (await api.delete<CommentResult>("/posts/" + postId + "/comments/" + id)).data;
}
