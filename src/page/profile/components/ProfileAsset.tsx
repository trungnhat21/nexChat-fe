import { profileAssets } from "../config";
import type { ProfileAssetProps } from "../../../component/type/profile";

export function ProfileImage({ id, className = "", alt = "", src }: ProfileAssetProps) {
    return <span className={`profile-image ${className} ${src ? "is-custom" : ""}`} data-profile-asset={id}>
        <img src={src || profileAssets[id].src} alt={alt} />
    </span>;
}

export function ProfileIcon({ id, className = "" }: ProfileAssetProps) {
    return <span className={`profile-icon ${className}`} aria-hidden="true" data-profile-asset={id}>
        <img src={profileAssets[id].src} alt="" />
    </span>;
}
