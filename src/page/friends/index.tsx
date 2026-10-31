import { UserCheck, UserX, UserPlus, Users, MessageSquare, Clock, Search, X } from "lucide-react";
import Header from "../home/components/Header";
import Sidebar from "../home/components/Sidebar";
import Discovery from "../home/components/Discovery";
import { HomeContext } from "../home/config";
import { useFriendsActions } from "./actions";
import { friendsTabs, friendsPageConfig } from "./config";
import "../home/style.scss";
import "./style.scss";

export default function FriendsPage() {
    const {
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
        requests,
        rawRequestsCount,
        suggestions,
        rawSuggestionsCount,
        friends,
        rawFriendsCount,
        handleAcceptRequest,
        handleRejectRequest,
        handleSendRequest,
        handleCancelRequest,
        handleRemoveSuggestion,
        handleToggleFollow,
        handleUnfriend,
        handleMessage,
        handleNavigateProfile,
    } = useFriendsActions();

    return (
        <HomeContext.Provider
            value={{
                user,
                search: headerSearch,
                setSearch: setHeaderSearch,
                announce: setNotice,
                openPanel: setNotice,
            }}
        >
            <div className="nexchat-home friends-page">
                <Header />
                <main className="home-grid">
                    <Sidebar />

                    <div className="home-feed" id="home-feed" tabIndex={-1}>
                        {/* Page Heading */}
                        <section className="home-card saved-heading">
                            <h1>{friendsPageConfig.title}</h1>
                            <p>{friendsPageConfig.subtitle}</p>
                        </section>

                        {/* Top Navigation Tabs */}
                        <nav className="friends-tabs" aria-label="Bộ lọc bạn bè">
                            {friendsTabs.map(tab => {
                                const count =
                                    tab.id === "requests"
                                        ? rawRequestsCount
                                        : tab.id === "suggestions"
                                          ? rawSuggestionsCount
                                          : rawFriendsCount;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        className={activeTab === tab.id ? "is-active" : ""}
                                        onClick={() => handleTabChange(tab.id)}
                                    >
                                        {tab.id === "requests" && <UserCheck size={15} />}
                                        {tab.id === "suggestions" && <UserPlus size={15} />}
                                        {tab.id === "all" && <Users size={15} />}
                                        <span>{tab.label}</span>
                                        {count > 0 && <span className="tab-badge">{count}</span>}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Quick In-Tab Search Bar */}
                        <div className="friends-search-bar">
                            <Search size={16} />
                            <input
                                type="text"
                                placeholder={
                                    activeTab === "requests"
                                        ? "Lọc theo tên hoặc @username người gửi..."
                                        : activeTab === "suggestions"
                                          ? "Lọc theo tên hoặc @username gợi ý..."
                                          : "Lọc theo tên hoặc @username bạn bè..."
                                }
                                value={localFilter}
                                onChange={e => setLocalFilter(e.target.value)}
                            />
                            {localFilter && (
                                <button
                                    type="button"
                                    className="clear-search"
                                    onClick={() => setLocalFilter("")}
                                    aria-label="Xóa bộ lọc"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Loading Skeletons */}
                        {loading && (
                            <section className="friends-section-card">
                                <div className="friend-skeleton-list">
                                    <div className="friend-skeleton-card" />
                                    <div className="friend-skeleton-card" />
                                    <div className="friend-skeleton-card" />
                                </div>
                            </section>
                        )}

                        {/* Tab 1: Received Friend Requests */}
                        {!loading && activeTab === "requests" && (
                            <section className="friends-section-card">
                                <h2>
                                    <span>
                                        <UserCheck size={16} />
                                        Lời mời kết bạn ({requests.length})
                                    </span>
                                </h2>

                                {requests.length > 0 ? (
                                    <div className="friends-list">
                                        {requests.map(req => {
                                            const requester = req.requester;
                                            const displayName =
                                                [requester.last_name, requester.first_name].filter(Boolean).join(" ") ||
                                                requester.user_name ||
                                                "Người dùng";
                                            const isBusy = busyIds.has(req.id);

                                            return (
                                                <div key={req.id} className="friend-card">
                                                    <span
                                                        className="friend-avatar"
                                                        onClick={() => handleNavigateProfile(requester.id)}
                                                        title={`Xem hồ sơ của ${displayName}`}
                                                    >
                                                        {requester.avatar ? (
                                                            <img src={requester.avatar} alt={displayName} />
                                                        ) : (
                                                            <span>
                                                                {displayName
                                                                    .trim()
                                                                    .split(/\s+/)
                                                                    .slice(-2)
                                                                    .map(p => p[0])
                                                                    .join("")
                                                                    .toUpperCase() || "?"}
                                                            </span>
                                                        )}
                                                    </span>

                                                    <div className="friend-info">
                                                        <strong
                                                            onClick={() => handleNavigateProfile(requester.id)}
                                                            title={`Xem hồ sơ của ${displayName}`}
                                                        >
                                                            {displayName}
                                                        </strong>
                                                        <small>
                                                            {requester.user_name ? `@${requester.user_name} • ` : ""}
                                                            Đã gửi cho bạn một lời mời kết bạn
                                                        </small>
                                                    </div>

                                                    <div className="friend-actions">
                                                        <button
                                                            type="button"
                                                            className="btn-primary"
                                                            disabled={isBusy}
                                                            onClick={() => handleAcceptRequest(req)}
                                                        >
                                                            <UserCheck size={13} />
                                                            {friendsPageConfig.labels.accept}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-secondary"
                                                            disabled={isBusy}
                                                            onClick={() => handleRejectRequest(req)}
                                                        >
                                                            <UserX size={13} />
                                                            {friendsPageConfig.labels.reject}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="friends-empty-state">
                                        <UserCheck size={36} />
                                        <h3>{friendsPageConfig.emptyStates.requests.title}</h3>
                                        <p>{friendsPageConfig.emptyStates.requests.desc}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Tab 2: Friend Suggestions */}
                        {!loading && activeTab === "suggestions" && (
                            <section className="friends-section-card">
                                <h2>
                                    <span>
                                        <UserPlus size={16} />
                                        Gợi ý kết bạn ({suggestions.length})
                                    </span>
                                </h2>

                                {suggestions.length > 0 ? (
                                    <div className="friends-list">
                                        {suggestions.map(person => {
                                            const isBusy = busyIds.has(person.id);

                                            return (
                                                <div key={person.id} className="friend-card">
                                                    <span
                                                        className="friend-avatar"
                                                        onClick={() => handleNavigateProfile(person.id)}
                                                        title={`Xem hồ sơ của ${person.name}`}
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

                                                    <div className="friend-info">
                                                        <strong
                                                            onClick={() => handleNavigateProfile(person.id)}
                                                            title={`Xem hồ sơ của ${person.name}`}
                                                        >
                                                            {person.name}
                                                        </strong>
                                                        <small>
                                                            {person.username ? `@${person.username} • ` : ""}
                                                            {person.friendStatus === "outgoing"
                                                                ? "Đã gửi lời mời"
                                                                : person.friendStatus === "friends"
                                                                  ? "Bạn bè"
                                                                  : "Gợi ý cho bạn"}
                                                        </small>
                                                    </div>

                                                    <div className="friend-actions">
                                                        {person.friendStatus === "none" && (
                                                            <button
                                                                type="button"
                                                                className="btn-primary"
                                                                disabled={isBusy}
                                                                onClick={() => handleSendRequest(person)}
                                                            >
                                                                <UserPlus size={13} />
                                                                {friendsPageConfig.labels.addFriend}
                                                            </button>
                                                        )}

                                                        {person.friendStatus === "outgoing" && (
                                                            <button
                                                                type="button"
                                                                className="btn-secondary"
                                                                disabled={isBusy}
                                                                onClick={() => handleCancelRequest(person)}
                                                            >
                                                                <Clock size={13} />
                                                                {friendsPageConfig.labels.cancelRequest}
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className={person.following ? "btn-following" : "btn-secondary"}
                                                            disabled={isBusy}
                                                            onClick={() => handleToggleFollow(person)}
                                                        >
                                                            {person.following
                                                                ? friendsPageConfig.labels.following
                                                                : friendsPageConfig.labels.follow}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn-secondary"
                                                            onClick={() => handleRemoveSuggestion(person.id)}
                                                            title={friendsPageConfig.labels.removeSuggestion}
                                                        >
                                                            <X size={13} />
                                                            {friendsPageConfig.labels.removeSuggestion}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="friends-empty-state">
                                        <Users size={36} />
                                        <h3>{friendsPageConfig.emptyStates.suggestions.title}</h3>
                                        <p>{friendsPageConfig.emptyStates.suggestions.desc}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Tab 3: All Friends */}
                        {!loading && activeTab === "all" && (
                            <section className="friends-section-card">
                                <h2>
                                    <span>
                                        <Users size={16} />
                                        Tất cả bạn bè ({friends.length})
                                    </span>
                                </h2>

                                {friends.length > 0 ? (
                                    <div className="friends-list">
                                        {friends.map(friend => {
                                            const isBusy = busyIds.has(friend.id);

                                            return (
                                                <div key={friend.id} className="friend-card">
                                                    <span
                                                        className="friend-avatar"
                                                        onClick={() => handleNavigateProfile(friend.id)}
                                                        title={`Xem hồ sơ của ${friend.name}`}
                                                    >
                                                        {friend.avatar ? (
                                                            <img src={friend.avatar} alt={friend.name} />
                                                        ) : (
                                                            <span>
                                                                {friend.name
                                                                    .trim()
                                                                    .split(/\s+/)
                                                                    .slice(-2)
                                                                    .map(p => p[0])
                                                                    .join("")
                                                                    .toUpperCase() || "?"}
                                                            </span>
                                                        )}
                                                    </span>

                                                    <div className="friend-info">
                                                        <strong
                                                            onClick={() => handleNavigateProfile(friend.id)}
                                                            title={`Xem hồ sơ của ${friend.name}`}
                                                        >
                                                            {friend.name}
                                                        </strong>
                                                        <small>
                                                            {friend.username ? `@${friend.username} • ` : ""}
                                                            {friendsPageConfig.labels.friendStatus}
                                                        </small>
                                                    </div>

                                                    <div className="friend-actions">
                                                        <button
                                                            type="button"
                                                            className="btn-message"
                                                            onClick={() => handleMessage(friend.id)}
                                                        >
                                                            <MessageSquare size={13} />
                                                            {friendsPageConfig.labels.message}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-danger-outline"
                                                            disabled={isBusy}
                                                            onClick={() => handleUnfriend(friend)}
                                                        >
                                                            <UserX size={13} />
                                                            {friendsPageConfig.labels.unfriend}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="friends-empty-state">
                                        <Users size={36} />
                                        <h3>{friendsPageConfig.emptyStates.all.title}</h3>
                                        <p>{friendsPageConfig.emptyStates.all.desc}</p>
                                    </div>
                                )}
                            </section>
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
