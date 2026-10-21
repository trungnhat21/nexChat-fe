import { highlights } from "../config";
import { ProfileIcon, ProfileImage } from "./ProfileAsset";
import type { ProfileHighlightsProps } from "../../../component/type/profile";

export default function ProfileHighlights({ onOpen }: ProfileHighlightsProps) {
    return <section className="profile-highlights" aria-label="Tin nổi bật">
        <div className="profile-section-heading"><h2>Tin nổi bật</h2><span>5 bộ sưu tập</span></div>
        <div className="profile-highlight-strip">
            <button className="profile-highlight" onClick={() => onOpen({ kind: "notice", title: "Thêm tin nổi bật" })}><span className="profile-highlight-add"><ProfileIcon id="3360:482" /></span><span>Thêm tin</span></button>
            {highlights.map(highlight => <button className="profile-highlight" key={highlight.title} onClick={() => onOpen({ kind: "image", title: highlight.title, image: highlight.image })}><span className="profile-highlight-ring"><ProfileImage id={highlight.image} alt={highlight.title} /></span><span>{highlight.title}</span></button>)}
        </div>
    </section>;
}
