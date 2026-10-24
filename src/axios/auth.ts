import api, { setAccessToken } from "./index";
import type { AuthSession, CurrentUser, LoginPayload, RegisterPayload, RegisterResponse } from "../component/type/auth";

export async function login(payload: LoginPayload) {
    const response = await api.post<AuthSession>("/auth/login", payload);
    setAccessToken(response.data.accessToken || null);
    return response;
}

export async function logout() {
    const response = await api.post("/auth/logout", undefined, { withCredentials: true });
    setAccessToken(null);
    return response;
}

export function register(payload: RegisterPayload) {
    return api.post<RegisterResponse>("/auth/register", payload);
}

export function getCurrentUser() { return api.get<{ currentUser: CurrentUser }>("/auth/me"); }
