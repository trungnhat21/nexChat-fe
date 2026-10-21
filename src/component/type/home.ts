import type { designAssets } from "../../page/home/config";

export type DesignAssetId = keyof typeof designAssets;
export type AvatarSize = 28 | 32 | 40 | 44 | 48;
export type AssetProps = { id: DesignAssetId; className?: string; alt?: string };
export type AvatarProps = { id: DesignAssetId; size?: AvatarSize; online?: boolean; alt?: string };
export type Story = { name: string; image: DesignAssetId; avatar: DesignAssetId };
export type FeedPost = {
    id: string;
    author: string;
    avatar: DesignAssetId;
    role: string;
    time: string;
    content: string;
    kind: "image" | "poll" | "text";
    likes: number;
    comments: number;
};
export type Comment = { id: string; author: string; text: string; avatar: DesignAssetId; time: string; likes: number };
export type HomeContextValue = { search: string; setSearch: (value: string) => void; announce: (message: string) => void; openPanel: (title: string) => void };
export type ComposerProps = { onPost: (text: string) => void };
export type PostCardProps = { post: FeedPost };
export type CommentItemProps = { comment: Comment; onReply: () => void };
