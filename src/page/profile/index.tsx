import { Link, useNavigate } from "react-router";
import Button from "../../component/UI/Button/Button";
import Input from "../../component/UI/Input/Input";
import { useProfileActions } from "./actions";
import { profileAssets, profileEditFields, profileTabs } from "./config";
import { ProfileIcon } from "./components/ProfileAsset";
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

    return <div className="nexchat-profile">
        <a className="profile-skip-link" href="#profile-posts">Chuyển đến nội dung</a>
        <header className="profile-header bg-white shadow-sm position-sticky top-0 z-3">
            <div className="profile-header-inner d-flex align-items-center justify-content-between px-3 px-sm-6">
                <div className="profile-header-start d-flex align-items-center gap-2">
                    <Link className="btn btn-icon btn-sm btn-light-primary rounded-circle profile-icon-button" to="/home" aria-label="Quay lại bảng tin">
                        <ProfileIcon id="3360:870" />
                    </Link>
                    <h2 className="fs-5 fw-bold text-gray-900 m-0">Trang cá nhân</h2>
                </div>
                <div className="profile-header-end d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-icon btn-sm btn-light-primary rounded-circle profile-icon-button" aria-label="Cài đặt trang cá nhân" onClick={() => setDialog({ kind: "account", title: "Tài khoản của bạn" })}>
                        <ProfileIcon id="3360:877" />
                    </button>
                    <button type="button" className="profile-header-account btn btn-flush p-0 rounded-circle" aria-label="Tài khoản của bạn" onClick={() => setDialog({ kind: "account", title: "Tài khoản của bạn" })}>
                        <ProfileUserAvatar src={currentUser?.avatar ?? null} name={[currentUser?.lastName, currentUser?.firstName].filter(Boolean).join(" ") || "Tài khoản"} />
                    </button>
                </div>
            </div>
        </header>
        <main className="profile-shell">
            <ProfileHero recipientId={author?.id ?? null} uploading={cover.uploading || avatar.uploading} isOwner={isOwner} postCount={total} details={details} coverSrc={author?.cover ?? null} avatarSrc={avatarSrc} coverInputRef={cover.inputRef} avatarInputRef={avatar.inputRef} onCoverChange={cover.onChange} onAvatarChange={avatar.onChange} onRemoveAvatar={() => void avatar.remove()} onRemoveCover={() => void cover.remove()} onEdit={editProfile} onShare={shareProfile} onOpen={setDialog} relationship={relationship} relationshipBusy={relationshipBusy} onFriendAction={performFriendAction} onFollow={toggleFollow} />
            {(cover.uploading || avatar.uploading) && <p className="profile-image-status" role="status">Đang tải ảnh lên...</p>}
            <ProfileHighlights isOwner={isOwner} onOpen={setDialog} />
            <nav className="profile-tabs nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-6 fw-bold overflow-x-auto bg-white rounded-3 shadow-sm px-4 mb-4 position-sticky top-0 z-2" aria-label="Nội dung trang cá nhân">
                {profileTabs.filter(tab => tab.id !== "saved" || isOwner).map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`nav-link d-flex align-items-center gap-2 py-3 px-3 cursor-pointer border-0 ${activeTab === tab.id ? "active text-primary" : "text-gray-600 text-hover-primary bg-transparent"}`}
                        aria-current={activeTab === tab.id ? "page" : undefined}
                        onClick={() => tab.id === "saved" ? navigate("/saved") : setActiveTab(tab.id)}
                    >
                        <ProfileIcon id={tab.icon} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>
            <div className="profile-content" id="profile-posts" tabIndex={-1}>
                {loading && <section className="profile-empty card border-0 shadow-sm p-5 text-center mb-4 text-muted fs-7" role="status">Đang tải bài viết...</section>}
                {error && (
                    <section className="profile-empty profile-feed-error card border-0 shadow-sm p-5 text-center mb-4" role="alert">
                        <p className="text-danger fs-7 mb-2">{error}</p>
                        <Button variant="light-danger" size="sm" onClick={reload}>Thử lại</Button>
                    </section>
                )}
                {!loading && activeTab === "posts" && (
                    <>
                        {visiblePosts.map(post => (
                            <ProfilePostCard key={post.id} post={post} onStateChange={changePostState} onLike={likePost} onNotice={setNotice} onOpen={setDialog} />
                        ))}
                        {!error && visiblePosts.length === 0 && (
                            <section className="profile-empty card border-0 shadow-sm p-5 text-center mb-4">
                                <h2 className="fs-5 fw-bold text-gray-900 mb-2">Chưa có bài viết để hiển thị</h2>
                                <p className="text-muted fs-7 m-0">Các bài viết của tài khoản này sẽ xuất hiện ở đây.</p>
                            </section>
                        )}
                    </>
                )}
                {!loading && activeTab === "media" && (
                    <section className="profile-media card border-0 shadow-sm p-4 mb-4">
                        <div className="card-header border-0 p-0 mb-3">
                            <h2 className="card-title fs-5 fw-bold text-gray-900 m-0">Ảnh & Video</h2>
                        </div>
                        <div className="profile-media-grid">
                            {media.map(item => (
                                <button key={item.id} type="button" className="btn btn-flush p-0 overflow-hidden rounded-2" aria-label={`Mở ${item.name}`} onClick={() => setDialog({ kind: "image", title: item.name, media: item })}>
                                    {item.type.startsWith("video/") ? <video src={item.url} preload="metadata" aria-label={item.name} /> : <img src={item.url} alt={item.name} loading="lazy" />}
                                </button>
                            ))}
                        </div>
                        {!media.length && <p className="text-muted fs-7 mt-2">Chưa có ảnh hoặc video trong các bài viết đã tải.</p>}
                    </section>
                )}
                {!loading && nextCursor && activeTab !== "about" && (
                    <div className="mb-4">
                        <Button variant="light-primary" className="w-100 py-3 fw-bold fs-7" disabled={loadingMore} onClick={loadMore}>
                            {loadingMore ? "Đang tải..." : loadMoreError ? "Thử tải lại bài viết" : "Xem thêm bài viết"}
                        </Button>
                        {loadMoreError && <p className="profile-feed-error text-danger fs-8 mt-2 text-center" role="alert">{loadMoreError}</p>}
                    </div>
                )}
                {activeTab === "about" && (
                    <section className="profile-about card border-0 shadow-sm p-4 mb-4">
                        <div className="card-header border-0 p-0 mb-3">
                            <h2 className="card-title fs-5 fw-bold text-gray-900 m-0">Về {details.name}</h2>
                        </div>
                        <p className="fs-7 text-gray-800 mb-4">{details.bio}</p>
                        <dl className="m-0">
                            <dt className="text-muted fs-8 fw-semibold">Công việc</dt>
                            <dd className="fs-7 text-gray-900 mb-2">{details.role}</dd>
                            <dt className="text-muted fs-8 fw-semibold">Sở thích</dt>
                            <dd className="fs-7 text-gray-900 mb-2">{details.specialty}</dd>
                            <dt className="text-muted fs-8 fw-semibold">Website</dt>
                            <dd className="fs-7 text-primary mb-2">{details.website}</dd>
                            <dt className="text-muted fs-8 fw-semibold">Công ty</dt>
                            <dd className="fs-7 text-gray-900 mb-2">{details.company}</dd>
                            <dt className="text-muted fs-8 fw-semibold">Tham gia</dt>
                            <dd className="fs-7 text-gray-900 mb-0">{details.joined}</dd>
                        </dl>
                    </section>
                )}
            </div>
        </main>
        <div className="profile-toast" role="status" aria-live="polite">{notice}</div>
        <dialog ref={dialogRef} className="profile-dialog border-0 shadow-lg p-0 rounded-3" style={!dialog ? { display: "none" } : undefined} aria-labelledby="profile-dialog-title" onCancel={() => setDialog(null)} onClose={() => setDialog(null)} onClick={event => { if (event.target === event.currentTarget) setDialog(null); }}>
            {dialog && (
                <div className="profile-dialog-body p-4">
                    <div className="profile-section-heading d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
                        <h2 id="profile-dialog-title" className="fs-5 fw-bold text-gray-900 m-0">{dialog.title}</h2>
                        <button type="button" className="btn btn-icon btn-sm btn-light-primary rounded-circle" aria-label="Đóng" onClick={() => setDialog(null)}>✕</button>
                    </div>
                    {dialog.kind === "edit" ? (
                        <form className="profile-editor d-flex flex-column gap-3 mt-3" onSubmit={saveProfile}>
                            {profileEditFields.map(([key, label]) => (
                                <div key={key}>
                                    <label htmlFor={`profile-edit-${key}`} className="form-label fs-8 fw-semibold text-gray-700 mb-1">{label}</label>
                                    <Input compact id={`profile-edit-${key}`} inputClassName="profile-editor-input" value={draft[key]} maxLength={100} required={key === "name" || key === "handle"} onChange={event => setDraft(previous => ({ ...previous, [key]: event.target.value }))} />
                                </div>
                            ))}
                            <div>
                                <label htmlFor="profile-edit-bio" className="form-label fs-8 fw-semibold text-gray-700 mb-1">Giới thiệu</label>
                                <textarea id="profile-edit-bio" className="form-control rounded-2 p-2 border border-gray-300 fs-7" value={draft.bio} maxLength={500} rows={4} onChange={event => setDraft(previous => ({ ...previous, bio: event.target.value }))} />
                            </div>
                            <p className="text-muted fs-8 mb-2">Thay đổi chỉ áp dụng trong bản xem thử.</p>
                            <Button type="submit" variant="primary">Lưu thay đổi</Button>
                        </form>
                    ) : dialog.kind === "image" && dialog.media ? (
                        dialog.media.type.startsWith("video/") ? (
                            <video className="profile-lightbox rounded-3 w-100" src={dialog.media.url} controls autoPlay aria-label={dialog.title} />
                        ) : (
                            <img className="profile-lightbox rounded-3 w-100" src={dialog.media.url} alt={dialog.title} />
                        )
                    ) : dialog.kind === "image" && dialog.image ? (
                        <img className="profile-lightbox rounded-3 w-100" src={profileAssets[dialog.image].src} alt={dialog.title} />
                    ) : dialog.kind === "post" && dialog.postId ? (
                        <Link className="profile-dialog-option btn btn-light-primary w-100 py-3 text-start" to={"/posts/" + dialog.postId}>
                            Mở bài viết
                        </Link>
                    ) : dialog.kind === "account" ? (
                        <div className="profile-account-options d-flex flex-column gap-2 mt-2">
                            {isOwner ? (
                                <button type="button" className="btn btn-light text-start w-100 py-3 fw-semibold text-gray-800" onClick={editProfile}>
                                    Chỉnh sửa hồ sơ
                                </button>
                            ) : (
                                <Link to="/profile" className="btn btn-light text-start w-100 py-3 fw-semibold text-gray-800">
                                    Trang cá nhân của tôi
                                </Link>
                            )}
                            <Link to="/home" className="btn btn-light text-start w-100 py-3 fw-semibold text-gray-800">
                                Về bảng tin
                            </Link>
                            <Button variant="light-danger" className="w-100 py-3 fw-semibold text-start" loadding={loggingOut} onClick={handleLogout}>
                                Đăng xuất
                            </Button>
                        </div>
                    ) : (
                        <p className="profile-dialog-note text-muted fs-7 mt-3">
                            Tính năng này chưa được hỗ trợ. Bài viết và media trên trang được tải từ tài khoản đang xem.
                        </p>
                    )}
                </div>
            )}
        </dialog>
    </div>;
}
