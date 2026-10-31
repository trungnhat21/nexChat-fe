import type { FriendTabConfig } from "../../component/type/friends";

export const friendsTabs: FriendTabConfig[] = [
    { id: "requests", label: "Lời mời kết bạn" },
    { id: "suggestions", label: "Gợi ý" },
    { id: "all", label: "Bạn bè" },
];

export const friendsPageConfig = {
    title: "Quản lý bạn bè",
    subtitle: "Xem lời mời kết bạn, khám phá những người bạn có thể biết và kết nối với bạn bè.",
    emptyStates: {
        requests: {
            title: "Không có lời mời kết bạn nào",
            desc: "Khi người khác gửi lời mời kết bạn cho bạn, các lời mời sẽ hiển thị tại đây.",
        },
        suggestions: {
            title: "Chưa có gợi ý bạn bè",
            desc: "Hiện tại không có gợi ý mới. Bạn có thể tìm kiếm bạn bè bằng thanh tìm kiếm ở trên.",
        },
        all: {
            title: "Chưa có bạn bè nào",
            desc: "Hãy kết nối với bạn bè từ danh sách gợi ý để cùng trò chuyện và chia sẻ bài viết.",
        },
    },
    labels: {
        accept: "Chấp nhận",
        reject: "Từ chối",
        addFriend: "Kết bạn",
        cancelRequest: "Hủy lời mời",
        sent: "Đã gửi",
        follow: "Theo dõi",
        following: "Đang theo dõi",
        removeSuggestion: "Gỡ gợi ý",
        message: "Nhắn tin",
        friendStatus: "Bạn bè",
        unfriend: "Hủy kết bạn",
        viewProfile: "Xem hồ sơ",
    },
};
