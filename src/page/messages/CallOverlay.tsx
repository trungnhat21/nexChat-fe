import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Mic, MicOff, Phone, PhoneOff, RefreshCw, Sparkles, UsersRound, Volume2, VolumeX, Video, VideoOff } from "lucide-react";
import { ConnectionState, Room, RoomEvent, Track, type Participant, type Track as LKTrack } from "livekit-client";
import type { ActiveCall } from "../../axios/calls";

function initials(name: string) {
    return name.trim().split(/\s+/).slice(-2).map(part => part[0]).join("").toUpperCase() || "?";
}

function MediaTrack({ track, muted = false, audio = false }: { track: LKTrack | null; muted?: boolean; audio?: boolean }) {
    const elementRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
    useEffect(() => {
        const element = elementRef.current;
        if (!track || !element) return;
        track.attach(element);
        if (audio && element instanceof HTMLAudioElement) element.muted = muted;
        return () => { track.detach(element); };
    }, [audio, muted, track]);
    if (!track) return null;
    return audio
        ? <audio ref={elementRef as React.RefObject<HTMLAudioElement>} autoPlay playsInline />
        : <video ref={elementRef as React.RefObject<HTMLVideoElement>} autoPlay playsInline muted={muted} />;
}

function PersonAvatar({ name, avatar, large = false }: { name: string; avatar: string | null; large?: boolean }) {
    return <div className={`call-avatar ${large ? "is-large" : ""}`}>
        {avatar ? <img src={avatar} alt="" /> : <span>{initials(name)}</span>}
    </div>;
}

