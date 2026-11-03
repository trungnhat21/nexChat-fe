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
                        <section className="card p-6 mb-4">
                            <h1 className="fs-24 fw-bold mb-2 text-gray-900">{searchTitle}</h1>
                            <p className="text-gray-600 m-0 fs-14">
                                {query ? (
                                    <>
                                        Hiển thị kết quả cho từ khóa <strong className="text-primary">“{query}”</strong>
                                    </>
                                ) : (
                                    searchDefaultHint
                                )}
                            </p>
                        </section>

                        {/* Search Category Tabs */}
                        {query && (
                            <nav className="nav-group nav-group-pill w-100 mb-4" aria-label="Bộ lọc tìm kiếm">
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
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        )}

                        {/* Loading State */}
                        {loading && (
                            <section className="card p-6 text-center text-gray-500 mb-4" role="status">
                                Đang tải kết quả tìm kiếm...
                            </section>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <section className="card p-6 border-dashed border-danger mb-4 text-center" role="alert">
                                <p className="text-danger fw-semibold m-0">{error}</p>
                            </section>
                        )}

                        {/* Empty State */}
                        {!loading && !error && query && !hasAnyResults && (
                            <section className="card p-8 text-center mb-4">
                                <Search size={36} aria-hidden="true" className="text-gray-400 mx-auto mb-3" />
                                <h2 className="fs-18 fw-bold text-gray-800 mb-2">{searchEmptyTitle}</h2>
                                <p className="text-gray-500 fs-14 mb-4">{searchEmptyDesc}</p>
                                <div>
                                    <Link to="/home" className="btn btn-primary btn-sm">Về bảng tin</Link>
                                </div>
                            </section>
                        )}

                        {/* Tab Content: ALL or PEOPLE */}
                        {!loading && people.length > 0 && (activeTab === "all" || activeTab === "people") && (
                            <section className="card p-5 mb-4 shadow-sm">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h2 className="fs-15 fw-bold text-gray-800 m-0 d-flex align-items-center gap-2">
                                        <User size={16} className="text-primary" />
                                        Mọi người ({people.length})
                                    </h2>
                                    {activeTab === "all" && (
                                        <button
                                            type="button"
                                            className="btn btn-flush fs-12 text-primary fw-semibold"
                                            onClick={() => setActiveTab("people")}
                                        >
                                            Xem tất cả →
                                        </button>
                                    )}
                                </div>

                                <div className={`d-flex flex-column gap-3`}>
                                    {people.map(person => {
                                        const isBusy = busyUserIds.has(person.id);
                                        return (
                                            <div key={person.id} className="d-flex align-items-center gap-3 p-3 rounded-lg border bg-light">
                                                <span
                                                    className="rounded-circle overflow-hidden flex-shrink-0 cursor-pointer d-grid place-items-center bg-gray-200 fw-bold fs-14 text-gray-700"
                                                    style={{ width: 44, height: 44 }}
                                                    onClick={() => handleNavigateProfile(person.id)}
                                                    role="button"
                                                    tabIndex={0}
                                                    title={`Xem hồ sơ của ${person.name}`}
                                                    aria-label={`Xem hồ sơ của ${person.name}`}
                                                >
                                                    {person.avatar ? (
                                                        <img src={person.avatar} alt={person.name} className="w-100 h-100 object-cover" />
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

                                                <div className="flex-grow-1 min-w-0">
                                                    <strong
                                                        className="d-block fs-14 fw-semibold text-gray-900 text-truncate cursor-pointer"
                                                        onClick={() => handleNavigateProfile(person.id)}
                                                        title={`Xem hồ sơ của ${person.name}`}
                                                    >
                                                        {person.name}
                                                    </strong>
                                                    <small className="d-block fs-12 text-gray-500 text-truncate">
                                                        {person.username ? `@${person.username} • ` : ""}
                                                        {friendStatusLabels[person.friendStatus]}
                                                    </small>
                                                    {person.bio && (
                                                        <p className="fs-12 text-gray-600 m-0 mt-1 text-truncate">{person.bio}</p>
                                                    )}
                                                </div>

                                                <div className="d-flex align-items-center gap-2 ms-auto flex-shrink-0">
                                                    {/* Friend Action Button */}
                                                    {person.friendStatus === "none" && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-primary"
                                                            disabled={isBusy}
                                                            onClick={() => performFriendAction(person, "request")}
                                                        >
                                                            <UserPlus size={13} />
                                                            Kết bạn
                                                        </button>
                                                    )}
                                                    {person.friendStatus === "outgoing" && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light-secondary"
                                                            disabled={isBusy}
                                                            onClick={() => performFriendAction(person, "cancel")}
                                                        >
                                                            <Clock size={13} />
                                                            Hủy lời mời
                                                        </button>
                                                    )}
                                                    {person.friendStatus === "incoming" && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-primary"
                                                            disabled={isBusy}
                                                            onClick={() => performFriendAction(person, "accept")}
                                                        >
                                                            <UserCheck size={13} />
                                                            Chấp nhận
                                                        </button>
                                                    )}
                                                    {person.friendStatus === "friends" && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light-danger"
                                                            disabled={isBusy}
                                                            onClick={() => performFriendAction(person, "unfriend")}
                                                        >
                                                            <UserX size={13} />
                                                            Hủy kết bạn
                                                        </button>
                                                    )}

                                                    {/* Follow Action Button */}
                                                    <button
                                                        type="button"
                                                        className={person.following ? "btn btn-sm btn-light-primary" : "btn btn-sm btn-light-secondary"}
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
                                        className="btn btn-light-primary w-100 py-3 rounded-lg fw-bold mt-3"
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
                            <section className="card p-5 mb-4 shadow-sm">
                                <h2 className="fs-15 fw-bold text-gray-800 mb-4 d-flex align-items-center gap-2">
                                    <Hash size={16} className="text-primary" />
                                    Hashtags &amp; Chủ đề ({hashtags.length})
                                </h2>
                                <div className="d-grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                                    {hashtags.map(item => (
                                        <div
                                            key={item.tag}
                                            className="d-flex align-items-center gap-3 p-3 rounded-lg border bg-light cursor-pointer"
                                            onClick={() => handleSelectHashtag(item.tag)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <div className="badge badge-circle badge-light-primary fw-bold fs-14" style={{ width: 36, height: 36 }}>
                                                #
                                            </div>
                                            <div className="min-w-0 flex-grow-1">
                                                <strong className="d-block fs-13 text-gray-900 text-truncate">{item.tag}</strong>
                                                <small className="d-block fs-12 text-gray-500">{item.postsCount} bài viết</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Tab Content: ALL, POSTS or MEDIA */}
                        {!loading && posts.length > 0 && (activeTab === "all" || activeTab === "posts" || activeTab === "media") && (
                            <div className="d-flex flex-column gap-4">
                                {activeTab === "all" && (
                                    <div className="fs-15 fw-bold text-gray-900 d-flex align-items-center gap-2">
                                        <FileText size={16} className="text-primary" />
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
                                        className="btn btn-light-primary w-100 py-3 rounded-lg fw-bold"
                                        disabled={loadingMore}
                                        onClick={loadMore}
                                    >
                                        {loadingMore ? "Đang tải thêm bài viết..." : "Xem thêm bài viết"}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Loading More & Errors */}
                        {loadingMore && <p className="text-center text-gray-500 py-2 fs-13">Đang tải thêm...</p>}
                        {loadMoreError && (
                            <p className="card p-3 border-dashed border-danger text-danger text-center fs-13" role="alert">
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
