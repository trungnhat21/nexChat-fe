import type { ProfileOpenDialog } from "../../../component/type/profile";

export default function ProfileHighlights({ isOwner, onOpen }: { isOwner: boolean; onOpen: ProfileOpenDialog }) {
    if (!isOwner) return null;

    return <section className="profile-highlights card border-0 shadow-sm p-4 mb-4" aria-label="Tin nổi bật">
        <div className="profile-section-heading card-title mb-3">
            <h2 className="fs-5 fw-bold text-gray-900 m-0">Tin nổi bật</h2>
        </div>
        <div className="profile-highlight-strip d-flex align-items-center gap-4 mt-2">
            <button type="button" className="profile-highlight btn btn-flush d-flex flex-column align-items-center gap-2 p-0 text-gray-700" onClick={() => onOpen({ kind: "notice", title: "Thêm tin nổi bật" })}>
                <span className="profile-highlight-add d-flex align-items-center justify-content-center rounded-circle bg-light-primary text-primary fs-2 fw-normal" aria-hidden="true">+</span>
                <span className="fs-8 fw-semibold">Thêm tin nổi bật</span>
            </button>
        </div>
    </section>;
}
