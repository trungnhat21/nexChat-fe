import type { GroupPrivacy } from "../../axios/groups";

export interface GroupCreateForm {
    name: string;
    description: string;
    privacy: GroupPrivacy;
    requires_approval: boolean;
}

export const groupsPageConfig = {
    title: "Cộng đồng & Nhóm",
    subtitle: "Khám phá các nhóm sở thích, trao đổi kiến thức hoặc tạo cộng đồng của riêng bạn",
    defaultCover: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)",
    emptyGroupDescription: "Chưa có mô tả cho nhóm này.",
};

export const initialGroupCreateForm: GroupCreateForm = {
    name: "",
    description: "",
    privacy: "PUBLIC",
    requires_approval: false,
};
