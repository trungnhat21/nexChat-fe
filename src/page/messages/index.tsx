import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useLocation, useNavigate } from "react-router";
import { Phone, Video, Search, ImagePlus, Smile, Mic, X, Send, Square, Trash2 } from "lucide-react";
import type { ChatMessage } from "../../component/type/message";
import { useMessagesActions } from "./actions";
import { useCalls } from "./useCalls";
import { messagesConfig } from "./config";
import "./style.scss";

const CallOverlay = lazy(() => import("./CallOverlay"));

function formatTime(value: string) {
    return new Date(value).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

function encodeWav(chunks: Float32Array[], sampleRate: number): Blob {
    const sampleCount = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const buffer = new ArrayBuffer(44 + sampleCount * 2);
    const view = new DataView(buffer);
    const writeText = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
    writeText(0, "RIFF"); view.setUint32(4, 36 + sampleCount * 2, true); writeText(8, "WAVE");
    writeText(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
    writeText(36, "data"); view.setUint32(40, sampleCount * 2, true);
    let offset = 44;
    for (const chunk of chunks) for (const sample of chunk) {
        const clamped = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
        offset += 2;
    }
    return new Blob([buffer], { type: "audio/wav" });
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
    const [composerFocused, setComposerFocused] = useState(false);
    const [selectedImages, setSelectedImages] = useState<{ file: File; url: string }[]>([]);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [composerError, setComposerError] = useState("");
    const [uploading, setUploading] = useState(false);
    const [recording, setRecording] = useState(false);
    const [recordedVoice, setRecordedVoice] = useState<{ file: File; url: string; durationMs: number } | null>(null);
    const [recordDurationMs, setRecordDurationMs] = useState(0);
    const [imageViewer, setImageViewer] = useState<string | null>(null);
    const [audioPlaybackErrors, setAudioPlaybackErrors] = useState<Record<string, boolean>>({});
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const emojiRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const audioStreamRef = useRef<MediaStream | null>(null);
    const recordChunksRef = useRef<Float32Array[]>([]);
    const recordSampleCountRef = useRef(0);
    const recordSampleRateRef = useRef(48000);
    const recordStartRef = useRef(0);
    const recordAnimationRef = useRef<number | null>(null);
    const discardRecordingRef = useRef(false);
    const objectUrlsRef = useRef(new Set<string>());
    const emojis = ["😀", "😂", "🥹", "😍", "🥰", "😎", "😭", "😡", "👍", "👎", "👏", "🙏", "❤️", "🔥", "🎉", "✨", "💯", "🤔", "😴", "🥳", "🙌", "😅", "💖", "🤝"];

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

    useLayoutEffect(() => {
        const field = textAreaRef.current;
        if (!field) return;
        field.style.height = "auto";
        field.style.height = `${Math.min(field.scrollHeight, 144)}px`;
    }, [draft]);

    function onHistoryScroll() {
        const element = historyRef.current;
        if (!element) return;
        stickToBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
        if (element.scrollTop <= 32 && hasOlder && !loadingOlder) {
            restoreScroll.current = element.scrollHeight;
            void loadOlderMessages().then(didLoad => { if (!didLoad) restoreScroll.current = null; });
        }
    }

    useEffect(() => {
        if (!emojiOpen) return;
        const closeOnOutside = (event: MouseEvent) => { if (!emojiRef.current?.contains(event.target as Node)) setEmojiOpen(false); };
        document.addEventListener("mousedown", closeOnOutside);
        return () => document.removeEventListener("mousedown", closeOnOutside);
    }, [emojiOpen]);

    useEffect(() => () => {
        if (recordAnimationRef.current !== null) cancelAnimationFrame(recordAnimationRef.current);
        if (audioProcessorRef.current) { audioProcessorRef.current.onaudioprocess = null; audioProcessorRef.current.disconnect(); }
        audioStreamRef.current?.getTracks().forEach(track => track.stop());
        if (audioContextRef.current && audioContextRef.current.state !== "closed") void audioContextRef.current.close();
        objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    }, []);

    function addImages(files: FileList | null) {
        if (!files) return;
        if (recording || recordedVoice) { setComposerError("Gửi ảnh riêng với tin nhắn thoại nhé."); return; }
        const incoming = Array.from(files);
        if (incoming.some(file => !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type))) { setComposerError("Chỉ hỗ trợ ảnh JPEG, PNG, GIF hoặc WebP."); return; }
        if (incoming.some(file => file.size > 25 * 1024 * 1024)) { setComposerError("Mỗi ảnh có dung lượng tối đa 25 MB."); return; }
        if ([...selectedImages.map(item => item.file), ...incoming].reduce((total, file) => total + file.size, 0) > 50 * 1024 * 1024) { setComposerError("Tổng dung lượng ảnh tối đa 50 MB."); return; }
        if (selectedImages.length + incoming.length > 5) { setComposerError("Mỗi tin nhắn gửi tối đa 5 ảnh."); return; }
        setComposerError("");
        const next = incoming.map(file => {
            const url = URL.createObjectURL(file);
            objectUrlsRef.current.add(url);
            return { file, url };
        });
        setSelectedImages(current => [...current, ...next]);
    }

    function insertEmoji(emoji: string) {
        const field = textAreaRef.current;
        if (!field) return;
        const start = field.selectionStart;
        const end = field.selectionEnd;
        const next = `${draft.slice(0, start)}${emoji}${draft.slice(end)}`;
        updateDraft(next);
        setEmojiOpen(false);
        requestAnimationFrame(() => { field.focus(); field.setSelectionRange(start + emoji.length, start + emoji.length); });
    }

    async function startVoiceRecording() {
        setComposerError("");
        if (selectedImages.length) { setComposerError("Gửi ảnh riêng với tin nhắn thoại nhé."); return; }
        if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") { setComposerError("Trình duyệt này chưa hỗ trợ ghi âm."); return; }
        let acquiredStream: MediaStream | null = null;
        let context: AudioContext | null = null;
        try {
            // Create the context directly from the user gesture so browsers do not leave it suspended.
            context = new AudioContext();
            const stream = acquiredStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            await context.resume();
            if (!stream.getAudioTracks().some(track => track.enabled && track.readyState === "live")) throw new Error("No active microphone track");
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(4096, 1, 1);
            const silentOutput = context.createGain();
            silentOutput.gain.value = 0;
            recordChunksRef.current = [];
            recordSampleCountRef.current = 0;
            recordSampleRateRef.current = context.sampleRate;
            discardRecordingRef.current = false;
            recordStartRef.current = Date.now();
            processor.onaudioprocess = event => {
                if (discardRecordingRef.current) return;
                const samples = event.inputBuffer.getChannelData(0);
                if (44 + (recordSampleCountRef.current + samples.length) * 2 > 25 * 1024 * 1024) {
                    discardRecordingRef.current = true;
                    setComposerError("Bản ghi tối đa 25 MB.");
                    stopVoiceRecording(true);
                    return;
                }
                recordChunksRef.current.push(new Float32Array(samples));
                recordSampleCountRef.current += samples.length;
            };
            source.connect(processor);
            processor.connect(silentOutput);
            silentOutput.connect(context.destination);
            audioContextRef.current = context;
            audioProcessorRef.current = processor;
            audioStreamRef.current = stream;
            setRecordDurationMs(0);
            setRecording(true);
            const updateDuration = () => {
                setRecordDurationMs(Date.now() - recordStartRef.current);
                recordAnimationRef.current = requestAnimationFrame(updateDuration);
            };
            recordAnimationRef.current = requestAnimationFrame(updateDuration);
        } catch (error) {
            acquiredStream?.getTracks().forEach(track => track.stop());
            if (context && context.state !== "closed") void context.close();
            setComposerError(error instanceof DOMException && error.name === "NotAllowedError" ? "Bạn cần cấp quyền micro để ghi âm." : "Không thể truy cập micro.");
        }
    }

    function stopVoiceRecording(discard = false) {
        discardRecordingRef.current = discard;
        if (recordAnimationRef.current !== null) cancelAnimationFrame(recordAnimationRef.current);
        recordAnimationRef.current = null;
        if (audioProcessorRef.current) {
            audioProcessorRef.current.onaudioprocess = null;
            audioProcessorRef.current.disconnect();
            audioProcessorRef.current = null;
        }
        audioStreamRef.current?.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
        const context = audioContextRef.current;
        audioContextRef.current = null;
        if (context && context.state !== "closed") void context.close();
        const durationMs = Math.max(1, Date.now() - recordStartRef.current);
        if (!discard && recordSampleCountRef.current > 0) {
            const blob = encodeWav(recordChunksRef.current, recordSampleRateRef.current);
            const file = new File([blob], "voice-message.wav", { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            objectUrlsRef.current.add(url);
            setRecordedVoice({ file, url, durationMs });
        }
        recordChunksRef.current = [];
        recordSampleCountRef.current = 0;
        setRecording(false);
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (recording) { stopVoiceRecording(); return; }
        if (recordedVoice) {
            setUploading(true);
            const succeeded = await send([recordedVoice.file], "audio", recordedVoice.durationMs, [{ url: recordedVoice.url, mimeType: recordedVoice.file.type, name: recordedVoice.file.name, size: recordedVoice.file.size, durationMs: recordedVoice.durationMs }]);
            if (succeeded) setRecordedVoice(null);
            setUploading(false);
        } else if (selectedImages.length) {
            setUploading(true);
            const succeeded = await send(selectedImages.map(item => item.file), "image", undefined, selectedImages.map(item => ({ url: item.url, mimeType: item.file.type, name: item.file.name, size: item.file.size, durationMs: null })));
            if (succeeded) setSelectedImages([]);
            setUploading(false);
        } else await send();
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
                                    <div className={`d-flex align-items-center gap-2 max-w-75 ${message.isMine ? "flex-row-reverse" : "flex-row"}`}>
                                        <Avatar name={message.sender?.name || "Người dùng"} src={message.sender?.avatar ?? null} />
                                        <div className={`messages-bubble-content ${message.isMine ? "text-end" : "text-start"}`}>
                                            <small className="d-flex align-items-center gap-2 mb-1 text-gray-500 fs-9">
                                                <strong className="text-gray-700">{message.sender?.name || "Người dùng"}</strong>
                                                <time>{formatTime(message.createdAt)}</time>
                                            </small>
                                            {message.messageType === "image" || message.attachments?.some(item => item.mimeType?.startsWith("image/")) ? (
                                                <div className={`messages-image-grid ${message.isMine ? "is-mine" : ""}`}>
                                                    {message.attachments?.filter(item => item.mimeType?.startsWith("image/")).map((item, index) => <button key={`${item.url}-${index}`} type="button" className="messages-image-open" onClick={() => setImageViewer(item.url)} aria-label="Phóng to ảnh"><img src={item.url} alt={item.name || "Ảnh đính kèm"} loading="lazy" /></button>)}
                                                    {message.content && <p className={`px-3 py-2 rounded-pill fs-7 mb-0 text-break ${message.isMine ? "bg-primary text-white text-center" : "bg-light text-gray-900"}`}>{message.content}</p>}
                                                </div>
                                            ) : message.messageType === "audio" ? (
                                                <div className={`messages-audio-bubble ${message.isMine ? "is-mine" : ""}`}>
                                                    {message.attachments?.[0]?.url ? <audio controls preload="metadata" src={message.attachments[0].url} aria-label="Phát tin nhắn thoại" onError={() => setAudioPlaybackErrors(current => ({ ...current, [message.id]: true }))} onCanPlay={() => setAudioPlaybackErrors(current => { if (!current[message.id]) return current; const next = { ...current }; delete next[message.id]; return next; })} /> : <span>Không tải được tin nhắn thoại.</span>}
                                                    <span className="messages-audio-duration">{message.attachments?.[0]?.durationMs ? `${Math.floor(message.attachments[0].durationMs / 60000)}:${String(Math.floor(message.attachments[0].durationMs / 1000) % 60).padStart(2, "0")}` : ""}</span>
                                                    {audioPlaybackErrors[message.id] && <span className="messages-audio-error">Không tải/phát được âm thanh. Hãy thử tải lại cuộc trò chuyện.</span>}
                                                </div>
                                            ) : message.content ? (
                                                <p className={`px-3 py-2 rounded-pill fs-7 mb-0 text-break ${message.isMine ? "bg-primary text-white text-center" : "bg-light text-gray-900"}`}>{message.content}</p>
                                            ) : null}
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
                    <form className={`card-footer messages-composer p-3 border-top border-gray-200 ${composerFocused || draft || selectedImages.length || recordedVoice || recording ? "is-expanded" : ""}`} onSubmit={submit}>
                        {!online && <p className="text-danger fs-8 mb-2" role="status">Bạn đang ngoại tuyến. Kết nối lại để gửi tin nhắn.</p>}
                        {actionError && <p className="text-danger fs-8 mb-2" role="alert">{actionError}</p>}
                        {composerError && <p className="text-danger fs-8 mb-2" role="alert">{composerError}</p>}
                        {selectedImages.length > 0 && <div className="messages-composer-previews" aria-label="Ảnh đã chọn">{selectedImages.map((item, index) => <div className="messages-composer-preview" key={`${item.url}-${index}`}><img src={item.url} alt={item.file.name} /><button type="button" onClick={() => setSelectedImages(current => current.filter((_, i) => i !== index))} aria-label="Xóa ảnh"><X size={15} /></button></div>)}</div>}
                        {recording && <div className="messages-recording-state"><span className="messages-recording-dot" /> Đang ghi âm {Math.floor(recordDurationMs / 60000)}:{String(Math.floor(recordDurationMs / 1000) % 60).padStart(2, "0")} <button type="button" className="btn btn-sm btn-light-danger" onClick={() => stopVoiceRecording(true)}><Trash2 size={15} /> Hủy</button></div>}
                        {recordedVoice && !recording && <div className="messages-voice-preview"><audio controls src={recordedVoice.url} /><button type="button" className="btn btn-sm btn-light-danger" onClick={() => setRecordedVoice(null)} aria-label="Xóa bản ghi"><X size={16} /></button><span>{Math.floor(recordedVoice.durationMs / 60000)}:{String(Math.floor(recordedVoice.durationMs / 1000) % 60).padStart(2, "0")}</span></div>}
                        <div className="messages-composer-row">
                            <div className={`messages-composer-actions ${composerFocused || draft || selectedImages.length || recordedVoice || recording ? "is-collapsed" : ""}`} aria-label="Tác vụ tin nhắn">
                                <button type="button" className="btn btn-icon btn-light-primary" onClick={startVoiceRecording} disabled={!online || recording || Boolean(recordedVoice)} title="Ghi âm" aria-label="Ghi âm"><Mic size={19} /></button>
                                <button type="button" className="btn btn-icon btn-light-primary" onClick={() => imageInputRef.current?.click()} disabled={!online || recording} title="Chọn ảnh" aria-label="Chọn ảnh"><ImagePlus size={19} /></button>
                                <div className="messages-emoji-wrap" ref={emojiRef}>
                                    <button type="button" className="btn btn-icon btn-light-primary" onClick={() => setEmojiOpen(value => !value)} title="Emoji" aria-label="Mở bộ chọn emoji"><Smile size={19} /></button>
                                    {emojiOpen && <div className="messages-emoji-picker" role="dialog" aria-label="Chọn emoji">{emojis.map(emoji => <button type="button" key={emoji} onClick={() => insertEmoji(emoji)}>{emoji}</button>)}</div>}
                                </div>
                            </div>
                            <textarea
                            ref={textAreaRef}
                            value={draft}
                            onFocus={() => setComposerFocused(true)}
                            onBlur={() => setComposerFocused(false)}
                            onChange={event => { updateDraft(event.target.value); event.currentTarget.style.height = "auto"; event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 144)}px`; }}
                            placeholder="Viết tin nhắn…"
                            maxLength={4000}
                            rows={1}
                            className="form-control form-control-solid resize-none p-3 fs-7 rounded-3"
                            aria-label="Nội dung tin nhắn"
                            onKeyDown={event => {
                                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                                    event.preventDefault();
                                    event.currentTarget.form?.requestSubmit();
                                }
                            }}
                            disabled={!online}
                            />
                            {recording && <button type="button" className="btn btn-danger btn-icon messages-record-stop" aria-label="Dừng ghi âm" onClick={() => stopVoiceRecording()}><Square size={15} /></button>}
                        </div>
                        <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" multiple hidden onChange={event => { addImages(event.target.files); event.currentTarget.value = ""; }} />
                        <div className="d-flex align-items-center justify-content-between mt-2">
                            <span className="text-gray-500 fs-9">{draft.length}/4000</span>
                            <button type="submit" className="btn btn-primary btn-sm px-4 rounded-2" disabled={!online || uploading || (!draft.trim() && selectedImages.length === 0 && !recordedVoice && !recording)}>
                                {uploading ? "Đang tải…" : recording ? "Dừng" : <><Send size={15} className="me-1" /> Gửi</>}
                            </button>
                        </div>
                    </form>
                </>}
            </section>
        </div>
        {currentUser && <span className="messages-sr-only" aria-live="polite">Đăng nhập với tài khoản {currentUser.userName || currentUser.email}</span>}
        {calls.notice && <div className="call-toast" role="status">{calls.notice}</div>}
        {imageViewer && <div className="messages-image-viewer" role="dialog" aria-modal="true" onClick={() => setImageViewer(null)}><button type="button" aria-label="Đóng ảnh" onClick={() => setImageViewer(null)}><X size={24} /></button><img src={imageViewer} alt="Ảnh phóng to" onClick={event => event.stopPropagation()} /></div>}
        {calls.error && !calls.activeCall && <div className="call-toast is-error" role="alert"><span>{calls.error}</span><button type="button" onClick={calls.dismissError} aria-label="Đóng thông báo lỗi">×</button></div>}
        {calls.activeCall && currentUser && <Suspense fallback={<div className="call-overlay-loading" role="status">Đang mở giao diện cuộc gọi…</div>}><CallOverlay session={calls.activeCall} userId={currentUser.id} busy={calls.busy} error={calls.error} online={online} cameraOffOnStart={incomingCameraOff && navigationCallState?.incomingCallId === calls.activeCall.call.id} onAccept={calls.accept} onDecline={calls.decline} onCancel={calls.cancel} onEnd={calls.end} onDismissError={calls.dismissError} /></Suspense>}
    </main>;
}
