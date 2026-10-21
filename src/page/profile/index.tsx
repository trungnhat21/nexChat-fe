import { Link } from "react-router";
import Button from "../../component/UI/Button/Button";
import Input from "../../component/UI/Input/Input";
import { useProfileActions } from "./actions";
import { highlights, profileAssets, profileEditFields, profilePosts, profileTabs } from "./config";
import { ProfileIcon, ProfileImage } from "./components/ProfileAsset";
import ProfileHero from "./components/ProfileHero";
import ProfileHighlights from "./components/ProfileHighlights";
import ProfilePostCard from "./components/ProfilePostCard";
import "./style.scss";

export default function ProfilePage() {
    const { details, draft, setDraft, activeTab, setActiveTab, savedPosts, dialog, setDialog, notice, setNotice, dialogRef, cover, avatar, editProfile, saveProfile, toggleSave, shareProfile, loggingOut, handleLogout } = useProfileActions();
    const posts = activeTab === "saved" ? profilePosts.filter(post => savedPosts.includes(post.id)) : profilePosts;

    return <div className="pulse-profile">
        <a className="profile-skip-link" href="#profile-posts">Chuyển đến nội dung</a>
        <header className="profile-header"><div className="profile-header-inner">
            <div className="profile-header-start"><Link className="profile-icon-button" to="/home" aria-label="Quay lại bảng tin"><ProfileIcon id="3360:870" /></Link><Link to="/home" aria-label="Pulse — Trang chủ"><ProfileImage id="3360:872" className="profile-logo" /></Link><h2>Ho So Ca Nhan</h2></div>
            <div className="profile-header-end"><button className="profile-icon-button" aria-label="Cài đặt trang cá nhân" onClick={() => setDialog({ kind: "account", title: "Tài khoản của bạn" })}><ProfileIcon id="3360:877" /></button><button className="profile-header-account" aria-label="Tài khoản của bạn" onClick={() => setDialog({ kind: "account", title: "Tài khoản của bạn" })}><ProfileImage id="3360:880" src={avatar.src} /></button></div>
        </div></header>
        <main className="profile-shell">
            <ProfileHero details={details} coverSrc={cover.src} avatarSrc={avatar.src} coverInputRef={cover.inputRef} avatarInputRef={avatar.inputRef} onCoverChange={cover.onChange} onAvatarChange={avatar.onChange} onEdit={editProfile} onShare={shareProfile} onOpen={setDialog} />
            <ProfileHighlights onOpen={setDialog} />
            <nav className="profile-tabs" aria-label="Nội dung trang cá nhân">{profileTabs.map(tab => <button key={tab.id} aria-current={activeTab === tab.id ? "page" : undefined} onClick={() => setActiveTab(tab.id)}><ProfileIcon id={tab.icon} /><span>{tab.label}</span></button>)}</nav>
            <div className="profile-content" id="profile-posts" tabIndex={-1}>
                {(activeTab === "posts" || activeTab === "saved") && <>{posts.map(post => <ProfilePostCard key={post.id} post={post} details={details} avatarSrc={avatar.src} onNotice={setNotice} onOpen={setDialog} />)}{posts.length === 0 && <section className="profile-empty"><h2>Chưa có bài viết đã lưu</h2><p>Mở tùy chọn của một bài viết để lưu vào danh sách.</p></section>}</>}
                {activeTab === "media" && <section className="profile-media"><h2>Ảnh & Video</h2><div className="profile-media-grid">{[...highlights, { title: "Pulse Mobile Workspace", image: "3360:806" } as const].map(item => <button key={item.title} onClick={() => setDialog({ kind: "image", title: item.title, image: item.image })}><ProfileImage id={item.image} alt={item.title} /><span>{item.title}</span></button>)}</div></section>}
                {activeTab === "about" && <section className="profile-about"><h2>Về {details.name}</h2><p>{details.bio}</p><dl><dt>Công việc</dt><dd>{details.role}</dd><dt>Sở thích</dt><dd>{details.specialty}</dd><dt>Website</dt><dd>{details.website}</dd><dt>Công ty</dt><dd>{details.company}</dd><dt>Tham gia</dt><dd>{details.joined}</dd></dl></section>}
            </div>
        </main>
        <div className="profile-toast" role="status" aria-live="polite">{notice}</div>
        <dialog ref={dialogRef} className="profile-dialog" aria-labelledby="profile-dialog-title" onCancel={() => setDialog(null)} onClose={() => setDialog(null)} onClick={event => { if (event.target === event.currentTarget) setDialog(null); }}>
            <div className="profile-dialog-body"><div className="profile-section-heading"><h2 id="profile-dialog-title">{dialog?.title}</h2><button className="profile-close" aria-label="Đóng" onClick={() => setDialog(null)}>✕</button></div>
                {dialog?.kind === "edit" ? <form className="profile-editor" onSubmit={saveProfile}>
                    {profileEditFields.map(([key, label]) => <div key={key}><label htmlFor={`profile-edit-${key}`}>{label}</label><Input compact id={`profile-edit-${key}`} inputClassName="profile-editor-input" value={draft[key]} maxLength={100} required={key === "name" || key === "handle"} onChange={event => setDraft(previous => ({ ...previous, [key]: event.target.value }))} /></div>)}
                    <div><label htmlFor="profile-edit-bio">Giới thiệu</label><textarea id="profile-edit-bio" value={draft.bio} maxLength={500} rows={4} onChange={event => setDraft(previous => ({ ...previous, bio: event.target.value }))} /></div><p>Thay đổi chỉ áp dụng trong bản xem thử.</p><Button type="submit" className="profile-primary">Lưu thay đổi</Button>
                </form> : dialog?.kind === "image" && dialog.image ? <img className="profile-lightbox" src={profileAssets[dialog.image].src} alt={dialog.title} /> : dialog?.kind === "post" && dialog.postId ? <button className="profile-dialog-option" onClick={() => toggleSave(dialog.postId ?? "")}>{savedPosts.includes(dialog.postId) ? "Bỏ lưu bài viết" : "Lưu bài viết"}</button> : dialog?.kind === "account" ? <div className="profile-account-options"><button onClick={editProfile}>Chỉnh sửa hồ sơ</button><Link to="/home">Về bảng tin</Link><Button className="profile-logout" loadding={loggingOut} onClick={handleLogout}>Đăng xuất</Button></div> : <p className="profile-dialog-note">Tính năng này chưa kết nối dữ liệu máy chủ. Nội dung trên trang là dữ liệu xem thử.</p>}
            </div>
        </dialog>
    </div>;
}
