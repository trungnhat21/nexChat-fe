import { createContext } from "react";
import type { HomeContextValue } from "../../component/type/home";
import asset0 from "../../_metronic/assets/images/home/current-user.png";
import asset10 from "../../_metronic/assets/images/home/composer-avatar.png";
import asset11 from "../../_metronic/assets/images/home/author-hoang-anh.png";
import asset12 from "../../_metronic/assets/images/home/post-design-system.png";
import asset13 from "../../_metronic/assets/images/home/comment-avatar.png";
import asset14 from "../../_metronic/assets/images/home/avatar-tuan-kiet.png";
import asset15 from "../../_metronic/assets/images/home/avatar-phuong-thao.png";
import asset16 from "../../_metronic/assets/images/home/author-quoc-nam.png";
import asset17 from "../../_metronic/assets/images/home/friend-linh-san.png";
import asset18 from "../../_metronic/assets/images/home/friend-hoang-bach.png";
import asset19 from "../../_metronic/assets/images/home/friend-tuyet-mai.png";
import asset23 from "../../_metronic/assets/images/home/nexchat-logo.svg";
import asset24 from "../../_metronic/assets/images/home/profile.png";
import asset25 from "../../_metronic/assets/images/home/icon-verified.svg";
import asset26 from "../../_metronic/assets/images/home/icon-1.svg";
import asset27 from "../../_metronic/assets/images/home/icon-2.svg";
import asset28 from "../../_metronic/assets/images/home/icon-3.svg";
import asset29 from "../../_metronic/assets/images/home/icon-4.svg";
import asset30 from "../../_metronic/assets/images/home/icon-5.svg";
import asset31 from "../../_metronic/assets/images/home/icon-6.svg";
import asset32 from "../../_metronic/assets/images/home/icon-7.svg";
import asset33 from "../../_metronic/assets/images/home/icon-8.svg";
import asset34 from "../../_metronic/assets/images/home/icon-9.svg";
import asset35 from "../../_metronic/assets/images/home/icon-10.svg";
import asset36 from "../../_metronic/assets/images/home/icon-11.svg";
import asset37 from "../../_metronic/assets/images/home/icon-12.svg";
import asset38 from "../../_metronic/assets/images/home/icon-13.svg";
import asset39 from "../../_metronic/assets/images/home/icon-14.svg";
import asset40 from "../../_metronic/assets/images/home/icon-15.svg";
import asset41 from "../../_metronic/assets/images/home/icon-16.svg";
import asset42 from "../../_metronic/assets/images/home/icon-17.svg";
import asset43 from "../../_metronic/assets/images/home/icon-18.svg";
import asset44 from "../../_metronic/assets/images/home/icon-19.svg";
import asset45 from "../../_metronic/assets/images/home/icon-20.svg";
import asset46 from "../../_metronic/assets/images/home/icon-21.svg";
import asset47 from "../../_metronic/assets/images/home/icon-22.svg";
import asset48 from "../../_metronic/assets/images/home/icon-23.svg";
import asset49 from "../../_metronic/assets/images/home/icon-24.svg";
import asset50 from "../../_metronic/assets/images/home/icon-25.svg";
import asset51 from "../../_metronic/assets/images/home/icon-26.svg";
import asset52 from "../../_metronic/assets/images/home/icon-27.svg";
import asset53 from "../../_metronic/assets/images/home/icon-28.svg";
import asset54 from "../../_metronic/assets/images/home/icon-29.svg";
import asset56 from "../../_metronic/assets/images/home/icon-search.svg";
import asset57 from "../../_metronic/assets/images/home/icon-31.svg";
import asset58 from "../../_metronic/assets/images/home/icon-32.svg";
import asset59 from "../../_metronic/assets/images/home/icon-33.svg";
import asset60 from "../../_metronic/assets/images/home/icon-34.svg";

// Static assets and image crops from Figma node 3352:467.

