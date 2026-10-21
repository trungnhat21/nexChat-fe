import asset0 from "../../_metronic/assets/images/profile/highlight-ai.png";
import asset1 from "../../_metronic/assets/images/profile/highlight-tech.png";
import asset2 from "../../_metronic/assets/images/profile/highlight-design.png";
import asset3 from "../../_metronic/assets/images/profile/highlight-life.png";
import asset4 from "../../_metronic/assets/images/profile/highlight-travel.png";
import asset5 from "../../_metronic/assets/images/profile/cover.png";
import asset6 from "../../_metronic/assets/images/profile/avatar.png";
import asset7 from "../../_metronic/assets/images/profile/workspace-preview.png";
import asset8 from "../../_metronic/assets/images/profile/logo.png";
import asset9 from "../../_metronic/assets/images/profile/header-avatar.png";
import asset10 from "../../_metronic/assets/images/profile/icon-0.svg";
import asset11 from "../../_metronic/assets/images/profile/icon-1.svg";
import asset12 from "../../_metronic/assets/images/profile/icon-2.svg";
import asset13 from "../../_metronic/assets/images/profile/icon-3.svg";
import asset14 from "../../_metronic/assets/images/profile/icon-4.svg";
import asset15 from "../../_metronic/assets/images/profile/icon-5.svg";
import asset16 from "../../_metronic/assets/images/profile/icon-6.svg";
import asset17 from "../../_metronic/assets/images/profile/icon-7.svg";
import asset18 from "../../_metronic/assets/images/profile/icon-8.svg";
import asset19 from "../../_metronic/assets/images/profile/icon-9.svg";
import asset20 from "../../_metronic/assets/images/profile/icon-10.svg";
import asset21 from "../../_metronic/assets/images/profile/icon-11.svg";
import asset22 from "../../_metronic/assets/images/profile/icon-12.svg";
import asset23 from "../../_metronic/assets/images/profile/icon-13.svg";
import asset24 from "../../_metronic/assets/images/profile/icon-14.svg";
import asset25 from "../../_metronic/assets/images/profile/icon-15.svg";
import asset26 from "../../_metronic/assets/images/profile/icon-16.svg";
import asset27 from "../../_metronic/assets/images/profile/icon-17.svg";
import asset28 from "../../_metronic/assets/images/profile/icon-18.svg";
import asset29 from "../../_metronic/assets/images/profile/icon-19.svg";
import asset30 from "../../_metronic/assets/images/profile/icon-20.svg";
import asset31 from "../../_metronic/assets/images/profile/icon-21.svg";
import asset32 from "../../_metronic/assets/images/profile/icon-22.svg";
import asset33 from "../../_metronic/assets/images/profile/icon-23.svg";
import asset34 from "../../_metronic/assets/images/profile/icon-24.svg";
import asset35 from "../../_metronic/assets/images/profile/icon-25.svg";
import asset36 from "../../_metronic/assets/images/profile/icon-26.svg";
import asset37 from "../../_metronic/assets/images/profile/icon-27.svg";
import asset38 from "../../_metronic/assets/images/profile/icon-28.svg";
import type { ProfileDetails, ProfilePost } from "../../component/type/profile";

export const profileAssets = {
    "3360:482": { src: asset10 },
    "3360:489": { src: asset0 },
    "3360:495": { src: asset1 },
    "3360:501": { src: asset2 },
    "3360:507": { src: asset3 },
    "3360:513": { src: asset4 },
    "3360:518": { src: asset5 },
    "3360:522": { src: asset11 },
    "3360:532": { src: asset6 },
    "3360:534": { src: asset12 },
    "3360:539": { src: asset13 },
    "3360:544": { src: asset14 },
    "3360:547": { src: asset15 },
    "3360:554": { src: asset16 },
    "3360:559": { src: asset17 },
    "3360:571": { src: asset18 },
    "3360:576": { src: asset19 },
    "3360:581": { src: asset20 },
    "3360:608": { src: asset21 },
    "3360:614": { src: asset6 },
    "3360:619": { src: asset22 },
    "3360:626": { src: asset23 },
    "3360:629": { src: asset24 },
    "3360:646": { src: asset25 },
    "3360:653": { src: asset26 },
    "3360:660": { src: asset27 },
    "3360:664": { src: asset28 },
    "3360:676": { src: asset29 },
    "3360:681": { src: asset30 },
    "3360:686": { src: asset31 },
    "3360:693": { src: asset6 },
    "3360:698": { src: asset22 },
    "3360:705": { src: asset23 },
    "3360:708": { src: asset24 },
    "3360:719": { src: asset16 },
    "3360:729": { src: asset32 },
    "3360:739": { src: asset32 },
    "3360:755": { src: asset27 },
    "3360:767": { src: asset29 },
    "3360:772": { src: asset30 },
    "3360:777": { src: asset31 },
    "3360:784": { src: asset6 },
    "3360:789": { src: asset22 },
    "3360:796": { src: asset23 },
    "3360:799": { src: asset24 },
    "3360:806": { src: asset7 },
    "3360:812": { src: asset27 },
    "3360:816": { src: asset28 },
    "3360:828": { src: asset29 },
    "3360:833": { src: asset30 },
    "3360:838": { src: asset31 },
    "3360:846": { src: asset33 },
    "3360:852": { src: asset34 },
    "3360:857": { src: asset35 },
    "3360:862": { src: asset36 },
    "3360:870": { src: asset37 },
    "3360:872": { src: asset8 },
    "3360:877": { src: asset38 },
    "3360:880": { src: asset9 },
} as const;

