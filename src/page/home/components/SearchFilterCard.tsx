import { Filter } from "lucide-react";

export type FeedFilters = {
    sort: "relevance" | "latest" | "newest";
    period: "all" | "24h" | "day" | "week" | "month";
    mediaOnly: boolean;
};

type Props = { filters: FeedFilters; onChange: (filters: FeedFilters) => void };

export default function SearchFilterCard({ filters, onChange }: Props) {
    const update = (patch: Partial<FeedFilters>) => onChange({ ...filters, ...patch });
    const isLatest = filters.sort === "latest" || filters.sort === "newest";
    const periodValue = filters.period === "day" ? "24h" : filters.period;

    return (
        <section className="card p-5 mb-4 shadow-sm" aria-labelledby="home-search-filters-title">
            <header className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom">
                <h2 id="home-search-filters-title" className="fs-12 fw-bold text-gray-700 text-uppercase d-flex align-items-center gap-2 m-0">
                    <Filter size={15} className="text-primary" aria-hidden="true" />
                    Bộ lọc kết quả
                </h2>
                <button
                    type="button"
                    className="btn btn-flush fs-12 text-primary fw-semibold cursor-pointer"
                    onClick={() => onChange({ sort: "latest", period: "all", mediaOnly: false })}
                >
                    Thiết lập lại
                </button>
            </header>

            {/* Sắp xếp */}
            <div className="mb-4">
                <label className="d-block fs-12 fw-semibold text-gray-500 text-uppercase mb-2">
                    Sắp xếp theo
                </label>
                <div className="d-flex flex-column gap-2">
                    <label className="form-check form-check-custom form-check-solid cursor-pointer">
                        <input
                            type="radio"
                            name="feed-sort"
                            className="form-check-input"
                            checked={filters.sort === "relevance"}
                            onChange={() => update({ sort: "relevance" })}
                        />
                        <span className="form-check-label fs-13 text-gray-700">Liên quan nhất</span>
                    </label>
                    <label className="form-check form-check-custom form-check-solid cursor-pointer">
                        <input
                            type="radio"
                            name="feed-sort"
                            className="form-check-input"
                            checked={isLatest}
                            onChange={() => update({ sort: "latest" })}
                        />
                        <span className="form-check-label fs-13 text-gray-700">Mới nhất trước</span>
                    </label>
                </div>
            </div>

            {/* Thời gian đăng */}
            <div className="mb-4">
                <label className="d-block fs-12 fw-semibold text-gray-500 text-uppercase mb-2">
                    Thời gian đăng
                </label>
                <select
                    aria-label="Thời gian đăng"
                    className="form-select form-select-solid"
                    value={periodValue}
                    onChange={event => update({ period: event.target.value as FeedFilters["period"] })}
                >
                    <option value="all">Tất cả thời gian</option>
                    <option value="24h">24 giờ qua</option>
                    <option value="week">1 tuần qua</option>
                    <option value="month">1 tháng qua</option>
                </select>
            </div>

            {/* Loại nội dung */}
            <div>
                <label className="d-block fs-12 fw-semibold text-gray-500 text-uppercase mb-2">
                    Loại nội dung
                </label>
                <div className="d-flex flex-column gap-2">
                    <label className="form-check form-check-custom form-check-solid cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={!filters.mediaOnly}
                            onChange={() => update({ mediaOnly: false })}
                        />
                        <span className="form-check-label fs-13 text-gray-700">Tất cả bài viết</span>
                    </label>
                    <label className="form-check form-check-custom form-check-solid cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            checked={filters.mediaOnly}
                            onChange={event => update({ mediaOnly: event.target.checked })}
                        />
                        <span className="form-check-label fs-13 text-gray-700">Chỉ bài viết có media / ảnh</span>
                    </label>
                    <label className="form-check form-check-custom form-check-solid opacity-50 cursor-not-allowed" title="Nguồn dữ liệu bài viết hiện chưa cung cấp trạng thái xác minh.">
                        <input type="checkbox" className="form-check-input" disabled />
                        <span className="form-check-label fs-13 text-gray-500">Tài khoản đã xác minh</span>
                    </label>
                </div>
            </div>
        </section>
    );
}