export const designAssets = {
    "3352:474": { src: asset0 },
    "3352:481": { src: asset25 },
    "3352:499": { src: asset26 },
    "3352:506": { src: asset27 },
    "3352:514": { src: asset28 },
    "3352:522": { src: asset29 },
    "3352:530": { src: asset30 },
    "3352:536": { src: asset31 },
    "3352:544": { src: asset32 },
    "3352:588": { src: asset33 },
    "3352:623": { src: asset10 },
    "3352:631": { src: asset34 },
    "3352:636": { src: asset35 },
    "3352:641": { src: asset36 },
    "3352:646": { src: asset37 },
    "3352:656": { src: asset11 },
    "3352:663": { src: asset38 },
    "3352:670": { src: asset39 },
    "3352:673": { src: asset40 },
    "3352:688": { src: asset12 },
    "3352:694": { src: asset41 },
    "3352:699": { src: asset42 },
    "3352:710": { src: asset43 },
    "3352:715": { src: asset44 },
    "3352:720": { src: asset45 },
    "3352:725": { src: asset46 },
    "3352:731": { src: asset13 },
    "3352:738": { src: asset47 },
    "3352:741": { src: asset48 },
    "3352:744": { src: asset49 },
    "3352:749": { src: asset14 },
    "3352:761": { src: asset50 },
    "3352:768": { src: asset15 },
    "3352:780": { src: asset50 },
    "3352:793": { src: asset16 },
    "3352:800": { src: asset38 },
    "3352:807": { src: asset39 },
    "3352:810": { src: asset40 },
    "3352:819": { src: asset51 },
    "3352:850": { src: asset52 },
    "3352:855": { src: asset44 },
    "3352:860": { src: asset45 },
    "3352:865": { src: asset46 },
    "3352:873": { src: asset53 },
    "3352:889": { src: asset54 },
    "3352:899": { src: asset54 },
    "3352:909": { src: asset54 },
    "3352:919": { src: asset54 },
    "3352:931": { src: asset17 },
    "3352:941": { src: asset18 },
    "3352:951": { src: asset19 },
    "3352:1019": { src: asset23 },
    "3352:1027": { src: asset56 },
    "3352:1039": { src: asset57 },
    "3352:1045": { src: asset58 },
    "3352:1050": { src: asset59 },
    "3352:1056": { src: asset24 },
    "3352:1058": { src: asset60 },
} as const;

export const trends = [
    { category: "Công nghệ • Xu hướng hàng đầu", tag: "#TechSummit2025", count: "14.8k bài viết", icon: "3352:889" },
    { category: "Thiết kế sáng tạo", tag: "#UXDesignVietnam", count: "8.3k bài viết", icon: "3352:899" },
    { category: "Du lịch & Đời sống", tag: "#CheckinPhuQuoc", count: "5.1k bài viết", icon: "3352:909" },
    { category: "Trí tuệ nhân tạo", tag: "#AIRevolution", count: "29.4k bài viết", icon: "3352:919" },
] as const;

export const suggestedFriends = [
    { name: "Mai Linh San", mutual: 3, avatar: "3352:931" },
    { name: "Hoàng Bách", mutual: 8, avatar: "3352:941" },
    { name: "Trần Tuyết Mai", mutual: 12, avatar: "3352:951" },
] as const;

export const navigationLinks = [
        { label: "Bảng tin", icon: "3352:499", badge: "" },
        { label: "Khám phá", icon: "3352:506", badge: "Hot" },
        { label: "Thông báo", icon: "3352:514", badge: "3" },
        { label: "Tin nhắn", icon: "3352:522", badge: "" },
        { label: "Đã lưu", icon: "3352:530", badge: "" },
        { label: "Nhóm của bạn", icon: "3352:536", badge: "5" },
        { label: "Cài đặt cá nhân", icon: "3352:544", badge: "" },
    ] as const;

export const shortcuts = [
                ["UX", "Cộng Đồng UI/UX Sài Gòn", "18.4k thành viên"],
                ["AI", "GenAI Developers VN", "9.2k thành viên"],
                ["VN", "Khởi Nghiệp Công Nghệ", "42.1k thành viên"],
            ] as const;

export const postLimits = { contentLength: 5000, files: 5, fileBytes: 25 * 1024 * 1024, totalBytes: 50 * 1024 * 1024 } as const;
export const mediaTypes: string[] = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm"];
export const mediaAccept = mediaTypes.join(",");
export const privacyLabels = { public: "Công khai", friends: "Bạn bè", private: "Chỉ mình tôi" } as const;

export const HomeContext = createContext<HomeContextValue>({
    user: null,
    search: "",
    setSearch: (_value: string) => { void _value; },
    announce: (_message: string) => { void _message; },
    openPanel: (_title: string) => { void _title; },
});
