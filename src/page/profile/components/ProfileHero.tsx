import ProfileUserAvatar from "./ProfileUserAvatar";
import Button from "../../../component/UI/Button/Button";
import { ProfileIcon, ProfileImage } from "./ProfileAsset";
import type { ProfileHeroProps } from "../../../component/type/profile";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

export default function ProfileHero({ uploading, isOwner, recipientId, postCount, details, coverSrc, avatarSrc, coverInputRef, avatarInputRef, onCoverChange, onAvatarChange, onRemoveAvatar, onEdit, onShare, onOpen, relationship, relationshipBusy, onFriendAction, onFollow }: ProfileHeroProps) {
    const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
    const avatarMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function closeOnOutside(event: PointerEvent) {
            if (event.target instanceof Node && !avatarMenuRef.current?.contains(event.target)) setAvatarMenuOpen(false);
        }
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setAvatarMenuOpen(false);
        }
        document.addEventListener("pointerdown", closeOnOutside);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("pointerdown", closeOnOutside);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);
    return <section className="profile-hero" aria-label="Thông tin trang cá nhân">
        <div className="profile-cover"><ProfileImage id="3360:518" src={coverSrc} alt="Ảnh bìa trang cá nhân" /><div className="profile-cover-gradient" />
            {isOwner && <button className="profile-cover-change" disabled={uploading} onClick={() => coverInputRef.current?.click()}><ProfileIcon id="3360:522" />Đổi ảnh bìa</button>}
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={!isOwner || uploading} aria-label="Chọn ảnh bìa" hidden onChange={onCoverChange} />
        </div>
        <div className="profile-hero-info"><div className="profile-avatar-row">
            <div className="profile-avatar-menu-wrap" ref={avatarMenuRef}>
                <button type="button" className="profile-main-avatar" disabled={!isOwner || uploading} aria-busy={uploading} aria-label={isOwner ? "Tùy chọn ảnh đại diện" : details.name} aria-haspopup="menu" aria-expanded={avatarMenuOpen} onClick={() => setAvatarMenuOpen(open => !open)}><ProfileUserAvatar src={avatarSrc} name={details.name} /></button>
                {isOwner && avatarMenuOpen && <div className="profile-avatar-menu" role="menu" aria-label="Tùy chọn ảnh đại diện">
                    <button type="button" role="menuitem" disabled={uploading} onClick={() => { setAvatarMenuOpen(false); avatarInputRef.current?.click(); }}>Đổi ảnh đại diện</button>
                    <button type="button" role="menuitem" disabled={uploading || !avatarSrc} onClick={() => { setAvatarMenuOpen(false); onRemoveAvatar(); }}>Xóa ảnh đại diện</button>
                </div>}
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={!isOwner || uploading} aria-label="Chọn ảnh đại diện" hidden onChange={onAvatarChange} />
            </div>
            <div className="profile-hero-actions">
                {isOwner ? <Button className="profile-primary" onClick={onEdit}><ProfileIcon id="3360:539" />Chỉnh sửa</Button> : <>
                    {(!relationship || relationship.friendStatus === "none") && <Button className="profile-primary" loadding={relationshipBusy} onClick={() => onFriendAction("request")}>Thêm bạn bè</Button>}
                    {relationship?.friendStatus === "outgoing" && <Button loadding={relationshipBusy} onClick={() => onFriendAction("cancel")}>Đã gửi · Hủy</Button>}
                    {relationship?.friendStatus === "incoming" && <><Button className="profile-primary" loadding={relationshipBusy} onClick={() => onFriendAction("accept")}>Chấp nhận</Button><Button loadding={relationshipBusy} onClick={() => onFriendAction("reject")}>Từ chối</Button></>}
                    {relationship?.friendStatus === "friends" && <Button loadding={relationshipBusy} onClick={() => onFriendAction("unfriend")}>Bạn bè · Hủy kết bạn</Button>}
                    {relationship && relationship.friendStatus !== "blocked" && <Button loadding={relationshipBusy} onClick={onFollow}>{relationship.following ? "Đang theo dõi" : "Theo dõi"}</Button>}
                </>}
                {!isOwner && recipientId && <Link className="profile-primary profile-message-link" to={`/messages?userId=${encodeURIComponent(recipientId)}`}>Nhắn tin</Link>}
                <button className="profile-square" aria-label="Chia sẻ trang cá nhân" onClick={onShare}><ProfileIcon id="3360:544" /></button>
                <button className="profile-square" aria-label="Tùy chọn trang cá nhân" onClick={() => onOpen({ kind: "account", title: "Tài khoản của bạn" })}><ProfileIcon id="3360:547" /></button>
            </div>
        </div>
        <div className="profile-identity"><h1>{details.name}</h1><p className="profile-handle">{details.handle}</p>
            {(details.role || details.specialty) && <div className="profile-role"><span><ProfileIcon id="3360:559" /><strong>{details.role}</strong></span><span className="profile-role-divider">•</span><span>{details.specialty}</span></div>}
            <p className="profile-bio">{details.bio}</p><div className="profile-meta"><button onClick={() => onOpen({ kind: "notice", title: details.website })}><ProfileIcon id="3360:571" />{details.website}</button><button onClick={() => onOpen({ kind: "notice", title: details.company })}><ProfileIcon id="3360:576" />{details.company}</button><span><ProfileIcon id="3360:581" />{details.joined}</span></div>
        </div>
        <div className="profile-follow-stats"><button onClick={() => onOpen({ kind: "notice", title: "Người theo dõi" })}><strong>{relationship?.followers ?? 0}</strong><span>Người theo dõi</span></button><button onClick={() => onOpen({ kind: "notice", title: "Đang theo dõi" })}><strong>{relationship?.followingCount ?? 0}</strong><span>Đang theo dõi</span></button><button onClick={() => onOpen({ kind: "notice", title: "Bạn bè" })}><strong>{relationship?.friends ?? 0}</strong><span>Bạn bè</span></button><button onClick={() => document.getElementById("profile-posts")?.scrollIntoView({ behavior: "smooth" })}><strong>{postCount}</strong><span>Bài viết</span></button></div>
        </div>
    </section>;
}
