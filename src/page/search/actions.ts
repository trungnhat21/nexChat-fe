import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { searchAll, searchCategory, type SearchFilterParams } from "../../axios/search";
import { setPostLike, updatePost, deletePost } from "../../axios/posts";
import {
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    unfriend,
    followUser,
    unfollowUser,
} from "../../axios/friends";
import { getCurrentUser } from "../../axios/auth";
import type { CurrentUser } from "../../component/type/auth";
import type { SearchPerson, SearchHashtag } from "../../component/type/search";
import type { FeedPost, PostDraft, PostStateChange, UploadProgress } from "../../component/type/post";
import type { FeedFilters } from "../home/components/SearchFilterCard";
import type { SearchTabType } from "./config";

export function useSearchActions() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const query = searchParams.get("q") ?? "";
    const rawTab = searchParams.get("tab");
    const activeTab: SearchTabType =
        rawTab === "people" || rawTab === "posts" || rawTab === "hashtags" || rawTab === "media"
            ? rawTab
            : "all";

    // URL Search Filter synchronization
    const urlSort = searchParams.get("sort");
    const initialSort: FeedFilters["sort"] =
        urlSort === "latest" || urlSort === "newest" ? "latest" : "relevance";
    const urlPeriod = searchParams.get("period");
    const initialPeriod: FeedFilters["period"] =
        urlPeriod === "24h" || urlPeriod === "day"
            ? "24h"
            : urlPeriod === "week" || urlPeriod === "month"
              ? urlPeriod
              : "all";
    const initialMediaOnly = searchParams.get("mediaOnly") === "true";

    const [filters, setFiltersState] = useState<FeedFilters>({
        sort: initialSort,
        period: initialPeriod,
        mediaOnly: initialMediaOnly,
    });

    const setFilters = (newFilters: FeedFilters) => {
        setFiltersState(newFilters);
        setSearchParams(
            prev => {
                const next = new URLSearchParams(prev);
                if (newFilters.sort && newFilters.sort !== "relevance") {
                    next.set("sort", newFilters.sort);
                } else {
                    next.delete("sort");
                }
                if (newFilters.period && newFilters.period !== "all") {
                    next.set("period", newFilters.period);
                } else {
                    next.delete("period");
                }
                if (newFilters.mediaOnly) {
                    next.set("mediaOnly", "true");
                } else {
                    next.delete("mediaOnly");
                }
                return next;
            },
            { replace: true }
        );
    };

    // Header search input synchronization
    const [headerSearch, setHeaderSearch] = useState(query);

    // Sync input when query from URL changes (e.g. user presses Enter or changes URL)
    useEffect(() => {
        setHeaderSearch(query);
    }, [query]);

    // User & Notification Toast
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [notice, setNotice] = useState("");

    // Results states
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [loadMoreError, setLoadMoreError] = useState("");

    const [people, setPeople] = useState<SearchPerson[]>([]);
    const [peopleCursor, setPeopleCursor] = useState<string | null>(null);

    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [postsCursor, setPostsCursor] = useState<string | null>(null);

    const [hashtags, setHashtags] = useState<SearchHashtag[]>([]);

    // Track user ids being processed for friend/follow actions
    const [busyUserIds, setBusyUserIds] = useState<Set<string>>(new Set());

    // Abort controller ref for search requests
    const abortRef = useRef<AbortController | null>(null);

    // Fetch current user on mount
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

    // Main search effect connected to Backend Search API
    useEffect(() => {
        if (!query.trim()) {
            setPeople([]);
            setPosts([]);
            setHashtags([]);
            setPeopleCursor(null);
            setPostsCursor(null);
            setLoading(false);
            setError("");
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setError("");
        setLoadMoreError("");

        const filterParams: SearchFilterParams = {
            sort: filters.sort === "newest" || filters.sort === "latest" ? "latest" : "relevance",
            period: filters.period === "day" ? "24h" : filters.period,
            mediaOnly: activeTab === "media" ? true : filters.mediaOnly,
        };

        if (activeTab === "all") {
            searchAll({
                query: query.trim(),
                limit: 5,
                signal: controller.signal,
                ...filterParams,
            })
                .then(res => {
                    if (!controller.signal.aborted) {
                        setPeople(res.people.items);
                        setPeopleCursor(res.people.nextCursor);
                        setPosts(res.posts.items);
                        setPostsCursor(res.posts.nextCursor);
                        setHashtags(res.hashtags.items);
                    }
                })
                .catch((err: unknown) => {
                    if (!controller.signal.aborted && !(err instanceof DOMException && err.name === "AbortError")) {
                        setError("Không thể tải kết quả tìm kiếm. Vui lòng thử lại.");
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        } else if (activeTab === "people") {
            searchCategory(query.trim(), "people", undefined, controller.signal, 15)
                .then(res => {
                    if (!controller.signal.aborted) {
                        setPeople(res.items as SearchPerson[]);
                        setPeopleCursor(res.nextCursor);
                        setPosts([]);
                        setPostsCursor(null);
                        setHashtags([]);
                    }
                })
                .catch((err: unknown) => {
                    if (!controller.signal.aborted && !(err instanceof DOMException && err.name === "AbortError")) {
                        setError("Không thể tải kết quả tìm kiếm người dùng.");
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        } else if (activeTab === "posts" || activeTab === "media") {
            searchCategory(
                query.trim(),
                "posts",
                undefined,
                controller.signal,
                activeTab === "media" ? 30 : 15,
                filterParams
            )
                .then(res => {
                    if (!controller.signal.aborted) {
                        const allPosts = res.items as FeedPost[];
                        setPosts(allPosts);
                        setPostsCursor(res.nextCursor);
                        setPeople([]);
                        setPeopleCursor(null);
                        setHashtags([]);
                    }
                })
                .catch((err: unknown) => {
                    if (!controller.signal.aborted && !(err instanceof DOMException && err.name === "AbortError")) {
                        setError("Không thể tải danh sách bài viết.");
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        } else if (activeTab === "hashtags") {
            searchCategory(query.trim(), "hashtags", undefined, controller.signal, 50)
                .then(res => {
                    if (!controller.signal.aborted) {
                        setHashtags(res.items as SearchHashtag[]);
                        setPeople([]);
                        setPeopleCursor(null);
                        setPosts([]);
                        setPostsCursor(null);
                    }
                })
                .catch((err: unknown) => {
                    if (!controller.signal.aborted && !(err instanceof DOMException && err.name === "AbortError")) {
                        setError("Không thể tải danh sách hashtag.");
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        }

        return () => {
            controller.abort();
        };
    }, [query, activeTab, filters.sort, filters.period, filters.mediaOnly]);

    // Load more handler with filter options pushed to backend
    const loadMore = async () => {
        if (loading || loadingMore || !query.trim()) return;

        const filterParams: SearchFilterParams = {
            sort: filters.sort === "newest" ? "latest" : "relevance",
            period: filters.period === "day" ? "24h" : filters.period,
            mediaOnly: activeTab === "media" ? true : filters.mediaOnly,
        };

        if (activeTab === "people" && peopleCursor) {
            setLoadingMore(true);
            setLoadMoreError("");
            try {
                const res = await searchCategory(query.trim(), "people", peopleCursor, undefined, 15);
                setPeople(prev => [...prev, ...(res.items as SearchPerson[])]);
                setPeopleCursor(res.nextCursor);
            } catch {
                setLoadMoreError("Không thể tải thêm người dùng. Vui lòng thử lại.");
            } finally {
                setLoadingMore(false);
            }
        } else if ((activeTab === "posts" || activeTab === "media" || activeTab === "all") && postsCursor) {
            setLoadingMore(true);
            setLoadMoreError("");
            try {
                const res = await searchCategory(
                    query.trim(),
                    "posts",
                    postsCursor,
                    undefined,
                    activeTab === "media" ? 30 : 15,
                    filterParams
                );
                setPosts(prev => [...prev, ...(res.items as FeedPost[])]);
                setPostsCursor(res.nextCursor);
            } catch {
                setLoadMoreError("Không thể tải thêm bài viết. Vui lòng thử lại.");
            } finally {
                setLoadingMore(false);
            }
        }
    };

    // Tab and query setters
    const setActiveTab = (tab: SearchTabType) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (tab === "all") {
                next.delete("tab");
            } else {
                next.set("tab", tab);
            }
            return next;
        });
    };

    const handleHeaderSearchChange = (val: string) => {
        setHeaderSearch(val);
    };

    const handleSelectHashtag = (tag: string) => {
        setHeaderSearch(tag);
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("q", tag);
            next.set("tab", "posts");
            return next;
        });
    };

    const handleNavigateProfile = (personId: string) => {
        navigate(`/profile/${encodeURIComponent(personId)}`);
    };

    // Relationship Actions (Friend request, cancel, accept, unfriend)
    const performFriendAction = async (
        person: SearchPerson,
        action: "request" | "cancel" | "accept" | "reject" | "unfriend"
    ) => {
        if (busyUserIds.has(person.id)) return;
        setBusyUserIds(prev => new Set(prev).add(person.id));

        try {
            if (action === "request") {
                const res = await sendFriendRequest(person.id);
                setPeople(prev =>
                    prev.map(p =>
                        p.id === person.id
                            ? { ...p, friendStatus: "outgoing", requestId: res.friendship.id }
                            : p
                    )
                );
                setNotice("Đã gửi lời mời kết bạn.");
            } else if (action === "cancel" && person.requestId) {
                await cancelFriendRequest(person.requestId);
                setPeople(prev =>
                    prev.map(p =>
                        p.id === person.id ? { ...p, friendStatus: "none", requestId: null } : p
                    )
                );
                setNotice("Đã hủy lời mời kết bạn.");
            } else if (action === "accept" && person.requestId) {
                await acceptFriendRequest(person.requestId);
                setPeople(prev =>
                    prev.map(p =>
                        p.id === person.id ? { ...p, friendStatus: "friends", requestId: null } : p
                    )
                );
                setNotice("Đã chấp nhận lời mời kết bạn.");
            } else if (action === "unfriend") {
                await unfriend(person.id);
                setPeople(prev =>
                    prev.map(p =>
                        p.id === person.id ? { ...p, friendStatus: "none", requestId: null } : p
                    )
                );
                setNotice("Đã hủy kết bạn.");
            }
        } catch {
            setNotice("Thao tác thất bại. Vui lòng thử lại sau.");
        } finally {
            setBusyUserIds(prev => {
                const next = new Set(prev);
                next.delete(person.id);
                return next;
            });
        }
    };

    // Toggle follow action
    const performFollowAction = async (person: SearchPerson) => {
        if (busyUserIds.has(person.id)) return;
        setBusyUserIds(prev => new Set(prev).add(person.id));

        try {
            if (person.following) {
                await unfollowUser(person.id);
                setPeople(prev =>
                    prev.map(p => (p.id === person.id ? { ...p, following: false } : p))
                );
                setNotice(`Đã bỏ theo dõi ${person.name}.`);
            } else {
                await followUser(person.id);
                setPeople(prev =>
                    prev.map(p => (p.id === person.id ? { ...p, following: true } : p))
                );
                setNotice(`Đang theo dõi ${person.name}.`);
            }
        } catch {
            setNotice("Không thể thay đổi trạng thái theo dõi. Vui lòng thử lại.");
        } finally {
            setBusyUserIds(prev => {
                const next = new Set(prev);
                next.delete(person.id);
                return next;
            });
        }
    };

    // Post handlers
    const changePostState: PostStateChange = (id, patch) => {
        setPosts(prev => prev.map(post => (post.id === id ? { ...post, ...patch } : post)));
    };

    const likePost = async (id: string, liked: boolean) => {
        const res = await setPostLike(id, liked);
        setPosts(prev =>
            prev.map(post => (post.id === id ? { ...post, liked: res.liked, likes: res.likes } : post))
        );
    };

    const editPost = async (id: string, draft: PostDraft, onProgress: UploadProgress) => {
        const updated = await updatePost(id, draft, onProgress);
        setPosts(prev => prev.map(p => (p.id === id ? updated : p)));
    };

    const removePost = async (id: string) => {
        await deletePost(id);
        setPosts(prev => prev.filter(p => p.id !== id));
    };

    const hasAnyResults =
        people.length > 0 || posts.length > 0 || hashtags.length > 0;

    const hasNextCursor =
        (activeTab === "people" && !!peopleCursor) ||
        ((activeTab === "posts" || activeTab === "media" || activeTab === "all") && !!postsCursor);

    return {
        query,
        headerSearch,
        activeTab,
        filters,
        setFilters,
        setActiveTab,
        handleHeaderSearchChange,
        user,
        notice,
        setNotice,
        loading,
        loadingMore,
        error,
        loadMoreError,
        people,
        posts,
        hashtags,
        hasAnyResults,
        hasNextCursor,
        busyUserIds,
        loadMore,
        performFriendAction,
        performFollowAction,
        handleSelectHashtag,
        handleNavigateProfile,
        changePostState,
        likePost,
        editPost,
        removePost,
    };
}
