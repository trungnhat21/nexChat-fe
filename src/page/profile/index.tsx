import { Link, useNavigate } from "react-router";
import Button from "../../component/UI/Button/Button";
import Input from "../../component/UI/Input/Input";
import { useProfileActions } from "./actions";
import { profileAssets, profileEditFields, profileTabs } from "./config";
import { ProfileIcon, ProfileImage } from "./components/ProfileAsset";
import ProfileUserAvatar from "./components/ProfileUserAvatar";
import ProfileHero from "./components/ProfileHero";
import ProfileHighlights from "./components/ProfileHighlights";
import ProfilePostCard from "./components/ProfilePostCard";
import "./style.scss";

export default function ProfilePage() {
    const navigate = useNavigate();
    const { changePostState, likePost, details, draft, setDraft, activeTab, setActiveTab, dialog, setDialog, notice, setNotice, dialogRef, cover, avatar, editProfile, saveProfile, shareProfile, loggingOut, handleLogout, currentUser, author, isOwner, posts, total, nextCursor, loading, loadingMore, error, loadMoreError, loadMore, reload, avatarSrc, relationship, relationshipBusy, performFriendAction, toggleFollow } = useProfileActions();
    const visiblePosts = posts;
    const media = posts.flatMap(post => post.media);

    return <div className="pulse-profile">
        <a className="profile-skip-link" href="#profile-posts">Chuyển đến nội dung</a>
        <header className="profile-header"><div className="profile-header-inner">
            <div className="profile-header-start"><Link className="profile-icon-button" to="/home" aria-label="Quay lại bảng tin"><ProfileIcon id="3360:870" /></Link><Link to="/home" aria-label="Pulse — Trang chủ"><ProfileImage id="3360:872" className="profile-logo" /></Link><h2>Ho So Ca Nhan</h2></div>
            <div className="profile-header-end"><button className="profile-icon-button" aria-label="Cài đặt trang cá nhân" onClick={() => setDialog({ kind: "account", title: "Tài khoản của bạn" })}><ProfileIcon id="3360:877" /></button><button className="profile-header-account" aria-label="Tài khoản của bạn" onClick={() => setDialog({ kind: "account", title: "Tài khoản của bạn" })}><ProfileUserAvatar src={currentUser?.avatar ?? null} name={[currentUser?.lastName, currentUser?.firstName].filter(Boolean).join(" ") || "Tài khoản"} /></button></div>
        </div></header>
        <main className="profile-shell">
            <ProfileHero uploading={cover.uploading || avatar.uploading} isOwner={isOwner} postCount={total} details={details} coverSrc={author?.cover ?? null} avatarSrc={avatarSrc} coverInputRef={cover.inputRef} avatarInputRef={avatar.inputRef} onCoverChange={cover.onChange} onAvatarChange={avatar.onChange} onRemoveAvatar={() => void avatar.remove()} onEdit={editProfile} onShare={shareProfile} onOpen={setDialog} relationship={relationship} relationshipBusy={relationshipBusy} onFriendAction={performFriendAction} onFollow={toggleFollow} />
            {(cover.uploading || avatar.uploading) && <p className="profile-image-status" role="status">Đang tải ảnh lên...</p>}
            <ProfileHighlights onOpen={setDialog} />
            <nav className="profile-tabs" aria-label="Nội dung trang cá nhân">{profileTabs.filter(tab => tab.id !== "saved" || isOwner).map(tab => <button key={tab.id} aria-current={activeTab === tab.id ? "page" : undefined} onClick={() => tab.id === "saved" ? navigate("/saved") : setActiveTab(tab.id)}><ProfileIcon id={tab.icon} /><span>{tab.label}</span></button>)}</nav>
            <div className="profile-content" id="profile-posts" tabIndex={-1}>
                {loading && <section className="profile-empty" role="status">Đang tải bài viết...</section>}
                {error && <section className="profile-empty profile-feed-error" role="alert"><p>{error}</p><button onClick={reload}>Thử lại</button></section>}
                {!loading && activeTab === "posts" && <>{visiblePosts.map(post => <ProfilePostCard key={post.id} post={post} onStateChange={changePostState} onLike={likePost} onNotice={setNotice} onOpen={setDialog} />)}{!error && visiblePosts.length === 0 && <section className="profile-empty"><h2>Chưa có bài viết để hiển thị</h2><p>Các bài viết của tài khoản này sẽ xuất hiện ở đây.</p></section>}</>}
                {!loading && activeTab === "media" && <section className="profile-media"><h2>Ảnh & Video</h2><div className="profile-media-grid">{media.map(item => <button key={item.id} onClick={() => setDialog({ kind: "image", title: item.name, media: item })}>{item.type.startsWith("video/") ? <video src={item.url} preload="metadata" aria-label={item.name} /> : <img src={item.url} alt={item.name} loading="lazy" />}<span>{item.name}</span></button>)}</div>{!media.length && <p>Chưa có ảnh hoặc video trong các bài viết đã tải.</p>}</section>}
                {!loading && nextCursor && activeTab !== "about" && <><button className="profile-load-more" disabled={loadingMore} onClick={loadMore}>{loadingMore ? "Đang tải..." : loadMoreError ? "Thử tải lại bài viết" : "Xem thêm bài viết"}</button>{loadMoreError && <p className="profile-feed-error" role="alert">{loadMoreError}</p>}</>}
                {activeTab === "about" && <section className="profile-about"><h2>Về {details.name}</h2><p>{details.bio}</p><dl><dt>Công việc</dt><dd>{details.role}</dd><dt>Sở thích</dt><dd>{details.specialty}</dd><dt>Website</dt><dd>{details.website}</dd><dt>Công ty</dt><dd>{details.company}</dd><dt>Tham gia</dt><dd>{details.joined}</dd></dl></section>}
            </div>
        </main>
        <div className="profile-toast" role="status" aria-live="polite">{notice}</div>
        <dialog ref={dialogRef} className="profile-dialog" aria-labelledby="profile-dialog-title" onCancel={() => setDialog(null)} onClose={() => setDialog(null)} onClick={event => { if (event.target === event.currentTarget) setDialog(null); }}>
            <div className="profile-dialog-body"><div className="profile-section-heading"><h2 id="profile-dialog-title">{dialog?.title}</h2><button className="profile-close" aria-label="Đóng" onClick={() => setDialog(null)}>✕</button></div>
                {dialog?.kind === "edit" ? <form className="profile-editor" onSubmit={saveProfile}>
                    {profileEditFields.map(([key, label]) => <div key={key}><label htmlFor={`profile-edit-${key}`}>{label}</label><Input compact id={`profile-edit-${key}`} inputClassName="profile-editor-input" value={draft[key]} maxLength={100} required={key === "name" || key === "handle"} onChange={event => setDraft(previous => ({ ...previous, [key]: event.target.value }))} /></div>)}
                    <div><label htmlFor="profile-edit-bio">Giới thiệu</label><textarea id="profile-edit-bio" value={draft.bio} maxLength={500} rows={4} onChange={event => setDraft(previous => ({ ...previous, bio: event.target.value }))} /></div><p>Thay đổi chỉ áp dụng trong bản xem thử.</p><Button type="submit" className="profile-primary">Lưu thay đổi</Button>
                </form> : dialog?.kind === "image" && dialog.media ? (dialog.media.type.startsWith("video/") ? <video className="profile-lightbox" src={dialog.media.url} controls autoPlay aria-label={dialog.title} /> : <img className="profile-lightbox" src={dialog.media.url} alt={dialog.title} />) : dialog?.kind === "image" && dialog.image ? <img className="profile-lightbox" src={profileAssets[dialog.image].src} alt={dialog.title} /> : dialog?.kind === "post" && dialog.postId ? <Link className="profile-dialog-option" to={"/posts/" + dialog.postId}>Mở bài viết</Link> : dialog?.kind === "account" ? <div className="profile-account-options">{isOwner ? <button onClick={editProfile}>Chỉnh sửa hồ sơ</button> : <Link to="/profile">Trang cá nhân của tôi</Link>}<Link to="/home">Về bảng tin</Link><Button className="profile-logout" loadding={loggingOut} onClick={handleLogout}>Đăng xuất</Button></div> : <p className="profile-dialog-note">Tính năng này chưa được hỗ trợ. Bài viết và media trên trang được tải từ tài khoản đang xem.</p>}
            </div>
        </dialog>
    </div>;
}
