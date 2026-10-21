import api from "./index";
import type { LoginPayload } from "../component/type/auth";

export function login(payload: LoginPayload) {
    return api.post("/auth/login", payload);
}
