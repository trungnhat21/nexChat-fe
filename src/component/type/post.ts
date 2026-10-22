export type PostPrivacy = "public" | "friends" | "private";
export type PostMedia = { id: string; url: string; type: string; name: string; size: number };
export type FeedPost = {
    id: string; content: string; privacy: PostPrivacy; createdAt: string; updatedAt: string;
    canEdit: boolean; author: { id: string; name: string; handle: string | null; avatar: string | null };
    likes: number; comments: number; media: PostMedia[];
};
export type PostDraft = { content: string; privacy: PostPrivacy; files: File[]; keepMediaIds: string[] };
export type ProfileAuthor = { id: string; name: string; handle: string | null; avatar: string | null; cover?: string | null; bio: string | null; createdAt: string };
export type PostPage = { success: boolean; posts: FeedPost[]; nextCursor: string | null; total?: number; author?: ProfileAuthor };
export type PostResult = { success: boolean; post: FeedPost };
export type NewPostMedia = { id: string; file: File; url: string };
export type UploadProgress = (percent: number) => void;
export type ComposerProps = { onPost: (draft: PostDraft, onProgress: UploadProgress) => Promise<void>; post?: FeedPost; onCancel?: () => void };
export type PostCardProps = { post: FeedPost; onUpdate: (id: string, draft: PostDraft, onProgress: UploadProgress) => Promise<void>; onDelete: (id: string) => Promise<void>; onReload: () => void };
export type UserAvatarProps = { name: string; src?: string | null | undefined; size?: 28 | 32 | 40 | 44 | 48 };
