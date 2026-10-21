import Button from "../../../component/UI/Button/Button";
import { ProfileIcon, ProfileImage } from "./ProfileAsset";
import type { ProfileHeroProps } from "../../../component/type/profile";

export default function ProfileHero({ details, coverSrc, avatarSrc, coverInputRef, avatarInputRef, onCoverChange, onAvatarChange, onEdit, onShare, onOpen }: ProfileHeroProps) {
    return <section className="profile-hero" aria-label="Thông tin trang cá nhân">
        <div className="profile-cover">
            <ProfileImage id="3360:518" src={coverSrc} alt="Ảnh bìa trang cá nhân" />
            <div className="profile-cover-gradient" />
            <button className="profile-cover-change" onClick={() => coverInputRef.current?.click()}><ProfileIcon id="3360:522" />Đổi ảnh bìa</button>
            <input ref={coverInputRef} type="file" accept="image/*" aria-label="Chọn ảnh bìa" hidden onChange={onCoverChange} />
        </div>
        <div className="profile-hero-info">
            <div className="profile-avatar-row">
                <button className="profile-main-avatar" aria-label="Thay đổi ảnh đại diện" onClick={() => avatarInputRef.current?.click()}>
                    <ProfileImage id="3360:532" src={avatarSrc} alt={details.name} />
                    <span className="profile-avatar-badge"><ProfileIcon id="3360:534" /></span>
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" aria-label="Chọn ảnh đại diện" hidden onChange={onAvatarChange} />
                <div className="profile-hero-actions">
                    <Button className="profile-primary" onClick={onEdit}><ProfileIcon id="3360:539" />Chỉnh sửa</Button>
                    <button className="profile-square" aria-label="Chia sẻ trang cá nhân" onClick={onShare}><ProfileIcon id="3360:544" /></button>
                    <button className="profile-square" aria-label="Tùy chọn trang cá nhân" onClick={() => onOpen({ kind: "account", title: "Tài khoản của bạn" })}><ProfileIcon id="3360:547" /></button>
                </div>
            </div>
            <div className="profile-identity">
                <h1>{details.name}<ProfileIcon id="3360:554" /></h1>
                <p className="profile-handle">{details.handle}</p>
                <div className="profile-role"><span><ProfileIcon id="3360:559" /><strong>{details.role}</strong></span><span className="profile-role-divider">•</span><span>{details.specialty}</span></div>
                <p className="profile-bio">{details.bio}</p>
                <div className="profile-meta">
                    <button onClick={() => onOpen({ kind: "notice", title: details.website })}><ProfileIcon id="3360:571" />{details.website}</button>
                    <button onClick={() => onOpen({ kind: "notice", title: details.company })}><ProfileIcon id="3360:576" />{details.company}</button>
                    <span><ProfileIcon id="3360:581" />{details.joined}</span>
                </div>
            </div>
            <div className="profile-follow-stats">
                <button onClick={() => onOpen({ kind: "notice", title: "Người theo dõi" })}><strong>1.2k</strong><span>Người<br />theo dõi</span></button>
                <button onClick={() => onOpen({ kind: "notice", title: "Đang theo dõi" })}><strong>384</strong><span>Đang<br />theo dõi</span></button>
                <button onClick={() => document.getElementById("profile-posts")?.scrollIntoView({ behavior: "smooth" })}><strong>48</strong><span>Bài<br />viết</span></button>
            </div>
        </div>
    </section>;
}
