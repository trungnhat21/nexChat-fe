import Button from "../../../component/UI/Button/Button";
import { Avatar, DesignIcon } from "./DesignAsset";
import { useComposerActions } from "../actions";
import { composerTools } from "../config";
import type { ComposerProps } from "../../../component/type/home";

export default function Composer({ onPost }: ComposerProps) {
    const { text, setText, submitPost, openPanel } = useComposerActions({ onPost });
    return <form className="home-card home-composer" onSubmit={submitPost}>
        <div className="home-compose-row">
            <Avatar id="3352:623" />
            <textarea id="home-compose" aria-label="Nội dung bài viết" placeholder="Minh Tâm ơi, bạn đang nghĩ gì thế? Chia sẻ nhịp đập hôm nay..." value={text} onChange={event => setText(event.target.value)} maxLength={5000} rows={2} />
        </div>
        <div className="home-compose-actions">
            <div className="home-compose-tools">
                {composerTools.map(([id, label]) => <button type="button" key={id} aria-label={label} onClick={() => openPanel(label)}><DesignIcon id={id} /><span>{label}</span></button>)}
            </div>
            <Button type="submit" className="home-primary">Đăng bài</Button>
        </div>
    </form>;
}
