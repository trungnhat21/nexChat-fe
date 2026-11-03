import { UserCheck, UserX, UserPlus, Users, MessageSquare, Clock, Search, X } from "lucide-react";
import Header from "../home/components/Header";
import Sidebar from "../home/components/Sidebar";
import Discovery from "../home/components/Discovery";
import { HomeContext } from "../home/config";
import { useFriendsActions } from "./actions";
import { friendsTabs, friendsPageConfig } from "./config";
import "../home/style.scss";

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
                        <section className="card p-6 mb-4">
                            <h1 className="fs-24 fw-bold mb-2 text-gray-900">{friendsPageConfig.title}</h1>
                            <p className="text-gray-600 m-0 fs-14">{friendsPageConfig.subtitle}</p>
                        </section>

                        {/* Top Navigation Tabs */}
                        <nav className="nav-group nav-group-pill nav-group-justified w-100 mb-4" aria-label="Bộ lọc bạn bè">
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
                        <div className="d-flex align-items-center gap-2 mb-4 bg-white px-4 py-2 border rounded-lg shadow-sm">
                            <Search size={16} className="text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                className="form-control form-control-flush p-0 border-0 flex-grow-1 fs-14"
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
                                    className="btn btn-flush text-gray-400"
                                    onClick={() => setLocalFilter("")}
                                    aria-label="Xóa bộ lọc"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Loading Skeletons */}
                        {loading && (
                            <section className="card p-5 mb-4 shadow-sm">
                                <div className="d-flex flex-column gap-3">
                                    <div className="skeleton-shimmer" style={{ height: 70 }} />
                                    <div className="skeleton-shimmer" style={{ height: 70 }} />
                                    <div className="skeleton-shimmer" style={{ height: 70 }} />
                                </div>
                            </section>
                        )}

                        {/* Tab 1: Received Friend Requests */}
                        {!loading && activeTab === "requests" && (
                            <section className="card p-5 mb-4 shadow-sm">
                                <h2 className="fs-15 fw-bold text-gray-800 mb-4 d-flex align-items-center gap-2">
                                    <UserCheck size={16} className="text-primary" />
                                    Lời mời kết bạn ({requests.length})
                                </h2>

                                {requests.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {requests.map(req => {
                                            const requester = req.requester;
                                            const displayName =
                                                [requester.last_name, requester.first_name].filter(Boolean).join(" ") ||
                                                requester.user_name ||
                                                "Người dùng";
                                            const isBusy = busyIds.has(req.id);

                                            return (
                                                <div key={req.id} className="d-flex align-items-center gap-3 p-3 rounded-lg border bg-light">
                                                    <span
                                                        className="rounded-circle overflow-hidden flex-shrink-0 cursor-pointer d-grid place-items-center bg-gray-200 fw-bold fs-14 text-gray-700"
                                                        style={{ width: 44, height: 44 }}
                                                        onClick={() => handleNavigateProfile(requester.id)}
                                                        title={`Xem hồ sơ của ${displayName}`}
                                                    >
                                                        {requester.avatar ? (
                                                            <img src={requester.avatar} alt={displayName} className="w-100 h-100 object-cover" />
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

                                                    <div className="flex-grow-1 min-w-0">
                                                        <strong
                                                            className="d-block fs-14 fw-semibold text-gray-900 text-truncate cursor-pointer"
                                                            onClick={() => handleNavigateProfile(requester.id)}
                                                            title={`Xem hồ sơ của ${displayName}`}
                                                        >
                                                            {displayName}
                                                        </strong>
                                                        <small className="d-block fs-12 text-gray-500 text-truncate">
                                                            {requester.user_name ? `@${requester.user_name} • ` : ""}
                                                            Đã gửi cho bạn một lời mời kết bạn
                                                        </small>
                                                    </div>

                                                    <div className="d-flex align-items-center gap-2 ms-auto flex-shrink-0">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-primary"
                                                            disabled={isBusy}
                                                            onClick={() => handleAcceptRequest(req)}
                                                        >
                                                            <UserCheck size={13} />
                                                            {friendsPageConfig.labels.accept}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light-secondary"
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
                                    <div className="text-center py-10 d-flex flex-column align-items-center gap-2 text-gray-500">
                                        <UserCheck size={36} className="text-gray-400 mb-1" />
                                        <h3 className="fs-16 fw-bold text-gray-800 m-0">{friendsPageConfig.emptyStates.requests.title}</h3>
                                        <p className="fs-13 text-gray-500 m-0 max-w-sm">{friendsPageConfig.emptyStates.requests.desc}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Tab 2: Friend Suggestions */}
                        {!loading && activeTab === "suggestions" && (
                            <section className="card p-5 mb-4 shadow-sm">
                                <h2 className="fs-15 fw-bold text-gray-800 mb-4 d-flex align-items-center gap-2">
                                    <UserPlus size={16} className="text-primary" />
                                    Gợi ý kết bạn ({suggestions.length})
                                </h2>

                                {suggestions.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {suggestions.map(person => {
                                            const isBusy = busyIds.has(person.id);

                                            return (
                                                <div key={person.id} className="d-flex align-items-center gap-3 p-3 rounded-lg border bg-light">
                                                    <span
                                                        className="rounded-circle overflow-hidden flex-shrink-0 cursor-pointer d-grid place-items-center bg-gray-200 fw-bold fs-14 text-gray-700"
                                                        style={{ width: 44, height: 44 }}
                                                        onClick={() => handleNavigateProfile(person.id)}
                                                        title={`Xem hồ sơ của ${person.name}`}
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
                                                            {person.friendStatus === "outgoing"
                                                                ? "Đã gửi lời mời"
                                                                : person.friendStatus === "friends"
                                                                  ? "Bạn bè"
                                                                  : "Gợi ý cho bạn"}
                                                        </small>
                                                    </div>

                                                    <div className="d-flex align-items-center gap-2 ms-auto flex-shrink-0">
                                                        {person.friendStatus === "none" && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-primary"
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
                                                                className="btn btn-sm btn-light-secondary"
                                                                disabled={isBusy}
                                                                onClick={() => handleCancelRequest(person)}
                                                            >
                                                                <Clock size={13} />
                                                                {friendsPageConfig.labels.cancelRequest}
                                                            </button>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className={person.following ? "btn btn-sm btn-light-primary" : "btn btn-sm btn-light-secondary"}
                                                            disabled={isBusy}
                                                            onClick={() => handleToggleFollow(person)}
                                                        >
                                                            {person.following
                                                                ? friendsPageConfig.labels.following
                                                                : friendsPageConfig.labels.follow}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light-secondary"
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
                                    <div className="text-center py-10 d-flex flex-column align-items-center gap-2 text-gray-500">
                                        <Users size={36} className="text-gray-400 mb-1" />
                                        <h3 className="fs-16 fw-bold text-gray-800 m-0">{friendsPageConfig.emptyStates.suggestions.title}</h3>
                                        <p className="fs-13 text-gray-500 m-0 max-w-sm">{friendsPageConfig.emptyStates.suggestions.desc}</p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Tab 3: All Friends */}
                        {!loading && activeTab === "all" && (
                            <section className="card p-5 mb-4 shadow-sm">
                                <h2 className="fs-15 fw-bold text-gray-800 mb-4 d-flex align-items-center gap-2">
                                    <Users size={16} className="text-primary" />
                                    Tất cả bạn bè ({friends.length})
                                </h2>

                                {friends.length > 0 ? (
                                    <div className="d-flex flex-column gap-3">
                                        {friends.map(friend => {
                                            const isBusy = busyIds.has(friend.id);

                                            return (
                                                <div key={friend.id} className="d-flex align-items-center gap-3 p-3 rounded-lg border bg-light">
                                                    <span
                                                        className="rounded-circle overflow-hidden flex-shrink-0 cursor-pointer d-grid place-items-center bg-gray-200 fw-bold fs-14 text-gray-700"
                                                        style={{ width: 44, height: 44 }}
                                                        onClick={() => handleNavigateProfile(friend.id)}
                                                        title={`Xem hồ sơ của ${friend.name}`}
                                                    >
                                                        {friend.avatar ? (
                                                            <img src={friend.avatar} alt={friend.name} className="w-100 h-100 object-cover" />
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

                                                    <div className="flex-grow-1 min-w-0">
                                                        <strong
                                                            className="d-block fs-14 fw-semibold text-gray-900 text-truncate cursor-pointer"
                                                            onClick={() => handleNavigateProfile(friend.id)}
                                                            title={`Xem hồ sơ của ${friend.name}`}
                                                        >
                                                            {friend.name}
                                                        </strong>
                                                        <small className="d-block fs-12 text-gray-500 text-truncate">
                                                            {friend.username ? `@${friend.username} • ` : ""}
                                                            {friendsPageConfig.labels.friendStatus}
                                                        </small>
                                                    </div>

                                                    <div className="d-flex align-items-center gap-2 ms-auto flex-shrink-0">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light-primary"
                                                            onClick={() => handleMessage(friend.id)}
                                                        >
                                                            <MessageSquare size={13} />
                                                            {friendsPageConfig.labels.message}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-light-danger"
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
                                    <div className="text-center py-10 d-flex flex-column align-items-center gap-2 text-gray-500">
                                        <Users size={36} className="text-gray-400 mb-1" />
                                        <h3 className="fs-16 fw-bold text-gray-800 m-0">{friendsPageConfig.emptyStates.all.title}</h3>
                                        <p className="fs-13 text-gray-500 m-0 max-w-sm">{friendsPageConfig.emptyStates.all.desc}</p>
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
