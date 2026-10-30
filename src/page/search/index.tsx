import { Link } from "react-router";
import { Hash, Search, User, FileText, Image, UserPlus, UserCheck, UserX, Clock } from "lucide-react";
import Header from "../home/components/Header";
import Sidebar from "../home/components/Sidebar";
import Discovery from "../home/components/Discovery";
import PostCard from "../home/components/PostCard";
import { HomeContext } from "../home/config";
import { useSearchActions } from "./actions";
import {
    searchTabs,
    searchTitle,
    searchEmptyTitle,
    searchEmptyDesc,
    searchDefaultHint,
    friendStatusLabels,
} from "./config";
import "../home/style.scss";
import "./style.scss";

export default function SearchPage() {
    const {
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
    } = useSearchActions();

    return (
        <HomeContext.Provider
            value={{
                user,
                search: headerSearch,
                setSearch: handleHeaderSearchChange,
                announce: setNotice,
                openPanel: setNotice,
            }}
        >
            <div className="nexchat-home search-results-page">
                <Header />
                <main className="home-grid">
                    <Sidebar filters={filters} onFiltersChange={setFilters} />

                    <div className="home-feed" id="home-feed" tabIndex={-1}>
                        {/* Heading Card */}
                        <section className="home-card saved-heading">
                            <h1>{searchTitle}</h1>
                            <p>
                                {query ? (
                                    <>
                                        Hiển thị kết quả cho từ khóa <strong>“{query}”</strong>
                                    </>
                                ) : (
                                    searchDefaultHint
                                )}
                            </p>
                        </section>

                        {/* Search Category Tabs */}
                        {query && (
                            <nav className="search-tabs" aria-label="Bộ lọc tìm kiếm">
                                {searchTabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        className={activeTab === tab.id ? "is-active" : ""}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.id === "all" && <Search size={14} />}
                                        {tab.id === "people" && <User size={14} />}
                                        {tab.id === "posts" && <FileText size={14} />}
                                        {tab.id === "hashtags" && <Hash size={14} />}
                                        {tab.id === "media" && <Image size={14} />}
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <section className="home-card home-empty" role="status">
                                Đang tải kết quả tìm kiếm...
                            </section>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <section className="home-card home-feed-error" role="alert">
                                <p>{error}</p>
                            </section>
                        )}

                        {/* Empty State */}
                        {!loading && !error && query && !hasAnyResults && (
                            <section className="home-card home-empty">
                                <Search size={32} aria-hidden="true" style={{ color: "#94a3b8", margin: "0 auto 12px" }} />
                                <h2>{searchEmptyTitle}</h2>
                                <p>{searchEmptyDesc}</p>
                                <Link to="/home">Về bảng tin</Link>
                            </section>
                        )}

                        {/* Tab Content: ALL or PEOPLE */}
                        {!loading && people.length > 0 && (activeTab === "all" || activeTab === "people") && (
                            <section className="search-section-card">
                                <h2>
                                    <span>
                                        <User size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
                                        Mọi người ({people.length})
                                    </span>
                                    {activeTab === "all" && (
                                        <button
                                            type="button"
                                            style={{ color: "#2563eb", fontSize: "12px", background: "none" }}
                                            onClick={() => setActiveTab("people")}
                                        >
                                            Xem tất cả →
                                        </button>
                                    )}
                                </h2>

                                <div className={`search-people-grid ${activeTab === "people" ? "is-full-list" : ""}`}>
                                    {people.map(person => {
                                        const isBusy = busyUserIds.has(person.id);
                                        return (
                                            <div key={person.id} className="search-person-card">
                                                <span
                                                    className="search-person-avatar"
                                                    onClick={() => handleNavigateProfile(person.id)}
                                                    role="button"
                                                    tabIndex={0}
                                                    title={`Xem hồ sơ của ${person.name}`}
                                                    aria-label={`Xem hồ sơ của ${person.name}`}
                                                >
                                                    {person.avatar ? (
                                                        <img src={person.avatar} alt={person.name} />
                                                    ) : (
                                                        <span>
                                                            {person.name
                                                                .trim()
                                                                .split(/\s+/)
                                                                .slice(-2)
                                                                .map(p => p[0])
                                                                .join("")
                                                                .toUpperCase() || "?"}
                                                        </span>
                                                    )}
                                                </span>

                                                <div className="search-person-info">
                                                    <strong
                                                        onClick={() => handleNavigateProfile(person.id)}
                                                        title={`Xem hồ sơ của ${person.name}`}
                                                    >
                                                        {person.name}
                                                    </strong>
                                                    <small>
                                                        {person.username ? `@${person.username} • ` : ""}
                                                        {friendStatusLabels[person.friendStatus]}
                                                    </small>
                                                    {person.bio && (
                                                        <p className="search-person-bio">{person.bio}</p>
                                                    )}
                                                </div>

                                                <div className="search-person-actions">
                                                    {/* Friend Action Button */}
                                                    {person.friendStatus === "none" && (
                                                        <button
                                                            type="button"
                                                            className="btn-friend"
                                                            disabled={isBusy}
                                                            onClick={() => performFriendAction(person, "request")}
                                                        >
                                                            <UserPlus size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
                                                            Kết bạn
                                                        </button>
                                                    )}
                                                    {person.friendStatus === "outgoing" && (
                                                        <button
                                                            type="button"
                                                            className="btn-friend is-outgoing"
                                                            disabled={isBusy}
                                                            onClick={() => performFriendAction(person, "cancel")}
                                                        >
                                                            <Clock size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
                                                            Hủy lời mời
                                                        </button>
                                                    )}
                                                    {person.friendStatus === "incoming" && (
                                                        <button
                                                            type="button"
                                                            className="btn-friend is-incoming"
                                                            disabled={isBusy}
                                                            onClick={() => performFriendAction(person, "accept")}
                                                        >
                                                            <UserCheck size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
                                                            Chấp nhận
                                                        </button>
                                                    )}
                                                    {person.friendStatus === "friends" && (
                                                        <button
                                                            type="button"
                                                            className="btn-friend is-friends"
                                                            disabled={isBusy}
                                                            onClick={() => performFriendAction(person, "unfriend")}
                                                        >
                                                            <UserX size={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} />
                                                            Hủy kết bạn
                                                        </button>
                                                    )}

                                                    {/* Follow Action Button */}
                                                    <button
                                                        type="button"
                                                        className={`btn-follow ${person.following ? "is-following" : ""}`}
                                                        disabled={isBusy}
                                                        onClick={() => performFollowAction(person)}
                                                    >
                                                        {person.following ? "Đang theo dõi" : "Theo dõi"}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {activeTab === "people" && hasNextCursor && (
                                    <button
                                        type="button"
                                        className="search-load-more"
                                        disabled={loadingMore}
                                        onClick={loadMore}
                                    >
                                        {loadingMore ? "Đang tải thêm người dùng..." : "Xem thêm người dùng"}
                                    </button>
                                )}
                            </section>
                        )}

                        {/* Tab Content: ALL or HASHTAGS */}
                        {!loading && hashtags.length > 0 && (activeTab === "all" || activeTab === "hashtags") && (
                            <section className="search-section-card">
                                <h2>
                                    <span>
                                        <Hash size={16} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} />
                                        Hashtags &amp; Chủ đề ({hashtags.length})
                                    </span>
                                </h2>
                                <div className="search-hashtags-grid">
                                    {hashtags.map(item => (
                                        <div
                                            key={item.tag}
                                            className="search-hashtag-card"
                                            onClick={() => handleSelectHashtag(item.tag)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="search-hashtag-icon">#</div>
                                            <div className="search-hashtag-info">
                                                <strong>{item.tag}</strong>
                                                <small>{item.postsCount} bài viết</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Tab Content: ALL, POSTS or MEDIA */}
                        {!loading && posts.length > 0 && (activeTab === "all" || activeTab === "posts" || activeTab === "media") && (
                            <div className="search-posts-container">
                                {activeTab === "all" && (
                                    <div
                                        style={{
                                            marginBottom: 12,
                                            fontWeight: 700,
                                            fontSize: 15,
                                            color: "#0f172a",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 6,
                                        }}
                                    >
                                        <FileText size={16} />
                                        Bài viết liên quan ({posts.length})
                                    </div>
                                )}
                                {posts.map(post => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onLike={likePost}
                                        onStateChange={changePostState}
                                        onUpdate={editPost}
                                        onDelete={removePost}
                                        onReload={() => {}}
                                    />
                                ))}

                                {hasNextCursor && (activeTab === "posts" || activeTab === "media") && (
                                    <button
                                        type="button"
                                        className="search-load-more"
                                        disabled={loadingMore}
                                        onClick={loadMore}
                                    >
                                        {loadingMore ? "Đang tải thêm bài viết..." : "Xem thêm bài viết"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Loading More & Errors */}
                        {loadingMore && <p className="search-loading-more">Đang tải thêm...</p>}
                        {loadMoreError && (
                            <p className="home-feed-error" role="alert">
                                {loadMoreError}
                            </p>
                        )}
                    </div>

                    <Discovery />
                </main>
                <div className="home-toast" role="status" aria-live="polite">
                    {notice}
                </div>
            </div>
        </HomeContext.Provider>
    );
}
