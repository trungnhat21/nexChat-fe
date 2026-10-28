import api from "./index";

export type CallType = "audio" | "video";
export type CallState = "ringing" | "accepted" | "declined" | "cancelled" | "ended" | "failed";
export type CallParticipant = { id: string; role: "caller" | "callee"; name: string; avatar: string | null; joinedAt: string | null; leftAt: string | null };
export type CallRecord = {
    id: string;
    conversationId: string;
    initiatedBy: string;
    roomName: string;
    callType: CallType;
    status: CallState;
    createdAt: string;
    acceptedAt: string | null;
    endedAt: string | null;
    endReason: string | null;
    participants: CallParticipant[];
};
export type CallCredentials = { token: string; expiresIn: number; url: string };
export type ActiveCall = { call: CallRecord } & Partial<CallCredentials>;

export async function startCall(conversationId: string, callType: CallType) {
    return (await api.post<{ success: boolean; reused: boolean; call: CallRecord } & CallCredentials>("/calls", {
        conversationId,
        callType,
        idempotencyKey: crypto.randomUUID(),
    })).data;
}

export async function acceptCall(callId: string) {
    return (await api.post<{ success: boolean; call: CallRecord } & CallCredentials>(`/calls/${callId}/accept`)).data;
}

export async function declineCall(callId: string) {
    return (await api.post<{ success: boolean; call: CallRecord }>(`/calls/${callId}/decline`)).data;
}

export async function cancelCall(callId: string) {
    return (await api.post<{ success: boolean; call: CallRecord }>(`/calls/${callId}/cancel`)).data;
}

export async function endCall(callId: string) {
    return (await api.post<{ success: boolean; call: CallRecord }>(`/calls/${callId}/end`)).data;
}

export async function listActiveCalls() {
    return (await api.get<{ success: boolean; calls: ActiveCall[] }>("/calls/active")).data;
}
