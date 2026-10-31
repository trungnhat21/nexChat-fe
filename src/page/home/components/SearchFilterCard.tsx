import { ChevronDown, Filter } from "lucide-react";

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

    return <section className="home-card home-search-filters" aria-labelledby="home-search-filters-title">
        <header className="home-search-filter-heading">
            <h2 id="home-search-filters-title"><Filter size={16} aria-hidden="true" />BỘ LỌC KẾT QUẢ</h2>
            <button type="button" onClick={() => onChange({ sort: "latest", period: "all", mediaOnly: false })}>Thiết lập lại</button>
        </header>
        <fieldset className="home-filter-section">
            <legend>Sắp xếp theo</legend>
            <label><input type="radio" name="feed-sort" checked={filters.sort === "relevance"} onChange={() => update({ sort: "relevance" })} />Liên quan nhất</label>
            <label><input type="radio" name="feed-sort" checked={isLatest} onChange={() => update({ sort: "latest" })} />Mới nhất trước</label>
        </fieldset>
        <label className="home-filter-section home-filter-period">
            <span>Thời gian đăng</span>
            <span className="home-filter-select-wrap"><select aria-label="Thời gian đăng" value={periodValue} onChange={event => update({ period: event.target.value as FeedFilters["period"] })}>
                <option value="all">Tất cả thời gian</option>
                <option value="24h">24h</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
            </select><ChevronDown size={16} aria-hidden="true" /></span>
        </label>
        <fieldset className="home-filter-section home-filter-content">
            <legend>Loại nội dung</legend>
            <label><input type="checkbox" checked={!filters.mediaOnly} onChange={() => update({ mediaOnly: false })} />Tất cả bài viết</label>
            <label><input type="checkbox" checked={filters.mediaOnly} onChange={event => update({ mediaOnly: event.target.checked })} />Chỉ bài viết có hình ảnh / media</label>
            <label className="is-unavailable" title="Nguồn dữ liệu bài viết hiện chưa cung cấp trạng thái xác minh."><input type="checkbox" disabled />Chỉ người &amp; tài khoản đã xác minh</label>
        </fieldset>
    </section>;
}
