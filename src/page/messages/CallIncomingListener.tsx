import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { io } from "socket.io-client";
import { AudioLines, Clock3, MessageSquareText, PhoneCall, PhoneOff, Video } from "lucide-react";
import { getCurrentUser } from "../../axios/auth";
import { acceptCall, declineCall, listActiveCalls, type ActiveCall } from "../../axios/calls";
import { getAccessToken } from "../../axios/index";

function initials(name: string) {
    return name.trim().split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase() || "?";
}

export default function CallIncomingListener() {
    const location = useLocation();
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string | null>(null);
    const [incoming, setIncoming] = useState<ActiveCall | null>(null);
    const [busy, setBusy] = useState(false);
    const [cameraOff, setCameraOff] = useState(false);
    const [failedAvatar, setFailedAvatar] = useState<string | null>(null);
    const [error, setError] = useState("");
    const incomingRef = useRef<ActiveCall | null>(null);
    const syncSequence = useRef(0);
    const snoozedId = useRef<string | null>(null);
    const snoozeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const setCurrentIncoming = useCallback((call: ActiveCall | null) => {
        incomingRef.current = call;
        setIncoming(call);
        if (call) {
            setCameraOff(false);
            setError("");
            setFailedAvatar(null);
        }
    }, []);

    const syncIncoming = useCallback(async (eventCallId?: string) => {
        const requestId = ++syncSequence.current;
        try {
            const result = await listActiveCalls();
            if (requestId !== syncSequence.current) return;
            const call = result.calls.find(item =>
                (!eventCallId || item.call.id === eventCallId)
                && item.call.status === "ringing"
                && item.call.participants.some(participant => participant.id === userId && participant.role === "callee"),
            ) ?? null;
            if (call?.call.id === snoozedId.current) return;
            if (!call && eventCallId) {
                if (incomingRef.current?.call.id === eventCallId) setCurrentIncoming(null);
                return;
            }
            setCurrentIncoming(call);
        } catch {
            // A transient API failure must not turn unverified socket payload into caller details.
        }
    }, [setCurrentIncoming, userId]);

    // Route changes also cover login/logout, since the auth token is held in memory by the API client.
    useEffect(() => {
        let cancelled = false;
        void getCurrentUser().then(response => {
            if (!cancelled) setUserId(response.data.currentUser.id);
        }).catch(() => {
            if (!cancelled) {
                setUserId(null);
                setCurrentIncoming(null);
            }
        });
        return () => { cancelled = true; };
    }, [location.pathname, setCurrentIncoming]);

    useEffect(() => {
        if (!userId) return;
        const token = getAccessToken();
        if (!token) return;
        const socketUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        const socket = io(socketUrl, { auth: { token }, withCredentials: true, reconnection: true });
        const onConnect = () => { void syncIncoming(); };
        const onIncoming = (event: { callId?: string; calleeId?: string }) => {
            if (event?.callId && event.calleeId === userId) void syncIncoming(event.callId);
        };
        const onTransition = (event: { callId?: string; status?: string }) => {
            if (event?.callId && ["accepted", "declined", "cancelled", "ended", "failed"].includes(event.status ?? "")) {
                if (incomingRef.current?.call.id === event.callId) setCurrentIncoming(null);
            }
        };
        socket.on("connect", onConnect);
        socket.on("call:incoming", onIncoming);
        socket.on("call:accepted", onTransition);
        socket.on("call:declined", onTransition);
        socket.on("call:cancelled", onTransition);
        socket.on("call:ended", onTransition);
        socket.on("connect_error", () => {
            void getCurrentUser().then(() => {
                const refreshedToken = getAccessToken();
                if (refreshedToken) socket.auth = { token: refreshedToken };
            }).catch(() => undefined);
        });
        if (socket.connected) queueMicrotask(onConnect);
        return () => {
            socket.off("connect", onConnect);
            socket.off("call:incoming", onIncoming);
            socket.off("call:accepted", onTransition);
            socket.off("call:declined", onTransition);
            socket.off("call:cancelled", onTransition);
            socket.off("call:ended", onTransition);
            socket.disconnect();
        };
    }, [setCurrentIncoming, syncIncoming, userId]);

    useEffect(() => () => { if (snoozeTimer.current) clearTimeout(snoozeTimer.current); }, []);

    const caller = incoming?.call.participants.find(participant => participant.role === "caller");
    const answer = async () => {
        if (!incoming || busy) return;
        setBusy(true);
        setError("");
        try {
            await acceptCall(incoming.call.id);
            const callerId = incoming.call.participants.find(participant => participant.role === "caller")?.id;
            setCurrentIncoming(null);
            if (callerId) navigate(`/messages?userId=${encodeURIComponent(callerId)}`, { state: { incomingCameraOff: cameraOff, incomingCallId: incoming.call.id } });
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Không thể nhận cuộc gọi. Vui lòng thử lại.");
        } finally { setBusy(false); }
    };

    const decline = async () => {
        if (!incoming || busy) return;
        setBusy(true);
        setError("");
        try {
            await declineCall(incoming.call.id);
            setCurrentIncoming(null);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : "Không thể từ chối cuộc gọi. Vui lòng thử lại.");
        } finally { setBusy(false); }
    };

    const snooze = () => {
        if (!incoming) return;
        const callId = incoming.call.id;
        snoozedId.current = callId;
        setCurrentIncoming(null);
        if (snoozeTimer.current) clearTimeout(snoozeTimer.current);
        snoozeTimer.current = setTimeout(() => {
            snoozedId.current = null;
            void syncIncoming(callId);
        }, 20000);
    };

    const openChat = () => {
        const callerId = caller?.id;
        if (callerId) navigate(`/messages?userId=${encodeURIComponent(callerId)}`);
    };

    if (!incoming || !caller) return null;
    const isVideo = incoming.call.callType === "video";

    return <div className="incoming-call-backdrop">
        <section className="incoming-call-card" role="dialog" aria-modal="true" aria-labelledby="incoming-call-name">
            <div className="incoming-call-pill"><i /> NEXCHAT {isVideo ? "VIDEO" : "AUDIO"} CALL</div>
            <div className="incoming-call-identity">
                <div className="incoming-call-avatar-rings"><div className="incoming-call-avatar">{caller.avatar && failedAvatar !== caller.avatar ? <img src={caller.avatar} alt="" onError={() => setFailedAvatar(caller.avatar)} /> : <span>{initials(caller.name)}</span>}</div>{isVideo && <span className="incoming-call-video-badge" aria-hidden="true"><Video size={14} /></span>}</div>
                <h2 id="incoming-call-name">{caller.name}</h2>
                <p>{isVideo ? "Cuộc gọi video đến" : "Cuộc gọi thoại đến"}</p>
                <span className="incoming-call-conversation">Cuộc gọi NexChat riêng tư</span>
                <div className="incoming-call-status"><AudioLines size={16} className="incoming-call-wave" aria-hidden="true" /> Đang gọi cho bạn…</div>
            </div>

            <div className="incoming-call-quick-actions">
                <button type="button" onClick={snooze} disabled={busy}><Clock3 size={16} aria-hidden="true" /> Nhắc sau</button>
                <button type="button" onClick={openChat} disabled={busy}><MessageSquareText size={16} aria-hidden="true" /> Tin nhắn</button>
            </div>
            {isVideo && <button type="button" className="incoming-call-camera-toggle" role="switch" aria-checked={cameraOff} onClick={() => setCameraOff(value => !value)} disabled={busy}>
                <Video size={16} className="incoming-call-camera-icon" aria-hidden="true" /><span>Tắt camera khi nhận</span><i className={cameraOff ? "is-on" : ""}><b /></i>
            </button>}
            {error && <p className="incoming-call-error" role="alert">{error}</p>}
            <div className="incoming-call-actions">
                <button type="button" className="incoming-call-decline" onClick={() => void decline()} disabled={busy} aria-label="Từ chối cuộc gọi"><span><PhoneOff size={25} /></span><small>Từ chối</small></button>
                <div className="incoming-call-audio-note"><AudioLines size={22} aria-hidden="true" /><small>HD Audio</small></div>
                <button type="button" className="incoming-call-answer" onClick={() => void answer()} disabled={busy} aria-label="Trả lời cuộc gọi"><span><PhoneCall size={25} /></span><small>Trả lời</small></button>
            </div>
        </section>
    </div>;
}
