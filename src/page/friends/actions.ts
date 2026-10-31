import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { getCurrentUser } from "../../axios/auth";
import {
    getReceivedFriendRequests,
    getFriendSuggestions,
    getFriendsList,
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    cancelFriendRequest,
    unfriend,
    followUser,
    unfollowUser,
} from "../../axios/friends";
import type { CurrentUser } from "../../component/type/auth";
import type { SuggestedUser } from "../../component/type/relationship";
import type { FriendTabType, ReceivedFriendRequest, FriendUser } from "../../component/type/friends";
import { confirmDelete } from "../../utils/swal";

export function useFriendsActions() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const rawTab = searchParams.get("tab");
    const activeTab: FriendTabType =
        rawTab === "suggestions" || rawTab === "all" ? rawTab : "requests";

    const [user, setUser] = useState<CurrentUser | null>(null);
    const [headerSearch, setHeaderSearch] = useState("");
    const [localFilter, setLocalFilter] = useState("");
    const [notice, setNotice] = useState("");

    const [requests, setRequests] = useState<ReceivedFriendRequest[]>([]);
    const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
    const [friends, setFriends] = useState<FriendUser[]>([]);

    const [loading, setLoading] = useState(true);
    const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

    // Fetch current logged in user
    useEffect(() => {
        let active = true;
        void getCurrentUser()
            .then(res => {
                if (active) setUser(res.data.currentUser);
            })
            .catch(() => {});
        return () => {
            active = false;
        };
    }, []);

    // Load data for all tabs on mount
    const loadData = async () => {
        setLoading(true);
        try {
            const [reqs, suggs, frs] = await Promise.all([
                getReceivedFriendRequests().catch(() => [] as ReceivedFriendRequest[]),
                getFriendSuggestions().catch(() => [] as SuggestedUser[]),
                getFriendsList().catch(() => [] as FriendUser[]),
            ]);
            const friendIdSet = new Set(frs.map(f => f.id));
            const validSuggestions = suggs.filter(s => s.friendStatus !== "friends" && !friendIdSet.has(s.id));
            setRequests(reqs);
            setSuggestions(validSuggestions);
            setFriends(frs);
        } catch {
            setNotice("Không thể tải danh sách bạn bè. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    // Set busy state helper
    const markBusy = (id: string, busy: boolean) => {
        setBusyIds(prev => {
            const next = new Set(prev);
            if (busy) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    // Tab switching
    const handleTabChange = (tab: FriendTabType) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (tab === "requests") {
                next.delete("tab");
            } else {
                next.set("tab", tab);
            }
            return next;
        });
    };

    // Accept friend request
    const handleAcceptRequest = async (request: ReceivedFriendRequest) => {
        if (busyIds.has(request.id)) return;
        markBusy(request.id, true);

        try {
            await acceptFriendRequest(request.id);
            const requester = request.requester;
            const requesterName =
                [requester.last_name, requester.first_name].filter(Boolean).join(" ") ||
                requester.user_name ||
                "Người dùng";

            setRequests(prev => prev.filter(r => r.id !== request.id));
            setSuggestions(prev => prev.filter(s => s.id !== requester.id));
            setFriends(prev => [
                {
                    id: requester.id,
                    name: requesterName,
                    username: requester.user_name,
                    email: requester.email,
                    avatar: requester.avatar,
                },
                ...prev,
            ]);
            setNotice(`Đã chấp nhận lời mời kết bạn từ ${requesterName}.`);
        } catch {
            setNotice("Không thể chấp nhận lời mời kết bạn. Vui lòng thử lại.");
        } finally {
            markBusy(request.id, false);
        }
    };

    // Reject friend request
    const handleRejectRequest = async (request: ReceivedFriendRequest) => {
        if (busyIds.has(request.id)) return;
        markBusy(request.id, true);

        try {
            await rejectFriendRequest(request.id);
            setRequests(prev => prev.filter(r => r.id !== request.id));
            setNotice("Đã từ chối lời mời kết bạn.");
        } catch {
            setNotice("Không thể từ chối lời mời kết bạn. Vui lòng thử lại.");
        } finally {
            markBusy(request.id, false);
        }
    };

    // Send friend request to suggested user
    const handleSendRequest = async (suggested: SuggestedUser) => {
        if (busyIds.has(suggested.id)) return;
        markBusy(suggested.id, true);

        try {
            const res = await sendFriendRequest(suggested.id);
            setSuggestions(prev =>
                prev.map(s =>
                    s.id === suggested.id
                        ? { ...s, friendStatus: "outgoing", requestId: res.friendship.id }
                        : s
                )
            );
            setNotice(`Đã gửi lời mời kết bạn đến ${suggested.name}.`);
        } catch {
            setNotice("Không thể gửi lời mời kết bạn. Vui lòng thử lại.");
        } finally {
            markBusy(suggested.id, false);
        }
    };

    // Cancel friend request
    const handleCancelRequest = async (suggested: SuggestedUser) => {
        if (!suggested.requestId || busyIds.has(suggested.id)) return;
        markBusy(suggested.id, true);

        try {
            await cancelFriendRequest(suggested.requestId);
            setSuggestions(prev =>
                prev.map(s =>
                    s.id === suggested.id
                        ? { ...s, friendStatus: "none", requestId: null }
                        : s
                )
            );
            setNotice(`Đã hủy lời mời kết bạn với ${suggested.name}.`);
        } catch {
            setNotice("Không thể hủy lời mời kết bạn. Vui lòng thử lại.");
        } finally {
            markBusy(suggested.id, false);
        }
    };

    // Remove suggestion from list
    const handleRemoveSuggestion = (userId: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== userId));
        setNotice("Đã gỡ khỏi danh sách gợi ý.");
    };

    // Toggle follow on suggested user
    const handleToggleFollow = async (suggested: SuggestedUser) => {
        if (busyIds.has(suggested.id)) return;
        markBusy(suggested.id, true);

        try {
            if (suggested.following) {
                await unfollowUser(suggested.id);
                setSuggestions(prev =>
                    prev.map(s => (s.id === suggested.id ? { ...s, following: false } : s))
                );
                setNotice(`Đã bỏ theo dõi ${suggested.name}.`);
            } else {
                await followUser(suggested.id);
                setSuggestions(prev =>
                    prev.map(s => (s.id === suggested.id ? { ...s, following: true } : s))
                );
                setNotice(`Đang theo dõi ${suggested.name}.`);
            }
        } catch {
            setNotice("Không thể cập nhật theo dõi. Vui lòng thử lại.");
        } finally {
            markBusy(suggested.id, false);
        }
    };

    // Remove friend (unfriend)
    const handleUnfriend = async (friend: FriendUser) => {
        const confirmed = await confirmDelete(`Bạn có chắc muốn hủy kết bạn với ${friend.name}?`);
        if (!confirmed) return;

        markBusy(friend.id, true);
        try {
            await unfriend(friend.id);
            setFriends(prev => prev.filter(f => f.id !== friend.id));
            setNotice(`Đã hủy kết bạn với ${friend.name}.`);
        } catch {
            setNotice("Không thể hủy kết bạn. Vui lòng thử lại.");
        } finally {
            markBusy(friend.id, false);
        }
    };

    // Navigation helpers
    const handleMessage = (friendId: string) => {
        navigate(`/messages?userId=${encodeURIComponent(friendId)}`);
    };

    const handleNavigateProfile = (userId: string) => {
        navigate(`/profile/${encodeURIComponent(userId)}`);
    };

    // Filter items according to search filter
    const trimmedFilter = localFilter.trim().toLowerCase();

    const filteredRequests = requests.filter(r => {
        if (!trimmedFilter) return true;
        const name = [r.requester.last_name, r.requester.first_name].filter(Boolean).join(" ").toLowerCase();
        const username = (r.requester.user_name || "").toLowerCase();
        return name.includes(trimmedFilter) || username.includes(trimmedFilter);
    });

    const friendIdSet = new Set(friends.map(f => f.id));
    const nonFriendSuggestions = suggestions.filter(s => s.friendStatus !== "friends" && !friendIdSet.has(s.id));

    const filteredSuggestions = nonFriendSuggestions.filter(s => {
        if (!trimmedFilter) return true;
        const name = s.name.toLowerCase();
        const username = (s.username || "").toLowerCase();
        return name.includes(trimmedFilter) || username.includes(trimmedFilter);
    });

    const filteredFriends = friends.filter(f => {
        if (!trimmedFilter) return true;
        const name = f.name.toLowerCase();
        const username = (f.username || "").toLowerCase();
        return name.includes(trimmedFilter) || username.includes(trimmedFilter);
    });

    return {
        activeTab,
        handleTabChange,
        user,
        headerSearch,
        setHeaderSearch,
        localFilter,
        setLocalFilter,
        notice,
        setNotice,
        loading,
        busyIds,
        requests: filteredRequests,
        rawRequestsCount: requests.length,
        suggestions: filteredSuggestions,
        rawSuggestionsCount: nonFriendSuggestions.length,
        friends: filteredFriends,
        rawFriendsCount: friends.length,
        loadData,
        handleAcceptRequest,
        handleRejectRequest,
        handleSendRequest,
        handleCancelRequest,
        handleRemoveSuggestion,
        handleToggleFollow,
        handleUnfriend,
        handleMessage,
        handleNavigateProfile,
    };
}
