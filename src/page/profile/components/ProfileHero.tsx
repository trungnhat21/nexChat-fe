import ProfileUserAvatar from "./ProfileUserAvatar";
import Button from "../../../component/UI/Button/Button";
import { ProfileIcon, ProfileImage } from "./ProfileAsset";
import type { ProfileHeroProps } from "../../../component/type/profile";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";

export default function ProfileHero({ uploading, isOwner, recipientId, postCount, details, coverSrc, avatarSrc, coverInputRef, avatarInputRef, onCoverChange, onAvatarChange, onRemoveAvatar, onRemoveCover, onEdit, onShare, onOpen, relationship, relationshipBusy, onFriendAction, onFollow }: ProfileHeroProps) {
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
    return <section className="profile-hero card border-0 shadow-sm overflow-hidden mb-4" aria-label="Thông tin trang cá nhân">
        <div className="profile-cover position-relative overflow-hidden">
            {coverSrc && <ProfileImage id="3360:518" src={coverSrc} alt="Ảnh bìa trang cá nhân" />}
            <div className="profile-cover-gradient" />
            {isOwner && (
                <div className="profile-cover-actions position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2 z-1">
                    {coverSrc && (
                        <button type="button" className="btn btn-sm btn-light-danger fw-semibold py-1 px-3 fs-9" disabled={uploading} onClick={onRemoveCover}>
                            Xóa ảnh bìa
                        </button>
                    )}
                    <button type="button" className="btn btn-sm btn-light-primary fw-semibold py-1 px-3 fs-9 d-inline-flex align-items-center gap-1" disabled={uploading} onClick={() => coverInputRef.current?.click()}>
                        <ProfileIcon id="3360:522" />
                        Đổi ảnh bìa
                    </button>
                </div>
            )}
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={!isOwner || uploading} aria-label="Chọn ảnh bìa" hidden onChange={onCoverChange} />
        </div>
        <div className="profile-hero-info card-body p-4 p-sm-6 pt-0 position-relative">
            <div className="profile-avatar-row d-flex justify-content-between align-items-end gap-3">
                <div className="profile-avatar-menu-wrap position-relative flex-shrink-0" ref={avatarMenuRef}>
                    <button type="button" className="profile-main-avatar border-0" disabled={!isOwner || uploading} aria-busy={uploading} aria-label={isOwner ? "Tùy chọn ảnh đại diện" : details.name} aria-haspopup="menu" aria-expanded={avatarMenuOpen} onClick={() => setAvatarMenuOpen(open => !open)}>
                        <ProfileUserAvatar src={avatarSrc} name={details.name} />
                    </button>
                    {isOwner && avatarMenuOpen && (
                        <div className="profile-avatar-menu card border border-gray-200 shadow-sm p-2 position-absolute top-100 start-0 z-3" role="menu" aria-label="Tùy chọn ảnh đại diện">
                            <button type="button" role="menuitem" className="btn btn-flush text-start w-100 p-2 fs-7 rounded-2 text-gray-800" disabled={uploading} onClick={() => { setAvatarMenuOpen(false); avatarInputRef.current?.click(); }}>
                                Đổi ảnh đại diện
                            </button>
                            <button type="button" role="menuitem" className="btn btn-flush text-start w-100 p-2 fs-7 rounded-2 text-danger" disabled={uploading || !avatarSrc} onClick={() => { setAvatarMenuOpen(false); onRemoveAvatar(); }}>
                                Xóa ảnh đại diện
                            </button>
                        </div>
                    )}
                    <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" disabled={!isOwner || uploading} aria-label="Chọn ảnh đại diện" hidden onChange={onAvatarChange} />
                </div>
                <div className="profile-hero-actions d-flex align-items-center gap-2 pb-1">
                    {isOwner ? (
                        <Button variant="primary" size="sm" className="d-inline-flex align-items-center gap-1" onClick={onEdit}>
                            <ProfileIcon id="3360:539" />
                            Chỉnh sửa
                        </Button>
                    ) : (
                        <>
                            {(!relationship || relationship.friendStatus === "none") && <Button variant="primary" size="sm" loadding={relationshipBusy} onClick={() => onFriendAction("request")}>Thêm bạn bè</Button>}
                            {relationship?.friendStatus === "outgoing" && <Button variant="light" size="sm" loadding={relationshipBusy} onClick={() => onFriendAction("cancel")}>Đã gửi · Hủy</Button>}
                            {relationship?.friendStatus === "incoming" && (
                                <>
                                    <Button variant="primary" size="sm" loadding={relationshipBusy} onClick={() => onFriendAction("accept")}>Chấp nhận</Button>
                                    <Button variant="light" size="sm" loadding={relationshipBusy} onClick={() => onFriendAction("reject")}>Từ chối</Button>
                                </>
                            )}
                            {relationship?.friendStatus === "friends" && <Button variant="light" size="sm" loadding={relationshipBusy} onClick={() => onFriendAction("unfriend")}>Bạn bè · Hủy kết bạn</Button>}
                            {relationship && relationship.friendStatus !== "blocked" && <Button variant="light" size="sm" loadding={relationshipBusy} onClick={onFollow}>{relationship.following ? "Đang theo dõi" : "Theo dõi"}</Button>}
                        </>
                    )}
                    {!isOwner && recipientId && (
                        <Link className="btn btn-sm btn-primary profile-message-link d-inline-flex align-items-center" to={`/messages?userId=${encodeURIComponent(recipientId)}`}>
                            Nhắn tin
                        </Link>
                    )}
                    <button type="button" className="btn btn-icon btn-sm btn-light-primary rounded-2 profile-square" aria-label="Chia sẻ trang cá nhân" onClick={onShare}>
                        <ProfileIcon id="3360:544" />
                    </button>
                    <button type="button" className="btn btn-icon btn-sm btn-light-primary rounded-2 profile-square" aria-label="Tùy chọn trang cá nhân" onClick={() => onOpen({ kind: "account", title: "Tài khoản của bạn" })}>
                        <ProfileIcon id="3360:547" />
                    </button>
                </div>
            </div>
            <div className="profile-identity mt-3 d-flex flex-column gap-1">
                <h1 className="d-flex align-items-center gap-2 fs-2 fw-bold text-gray-900 m-0">{details.name}</h1>
                <p className="profile-handle text-muted fs-8 fw-medium m-0">{details.handle}</p>
                {(details.role || details.specialty) && (
                    <div className="profile-role d-flex align-items-center gap-2 pt-1 fs-7 text-gray-700">
                        <span className="d-flex align-items-center gap-1"><ProfileIcon id="3360:559" /><strong className="text-primary fw-semibold">{details.role}</strong></span>
                        <span className="profile-role-divider text-muted">•</span>
                        <span className="text-muted">{details.specialty}</span>
                    </div>
                )}
                <p className="profile-bio pt-2 fs-7 text-gray-800 m-0">{details.bio}</p>
                <div className="profile-meta py-2 fs-8 text-muted">
                    <button type="button" className="btn btn-flush p-0 text-primary fs-8 fw-medium" onClick={() => onOpen({ kind: "notice", title: details.website })}>
                        <ProfileIcon id="3360:571" />{details.website}
                    </button>
                    <button type="button" className="btn btn-flush p-0 text-muted fs-8" onClick={() => onOpen({ kind: "notice", title: details.company })}>
                        <ProfileIcon id="3360:576" />{details.company}
                    </button>
                    <span className="d-flex align-items-center gap-1">
                        <ProfileIcon id="3360:581" />{details.joined}
                    </span>
                </div>
            </div>
            <div className="profile-follow-stats d-flex align-items-center gap-4 gap-sm-6 p-3 px-4 bg-light rounded-3 mt-3">
                <button type="button" className="btn btn-flush p-0 d-flex align-items-center gap-2" onClick={() => onOpen({ kind: "notice", title: "Người theo dõi" })}>
                    <strong className="fs-6 fw-bold text-gray-900">{relationship?.followers ?? 0}</strong>
                    <span className="fs-8 text-muted">Người theo dõi</span>
                </button>
                <button type="button" className="btn btn-flush p-0 d-flex align-items-center gap-2" onClick={() => onOpen({ kind: "notice", title: "Đang theo dõi" })}>
                    <strong className="fs-6 fw-bold text-gray-900">{relationship?.followingCount ?? 0}</strong>
                    <span className="fs-8 text-muted">Đang theo dõi</span>
                </button>
                <button type="button" className="btn btn-flush p-0 d-flex align-items-center gap-2" onClick={() => onOpen({ kind: "notice", title: "Bạn bè" })}>
                    <strong className="fs-6 fw-bold text-gray-900">{relationship?.friends ?? 0}</strong>
                    <span className="fs-8 text-muted">Bạn bè</span>
                </button>
                <button type="button" className="btn btn-flush p-0 d-flex align-items-center gap-2" onClick={() => document.getElementById("profile-posts")?.scrollIntoView({ behavior: "smooth" })}>
                    <strong className="fs-6 fw-bold text-gray-900">{postCount}</strong>
                    <span className="fs-8 text-muted">Bài viết</span>
                </button>
            </div>
        </div>
    </section>;
}
