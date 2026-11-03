import Button from "../../../component/UI/Button/Button";
import { DesignIcon } from "./DesignAsset";
import UserAvatar from "./UserAvatar";
import { useComposerActions, useHome } from "../actions";
import { mediaAccept, postLimits, privacyLabels } from "../config";
import type { ComposerProps, PostPrivacy } from "../../../component/type/post";

export default function Composer(props: ComposerProps) {
    const { user } = useHome();
    const { text, setText, privacy, setPrivacy, files, retained, setRetained, fileInputRef, addFiles, removeFile, submitPost, submitting, error, progress } = useComposerActions(props);
    const editing = !!props.post;
    const userName = [user?.lastName, user?.firstName].filter(Boolean).join(" ") || user?.userName || "Bạn";

    return (
        <form className="card shadow-sm mb-4 p-4 border-0" onSubmit={submitPost} aria-label={editing ? "Chỉnh sửa bài viết" : "Tạo bài viết"}>
            <fieldset disabled={submitting} className="border-0 p-0 m-0">
                <div className="d-flex align-items-start gap-3">
                    <UserAvatar name={userName} src={user?.avatar} size={44} />
                    <textarea
                        id={editing ? `home-edit-${props.post?.id}` : "home-compose"}
                        aria-label="Nội dung bài viết"
                        className="form-control form-control-solid border-0 fs-6 p-3 flex-grow-1"
                        placeholder={`${userName} ơi, bạn đang nghĩ gì? Chia sẻ nhịp đập hôm nay...`}
                        value={text}
                        onChange={event => setText(event.target.value)}
                        maxLength={postLimits.contentLength}
                        rows={2}
                    />
                </div>

                <div className="d-flex align-items-center justify-content-between mt-3 pt-3 border-top border-gray-100 fs-7 text-gray-700">
                    <label className="d-flex align-items-center gap-1.5 m-0 cursor-pointer">
                        <span>Ai có thể xem?</span>
                        <select
                            aria-label="Quyền riêng tư bài viết"
                            className="form-select form-select-sm form-select-solid w-auto py-1 px-2.5 fs-7 fw-semibold"
                            value={privacy}
                            onChange={event => setPrivacy(event.target.value as PostPrivacy)}
                        >
                            {Object.entries(privacyLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </label>
                    <span className="fs-7 text-muted">{text.length}/{postLimits.contentLength}</span>
                </div>

                {!!(retained.length || files.length) && (
                    <div className="home-media-previews mt-3">
                        {retained.map(media => (
                            <div className="home-media-preview" key={media.id}>
                                {media.type.startsWith("video/") ? (
                                    <video src={media.url} controls preload="metadata" />
                                ) : (
                                    <img src={media.url} alt={media.name} />
                                )}
                                <button type="button" aria-label={`Bỏ ${media.name}`} onClick={() => setRetained(previous => previous.filter(item => item.id !== media.id))}>✕</button>
                                <span>{media.name}</span>
                            </div>
                        ))}
                        {files.map(media => (
                            <div className="home-media-preview" key={media.id}>
                                {media.file.type.startsWith("video/") ? (
                                    <video src={media.url} controls preload="metadata" />
                                ) : (
                                    <img src={media.url} alt={media.file.name} />
                                )}
                                <button type="button" aria-label={`Bỏ ${media.file.name}`} onClick={() => removeFile(media.id)}>✕</button>
                                <span>{media.file.name}</span>
                            </div>
                        ))}
                    </div>
                )}

                <input className="d-none" ref={fileInputRef} type="file" multiple accept={mediaAccept} aria-label="Chọn ảnh hoặc video" onChange={addFiles} />

                <div className="d-flex align-items-center justify-content-between mt-3 pt-2">
                    <div>
                        <button type="button" className="btn btn-sm btn-light-primary d-flex align-items-center gap-2 fw-semibold px-3 py-2 fs-7" onClick={() => fileInputRef.current?.click()}>
                            <DesignIcon id="3352:631" />
                            <span>Ảnh / Video</span>
                        </button>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {editing && (
                            <button type="button" className="btn btn-sm btn-light px-3 py-2 fs-7" onClick={props.onCancel}>
                                Hủy
                            </button>
                        )}
                        <Button type="submit" variant="primary" size="sm" loading={submitting}>
                            {editing ? "Lưu thay đổi" : "Đăng bài"}
                        </Button>
                    </div>
                </div>

                <p className="fs-7 text-muted mt-2 mb-0">Tối đa 5 file · 25 MB/file · Tổng 50 MB · JPEG, PNG, GIF, WebP, MP4, WebM</p>
            </fieldset>

            {submitting && (
                <div className="card bg-light p-3 mt-3 border-0 d-flex flex-column gap-2" role="status">
                    <progress value={progress} max={100} className="w-100" />
                    <span className="fs-7 text-muted">{progress < 99 ? `Đang tải lên ${progress}%` : "Đang lưu bài viết..."}</span>
                </div>
            )}
            {error && <div className="card p-3 border-dashed border-danger text-danger fs-7 mt-3 mb-0" role="alert">{error}</div>}
        </form>
    );
}

