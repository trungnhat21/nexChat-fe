import type { SearchTab } from "../../component/type/search";
import type { FeedFilters } from "../home/components/SearchFilterCard";

export type SearchTabType = SearchTab;

export interface SearchTabItem {
    id: SearchTabType;
    label: string;
}

export const searchTabs: SearchTabItem[] = [
    { id: "all", label: "Tất cả" },
    { id: "people", label: "Mọi người" },
    { id: "posts", label: "Bài viết" },
    { id: "hashtags", label: "Hashtags" },
    { id: "media", label: "Ảnh & Video" },
];

export const defaultSearchFilters: FeedFilters = {
    sort: "relevance",
    period: "all",
    mediaOnly: false,
};

export const searchTitle = "Kết quả tìm kiếm";
export const searchEmptyTitle = "Không tìm thấy kết quả phù hợp";
export const searchEmptyDesc = "Hãy thử tìm kiếm với từ khóa khác, tên người dùng hoặc hashtag phổ biến.";
export const searchDefaultHint = "Nhập từ khóa trên thanh tìm kiếm để tra cứu thông tin.";

export const friendStatusLabels = {
    none: "Kết bạn",
    outgoing: "Hủy lời mời",
    incoming: "Chấp nhận",
    friends: "Bạn bè",
    blocked: "Đã chặn",
} as const;
