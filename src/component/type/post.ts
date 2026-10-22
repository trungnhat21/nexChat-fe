export type PostPrivacy = "public" | "friends" | "private";
export type PostMedia = { id: string; url: string; type: string; name: string; size: number };
export type FeedPost = {
    id: string; content: string; privacy: PostPrivacy; createdAt: string; updatedAt: string;
    canEdit: boolean; author: { id: string; name: string; handle: string | null; avatar: string | null };
    liked: boolean; likes: number; saved: boolean; comments: number; media: PostMedia[];
    isRepost: boolean; original: FeedPost | null;
};
export type PostLikeResult = { success: boolean; id: string; liked: boolean; likes: number };
export type LikePostAction = (id: string, liked: boolean) => Promise<void>;
export type PostDraft = { content: string; privacy: PostPrivacy; files: File[]; keepMediaIds: string[] };
export type ProfileAuthor = { id: string; name: string; handle: string | null; avatar: string | null; cover?: string | null; bio: string | null; createdAt: string };
export type PostPage = { success: boolean; posts: FeedPost[]; nextCursor: string | null; total?: number; author?: ProfileAuthor };
export type PostResult = { success: boolean; post: FeedPost };
export type NewPostMedia = { id: string; file: File; url: string };
export type UploadProgress = (percent: number) => void;
export type ComposerProps = { onPost: (draft: PostDraft, onProgress: UploadProgress) => Promise<void>; post?: FeedPost; onCancel?: () => void };
export type PostStateChange = (id: string, patch: Partial<Pick<FeedPost, "saved" | "comments">>) => void;
export type PostCardProps = { post: FeedPost; onStateChange: PostStateChange; onLike: LikePostAction; onUpdate: (id: string, draft: PostDraft, onProgress: UploadProgress) => Promise<void>; onDelete: (id: string) => Promise<void>; onReload: () => void };
export type UserAvatarProps = { name: string; src?: string | null | undefined; size?: 28 | 32 | 40 | 44 | 48 };

export type PostComment = { id: string; postId: string; content: string; createdAt: string; updatedAt: string; canEdit: boolean; author: { id: string; name: string; avatar: string | null } };
export type CommentPage = { success: boolean; comments: PostComment[]; total: number; nextCursor: string | null };
export type CommentResult = { success: boolean; comment: PostComment | null; total: number };
export type SavedResult = { success: boolean; id: string; saved: boolean };
export type PostInteractionsProps = { post: FeedPost; variant: "home" | "profile"; children: import("react").ReactNode; onStateChange: PostStateChange; onNotice: (message: string) => void; onReposted?: () => void };
