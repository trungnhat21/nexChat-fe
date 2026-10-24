import api from "./index";
import type { StoryItem, StoryPage, StoryVisibility, StoryViewers } from "../component/type/story";

export async function listStories(cursor?: string) {
    return (await api.get<StoryPage>("/stories", { params: cursor ? { cursor } : undefined })).data;
}

export async function publishStory(file: File, caption: string, visibility: StoryVisibility, onProgress: (percent: number) => void) {
    const form = new FormData();
    form.append("media", file);
    form.append("caption", caption);
    form.append("visibility", visibility);
    return (await api.post<{ success: boolean; story: StoryItem }>("/stories", form, {
        headers: { "Content-Type": undefined },
        onUploadProgress: event => { if (event.total) onProgress(Math.min(99, Math.round(event.loaded / event.total * 100))); },
    })).data.story;
}

export async function viewStory(id: string) {
    return (await api.post<{ success: boolean; story: StoryItem }>(`/stories/${id}/view`)).data.story;
}

export async function reactToStory(id: string, reaction: string) {
    return (await api.post<{ success: boolean; story: StoryItem }>(`/stories/${id}/reaction`, { reaction })).data.story;
}

export async function removeStoryReaction(id: string) {
    return (await api.delete<{ success: boolean; story: StoryItem }>(`/stories/${id}/reaction`)).data.story;
}

export async function getStoryViewers(id: string) {
    return (await api.get<StoryViewers>(`/stories/${id}/viewers`)).data.viewers;
}

export async function deleteStory(id: string) {
    return (await api.delete<{ success: boolean }>(`/stories/${id}`)).data;
}
