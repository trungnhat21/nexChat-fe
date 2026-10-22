import type { FeedPost, PostMedia } from "./post";
import type { ChangeEvent, RefObject } from "react";
import type { profileAssets, profileTabs } from "../../page/profile/config";

export type ProfileAssetId = keyof typeof profileAssets;
export type ProfileTab = typeof profileTabs[number]["id"];
export type ProfileDetails = {
    name: string; handle: string; role: string; specialty: string;
    bio: string; website: string; company: string; joined: string;
};
export type ProfileAssetProps = { id: ProfileAssetId; className?: string; alt?: string; src?: string | null };
export type ProfileDialog = {
    kind: "edit" | "notice" | "image" | "post" | "account";
    title: string; image?: ProfileAssetId; media?: PostMedia; postId?: string;
} | null;
export type ProfileNotice = (message: string) => void;
export type ProfileOpenDialog = (dialog: NonNullable<ProfileDialog>) => void;
export type ProfileHeroProps = {
    isOwner: boolean; postCount: number; uploading: boolean;
    details: ProfileDetails; coverSrc: string | null; avatarSrc: string | null;
    coverInputRef: RefObject<HTMLInputElement | null>; avatarInputRef: RefObject<HTMLInputElement | null>;
    onCoverChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onEdit: () => void; onShare: () => void; onOpen: ProfileOpenDialog;
};
export type ProfilePostProps = { post: FeedPost; onStateChange: import("./post").PostStateChange; onLike: import("./post").LikePostAction; onNotice: ProfileNotice; onOpen: ProfileOpenDialog };
export type ProfileUserAvatarProps = { name: string; src?: string | null; className?: string };

export type ProfileHighlightsProps = { onOpen: ProfileOpenDialog };

export type ProfileImageKind = "avatar" | "cover";
export type ProfileImageResponse = { success: boolean; kind: ProfileImageKind; url: string };
