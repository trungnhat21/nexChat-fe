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
        <header className="messages-topbar"><Link to="/home" className="messages-back">‹ <span>NexChat</span></Link><h1>{messagesConfig.title}</h1><span className={`messages-connection ${online ? "is-online" : "is-offline"}`}>{online ? "Đang kết nối" : "Ngoại tuyến"}</span></header>
        <div className="messages-layout">
            <aside className="messages-sidebar" aria-label="Các cuộc trò chuyện">
                <div className="messages-sidebar-heading"><h2>Trò chuyện</h2><span>{conversations.length}</span></div>

                {/* Sidebar Search Input */}
                <div className="messages-search-wrap">
                    <Search size={15} aria-hidden="true" className="messages-search-icon" />
                    <input
                        type="text"
                        className="messages-search-input"
                        placeholder={messagesConfig.searchPlaceholder}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Tìm kiếm cuộc trò chuyện hoặc bạn bè"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="messages-search-clear"
                            onClick={() => setSearchQuery("")}
                            aria-label="Xóa từ khóa tìm kiếm"
                        >
                            ×
                        </button>
                    )}
                </div>

                {loading && <p className="messages-hint" role="status">Đang tải cuộc trò chuyện…</p>}
                {listError && <div className="messages-error" role="alert">{listError}<button onClick={() => void retryConversations()}>Tải lại</button></div>}
                {!loading && !listError && conversations.length === 0 && <div className="messages-empty-list"><p>{messagesConfig.emptyConversations}</p><Link to="/profile">Tìm người để nhắn tin</Link></div>}
                
                {!loading && !listError && debouncedSearch && filteredConversations.length === 0 && filteredFriends.length === 0 && (
                    <p className="messages-hint" role="status">{messagesConfig.searchEmptyText}</p>
                )}

                <div className="messages-conversation-list">
                    {filteredConversations.map(conversation => <button type="button" key={conversation.id} className={`messages-conversation ${selectedId === conversation.id ? "is-active" : ""}`} onClick={() => void openConversation(conversation.id)}>
                        <Avatar name={conversation.participant.name} src={conversation.participant.avatar} online={presence[conversation.participant.id] ?? conversation.participant.online} />
                        <span className="messages-conversation-copy"><strong>{conversation.participant.name}</strong><small>{conversation.lastMessage?.content || "Bắt đầu cuộc trò chuyện"}</small></span>
                        <span className="messages-conversation-meta"><time>{conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt) : ""}</time>{conversation.unreadCount > 0 && <i aria-label={`${conversation.unreadCount} tin chưa đọc`}>{conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}</i>}</span>
                    </button>)}
                </div>

                {!loading && !listError && <>
                    <div className="messages-sidebar-heading messages-friends-heading"><h2>Bạn bè</h2><span>{filteredFriends.length}</span></div>
                    {filteredFriends.filter(friend => !conversations.some(conversation => conversation.participant.id === friend.id)).length === 0 && (
                        <p className="messages-hint">
                            {debouncedSearch ? "Không có bạn bè phù hợp." : messagesConfig.emptyFriends}
                        </p>
                    )}
                    <div className="messages-conversation-list">
                        {filteredFriends.filter(friend => !conversations.some(conversation => conversation.participant.id === friend.id)).map(friend => <button type="button" key={friend.id} className="messages-conversation" onClick={() => void openFriend(friend)}>
                            <Avatar name={friend.name} src={friend.avatar} online={presence[friend.id]} />
                            <span className="messages-conversation-copy"><strong>{friend.name}</strong><small>{presence[friend.id] ? "Đang hoạt động" : "Bắt đầu cuộc trò chuyện"}</small></span>
                        </button>)}
                    </div>
                </>}
            </aside>

            <section className="messages-chat" aria-label="Nội dung cuộc trò chuyện">
                {!selectedId && <div className="messages-chat-empty"><span>✉</span><h2>Chọn một cuộc trò chuyện</h2><p>Tin nhắn riêng tư của bạn sẽ xuất hiện tại đây.</p>{actionError && <p className="messages-error" role="alert">{actionError}</p>}</div>}
                {selectedId && <>
                    <header className="messages-chat-heading">
                        {selectedConversation ? <><Avatar name={selectedConversation.participant.name} src={selectedConversation.participant.avatar} online={presence[selectedConversation.participant.id] ?? selectedConversation.participant.online} /><span><strong>{selectedConversation.participant.name}</strong><small className={`messages-presence ${presence[selectedConversation.participant.id] ?? selectedConversation.participant.online ? "is-online" : ""}`}>{presence[selectedConversation.participant.id] ?? selectedConversation.participant.online ? "Đang hoạt động" : "Ngoại tuyến"}</small></span><div className="messages-chat-actions"><button type="button" className={`messages-chat-search-btn ${messageSearchOpen ? "is-active" : ""}`} aria-label="Tìm kiếm trong cuộc trò chuyện" title="Tìm kiếm tin nhắn" onClick={() => setMessageSearchOpen(prev => !prev)}><Search size={18} strokeWidth={2.2} /></button><button type="button" aria-label="Gọi thoại" title="Gọi thoại" onClick={calls.startAudio} disabled={!online || calls.busy || Boolean(calls.activeCall)}><Phone size={21} strokeWidth={2.5} /></button><button type="button" aria-label="Gọi video" title="Gọi video" onClick={calls.startVideo} disabled={!online || calls.busy || Boolean(calls.activeCall)}><Video size={22} strokeWidth={2.5} /></button><Link to={`/profile/${selectedConversation.participant.id}`}>Trang cá nhân</Link></div></> : <span>Đang mở cuộc trò chuyện…</span>}
                    </header>
                    {messageSearchOpen && (
                        <div className="messages-inchat-search-bar">
                            <Search size={15} className="messages-inchat-icon" />
                            <input
                                type="text"
                                className="messages-inchat-input"
                                placeholder={messagesConfig.inChatSearchPlaceholder}
                                value={messageSearchQuery}
                                onChange={e => setMessageSearchQuery(e.target.value)}
                                autoFocus
                            />
                            {messageSearchQuery && (
                                <span className="messages-inchat-results-count">
                                    {messageSearchResults.length} kết quả
                                </span>
                            )}
                            <button
                                type="button"
                                className="messages-inchat-close"
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
                    <div className="messages-history" ref={historyRef} onScroll={onHistoryScroll} aria-live="polite">
                        {loadingOlder && <p className="messages-hint">Đang tải tin nhắn cũ hơn…</p>}
                        {messageError && <p className="messages-error" role="alert">{messageError}<button onClick={() => hasOlder ? void loadOlderMessages() : void openConversation(selectedId)}>Thử lại</button></p>}
                        {!loadingMessages && !messageError && hasOlder && <button className="messages-load-older" onClick={() => {
                            if (historyRef.current) restoreScroll.current = historyRef.current.scrollHeight;
                            void loadOlderMessages();
                        }}>Tải tin nhắn cũ hơn</button>}
                        {loadingMessages && <p className="messages-hint" role="status">Đang tải tin nhắn…</p>}
                        {!loadingMessages && !messageError && messages.length === 0 && <p className="messages-no-history">Hãy gửi lời chào để bắt đầu cuộc trò chuyện.</p>}
                        {messages.map((message: ChatMessage) => {
                            const isMatched = messageSearchOpen && Boolean(messageSearchQuery.trim()) && messageSearchResults.some(m => m.id === message.id);
                            return message.messageType === "system" ? <article key={message.id} className="messages-call-activity"><span>{message.content}</span><time>{formatTime(message.createdAt)}</time></article> : <article key={message.id} data-message-id={message.id} data-unread={!message.isMine && !message.isRead ? "true" : "false"} className={`messages-bubble-row ${message.isMine ? "is-mine" : "is-theirs"} ${isMatched ? "is-matched" : ""}`}>
                                <Avatar name={message.sender?.name || "Người dùng"} src={message.sender?.avatar ?? null} />
                                <div className="messages-bubble-content"><small><strong>{message.sender?.name || "Người dùng"}</strong><time>{formatTime(message.createdAt)}</time></small><p>{message.content}</p>
                                    {message.delivery === "sending" && <span className="messages-delivery">Đang gửi…</span>}
                                    {message.delivery === "failed" && <span className="messages-delivery is-failed">Chưa gửi được. <button disabled={!online} onClick={() => retry(message)}>Thử gửi lại</button></span>}
                                    {message.isMine && !message.delivery && message.status && <span className="messages-delivery">{message.status === "read" ? "Đã xem" : message.status === "delivered" ? "Đã nhận" : "Đã gửi"}</span>}
                                </div>
                            </article>;
                        })}
                    </div>
                    <div className={`messages-typing-indicator ${typingUserId ? "is-visible" : ""}`} aria-live="polite" aria-label={typingUserId ? `${selectedConversation?.participant.name ?? "Bạn bè"} đang nhập` : undefined}>
                        {typingUserId && <><span className="messages-typing-dots" aria-hidden="true"><i /><i /><i /></span><span>{selectedConversation?.participant.name ?? "Bạn bè"} đang nhập</span></>}
                    </div>
                    <form className="messages-composer" onSubmit={submit}>
                        {!online && <p role="status">Bạn đang ngoại tuyến. Kết nối lại để gửi tin nhắn.</p>}
                        {actionError && <p className="messages-error" role="alert">{actionError}</p>}
                        <textarea value={draft} onChange={event => updateDraft(event.target.value)} placeholder="Viết tin nhắn…" maxLength={4000} rows={2} aria-label="Nội dung tin nhắn" disabled={!online} />
                        <div><span>{draft.length}/4000</span><button type="submit" disabled={!online || !draft.trim()}>Gửi</button></div>
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
