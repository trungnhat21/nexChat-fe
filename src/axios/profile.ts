import api from "./index";
import type { ProfileImageKind, ProfileImageResponse } from "../component/type/profile";

export async function uploadProfileImage(kind: ProfileImageKind, image: File) {
    const data = new FormData();
    data.append("image", image);
    const response = await api.patch<ProfileImageResponse>("/profile/images/" + kind, data, { headers: { "Content-Type": undefined } });
    return response.data;
}
