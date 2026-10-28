import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { acceptCall, cancelCall, declineCall, endCall, listActiveCalls, startCall, type ActiveCall, type CallType } from "../../axios/calls";
import type { DirectConversation } from "../../component/type/message";

function errorMessage(error: unknown) {
    if (error instanceof Error && error.message) return error.message;
    if (isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (typeof message === "string") return message;
    }
    return "Không thể thực hiện cuộc gọi. Vui lòng thử lại.";
}

export function useCalls(socket: Socket | null, conversationId: string | null, conversation: DirectConversation | null, online: boolean, userId: string | null) {
    const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const activeRef = useRef<ActiveCall | null>(null);
    const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const updateCall = useCallback((call: ActiveCall | null) => {
        activeRef.current = call;
        setActiveCall(call);
    }, []);

    const showNotice = useCallback((message: string) => {
        setNotice(message);
        if (noticeTimer.current) clearTimeout(noticeTimer.current);
        noticeTimer.current = setTimeout(() => setNotice(""), 4000);
    }, []);

    const syncActiveCall = useCallback(async () => {
        try {
            const result = await listActiveCalls();
            const current = result.calls.find(item => item.call.status === "accepted" || item.call.initiatedBy === userId) ?? null;
            if (current && activeRef.current?.call.id === current.call.id && activeRef.current.call.status === current.call.status && activeRef.current.token) return;
            updateCall(current);
        } catch {
            // A socket reconnect is best-effort; the authenticated call controls still report API failures.
        }
    }, [updateCall, userId]);

    useEffect(() => {
        if (!socket) return;
        const onConnect = () => { void syncActiveCall(); };
        const onState = (event: { callId?: string; status?: string }) => {
            if (!event?.callId) return;
            const current = activeRef.current;
            if (["declined", "cancelled", "ended"].includes(event.status ?? "")) {
                if (!current || current.call.id === event.callId) {
                    const text = event.status === "declined" ? "Cuộc gọi đã bị từ chối." : event.status === "cancelled" ? "Cuộc gọi đã bị hủy." : "Cuộc gọi đã kết thúc.";
                    updateCall(null);
                    showNotice(text);
                }
            } else {
                void syncActiveCall();
            }
        };
        socket.on("connect", onConnect);
        socket.on("call:incoming", onState);
        socket.on("call:outgoing", onState);
        socket.on("call:accepted", onState);
        socket.on("call:declined", onState);
        socket.on("call:cancelled", onState);
        socket.on("call:ended", onState);
        if (socket.connected) queueMicrotask(() => { void syncActiveCall(); });
        return () => {
            socket.off("connect", onConnect);
            socket.off("call:incoming", onState);
            socket.off("call:outgoing", onState);
            socket.off("call:accepted", onState);
            socket.off("call:declined", onState);
            socket.off("call:cancelled", onState);
            socket.off("call:ended", onState);
        };
    }, [socket, showNotice, syncActiveCall, updateCall]);

    useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current); }, []);

    const withAction = useCallback(async (action: () => Promise<void>) => {
        if (!online || busy) return;
        setBusy(true);
        setError("");
        try { await action(); }
        catch (reason) { setError(errorMessage(reason)); }
        finally { setBusy(false); }
    }, [busy, online]);

    const start = useCallback((callType: CallType) => withAction(async () => {
        if (!conversationId || !conversation) throw new Error("Hãy mở cuộc trò chuyện với một người bạn trước.");
        const result = await startCall(conversationId, callType);
        updateCall({ call: result.call, token: result.token, expiresIn: result.expiresIn, url: result.url });
    }), [conversation, conversationId, updateCall, withAction]);

    const accept = useCallback(() => withAction(async () => {
        const current = activeRef.current;
        if (!current) return;
        const result = await acceptCall(current.call.id);
        updateCall({ call: result.call, token: result.token, expiresIn: result.expiresIn, url: result.url });
    }), [updateCall, withAction]);

    const finish = useCallback((kind: "decline" | "cancel" | "end") => withAction(async () => {
        const current = activeRef.current;
        if (!current) return;
        if (kind === "decline") await declineCall(current.call.id);
        else if (kind === "cancel") await cancelCall(current.call.id);
        else await endCall(current.call.id);
        updateCall(null);
        setError("");
    }), [updateCall, withAction]);

    const startAudio = useCallback(() => void start("audio"), [start]);
    const startVideo = useCallback(() => void start("video"), [start]);
    const decline = useCallback(() => finish("decline"), [finish]);
    const cancel = useCallback(() => finish("cancel"), [finish]);
    const end = useCallback(() => finish("end"), [finish]);
    const dismissError = useCallback(() => setError(""), []);
    return { activeCall, busy, error, notice, startAudio, startVideo, accept, decline, cancel, end, dismissError };
}
