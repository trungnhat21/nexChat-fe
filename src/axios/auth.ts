import api from "./index";
import type { LoginPayload, RegisterPayload, RegisterResponse } from "../component/type/auth";

export function login(payload: LoginPayload) {
    return api.post("/auth/login", payload);
}

export function logout() {
    return api.post("/auth/logout", undefined, { withCredentials: true });
}

export function register(payload: RegisterPayload) {
    return api.post<RegisterResponse>("/auth/register", payload);
}
