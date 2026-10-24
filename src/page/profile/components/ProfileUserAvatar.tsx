import { useState } from "react";
import type { ProfileUserAvatarProps } from "../../../component/type/profile";

export default function ProfileUserAvatar({ name, src, className = "" }: ProfileUserAvatarProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    return <span className={`profile-user-avatar ${className}`}>{src && failedSrc !== src ? <img src={src} alt={name} onError={() => setFailedSrc(src)} /> : <span role="img" aria-label={name}>{name.trim().split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase() || "?"}</span>}</span>;
}
