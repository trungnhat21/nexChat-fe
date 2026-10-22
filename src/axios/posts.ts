import api from "./index";
import type { PostDraft, PostPage, PostResult, UploadProgress } from "../component/type/post";

export async function listPosts(search = "", cursor?: string, signal?: AbortSignal, authorId?: string) {
    const response = await api.get<PostPage>("/posts", { params: { search, cursor, authorId }, signal });
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