export default function CallOverlay({
    session, userId, busy, error, online, cameraOffOnStart = false, onAccept, onDecline, onCancel, onEnd, onDismissError,
}: {
    session: ActiveCall;
    userId: string;
    busy: boolean;
    error: string;
    online: boolean;
    cameraOffOnStart?: boolean;
    onAccept: () => void;
    onDecline: () => void;
    onCancel: () => void;
    onEnd: () => void;
    onDismissError: () => void;
}) {
    const [remoteVideo, setRemoteVideo] = useState<LKTrack | null>(null);
    const [remoteAudio, setRemoteAudio] = useState<LKTrack[]>([]);
    const [localVideo, setLocalVideo] = useState<LKTrack | null>(null);
    const [muted, setMuted] = useState(false);
    const [cameraOff, setCameraOff] = useState(session.call.callType === "audio" || cameraOffOnStart);
    const [speakerOff, setSpeakerOff] = useState(false);
    const [softFocus, setSoftFocus] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [connection, setConnection] = useState("Đang kết nối LiveKit…");
    const [roomConnected, setRoomConnected] = useState(false);
    const [mediaError, setMediaError] = useState("");
    const [retryVersion, setRetryVersion] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const roomRef = useRef<Room | null>(null);
    const participant = session.call.participants.find(item => item.id !== userId) ?? session.call.participants[0];
    const own = session.call.participants.find(item => item.id === userId);
    const isIncoming = session.call.status === "ringing" && own?.role === "callee";
    const isOutgoing = session.call.status === "ringing" && own?.role === "caller";
    const acceptedAt = session.call.acceptedAt;

    const roomName = useMemo(() => session.call.roomName, [session.call.roomName]);
    useEffect(() => {
        if (session.call.status !== "accepted" || !session.token || !session.url) return;
        let disposed = false;
        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;
        const attachPublishedTracks = (remote: Participant) => {
            for (const publication of remote.trackPublications.values()) {
                if (!publication.track) continue;
                if (publication.track.kind === Track.Kind.Video) setRemoteVideo(publication.track);
                if (publication.track.kind === Track.Kind.Audio) setRemoteAudio(current => current.some(item => item.sid === publication.track?.sid) ? current : [...current, publication.track!]);
            }
        };
        room.on(RoomEvent.TrackSubscribed, (track, _publication, remote) => {
            if (track.kind === Track.Kind.Video) setRemoteVideo(track);
            else if (track.kind === Track.Kind.Audio) setRemoteAudio(current => current.some(item => item.sid === track.sid) ? current : [...current, track]);
            attachPublishedTracks(remote);
        });
        room.on(RoomEvent.TrackUnsubscribed, track => {
            setRemoteVideo(current => track.sid === current?.sid ? null : current);
            setRemoteAudio(current => current.filter(item => item.sid !== track.sid));
        });
        room.on(RoomEvent.ParticipantConnected, attachPublishedTracks);
        room.on(RoomEvent.LocalTrackPublished, publication => {
            if (publication.track?.kind === Track.Kind.Video) setLocalVideo(publication.track);
        });
        room.on(RoomEvent.ConnectionStateChanged, state => {
            if (state === ConnectionState.Connected) { setConnection("Đã kết nối"); setRoomConnected(true); }
            else if (state === ConnectionState.Reconnecting || state === ConnectionState.SignalReconnecting) { setConnection("Đang kết nối lại…"); setRoomConnected(false); }
            else if (state === ConnectionState.Disconnected) { setConnection("Đã ngắt kết nối"); setRoomConnected(false); }
        });
        room.on(RoomEvent.Reconnected, () => { setConnection("Đã kết nối"); setRoomConnected(true); });

        void (async () => {
            try {
                await room.connect(session.url!, session.token!);
                if (disposed) return;
                setConnection("Đã kết nối");
                setRoomConnected(true);
                setMediaError("");
                await room.localParticipant.setMicrophoneEnabled(true);
                if (session.call.callType === "video" && !cameraOffOnStart) {
                    await room.localParticipant.setCameraEnabled(true);
                    const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
                    if (publication?.track) setLocalVideo(publication.track);
                }
                room.remoteParticipants.forEach(attachPublishedTracks);
            } catch (reason) {
                if (!disposed) {
                    setMediaError(reason instanceof Error ? reason.message : "Không thể kết nối cuộc gọi.");
                    setConnection(online ? "Không thể kết nối" : "Đang ngoại tuyến");
                }
            }
        })();
        return () => {
            disposed = true;
            room.removeAllListeners();
            if (roomRef.current === room) roomRef.current = null;
            setRemoteVideo(null);
            setRemoteAudio([]);
            setLocalVideo(null);
            void room.disconnect();
        };
    }, [cameraOffOnStart, online, retryVersion, roomName, session.call.callType, session.call.status, session.token, session.url]);

    useEffect(() => {
        if (session.call.status !== "accepted" || !acceptedAt) return;
        let timer: ReturnType<typeof setTimeout>;
        const tick = () => {
            setElapsed(Math.max(0, Math.floor((Date.now() - new Date(acceptedAt).getTime()) / 1000)));
            timer = setTimeout(tick, 1000);
        };
        tick();
        return () => clearTimeout(timer);
    }, [acceptedAt, session.call.status]);

    const setMicrophone = useCallback(async () => {
        const room = roomRef.current;
        if (!room) return;
        const nextMuted = !muted;
        try { await room.localParticipant.setMicrophoneEnabled(!nextMuted); setMuted(nextMuted); }
        catch (reason) { setMediaError(reason instanceof Error ? reason.message : "Không thể thay đổi micro."); }
    }, [muted]);

    const setCamera = useCallback(async () => {
        const room = roomRef.current;
        if (!room) return;
        const nextOff = !cameraOff;
        try {
            await room.localParticipant.setCameraEnabled(!nextOff);
            setCameraOff(nextOff);
            if (nextOff) setLocalVideo(null);
            else {
                const publication = room.localParticipant.getTrackPublication(Track.Source.Camera);
                setLocalVideo(publication?.track ?? null);
            }
        } catch (reason) { setMediaError(reason instanceof Error ? reason.message : "Không thể thay đổi camera."); }
    }, [cameraOff]);

    const switchCamera = useCallback(async () => {
        const room = roomRef.current;
        if (!room) return;
        try {
            const devices = await Room.getLocalDevices("videoinput");
            if (devices.length < 2) return;
            const current = room.getActiveDevice("videoinput");
            const currentIndex = devices.findIndex(device => device.deviceId === current);
            await room.switchActiveDevice("videoinput", devices[(currentIndex + 1) % devices.length].deviceId);
        } catch (reason) { setMediaError(reason instanceof Error ? reason.message : "Không thể đổi camera."); }
    }, []);

    const endCall = isIncoming ? onDecline : isOutgoing ? onCancel : onEnd;
    const formatted = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
    const statusLabel = isIncoming ? "Cuộc gọi đến" : isOutgoing ? "Đang gọi…" : session.call.status === "accepted" ? (connection === "Đã kết nối" ? formatted : connection) : "Đang kết thúc…";

    if (minimized) return <aside className="call-mini" aria-label="Cuộc gọi đang diễn ra">
        <button type="button" className="call-mini-preview" onClick={() => setMinimized(false)} aria-label="Mở lại cuộc gọi">
            {remoteVideo ? <MediaTrack track={remoteVideo} muted /> : <PersonAvatar name={participant?.name ?? "Cuộc gọi"} avatar={participant?.avatar ?? null} />}
            <span><strong>{participant?.name ?? "Cuộc gọi"}</strong><small>{statusLabel}</small></span>
        </button>
        <button type="button" className="call-mini-end" onClick={endCall} disabled={busy} aria-label="Kết thúc cuộc gọi"><PhoneOff size={18} /></button>
    </aside>;

    return <div className={`call-overlay ${softFocus ? "has-soft-focus" : ""}`} role="dialog" aria-modal="true" aria-label={`${session.call.callType === "video" ? "Cuộc gọi video" : "Cuộc gọi thoại"} với ${participant?.name ?? "bạn bè"}`}>
        <div className="call-stage">
            {remoteVideo && !isIncoming && !isOutgoing
                ? <MediaTrack track={remoteVideo} />
                : <div className="call-stage-placeholder"><PersonAvatar name={participant?.name ?? "Bạn bè"} avatar={participant?.avatar ?? null} large /><strong>{participant?.name ?? "Bạn bè"}</strong><span>{isIncoming ? "Muốn trò chuyện với bạn" : isOutgoing ? "Đang chờ trả lời" : "Chưa bật camera"}</span></div>}
            {remoteAudio.map(track => <MediaTrack key={track.sid} track={track} muted={speakerOff} audio />)}
            <div className="call-shade" />

            <header className="call-topbar">
                <button type="button" className="call-glass-button" aria-label="Thu nhỏ cuộc gọi" onClick={() => setMinimized(true)}><ChevronDown size={20} /></button>
                <div className="call-title"><strong>{participant?.name ?? "Cuộc gọi"}</strong><span>{statusLabel}</span></div>
                <div className="call-top-actions">
                    <button type="button" className="call-glass-button" aria-label="Đổi camera" title="Đổi camera" disabled={session.call.callType !== "video" || cameraOff} onClick={() => void switchCamera()}><RefreshCw size={17} /></button>
                    <button type="button" className="call-glass-button" aria-label="Người tham gia" title="Người tham gia" onClick={() => setShowParticipants(value => !value)}><UsersRound size={18} /></button>
                </div>
                {showParticipants && <div className="call-participants-popover"><strong>Người tham gia</strong>{session.call.participants.map(item => <span key={item.id}><PersonAvatar name={item.name} avatar={item.avatar} />{item.name}{item.id === userId ? " (Bạn)" : ""}</span>)}</div>}
            </header>

            {session.call.callType === "video" && <div className="call-self-preview">
                {localVideo && !cameraOff ? <MediaTrack track={localVideo} muted /> : <div className="call-self-avatar"><PersonAvatar name={own?.name ?? "Bạn"} avatar={own?.avatar ?? null} /></div>}
                <span>Bạn</span>
            </div>}

            {(mediaError || error) && <div className="call-alert" role="alert">
                <span>{error || mediaError}</span>
                {mediaError && <button type="button" onClick={() => { setConnection("Đang kết nối LiveKit…"); setRetryVersion(value => value + 1); }} disabled={!online}><RefreshCw size={14} /> Thử kết nối lại</button>}
                {error && <button type="button" onClick={onDismissError} aria-label="Đóng thông báo">×</button>}
            </div>}
            {!online && <div className="call-network-status" role="status">Mất kết nối Internet. Đang thử kết nối lại…</div>}

            <footer className="call-dock">
                {isIncoming ? <>
                    <button type="button" className="call-control call-decline" onClick={onDecline} disabled={busy} aria-label="Từ chối cuộc gọi"><PhoneOff /></button>
                    <button type="button" className="call-control call-accept" onClick={onAccept} disabled={busy || !online} aria-label="Chấp nhận cuộc gọi"><Phone /></button>
                </> : isOutgoing ? <>
                    <button type="button" className="call-control call-end" onClick={onCancel} disabled={busy} aria-label="Hủy cuộc gọi"><PhoneOff /></button>
                </> : <>
                    <button type="button" className={`call-control ${softFocus ? "is-selected" : ""}`} aria-label="Hiệu ứng video" title="Hiệu ứng video" onClick={() => setSoftFocus(value => !value)}><Sparkles /></button>
                    {session.call.callType === "video" && <button type="button" className={`call-control ${cameraOff ? "is-muted" : ""}`} onClick={() => void setCamera()} disabled={!roomConnected || busy} aria-label={cameraOff ? "Bật camera" : "Tắt camera"}>{cameraOff ? <VideoOff /> : <Video />}</button>}
                    <button type="button" className={`call-control ${muted ? "is-muted" : ""}`} onClick={() => void setMicrophone()} disabled={!roomConnected || busy} aria-label={muted ? "Bật micro" : "Tắt micro"}>{muted ? <MicOff /> : <Mic />}</button>
                    <button type="button" className={`call-control ${speakerOff ? "is-muted" : ""}`} onClick={() => setSpeakerOff(value => !value)} aria-label={speakerOff ? "Bật âm thanh" : "Tắt âm thanh"}>{speakerOff ? <VolumeX /> : <Volume2 />}</button>
                    <button type="button" className="call-control call-end" onClick={onEnd} disabled={busy} aria-label="Kết thúc cuộc gọi"><PhoneOff /></button>
                </>}
            </footer>
        </div>
    </div>;
}
