import { useState } from "react";
import { useNavigate } from "react-router";
import { Clock3, Search, X } from "lucide-react";

interface Props {
    query: string;
    userId: string;
    onSelect: (value: string) => void;
    onClose: () => void;
}

const RECENT_LIMIT = 5;

function readRecentSearches(key: string): string[] {
    try {
        const saved: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
        return Array.isArray(saved) ? saved.filter((item): item is string => typeof item === "string").slice(0, RECENT_LIMIT) : [];
    } catch {
        return [];
    }
}

export default function SearchSuggestions({ query, userId, onSelect, onClose }: Props) {
    const navigate = useNavigate();
    const storageKey = `nexchat:recent-searches:${userId}`;
    const [recent, setRecent] = useState<string[]>(() => readRecentSearches(storageKey));

    const activeQuery = query.trim();

    function remember(value: string) {
        const cleaned = value.trim();
        if (!cleaned) return;
        const next = [cleaned, ...recent.filter(item => item.toLocaleLowerCase("vi") !== cleaned.toLocaleLowerCase("vi"))].slice(0, RECENT_LIMIT);
        setRecent(next);
        try {
            localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
            /* Ignore local storage errors */
        }
    }

    function clearRecent(value?: string) {
        const next = value ? recent.filter(item => item !== value) : [];
        setRecent(next);
        try {
            localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
            /* Ignore local storage errors */
        }
    }

    function handleNavigateSearch(searchTerm: string) {
        const cleaned = searchTerm.trim();
        if (!cleaned) return;
        remember(cleaned);
        onSelect(cleaned);
        onClose();
        navigate(`/search?q=${encodeURIComponent(cleaned)}`);
    }

    // Lọc lịch sử tìm kiếm theo từ khóa đang gõ (nếu có)
    const matchingRecent = activeQuery
        ? recent.filter(item => item.toLocaleLowerCase("vi").includes(activeQuery.toLocaleLowerCase("vi")))
        : recent;

    return (
        <section className="card shadow-lg border-0 position-absolute start-0 end-0 top-100 mt-2 p-3 z-3 bg-white rounded-4" role="dialog" aria-label="Gợi ý tìm kiếm">
            {/* 1. Lịch sử tìm kiếm gần đây */}
            {matchingRecent.length > 0 && (
                <div className="mb-2">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                        <h2 className="fs-8 fw-bold text-gray-500 text-uppercase m-0">TÌM KIẾM GẦN ĐÂY</h2>
                        <button type="button" className="btn btn-flush fs-8 text-primary text-hover-primary fw-medium" onClick={() => clearRecent()}>
                            Xóa tất cả
                        </button>
                    </div>
                    <div className="d-flex flex-wrap gap-1.5">
                        {matchingRecent.map(item => (
                            <span className="d-inline-flex align-items-center gap-1.5 bg-light px-2.5 py-1.5 rounded-pill" key={item}>
                                <button type="button" className="btn btn-flush fs-7 text-gray-800 text-hover-primary d-flex align-items-center gap-1" onClick={() => handleNavigateSearch(item)}>
                                    <Clock3 size={13} aria-hidden="true" className="text-muted" />
                                    <span>{item}</span>
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-flush text-muted text-hover-danger p-0 d-flex align-items-center"
                                    aria-label={`Xóa tìm kiếm ${item}`}
                                    onClick={() => clearRecent(item)}
                                >
                                    <X size={13} aria-hidden="true" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Trạng thái khi chưa gõ từ khóa và chưa có lịch sử */}
            {!activeQuery && recent.length === 0 && (
                <div className="text-center py-4 text-muted">
                    <Search size={24} aria-hidden="true" className="mb-2 text-gray-400" />
                    <p className="fs-7 text-muted m-0">
                        Nhập từ khóa và bấm Enter để tìm kiếm bạn bè, bài viết, hashtag...
                    </p>
                </div>
            )}

            {/* 3. Khi người dùng đã gõ từ khóa: Hiển thị nút bấm Enter để bắt đầu tìm kiếm (không tự động load khi gõ) */}
            {activeQuery && (
                <div className={matchingRecent.length > 0 ? "mt-2 pt-2 border-top border-gray-100" : ""}>
                    <button
                        type="button"
                        className="btn btn-light-primary w-100 d-flex align-items-center justify-content-between p-2.5 rounded-2 fs-6 fw-semibold"
                        onClick={() => handleNavigateSearch(activeQuery)}
                    >
                        <span>
                            Tìm kiếm <strong className="text-primary">“{activeQuery}”</strong>
                        </span>
                        <kbd className="badge badge-light-primary fs-7">↵ Enter</kbd>
                    </button>
                    <p className="text-center mt-2 mb-0 fs-7 text-muted">
                        Nhấn phím <strong>Enter</strong> để tải kết quả tìm kiếm
                    </p>
                </div>
            )}
        </section>
    );
}

