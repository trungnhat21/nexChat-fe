import ProfileUserAvatar from "./ProfileUserAvatar";
import Button from "../../../component/UI/Button/Button";
import { ProfileIcon, ProfileImage } from "./ProfileAsset";
import type { ProfileHeroProps } from "../../../component/type/profile";

export default function ProfileHero({ uploading, isOwner, postCount, details, coverSrc, avatarSrc, coverInputRef, avatarInputRef, onCoverChange, onAvatarChange, onEdit, onShare, onOpen }: ProfileHeroProps) {
    return <section className="profile-hero" aria-label="Thông tin trang cá nhân">
        <div className="profile-cover">
            <ProfileImage id="3360:518" src={coverSrc} alt="Ảnh bìa trang cá nhân" />
            <div className="profile-cover-gradient" />
            {isOwner && <button className="profile-cover-change" disabled={uploading} onClick={() => coverInputRef.current?.click()}><ProfileIcon id="3360:522" />Đổi ảnh bìa</button>}
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={!isOwner || uploading} aria-label="Chọn ảnh bìa" hidden onChange={onCoverChange} />
        </div>
        <div className="profile-hero-info">
            <div className="profile-avatar-row">
                <button className="profile-main-avatar" disabled={!isOwner || uploading} aria-busy={uploading} aria-label={isOwner ? "Thay đổi ảnh đại diện" : details.name} onClick={() => avatarInputRef.current?.click()}>
                    <ProfileUserAvatar src={avatarSrc} name={details.name} />
                </button>
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={!isOwner || uploading} aria-label="Chọn ảnh đại diện" hidden onChange={onAvatarChange} />
                <div className="profile-hero-actions">
                    {isOwner && <Button className="profile-primary" onClick={onEdit}><ProfileIcon id="3360:539" />Chỉnh sửa</Button>}
                    <button className="profile-square" aria-label="Chia sẻ trang cá nhân" onClick={onShare}><ProfileIcon id="3360:544" /></button>
                    <button className="profile-square" aria-label="Tùy chọn trang cá nhân" onClick={() => onOpen({ kind: "account", title: "Tài khoản của bạn" })}><ProfileIcon id="3360:547" /></button>
                </div>
            </div>
            <div className="profile-identity">
                <h1>{details.name}</h1>
                <p className="profile-handle">{details.handle}</p>
                {(details.role || details.specialty) && <div className="profile-role"><span><ProfileIcon id="3360:559" /><strong>{details.role}</strong></span><span className="profile-role-divider">•</span><span>{details.specialty}</span></div>}
                <p className="profile-bio">{details.bio}</p>
                <div className="profile-meta">
                    <button onClick={() => onOpen({ kind: "notice", title: details.website })}><ProfileIcon id="3360:571" />{details.website}</button>
                    <button onClick={() => onOpen({ kind: "notice", title: details.company })}><ProfileIcon id="3360:576" />{details.company}</button>
                    <span><ProfileIcon id="3360:581" />{details.joined}</span>
                </div>
            </div>
            <div className="profile-follow-stats">
                <button onClick={() => onOpen({ kind: "notice", title: "Người theo dõi" })}><strong>—</strong><span>Người<br />theo dõi</span></button>
                <button onClick={() => onOpen({ kind: "notice", title: "Đang theo dõi" })}><strong>—</strong><span>Đang<br />theo dõi</span></button>
                <button onClick={() => document.getElementById("profile-posts")?.scrollIntoView({ behavior: "smooth" })}><strong>{postCount}</strong><span>Bài<br />viết</span></button>
            </div>
        </div>
    </section>;
}
