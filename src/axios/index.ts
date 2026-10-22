import axios, { type InternalAxiosRequestConfig } from "axios";
import type { AuthSession } from "../component/type/auth";

const api = axios.create({ baseURL: "/api", withCredentials: true, headers: { "Content-Type": "application/json" } });
let accessToken: string | null = null;
let refreshRequest: Promise<string> | null = null;

export function setAccessToken(token: string | null) { accessToken = token; }
function isProtected(url = "") { return !/^\/?auth\/(login|register|refresh|logout)$/.test(url); }
async function refreshSession(): Promise<string> {
    if (!refreshRequest) {
        refreshRequest = axios.post<AuthSession>("/api/auth/refresh", undefined, { withCredentials: true })
            .then(response => {
                if (!response.data.accessToken) throw new Error("Session expired");
                accessToken = response.data.accessToken;
                return accessToken;
            }).catch(error => { accessToken = null; throw error; })
            .finally(() => { refreshRequest = null; });
    }
    return refreshRequest;
}
api.interceptors.request.use(async config => {
    if (isProtected(config.url)) config.headers.set("Authorization", "Bearer " + (accessToken || await refreshSession()));
    return config;
});
api.interceptors.response.use(response => response, async error => {
    const config = error.config as (InternalAxiosRequestConfig & { retried?: boolean }) | undefined;
    if (error.response?.status === 401 && config && isProtected(config.url) && !config.retried) {
        config.retried = true;
        config.headers.set("Authorization", "Bearer " + await refreshSession());
        return api(config);
    }
    return Promise.reject(error);
});
export default api;