export const initialProfile: ProfileDetails = {
    name: "Lê Minh Tâm", handle: "@minhtam.tech",
    role: "Founder & Tech Lead @ VN-Tech Labs", specialty: "AI & UI/UX Explorer",
    bio: "Xây dựng sản phẩm công nghệ tạo tác động thực tiễn.\nĐam mê Generative AI, UI/UX System & Khởi nghiệp.\n📍 TP. Hồ Chí Minh",
    website: "minhtam.tech", company: "VN-Tech Labs", joined: "Gia nhập T8, 2023",
};

export const highlights = [
    { title: "Dự án AI", image: "3360:489" },
    { title: "Tech Summit", image: "3360:495" },
    { title: "Design Sys", image: "3360:501" },
    { title: "Đời sống", image: "3360:507" },
    { title: "Du lịch", image: "3360:513" },
] as const;

export const profileTabs = [
    { id: "posts", label: "B\u00e0i\nvi\u1ebft", title: "Bài viết", icon: "3360:846" },
    { id: "media", label: "\u1ea2nh &\nVideo", title: "Ảnh & Video", icon: "3360:852" },
    { id: "saved", label: "\u0110\u00e3\nl\u01b0u", title: "Đã lưu", icon: "3360:857" },
    { id: "about", label: "V\u1ec1\nt\u00f4i", title: "Về tôi", icon: "3360:862" },
] as const;

export const profilePosts: ProfilePost[] = [
    {
        id: "profile-pinned", kind: "pinned", time: "Hôm qua lúc 19:42",
        content: "Chào mừng anh em đến với trang cá nhân của\nmình! Mình thường xuyên chia sẻ các nghiên cứu\nvề AI-first Design System và kinh nghiệm xây\ndựng sản phẩm công nghệ tại Việt Nam. 🚀✨",
        tags: ["#AI", "#ProductDesign", "#TechInVietnam", "#PulseSocial"],
        likes: 245, comments: 38, shares: 12,
        assets: { avatar: "3360:614", verified: "3360:619", globe: "3360:626", more: "3360:629", reaction: "3360:660", heart: "3360:664", like: "3360:676", comment: "3360:681", share: "3360:686" },
    },
    {
        id: "profile-poll", kind: "poll", time: "3 ngày trước",
        content: "Khảo sát nhanh dành cho anh em lập trình viên &\ndesigner: Công cụ hỗ trợ AI nào bạn đang đưa\nvào quy trình phát triển sản phẩm hàng ngày\nnhiều nhất? 🤖💡",
        likes: 312, comments: 84, shares: 19,
        assets: { avatar: "3360:693", verified: "3360:698", globe: "3360:705", more: "3360:708", reaction: "3360:755", like: "3360:767", comment: "3360:772", share: "3360:777" },
    },
    {
        id: "profile-workspace", kind: "image", time: "5 ngày trước",
        content: "Bản thiết kế giao diện Pulse Mobile Workspace\nphiên bản 2.0 vừa hoàn tất! Tối ưu trải nghiệm\nlướt newfeed cho các tech founder & creator Việt\nNam. Các bác thấy layout mới này thế nào? 📱✨",
        likes: 419, comments: 52, shares: 27,
        assets: { avatar: "3360:784", verified: "3360:789", globe: "3360:796", more: "3360:799", reaction: "3360:812", heart: "3360:816", like: "3360:828", comment: "3360:833", share: "3360:838" },
    },
];

export const pollOptions = [
    { label: "GitHub Copilot & Cursor AI", votes: 338, icon: "3360:719" },
    { label: "ChatGPT Plus & Claude 3.5 Sonnet", votes: 116, icon: "3360:729" },
    { label: "Midjourney & v0.dev", votes: 74, icon: "3360:739" },
] as const;

export const profileLimits = { imageSize: 10 * 1024 * 1024, noticeDuration: 4500 };

export const profileEditFields = [
    ["name", "Tên hiển thị"], ["handle", "Tên người dùng"], ["role", "Công việc"],
    ["specialty", "Sở thích"], ["website", "Website"], ["company", "Công ty"],
] as const;
