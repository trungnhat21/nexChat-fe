import type { CurrentUser } from "./auth";
import type { designAssets } from "../../page/home/config";

export type DesignAssetId = keyof typeof designAssets;
export type AvatarSize = 28 | 32 | 40 | 44 | 48;
export type AssetProps = { id: DesignAssetId; className?: string; alt?: string };
export type AvatarProps = { id: DesignAssetId; size?: AvatarSize; online?: boolean; alt?: string };
export type Story = { name: string; image: DesignAssetId; avatar: DesignAssetId };
export type HomeContextValue = { user: CurrentUser | null; search: string; setSearch: (value: string) => void; announce: (message: string) => void; openPanel: (title: string) => void };
