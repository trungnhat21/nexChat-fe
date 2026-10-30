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
        <section className="home-search-suggestions" role="dialog" aria-label="Gợi ý tìm kiếm">
            {/* 1. Lịch sử tìm kiếm gần đây */}
            {matchingRecent.length > 0 && (
                <div className="home-search-suggestion-section home-recent-searches">
                    <div className="home-search-suggestion-heading">
                        <h2>TÌM KIẾM GẦN ĐÂY</h2>
                        <button type="button" onClick={() => clearRecent()}>
                            Xóa tất cả
                        </button>
                    </div>
                    <div className="home-recent-search-list">
                        {matchingRecent.map(item => (
                            <span className="home-recent-search" key={item}>
                                <button type="button" onClick={() => handleNavigateSearch(item)}>
                                    <Clock3 size={12} aria-hidden="true" />
                                    {item}
                                </button>
                                <button
                                    type="button"
                                    aria-label={`Xóa tìm kiếm ${item}`}
                                    onClick={() => clearRecent(item)}
                                >
                                    <X size={12} aria-hidden="true" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Trạng thái khi chưa gõ từ khóa và chưa có lịch sử */}
            {!activeQuery && recent.length === 0 && (
                <div className="home-search-empty-state">
                    <Search size={22} aria-hidden="true" />
                    <p className="home-search-suggestion-empty">
                        Nhập từ khóa và bấm Enter để tìm kiếm bạn bè, bài viết, hashtag...
                    </p>
                </div>
            )}

            {/* 3. Khi người dùng đã gõ từ khóa: Hiển thị nút bấm Enter để bắt đầu tìm kiếm (không tự động load khi gõ) */}
            {activeQuery && (
                <div style={{ marginTop: matchingRecent.length > 0 ? "8px" : 0 }}>
                    <button
                        type="button"
                        className="home-search-all-results"
                        onClick={() => handleNavigateSearch(activeQuery)}
                    >
                        <span>
                            Tìm kiếm <strong>“{activeQuery}”</strong>
                        </span>
                        <kbd>↵ Enter</kbd>
                    </button>
                    <p
                        className="home-search-suggestion-empty"
                        style={{ textAlign: "center", margin: "6px 0 2px", fontSize: "11px", color: "#64748b" }}
                    >
                        Nhấn phím <strong>Enter</strong> để tải kết quả tìm kiếm
                    </p>
                </div>
            )}
        </section>
    );
}
