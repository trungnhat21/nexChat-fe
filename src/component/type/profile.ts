import type { ChangeEvent, RefObject } from "react";
import type { profileAssets, profileTabs } from "../../page/profile/config";

export type ProfileAssetId = keyof typeof profileAssets;
export type ProfileTab = typeof profileTabs[number]["id"];
export type ProfileDetails = {
    name: string; handle: string; role: string; specialty: string;
    bio: string; website: string; company: string; joined: string;
};
export type ProfileAssetProps = { id: ProfileAssetId; className?: string; alt?: string; src?: string | null };
export type ProfilePost = {
    id: string; kind: "pinned" | "poll" | "image"; time: string; content: string;
    tags?: string[]; likes: number; comments: number; shares: number;
    assets: {
        avatar: ProfileAssetId; verified: ProfileAssetId; globe: ProfileAssetId;
        more: ProfileAssetId; reaction: ProfileAssetId; heart?: ProfileAssetId;
        like: ProfileAssetId; comment: ProfileAssetId; share: ProfileAssetId;
    };
};
export type ProfileDialog = {
    kind: "edit" | "notice" | "image" | "post" | "account";
    title: string; image?: ProfileAssetId; postId?: string;
} | null;
export type ProfileNotice = (message: string) => void;
export type ProfileOpenDialog = (dialog: NonNullable<ProfileDialog>) => void;
export type ProfileHeroProps = {
    details: ProfileDetails; coverSrc: string | null; avatarSrc: string | null;
    coverInputRef: RefObject<HTMLInputElement | null>; avatarInputRef: RefObject<HTMLInputElement | null>;
    onCoverChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onEdit: () => void; onShare: () => void; onOpen: ProfileOpenDialog;
};
export type ProfilePostProps = {
    post: ProfilePost; details: ProfileDetails; avatarSrc: string | null;
    onNotice: ProfileNotice; onOpen: ProfileOpenDialog;
};
export type ProfileComment = { id: string; text: string };
export type ProfilePollProps = { onNotice: ProfileNotice; onDiscuss: () => void };

export type ProfileHighlightsProps = { onOpen: ProfileOpenDialog };
