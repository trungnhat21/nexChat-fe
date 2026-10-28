import type { ProfileOpenDialog } from "../../../component/type/profile";

export default function ProfileHighlights({ isOwner, onOpen }: { isOwner: boolean; onOpen: ProfileOpenDialog }) {
    if (!isOwner) return null;

    return <section className="profile-highlights" aria-label="Tin nổi bật">
        <div className="profile-section-heading"><h2>Tin nổi bật</h2></div>
        <div className="profile-highlight-strip">
            <button type="button" className="profile-highlight" onClick={() => onOpen({ kind: "notice", title: "Thêm tin nổi bật" })}>
                <span className="profile-highlight-add" aria-hidden="true">+</span>
                <span>Thêm tin nổi bật</span>
            </button>
        </div>
    </section>;
}
