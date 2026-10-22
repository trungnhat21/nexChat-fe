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
    return <form className="home-card home-composer" onSubmit={submitPost} aria-label={editing ? "Chỉnh sửa bài viết" : "Tạo bài viết"}>
        <fieldset disabled={submitting} className="home-composer-fields">
            <div className="home-compose-row">
                <UserAvatar name={userName} src={user?.avatar} />
                <textarea id={editing ? `home-edit-${props.post?.id}` : "home-compose"} aria-label="Nội dung bài viết" placeholder={`${userName} ơi, bạn đang nghĩ gì? Chia sẻ nhịp đập hôm nay...`} value={text} onChange={event => setText(event.target.value)} maxLength={postLimits.contentLength} rows={2} />
            </div>
            <div className="home-post-options"><label>Ai có thể xem? <select aria-label="Quyền riêng tư bài viết" value={privacy} onChange={event => setPrivacy(event.target.value as PostPrivacy)}>{Object.entries(privacyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><span>{text.length}/{postLimits.contentLength}</span></div>
            {!!(retained.length || files.length) && <div className="home-media-previews">
                {retained.map(media => <div className="home-media-preview" key={media.id}>{media.type.startsWith("video/") ? <video src={media.url} controls preload="metadata" /> : <img src={media.url} alt={media.name} />}<button type="button" aria-label={`Bỏ ${media.name}`} onClick={() => setRetained(previous => previous.filter(item => item.id !== media.id))}>✕</button><span>{media.name}</span></div>)}
                {files.map(media => <div className="home-media-preview" key={media.id}>{media.file.type.startsWith("video/") ? <video src={media.url} controls preload="metadata" /> : <img src={media.url} alt={media.file.name} />}<button type="button" aria-label={`Bỏ ${media.file.name}`} onClick={() => removeFile(media.id)}>✕</button><span>{media.file.name}</span></div>)}
            </div>}
            <input className="home-media-input" ref={fileInputRef} type="file" multiple accept={mediaAccept} aria-label="Chọn ảnh hoặc video" onChange={addFiles} />
            <div className="home-compose-actions"><div className="home-compose-tools"><button type="button" onClick={() => fileInputRef.current?.click()}><DesignIcon id="3352:631" /><span>Ảnh / Video</span></button></div><div className="home-editor-buttons">{editing && <button type="button" className="home-editor-cancel" onClick={props.onCancel}>Hủy</button>}<Button type="submit" className="home-primary" loadding={submitting}>{editing ? "Lưu thay đổi" : "Đăng bài"}</Button></div></div>
            <p className="home-upload-hint">Tối đa 5 file · 25 MB/file · Tổng 50 MB · JPEG, PNG, GIF, WebP, MP4, WebM</p>
        </fieldset>
        {submitting && <div className="home-upload-progress" role="status"><progress value={progress} max={100} /><span>{progress < 99 ? `Đang tải lên ${progress}%` : "Đang lưu bài viết..."}</span></div>}
        {error && <p className="home-feed-error" role="alert">{error}</p>}
    </form>;
}
