import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router";
import { useLocation, useNavigate } from "react-router";
import { Phone, Video, Search } from "lucide-react";
import type { ChatMessage } from "../../component/type/message";
import { useMessagesActions } from "./actions";
import { useCalls } from "./useCalls";
import { messagesConfig } from "./config";
import "./style.scss";

const CallOverlay = lazy(() => import("./CallOverlay"));

function formatTime(value: string) {
    return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

function Avatar({ name, src, online }: { name: string; src: string | null; online?: boolean }) {
    return <span className={`messages-avatar ${online ? "is-online" : ""}`}>{src ? <img src={src} alt="" /> : <span aria-hidden="true">{name.trim().split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase() || "?"}</span>}</span>;
}

export default function MessagesPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        currentUser, conversations, presence, typingUserId, selectedId, selectedConversation, messages, draft, updateDraft,
        loading, listError, messageError, actionError, loadingMessages, loadingOlder,
        hasOlder, online, callSocket, openConversation, openFriend, loadOlderMessages, markVisibleMessages, send, retry, retryConversations,
        searchQuery, setSearchQuery, debouncedSearch, filteredConversations, filteredFriends,
        messageSearchQuery, setMessageSearchQuery, messageSearchOpen, setMessageSearchOpen, messageSearchResults,
    } = useMessagesActions();
    const navigationCallState = location.state as { incomingCameraOff?: boolean; incomingCallId?: string; startCall?: "audio" | "video" } | null;
    const incomingCameraOff = Boolean(navigationCallState?.incomingCameraOff);
    const calls = useCalls(callSocket, selectedId, selectedConversation, online, currentUser?.id ?? null);
    const startAudioCall = calls.startAudio;
    const startVideoCall = calls.startVideo;
    const startedNavigationCall = useRef<string | null>(null);

    useEffect(() => {
        const requestedCall = navigationCallState?.startCall;
        if (!requestedCall || !selectedConversation) return;
        const requestKey = `${selectedConversation.id}:${requestedCall}`;
        if (startedNavigationCall.current === requestKey) return;
        startedNavigationCall.current = requestKey;
        if (requestedCall === "audio") startAudioCall();
        else startVideoCall();
        navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    }, [location.pathname, location.search, navigate, navigationCallState?.startCall, selectedConversation, startAudioCall, startVideoCall]);
    const historyRef = useRef<HTMLDivElement>(null);
    const stickToBottom = useRef(true);
    const restoreScroll = useRef<number | null>(null);
    const previousLength = useRef(0);

    useEffect(() => {
        const root = historyRef.current;
        if (!root || !selectedId || loadingMessages || typeof IntersectionObserver === "undefined") return;
        const observer = new IntersectionObserver(entries => {
            const visibleIds = entries
                .filter(entry => entry.isIntersecting && entry.intersectionRatio >= 0.6)
                .map(entry => (entry.target as HTMLElement).dataset.messageId)
                .filter((id): id is string => Boolean(id));
            if (visibleIds.length) void markVisibleMessages(selectedId, visibleIds);
        }, { root, threshold: [0, 0.6, 1] });
        root.querySelectorAll<HTMLElement>("[data-message-id][data-unread='true']").forEach(element => observer.observe(element));
        return () => observer.disconnect();
    }, [loadingMessages, markVisibleMessages, messages, selectedId]);

    useLayoutEffect(() => {
        stickToBottom.current = true;
        restoreScroll.current = null;
        previousLength.current = 0;
        const element = historyRef.current;
        if (element) element.scrollTop = element.scrollHeight;
    }, [selectedId]);

    useLayoutEffect(() => {
        const element = historyRef.current;
        if (!element || messages.length === previousLength.current) return;
        previousLength.current = messages.length;
        if (restoreScroll.current !== null) {
            element.scrollTop = element.scrollHeight - restoreScroll.current;
            restoreScroll.current = null;
        } else if (stickToBottom.current) {
            element.scrollTop = element.scrollHeight;
        }
    }, [messages]);

    function onHistoryScroll() {
        const element = historyRef.current;
        if (!element) return;
        stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
        if (element.scrollTop <= 32 && hasOlder && !loadingOlder) {
            restoreScroll.current = element.scrollHeight;
            void loadOlderMessages().then(didLoad => { if (!didLoad) restoreScroll.current = null; });
        }
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await send();
    }

    return <main className="messages-page">
        <header className="messages-topbar d-flex align-items-center gap-3">
            <Link to="/home" className="messages-back link-primary fs-5 fw-bold d-inline-flex align-items-center gap-1">
                ‹ <span className="fs-6">NexChat</span>
            </Link>
            <h1 className="fs-4 fw-bold text-gray-900 m-0">{messagesConfig.title}</h1>
            <span className={`ms-auto badge ${online ? "badge-light-success" : "badge-light-danger"} fs-8 fw-semibold`}>
                {online ? "Đang kết nối" : "Ngoại tuyến"}
            </span>
        </header>

        <div className="messages-layout">
            <aside className="messages-sidebar" aria-label="Các cuộc trò chuyện">
                <div className="messages-sidebar-heading d-flex align-items-center justify-content-between p-4 pb-3">
                    <h2 className="fs-5 fw-bold text-gray-900 m-0">Trò chuyện</h2>
                    <span className="badge badge-light-primary fs-8 fw-semibold">{conversations.length}</span>
                </div>

                {/* Sidebar Search Input */}
                <div className="position-relative px-3 mb-3">
                    <Search size={16} aria-hidden="true" className="position-absolute top-50 start-0 translate-middle-y ms-6 text-gray-500 pointer-events-none" />
                    <input
                        type="text"
                        className="form-control form-control-solid ps-10 pe-8 py-2 fs-7 rounded-3"
                        placeholder={messagesConfig.searchPlaceholder}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Tìm kiếm cuộc trò chuyện hoặc bạn bè"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="btn btn-sm btn-icon btn-flush position-absolute top-50 end-0 translate-middle-y me-5 text-gray-500"
                            onClick={() => setSearchQuery("")}
                            aria-label="Xóa từ khóa tìm kiếm"
                        >
                            ×
                        </button>
                    )}
                </div>

                {loading && <p className="text-center text-gray-500 fs-8 my-3" role="status">Đang tải cuộc trò chuyện…</p>}
                {listError && (
                    <div className="alert alert-danger d-flex align-items-center justify-content-between mx-3 p-3 fs-8" role="alert">
                        <span>{listError}</span>
                        <button className="btn btn-sm btn-danger py-1 px-2" onClick={() => void retryConversations()}>Tải lại</button>
                    </div>
                )}
                {!loading && !listError && conversations.length === 0 && (
                    <div className="messages-empty-list p-4 text-center">
                        <p className="text-gray-600 fs-7 mb-2">{messagesConfig.emptyConversations}</p>
                        <Link to="/profile" className="link-primary fs-7 fw-semibold">Tìm người để nhắn tin</Link>
                    </div>
                )}
                
                {!loading && !listError && debouncedSearch && filteredConversations.length === 0 && filteredFriends.length === 0 && (
                    <p className="text-center text-gray-500 fs-8 my-3" role="status">{messagesConfig.searchEmptyText}</p>
                )}

                <div className="messages-conversation-list scroll-y px-2">
                    {filteredConversations.map((conversation, index) => (
                        <div key={conversation.id}>
                            {index > 0 && <div className="separator separator-dashed my-1" />}
                            <button
                                type="button"
                                className={`messages-conversation d-flex align-items-center p-3 rounded-3 cursor-pointer bg-hover-light w-100 border-0 text-start ${selectedId === conversation.id ? "is-active bg-light-primary" : "bg-transparent"}`}
                                onClick={() => void openConversation(conversation.id)}
                            >
                                <Avatar name={conversation.participant.name} src={conversation.participant.avatar} online={presence[conversation.participant.id] ?? conversation.participant.online} />
                                <span className="messages-conversation-copy flex-grow-1 min-w-0 ms-3">
                                    <strong className="d-block text-gray-900 fs-7 fw-bold text-truncate">{conversation.participant.name}</strong>
                                    <small className="d-block text-gray-600 fs-8 text-truncate">{conversation.lastMessage?.content || "Bắt đầu cuộc trò chuyện"}</small>
                                </span>
                                <span className="messages-conversation-meta d-flex flex-column align-items-end ms-2 flex-shrink-0">
                                    <time className="text-gray-500 fs-9">{conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ""}</time>
                                    {conversation.unreadCount > 0 && (
                                        <span className="badge badge-circle badge-primary fs-9 mt-1" aria-label={`${conversation.unreadCount} tin chưa đọc`}>
                                            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>

                {!loading && !listError && <>
                    <div className="messages-sidebar-heading messages-friends-heading d-flex align-items-center justify-content-between p-4 pb-2 pt-3">
                        <h2 className="fs-6 fw-bold text-gray-800 m-0">Bạn bè</h2>
                        <span className="badge badge-light-secondary fs-9">{filteredFriends.length}</span>
                    </div>
                    {filteredFriends.filter(friend => !conversations.some(conversation => conversation.participant.id === friend.id)).length === 0 && (
                        <p className="text-center text-gray-500 fs-8 px-3 my-2">
                            {debouncedSearch ? "Không có bạn bè phù hợp." : messagesConfig.emptyFriends}
                        </p>
                    )}
                    <div className="messages-conversation-list scroll-y px-2">
                        {filteredFriends.filter(friend => !conversations.some(conversation => conversation.participant.id === friend.id)).map((friend, index) => (
                            <div key={friend.id}>
                                {index > 0 && <div className="separator separator-dashed my-1" />}
                                <button
                                    type="button"
                                    className="messages-conversation d-flex align-items-center p-3 rounded-3 cursor-pointer bg-hover-light w-100 border-0 text-start bg-transparent"
                                    onClick={() => void openFriend(friend)}
                                >
                                    <Avatar name={friend.name} src={friend.avatar} online={presence[friend.id]} />
                                    <span className="messages-conversation-copy flex-grow-1 min-w-0 ms-3">
                                        <strong className="d-block text-gray-900 fs-7 fw-bold text-truncate">{friend.name}</strong>
                                        <small className="d-block text-gray-600 fs-8 text-truncate">{presence[friend.id] ? "Đang hoạt động" : "Bắt đầu cuộc trò chuyện"}</small>
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>
                </>}
            </aside>

            <section className="messages-chat h-100" aria-label="Nội dung cuộc trò chuyện">
                {!selectedId && (
                    <div className="messages-chat-empty d-flex flex-column align-items-center justify-content-center p-6 text-center h-100">
                        <span className="bullet bullet-dot bg-light-primary p-6 mb-3 fs-1 text-primary d-inline-flex align-items-center justify-content-center">✉</span>
                        <h2 className="fs-5 fw-bold text-gray-800 mb-1">Chọn một cuộc trò chuyện</h2>
                        <p className="text-gray-500 fs-7 mb-0">Tin nhắn riêng tư của bạn sẽ xuất hiện tại đây.</p>
                        {actionError && <p className="text-danger fs-8 mt-2" role="alert">{actionError}</p>}
                    </div>
                )}
                {selectedId && <>
                    <header className="card-header messages-chat-heading d-flex align-items-center justify-content-between px-4 py-3 border-bottom border-gray-200">
                        {selectedConversation ? (
                            <>
                                <div className="d-flex align-items-center gap-3 min-w-0">
                                    <Avatar name={selectedConversation.participant.name} src={selectedConversation.participant.avatar} online={presence[selectedConversation.participant.id] ?? selectedConversation.participant.online} />
                                    <div className="d-flex flex-column min-w-0">
                                        <strong className="fs-6 fw-bold text-gray-900 text-truncate">{selectedConversation.participant.name}</strong>
                                        <small className={`fs-8 ${presence[selectedConversation.participant.id] ?? selectedConversation.participant.online ? "text-success fw-semibold" : "text-gray-500"}`}>
                                            {presence[selectedConversation.participant.id] ?? selectedConversation.participant.online ? "Đang hoạt động" : "Ngoại tuyến"}
                                        </small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        type="button"
                                        className={`btn btn-sm btn-icon ${messageSearchOpen ? "btn-primary" : "btn-light"}`}
                                        aria-label="Tìm kiếm trong cuộc trò chuyện"
                                        title="Tìm kiếm tin nhắn"
                                        onClick={() => setMessageSearchOpen(prev => !prev)}
                                    >
                                        <Search size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-icon btn-light-success"
                                        aria-label="Gọi thoại"
                                        title="Gọi thoại"
                                        onClick={calls.startAudio}
                                        disabled={!online || calls.busy || Boolean(calls.activeCall)}
                                    >
                                        <Phone size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-icon btn-light-success"
                                        aria-label="Gọi video"
                                        title="Gọi video"
                                        onClick={calls.startVideo}
                                        disabled={!online || calls.busy || Boolean(calls.activeCall)}
                                    >
                                        <Video size={16} />
                                    </button>
                                    <Link to={`/profile/${selectedConversation.participant.id}`} className="btn btn-sm btn-light-primary ms-2 fs-8 fw-semibold">
                                        Trang cá nhân
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <span className="text-gray-500 fs-7">Đang mở cuộc trò chuyện…</span>
                        )}
                    </header>
                    {messageSearchOpen && (
                        <div className="d-flex align-items-center gap-2 px-4 py-2 bg-light border-bottom border-gray-200">
                            <Search size={16} className="text-gray-500 flex-shrink-0" />
                            <input
                                type="text"
                                className="form-control form-control-sm form-control-solid flex-grow-1"
                                placeholder={messagesConfig.inChatSearchPlaceholder}
                                value={messageSearchQuery}
                                onChange={e => setMessageSearchQuery(e.target.value)}
                                autoFocus
                            />
                            {messageSearchQuery && (
                                <span className="badge badge-light-primary fs-8">
                                    {messageSearchResults.length} kết quả
                                </span>
                            )}
                            <button
                                type="button"
                                className="btn btn-sm btn-icon btn-flush text-gray-500"
                                onClick={() => {
                                    setMessageSearchOpen(false);
                                    setMessageSearchQuery("");
                                }}
                                aria-label="Đóng tìm kiếm"
                            >
                                ✕
                            </button>
                        </div>
                    )}
                    <div className="card-body scroll-y messages-history p-4" ref={historyRef} onScroll={onHistoryScroll} aria-live="polite">
                        {loadingOlder && <p className="text-center text-gray-500 fs-8 my-2">Đang tải tin nhắn cũ hơn…</p>}
                        {messageError && (
                            <p className="text-center text-danger fs-8 my-2" role="alert">
                                {messageError}
                                <button className="btn btn-flush link-primary fs-8 ms-2" onClick={() => hasOlder ? void loadOlderMessages() : void openConversation(selectedId)}>
                                    Thử lại
                                </button>
                            </p>
                        )}
                        {!loadingMessages && !messageError && hasOlder && (
                            <div className="d-flex justify-content-center my-2">
                                <button
                                    className="btn btn-sm btn-light-primary rounded-pill fs-8 fw-semibold px-4"
                                    onClick={() => {
                                        if (historyRef.current) restoreScroll.current = historyRef.current.scrollHeight;
                                        void loadOlderMessages();
                                    }}
                                >
                                    Tải tin nhắn cũ hơn
                                </button>
                            </div>
                        )}
                        {loadingMessages && <p className="text-center text-gray-500 fs-8 my-2" role="status">Đang tải tin nhắn…</p>}
                        {!loadingMessages && !messageError && messages.length === 0 && (
                            <p className="text-center text-gray-500 fs-7 my-6">Hãy gửi lời chào để bắt đầu cuộc trò chuyện.</p>
                        )}
                        {messages.map((message: ChatMessage) => {
                            const isMatched = messageSearchOpen && Boolean(messageSearchQuery.trim()) && messageSearchResults.some(m => m.id === message.id);
                            if (message.messageType === "system") {
                                return (
                                    <article key={message.id} className="d-flex flex-column align-items-center my-2">
                                        <div className="d-flex flex-column align-items-center py-2 px-4 rounded-3 bg-light border border-gray-200 text-center max-w-500px">
                                            <span className="fs-8 text-gray-700">{message.content}</span>
                                            <time className="fs-9 text-gray-400 mt-1">{formatTime(message.createdAt)}</time>
                                        </div>
                                    </article>
                                );
                            }

                            return (
                                <article
                                    key={message.id}
                                    data-message-id={message.id}
                                    data-unread={!message.isMine && !message.isRead ? "true" : "false"}
                                    className={`messages-bubble-row d-flex ${message.isMine ? "justify-content-end" : "justify-content-start"} mb-4 ${isMatched ? "is-matched" : ""}`}
                                >
                                    <div className={`d-flex align-items-end gap-2 max-w-75 ${message.isMine ? "flex-row-reverse" : "flex-row"}`}>
                                        <Avatar name={message.sender?.name || "Người dùng"} src={message.sender?.avatar ?? null} />
                                        <div className={`messages-bubble-content ${message.isMine ? "text-end" : "text-start"}`}>
                                            <small className="d-flex align-items-center gap-2 mb-1 text-gray-500 fs-9">
                                                <strong className="text-gray-700">{message.sender?.name || "Người dùng"}</strong>
                                                <time>{formatTime(message.createdAt)}</time>
                                            </small>
                                            <p className={`p-3 rounded-3 fs-7 mb-0 text-break ${message.isMine ? "bg-primary text-white" : "bg-light text-gray-900"}`}>
                                                {message.content}
                                            </p>
                                            {message.delivery === "sending" && <span className="d-block fs-9 text-gray-400 mt-1">Đang gửi…</span>}
                                            {message.delivery === "failed" && (
                                                <span className="d-block fs-9 text-danger mt-1">
                                                    Chưa gửi được.{" "}
                                                    <button className="btn btn-flush link-primary fs-9" disabled={!online} onClick={() => retry(message)}>
                                                        Thử gửi lại
                                                    </button>
                                                </span>
                                            )}
                                            {message.isMine && !message.delivery && message.status && (
                                                <span className="d-block fs-9 text-gray-400 mt-1">
                                                    {message.status === "read" ? "Đã xem" : message.status === "delivered" ? "Đã nhận" : "Đã gửi"}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    <div className={`messages-typing-indicator ${typingUserId ? "is-visible" : ""}`} aria-live="polite" aria-label={typingUserId ? `${selectedConversation?.participant.name ?? "Bạn bè"} đang nhập` : undefined}>
                        {typingUserId && <><span className="messages-typing-dots" aria-hidden="true"><i /><i /><i /></span><span className="text-gray-600 fs-8 ms-2">{selectedConversation?.participant.name ?? "Bạn bè"} đang nhập</span></>}
                    </div>
                    <form className="card-footer messages-composer p-3 border-top border-gray-200" onSubmit={submit}>
                        {!online && <p className="text-danger fs-8 mb-2" role="status">Bạn đang ngoại tuyến. Kết nối lại để gửi tin nhắn.</p>}
                        {actionError && <p className="text-danger fs-8 mb-2" role="alert">{actionError}</p>}
                        <textarea
                            value={draft}
                            onChange={event => updateDraft(event.target.value)}
                            placeholder="Viết tin nhắn…"
                            maxLength={4000}
                            rows={2}
                            className="form-control form-control-solid resize-none p-3 fs-7 rounded-3"
                            aria-label="Nội dung tin nhắn"
                            disabled={!online}
                        />
                        <div className="d-flex align-items-center justify-content-between mt-2">
                            <span className="text-gray-500 fs-9">{draft.length}/4000</span>
                            <button type="submit" className="btn btn-primary btn-sm px-4 rounded-2" disabled={!online || !draft.trim()}>
                                Gửi
                            </button>
                        </div>
                    </form>
                </>}
            </section>
        </div>
        {currentUser && <span className="messages-sr-only" aria-live="polite">Đăng nhập với tài khoản {currentUser.userName || currentUser.email}</span>}
        {calls.notice && <div className="call-toast" role="status">{calls.notice}</div>}
        {calls.error && !calls.activeCall && <div className="call-toast is-error" role="alert"><span>{calls.error}</span><button type="button" onClick={calls.dismissError} aria-label="Đóng thông báo lỗi">×</button></div>}
        {calls.activeCall && currentUser && <Suspense fallback={<div className="call-overlay-loading" role="status">Đang mở giao diện cuộc gọi…</div>}><CallOverlay session={calls.activeCall} userId={currentUser.id} busy={calls.busy} error={calls.error} online={online} cameraOffOnStart={incomingCameraOff && navigationCallState?.incomingCallId === calls.activeCall.call.id} onAccept={calls.accept} onDecline={calls.decline} onCancel={calls.cancel} onEnd={calls.end} onDismissError={calls.dismissError} /></Suspense>}
    </main>;
}
