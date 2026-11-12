import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
    Users,
    Lock,
    Globe,
    Plus,
    Search,
    ShieldCheck,
    LogOut,
    Compass,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import Header from "../home/components/Header";
import Sidebar from "../home/components/Sidebar";
import { HomeContext } from "../home/config";
import { useHomeLayoutActions } from "../home/actions";
import Modal from "../../component/UI/Modal/Modal";
import {
    getGroups,
    createGroup,
    joinGroup,
    leaveGroup,
    type Group,
    type GroupPrivacy,
} from "../../axios/groups";
import { showSuccess, showError, confirmDelete } from "../../utils/swal";
import "../home/style.scss";
import "./style.scss";

// ─── GroupCard Component ─────────────────────────────────────────────────────

interface GroupCardProps {
    group: Group;
    onJoin: (group: Group) => void;
    onLeave: (group: Group) => void;
    busy?: boolean;
}

function GroupCard({ group, onJoin, onLeave, busy }: GroupCardProps) {
    const isJoined = group.membership?.status === "JOINED";
    const isPending = group.membership?.status === "PENDING";
    const isOwner = group.membership?.role === "OWNER";
    const isAdmin = group.membership?.role === "ADMIN";

    const defaultCover =
        "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)";

    return (
        <div className="card h-100 shadow-sm border-0 group-card overflow-hidden transition-all d-flex flex-column">
            {/* Cover image */}
            <Link
                to={`/groups/${group.id}`}
                className="group-card-cover position-relative d-block text-decoration-none"
                style={{
                    background: group.cover_image ? `url(${group.cover_image}) center/cover no-repeat` : defaultCover,
                    height: "120px",
                }}
            >
                {/* Privacy Badge */}
                <div className="position-absolute top-0 end-0 m-3">
                    {group.privacy === "PUBLIC" ? (
                        <span className="badge badge-light-primary fw-bold d-inline-flex align-items-center gap-1 shadow-sm">
                            <Globe size={12} />
                            <span>Công khai</span>
                        </span>
                    ) : (
                        <span className="badge badge-light-warning fw-bold d-inline-flex align-items-center gap-1 shadow-sm">
                            <Lock size={12} />
                            <span>Riêng tư</span>
                        </span>
                    )}
                </div>
            </Link>

            {/* Body */}
            <div className="card-body p-4 pt-0 d-flex flex-column position-relative flex-grow-1">
                {/* Avatar */}
                <div className="group-card-avatar-wrapper mb-3" style={{ marginTop: "-32px" }}>
                    <Link to={`/groups/${group.id}`} className="d-inline-block text-decoration-none">
                        {group.avatar ? (
                            <img
                                src={group.avatar}
                                alt={group.name}
                                className="rounded-3 border border-3 border-white shadow-sm object-fit-cover"
                                style={{ width: "64px", height: "64px" }}
                            />
                        ) : (
                            <div
                                className="rounded-3 border border-3 border-white shadow-sm bg-primary text-white d-flex align-items-center justify-content-center fw-bold fs-3"
                                style={{ width: "64px", height: "64px" }}
                            >
                                {group.name.trim().charAt(0).toUpperCase()}
                            </div>
                        )}
                    </Link>
                </div>

                {/* Info */}
                <Link to={`/groups/${group.id}`} className="text-decoration-none">
                    <h3 className="fs-6 fw-bold text-gray-900 text-truncate mb-1 text-hover-primary" title={group.name}>
                        {group.name}
                    </h3>
                </Link>
                <p className="fs-8 text-gray-600 mb-3 line-clamp-2 flex-grow-1" style={{ minHeight: "2.4em" }}>
                    {group.description || "Chưa có mô tả cho nhóm này."}
                </p>

                {/* Meta stats & Action */}
                <div className="d-flex align-items-center justify-content-between pt-3 border-top border-gray-100 mt-auto">
                    <div className="d-flex flex-column">
                        <span className="fs-8 text-gray-500 d-inline-flex align-items-center gap-1">
                            <Users size={14} className="text-gray-400" />
                            <span>{group.memberCount ?? 1} thành viên</span>
                        </span>
                        {isOwner ? (
                            <span className="badge badge-light-danger fs-9 px-1.5 py-0.5 mt-1 align-self-start">
                                Trưởng nhóm
                            </span>
                        ) : isAdmin ? (
                            <span className="badge badge-light-primary fs-9 px-1.5 py-0.5 mt-1 align-self-start">
                                Quản trị viên
                            </span>
                        ) : null}
                    </div>

                    {/* Action Button */}
                    {isJoined ? (
                        <div className="d-flex align-items-center gap-1.5">
                            <Link
                                to={`/groups/${group.id}`}
                                className="btn btn-sm btn-primary fs-8 fw-semibold px-3 d-inline-flex align-items-center gap-1"
                            >
                                <span>Vào nhóm</span>
                                <ArrowRight size={13} />
                            </Link>
                            {!isOwner && (
                                <button
                                    type="button"
                                    className="btn btn-icon btn-sm btn-light-danger"
                                    title="Rời nhóm"
                                    disabled={busy}
                                    onClick={() => onLeave(group)}
                                >
                                    <LogOut size={14} />
                                </button>
                            )}
                        </div>
                    ) : isPending ? (
                        <button type="button" className="btn btn-sm btn-light-warning fs-8 fw-semibold" disabled>
                            Chờ duyệt
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-sm btn-light-primary fs-8 fw-semibold px-3"
                            disabled={busy}
                            onClick={() => onJoin(group)}
                        >
                            Tham gia
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main GroupsPage ─────────────────────────────────────────────────────────

export default function GroupsPage() {
    const navigate = useNavigate();

    const [joined, setJoined] = useState<Group[]>([]);
    const [suggested, setSuggested] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyGroupId, setBusyGroupId] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");

    // Modal Create Group
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: "",
        description: "",
        privacy: "PUBLIC" as GroupPrivacy,
        requires_approval: false,
    });

    // Home Context bindings from useHomeLayoutActions
    const { search: headerSearch, setSearch: setHeaderSearch, notice, setNotice, user, setPanel } = useHomeLayoutActions();

    // Fetch data
    const fetchGroupsList = async () => {
        try {
            setLoading(true);
            const data = await getGroups();
            setJoined(data.joined);
            setSuggested(data.suggested);
        } catch {
            showError("Không thể tải danh sách nhóm.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchGroupsList();
    }, []);

    // Join action
    const handleJoin = async (group: Group) => {
        try {
            setBusyGroupId(group.id);
            const res = await joinGroup(group.id);
            showSuccess(res.message);

            if (res.membership?.status === "JOINED") {
                // Moved from suggested to joined
                setSuggested(prev => prev.filter(g => g.id !== group.id));
                setJoined(prev => [
                    {
                        ...group,
                        memberCount: (group.memberCount ?? 0) + 1,
                        membership: { role: "MEMBER", status: "JOINED" },
                    },
                    ...prev,
                ]);
            } else {
                // Set pending
                setSuggested(prev =>
                    prev.map(g =>
                        g.id === group.id
                            ? { ...g, membership: { role: "MEMBER", status: "PENDING" } }
                            : g
                    )
                );
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể tham gia nhóm.";
            showError(message);
        } finally {
            setBusyGroupId(null);
        }
    };

    // Leave action
    const handleLeave = async (group: Group) => {
        const confirmed = await confirmDelete(`Bạn có chắc muốn rời nhóm "${group.name}"?`);
        if (!confirmed) return;

        try {
            setBusyGroupId(group.id);
            await leaveGroup(group.id);
            showSuccess(`Đã rời nhóm "${group.name}".`);

            setJoined(prev => prev.filter(g => g.id !== group.id));
            if (group.privacy === "PUBLIC") {
                setSuggested(prev => [
                    {
                        ...group,
                        memberCount: Math.max(0, (group.memberCount ?? 1) - 1),
                        membership: null,
                    },
                    ...prev,
                ]);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể rời nhóm.";
            showError(message);
        } finally {
            setBusyGroupId(null);
        }
    };

    // Create group submit -> Navigate directly to the new group!
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = createForm.name.trim();
        if (!trimmedName) {
            showError("Vui lòng nhập tên nhóm.");
            return;
        }

        try {
            setCreating(true);
            const newGroup = await createGroup({
                name: trimmedName,
                description: createForm.description.trim() || null,
                privacy: createForm.privacy,
                requires_approval: createForm.requires_approval,
            });

            showSuccess(`Tạo nhóm "${newGroup.name}" thành công!`);
            setIsCreateOpen(false);
            setCreateForm({
                name: "",
                description: "",
                privacy: "PUBLIC",
                requires_approval: false,
            });

            // Navigate immediately to the newly created group!
            navigate(`/groups/${newGroup.id}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Không thể tạo nhóm.";
            showError(message);
        } finally {
            setCreating(false);
        }
    };

    // Filtered lists
    const filteredJoined = useMemo(() => {
        if (!searchQuery.trim()) return joined;
        const q = searchQuery.toLowerCase();
        return joined.filter(
            g =>
                g.name.toLowerCase().includes(q) ||
                (g.description && g.description.toLowerCase().includes(q))
        );
    }, [joined, searchQuery]);

    const filteredSuggested = useMemo(() => {
        if (!searchQuery.trim()) return suggested;
        const q = searchQuery.toLowerCase();
        return suggested.filter(
            g =>
                g.name.toLowerCase().includes(q) ||
                (g.description && g.description.toLowerCase().includes(q))
        );
    }, [suggested, searchQuery]);

    return (
        <HomeContext.Provider
            value={{
                user,
                search: headerSearch,
                setSearch: setHeaderSearch,
                announce: setNotice,
                openPanel: setPanel,
            }}
        >
            <div className="nexchat-home groups-page">
                <Header />
                <main className="home-grid">
                    <Sidebar />

                    {/* Main content container */}
                    <div className="home-feed" id="home-feed" tabIndex={-1}>
                        {/* ── HEADER CỘNG ĐỒNG & NHÓM ── */}
                        <div className="card shadow-sm border-0 p-4 mb-4">
                            <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div
                                        className="w-48px h-48px rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ background: "#EEF2FF", color: "#4F46E5" }}
                                    >
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h1 className="fs-4 fw-bold text-gray-900 m-0">
                                            Cộng đồng & Nhóm
                                        </h1>
                                        <p className="fs-7 text-muted m-0">
                                            Khám phá các nhóm sở thích, trao đổi kiến thức hoặc tạo cộng đồng của riêng bạn
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-primary fw-semibold px-4 py-2.5 d-inline-flex align-items-center gap-2 flex-shrink-0 align-self-start align-self-sm-center"
                                    onClick={() => setIsCreateOpen(true)}
                                >
                                    <Plus size={18} />
                                    <span>Tạo nhóm mới</span>
                                </button>
                            </div>

                            {/* Thanh tìm kiếm & thống kê */}
                            <div className="d-flex flex-column flex-sm-row align-items-sm-center gap-3 pt-3 border-top border-gray-100">
                                <div className="position-relative flex-grow-1">
                                    <Search
                                        size={15}
                                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        spellCheck={false}
                                        className="form-control form-control-solid ps-9 fs-7"
                                        placeholder="Tìm kiếm nhóm theo tên hoặc nội dung giới thiệu..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                                    <span className="badge badge-light-primary fw-semibold fs-7 py-2 px-3 d-inline-flex align-items-center gap-1.5">
                                        <Users size={13} />
                                        <span>{joined.length} đã tham gia</span>
                                    </span>
                                    <span className="badge badge-light fw-semibold fs-7 py-2 px-3 text-gray-600 d-inline-flex align-items-center gap-1.5">
                                        <Globe size={13} />
                                        <span>{suggested.length} gợi ý</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ── PHẦN 1: NHÓM CỦA BẠN (Hiển thị dạng Card nếu có nhóm) ── */}
                        {joined.length > 0 && (
                            <div className="card shadow-sm border-0 p-5 mb-5">
                                <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-gray-100">
                                    <div>
                                        <h2 className="fs-5 fw-bold text-gray-900 m-0">Nhóm của bạn</h2>
                                        <p className="fs-8 text-muted m-0">
                                            Các cộng đồng bạn đang quản trị hoặc đã tham gia
                                        </p>
                                    </div>
                                    <span className="badge badge-light-primary fw-bold fs-7 py-2 px-3">
                                        {filteredJoined.length} nhóm
                                    </span>
                                </div>

                                <div className="groups-card-grid">
                                    {filteredJoined.map(group => (
                                        <GroupCard
                                            key={group.id}
                                            group={group}
                                            busy={busyGroupId === group.id}
                                            onJoin={handleJoin}
                                            onLeave={handleLeave}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── PHẦN 2: KHÁM PHÁ CÁC NHÓM MỚI ── */}
                        <div className="card shadow-sm border-0 p-4 mb-4">
                            <div className="d-flex align-items-center gap-3">
                                <div className="w-40px h-40px rounded-circle bg-light-primary text-primary d-flex align-items-center justify-content-center">
                                    <Compass size={22} />
                                </div>
                                <div>
                                    <h2 className="fs-5 fw-bold text-gray-900 m-0">Khám phá nhóm mới</h2>
                                    <p className="fs-8 text-muted m-0">
                                        Tìm kiếm và tham gia các cộng đồng chung sở thích với bạn
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Danh sách nhóm gợi ý */}
                        {loading && (
                            <div className="card shadow-sm border-0 p-8 text-center text-muted fs-7">
                                Đang tải danh sách nhóm gợi ý...
                            </div>
                        )}

                        {!loading && filteredSuggested.length === 0 && (
                            <div className="card shadow-sm border-0 p-8 text-center bg-white rounded-3">
                                <div className="w-50px h-50px rounded-circle bg-light-primary text-primary mx-auto mb-3 d-flex align-items-center justify-content-center">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="fs-6 fw-bold text-gray-900 mb-1">
                                    {searchQuery
                                        ? `Không tìm thấy nhóm nào với từ khóa "${searchQuery}"`
                                        : "Chưa có thêm nhóm gợi ý mới"}
                                </h3>
                                <p className="fs-7 text-muted mb-4">
                                    {searchQuery
                                        ? "Hãy thử tìm kiếm với từ khóa khác hoặc tạo nhóm mới của riêng bạn."
                                        : "Bạn đã tham gia tất cả các nhóm hiện có, hoặc có thể tạo một cộng đồng mới!"}
                                </p>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary mx-auto"
                                    onClick={() => setIsCreateOpen(true)}
                                >
                                    + Tạo nhóm mới
                                </button>
                            </div>
                        )}

                        {!loading && filteredSuggested.length > 0 && (
                            <div className="groups-card-grid">
                                {filteredSuggested.map(group => (
                                    <GroupCard
                                        key={group.id}
                                        group={group}
                                        busy={busyGroupId === group.id}
                                        onJoin={handleJoin}
                                        onLeave={handleLeave}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* ── MODAL TẠO NHÓM MỚI ── */}
                <Modal
                    isOpen={isCreateOpen}
                    onClose={() => !creating && setIsCreateOpen(false)}
                    title="Tạo nhóm cộng đồng mới"
                    size="md"
                    footer={
                        <div className="d-flex align-items-center justify-content-end gap-2 w-100">
                            <button
                                type="button"
                                className="btn btn-light btn-sm px-4 fw-semibold"
                                disabled={creating}
                                onClick={() => setIsCreateOpen(false)}
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm px-4 fw-semibold"
                                disabled={creating || !createForm.name.trim()}
                                onClick={handleCreateSubmit}
                            >
                                {creating ? "Đang tạo..." : "Tạo nhóm"}
                            </button>
                        </div>
                    }
                >
                    <form onSubmit={handleCreateSubmit} className="d-flex flex-column gap-4">
                        {/* Tên nhóm */}
                        <div>
                            <label className="form-label fs-7 fw-bold text-gray-800 required">
                                Tên nhóm
                            </label>
                            <input
                                type="text"
                                className="form-control form-control-solid fs-7"
                                placeholder="Nhập tên nhóm (ví dụ: Lập trình viên React VN)..."
                                maxLength={255}
                                value={createForm.name}
                                onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                autoFocus
                                required
                            />
                        </div>

                        {/* Mô tả */}
                        <div>
                            <label className="form-label fs-7 fw-bold text-gray-800">
                                Mô tả nhóm
                            </label>
                            <textarea
                                className="form-control form-control-solid fs-7"
                                rows={3}
                                placeholder="Giới thiệu về mục đích, chủ đề của nhóm..."
                                value={createForm.description}
                                onChange={e =>
                                    setCreateForm({ ...createForm, description: e.target.value })
                                }
                            />
                        </div>

                        {/* Chọn quyền riêng tư */}
                        <div>
                            <label className="form-label fs-7 fw-bold text-gray-800 mb-2">
                                Quyền riêng tư
                            </label>
                            <div className="row g-3">
                                <div className="col-6">
                                    <label
                                        className={`card p-3 border cursor-pointer h-100 transition-all ${
                                            createForm.privacy === "PUBLIC"
                                                ? "border-primary bg-light-primary"
                                                : "border-gray-200 bg-hover-light"
                                        }`}
                                    >
                                        <div className="d-flex align-items-start gap-2">
                                            <input
                                                type="radio"
                                                name="privacy"
                                                className="form-check-input mt-1"
                                                checked={createForm.privacy === "PUBLIC"}
                                                onChange={() =>
                                                    setCreateForm({ ...createForm, privacy: "PUBLIC" })
                                                }
                                            />
                                            <div>
                                                <div className="fs-7 fw-bold text-gray-900 d-flex align-items-center gap-1">
                                                    <Globe size={14} className="text-primary" />
                                                    <span>Công khai</span>
                                                </div>
                                                <small className="fs-9 text-muted d-block mt-0.5">
                                                    Bất kỳ ai cũng có thể xem và tham gia nhóm.
                                                </small>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                                <div className="col-6">
                                    <label
                                        className={`card p-3 border cursor-pointer h-100 transition-all ${
                                            createForm.privacy === "PRIVATE"
                                                ? "border-primary bg-light-primary"
                                                : "border-gray-200 bg-hover-light"
                                        }`}
                                    >
                                        <div className="d-flex align-items-start gap-2">
                                            <input
                                                type="radio"
                                                name="privacy"
                                                className="form-check-input mt-1"
                                                checked={createForm.privacy === "PRIVATE"}
                                                onChange={() =>
                                                    setCreateForm({ ...createForm, privacy: "PRIVATE" })
                                                }
                                            />
                                            <div>
                                                <div className="fs-7 fw-bold text-gray-900 d-flex align-items-center gap-1">
                                                    <Lock size={14} className="text-warning" />
                                                    <span>Riêng tư</span>
                                                </div>
                                                <small className="fs-9 text-muted d-block mt-0.5">
                                                    Cần phê duyệt để tham gia và xem nội dung.
                                                </small>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Toggle yêu cầu duyệt bài */}
                        <div className="card p-3 bg-light border-0">
                            <div className="form-check form-switch d-flex align-items-center justify-content-between p-0 m-0">
                                <div>
                                    <label
                                        className="form-check-label fs-7 fw-bold text-gray-800 cursor-pointer d-flex align-items-center gap-1.5"
                                        htmlFor="requiresApprovalSwitch"
                                    >
                                        <ShieldCheck size={16} className="text-primary" />
                                        <span>Yêu cầu duyệt bài viết</span>
                                    </label>
                                    <small className="text-muted fs-8 d-block mt-0.5">
                                        Bài viết từ thành viên cần Ban Quản trị phê duyệt trước khi hiển thị.
                                    </small>
                                </div>
                                <input
                                    className="form-check-input ms-3 cursor-pointer"
                                    type="checkbox"
                                    id="requiresApprovalSwitch"
                                    checked={createForm.requires_approval}
                                    onChange={e =>
                                        setCreateForm({
                                            ...createForm,
                                            requires_approval: e.target.checked,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </form>
                </Modal>
                {notice && (
                    <div className="home-toast" role="status" aria-live="polite">
                        {notice}
                    </div>
                )}
            </div>
        </HomeContext.Provider>
    );
}
