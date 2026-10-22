import { useState } from "react";
import type { UserAvatarProps } from "../../../component/type/post";

export default function UserAvatar({ name, src, size = 40 }: UserAvatarProps) {
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const initials = name.trim().split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase() || "?";
    return <span className={`home-avatar home-avatar-${size} home-user-avatar`} aria-label={name}>
        {src && failedSrc !== src ? <img src={src} alt={name} onError={() => setFailedSrc(src)} /> : <span aria-hidden="true">{initials}</span>}
    </span>;
}
