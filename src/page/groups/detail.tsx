import { useEffect, useState, useCallback, useTransition } from "react";
import { useParams, Link, useNavigate } from "react-router";
import {
    Users,
    Lock,
    Globe,
    Settings,
    ShieldCheck,
    Check,
    LogOut,
    ArrowLeft,
    FileText,
    Info,
    Clock,
    CheckCircle2,
    XCircle,
    UserPlus,
    UserCheck,
    UserX,
} from "lucide-react";
import Header from "../home/components/Header";
import Sidebar from "../home/components/Sidebar";
import Composer from "../home/components/Composer";
import PostCard from "../home/components/PostCard";
import { HomeContext } from "../home/config";
import { useHomeLayoutActions } from "../home/actions";
import Modal from "../../component/UI/Modal/Modal";
import {
    getGroupDetail,
    getGroupPosts,
    getGroupPendingPosts,
    getGroupMembers,
    updateGroupMember,
    removeGroupMember,
    approveGroupPost,
    joinGroup,
    leaveGroup,
    type Group,
    type GroupMember,
} from "../../axios/groups";
import {
    createPost,
    updatePost,
    deletePost,
    setPostLike,
} from "../../axios/posts";
import type {
    FeedPost,
    PostDraft,
    UploadProgress,
    PostStateChange,
} from "../../component/type/post";
import { showSuccess, showError, confirmDelete } from "../../utils/swal";
import "../home/style.scss";
import "./style.scss";

type DetailTab = "feed" | "members" | "about" | "pending" | "pending-members";

export default function GroupDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [group, setGroup] = useState<Group | null>(null);
    const [loadingGroup, setLoadingGroup] = useState(true);
    const [activeTab, setActiveTab] = useState<DetailTab>("feed");
    const [actionBusy, setActionBusy] = useState(false);

    // Posts & Feed
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    // Pending Posts (Admin/Mod)
    const [pendingPosts, setPendingPosts] = useState<FeedPost[]>([]);
    const [loadingPending, setLoadingPending] = useState(false);
    const [approvingId, setApprovingId] = useState<string | null>(null);

    // Members (JOINED)
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [memberTotal, setMemberTotal] = useState(0);

    // Pending Members (Waiting for approval - Owner/Admin)
    const [pendingMembers, setPendingMembers] = useState<GroupMember[]>([]);
    const [loadingPendingMembers, setLoadingPendingMembers] = useState(false);
    const [handlingMemberId, setHandlingMemberId] = useState<string | null>(null);

    // Modal Settings / Edit Group
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Home Context bindings
    const { search: headerSearch, setSearch: setHeaderSearch, notice, setNotice, user, setPanel } = useHomeLayoutActions();
    const [, startTransition] = useTransition();

    const isMember = group?.membership?.status === "JOINED";
    const isPending = group?.membership?.status === "PENDING";
    const role = group?.membership?.role;
    const isOwner = role === "OWNER";
    const isAdmin = role === "ADMIN";
    const isMod = role === "MODERATOR";
    const canManage = isOwner || isAdmin || isMod;
    const canManageMembers = isOwner || isAdmin;

    // ── 1. Fetch group details ──────────────────────────────────────────────
    const fetchDetail = useCallback(async () => {
        if (!id) return;
        try {
            setLoadingGroup(true);
            const data = await getGroupDetail(id);
            setGroup(data);
        } catch {
            showError("Không thể tải thông tin nhóm hoặc nhóm không tồn tại.");
            navigate("/groups");
        } finally {
            setLoadingGroup(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        void fetchDetail();
    }, [fetchDetail]);

    // ── 2. Fetch group published posts ──────────────────────────────────────
    const fetchPosts = useCallback(async () => {
        if (!id || (group?.privacy === "PRIVATE" && !isMember)) return;
        try {
            setLoadingPosts(true);
            const res = await getGroupPosts(id);
            setPosts(res.posts);
            setNextCursor(res.nextCursor);
        } catch {
            // silent or toast
        } finally {
            setLoadingPosts(false);
        }
    }, [id, group?.privacy, isMember]);

    const handleLoadMorePosts = async () => {
        if (!id || !nextCursor || loadingMore) return;
        try {
            setLoadingMore(true);
            const res = await getGroupPosts(id, nextCursor);
            setPosts(prev => [...prev, ...res.posts]);
            setNextCursor(res.nextCursor);
        } finally {
            setLoadingMore(false);
        }
    };

    // ── 3. Fetch pending posts for admin/mod ─────────────────────────────────
    const fetchPendingPosts = useCallback(async () => {
        if (!id || !canManage) return;
        try {
            setLoadingPending(true);
            const res = await getGroupPendingPosts(id);
            setPendingPosts(res.posts);
        } catch {
            // ignore
        } finally {
            setLoadingPending(false);
        }
    }, [id, canManage]);

    // ── 4. Fetch members list (JOINED) ───────────────────────────────────────
    const fetchMembers = useCallback(async () => {
        if (!id) return;
        try {
            setLoadingMembers(true);
            const res = await getGroupMembers(id, 1, 50, undefined, "JOINED");
            setMembers(res.members);
            setMemberTotal(res.total);
        } catch {
            // ignore
        } finally {
            setLoadingMembers(false);
        }
    }, [id]);

    // ── 5. Fetch pending members (PENDING) ──────────────────────────────────
    const fetchPendingMembers = useCallback(async () => {
        if (!id || !canManageMembers) return;
        try {
            setLoadingPendingMembers(true);
            const res = await getGroupMembers(id, 1, 50, undefined, "PENDING");
            setPendingMembers(res.members);
        } catch {
            // ignore
        } finally {
            setLoadingPendingMembers(false);
        }
    }, [id, canManageMembers]);

    useEffect(() => {
        if (group) {
            void fetchPosts();
            if (canManage) void fetchPendingPosts();
            if (canManageMembers) void fetchPendingMembers();
            void fetchMembers();
        }
    }, [group, canManage, canManageMembers, fetchPosts, fetchPendingPosts, fetchPendingMembers, fetchMembers]);

    // ── Handlers: Join / Leave ──────────────────────────────────────────────
    const handleJoin = async () => {
        if (!group) return;
        try {
            setActionBusy(true);
            const res = await joinGroup(group.id);
            showSuccess(res.message);
            void fetchDetail();
        } catch (error) {
            showError(error instanceof Error ? error.message : "Không thể tham gia nhóm.");
        } finally {
            setActionBusy(false);
        }
    };

    const handleLeave = async () => {
        if (!group) return;
        const confirmed = await confirmDelete(`Bạn có chắc muốn rời khỏi "${group.name}"?`);
        if (!confirmed) return;

        try {
            setActionBusy(true);
            await leaveGroup(group.id);
            showSuccess("Bạn đã rời khỏi nhóm.");
            void fetchDetail();
        } catch (error) {
            showError(error instanceof Error ? error.message : "Không thể rời nhóm.");
        } finally {
            setActionBusy(false);
        }
    };

    // ── Handlers: Approve / Reject Pending Member ───────────────────────────
    const handleApproveMember = async (targetUserId: string) => {
        if (!id) return;
        try {
            setHandlingMemberId(targetUserId);
            await updateGroupMember(id, targetUserId, { status: "JOINED" });
            showSuccess("Đã phê duyệt thành viên vào nhóm!");
            setPendingMembers(prev => prev.filter(m => m.userId !== targetUserId));
            setGroup(prev => prev ? { ...prev, memberCount: (prev.memberCount ?? 0) + 1 } : prev);
            void fetchMembers();
        } catch (error) {
            showError(error instanceof Error ? error.message : "Phê duyệt thành viên thất bại.");
        } finally {
            setHandlingMemberId(null);
        }
    };

    const handleRejectMember = async (targetUserId: string) => {
        if (!id) return;
        const confirmed = await confirmDelete("Bạn có chắc muốn từ chối yêu cầu tham gia này?");
        if (!confirmed) return;

        try {
            setHandlingMemberId(targetUserId);
            await removeGroupMember(id, targetUserId);
            showSuccess("Đã từ chối yêu cầu tham gia.");
            setPendingMembers(prev => prev.filter(m => m.userId !== targetUserId));
        } catch (error) {
            showError(error instanceof Error ? error.message : "Từ chối yêu cầu thất bại.");
        } finally {
            setHandlingMemberId(null);
        }
    };

    // ── Handlers: Approve / Reject Pending Post ─────────────────────────────
    const handleApprove = async (postId: string, action: "approve" | "reject") => {
        if (!id) return;
        try {
            setApprovingId(postId);
            const res = await approveGroupPost(id, postId, action);
            showSuccess(res.message);
            setPendingPosts(prev => prev.filter(p => p.id !== postId));

            // If approved, refresh published feed
            if (action === "approve") {
                void fetchPosts();
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : "Thao tác duyệt bài thất bại.");
        } finally {
            setApprovingId(null);
        }
    };

    // ── Handlers: Post in Group ─────────────────────────────────────────────
    const handleCreatePost = async (draft: PostDraft, onProgress: UploadProgress) => {
        if (!id) return;
        const res = await createPost(
            {
                ...draft,
                groupId: id,
            },
            onProgress
        );

        if (res.approvalStatus === "PENDING_APPROVAL") {
            showSuccess("Bài viết của bạn đã được gửi và đang chờ Ban Quản trị phê duyệt!");
            if (canManage) void fetchPendingPosts();
        } else {
            showSuccess("Đăng bài viết lên nhóm thành công!");
            setPosts(prev => [res, ...prev]);
        }
    };

    const changePostState: PostStateChange = (postId, patch) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...patch } : p));
    };

    const handleLikePost = async (postId: string, liked: boolean) => {
        const res = await setPostLike(postId, liked);
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, liked: res.liked, likes: res.likes } : p));
    };

    const handleUpdatePost = async (postId: string, draft: PostDraft, onProgress: UploadProgress) => {
        const updated = await updatePost(postId, draft, onProgress);
        setPosts(prev => prev.map(p => p.id === postId ? updated : p));
    };

    const handleDeletePost = async (postId: string) => {
        const confirmed = await confirmDelete("Bạn có chắc muốn xóa bài viết này?");
        if (!confirmed) return;
        await deletePost(postId);
        setPosts(prev => prev.filter(p => p.id !== postId));
        showSuccess("Đã xóa bài viết.");
    };

    if (loadingGroup || !group) {
        return (
            <div className="nexchat-home group-detail-page">
                <Header />
                <main className="home-grid">
                    <Sidebar />
                    <div className="home-feed p-8 text-center text-gray-500">
                        Đang tải thông tin nhóm...
                    </div>
                </main>
            </div>
        );
    }

    const defaultCover = "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)";

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
            <div className="nexchat-home group-detail-page">
                <Header />
                <main className="home-grid">
                    <Sidebar />

                    {/* Main content container */}
                    <div className="home-feed" id="home-feed" tabIndex={-1}>
                        {/* ── 1. HEADER NHÓM ── */}
                        <div className="group-detail-header">
                            {/* Cover Photo with floating back button and privacy badge */}
                            <div
                                className="group-cover-wrapper"
                                style={{
                                    background: group.cover_image
                                        ? `url(${group.cover_image}) center/cover no-repeat`
                                        : defaultCover,
                                }}
                            >
                                <Link
                                    to="/groups"
                                    className="group-back-btn"
                                >
                                    <ArrowLeft size={15} />
                                    <span>Tất cả nhóm</span>
                                </Link>

                                <div className="group-privacy-badge">
                                    {group.privacy === "PUBLIC" ? (
                                        <span className="badge badge-light-primary fw-bold fs-7 d-inline-flex align-items-center gap-1.5 py-2 px-3">
                                            <Globe size={14} />
                                            <span>Nhóm Công khai</span>
                                        </span>
                                    ) : (
                                        <span className="badge badge-light-warning fw-bold fs-7 d-inline-flex align-items-center gap-1.5 py-2 px-3">
                                            <Lock size={14} />
                                            <span>Nhóm Riêng tư</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Group Profile Row */}
                            <div className="group-profile-body">
                                <div className="group-profile-row">
                                    {/* Avatar + Info */}
                                    <div className="group-profile-left">
                                        <div className="group-avatar-wrap">
                                            {group.avatar ? (
                                                <img
                                                    src={group.avatar}
                                                    alt=""
                                                    className="group-avatar-img"
                                                />
                                            ) : (
                                                <div className="group-avatar-placeholder">
                                                    {group.name.trim().charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="group-info-wrap">
                                            <h1 className="group-name" title={group.name}>
                                                {group.name}
                                            </h1>
                                            <div className="group-meta">
                                                <span className="group-meta-item">
                                                    <Users size={15} />
                                                    <strong>{group.memberCount ?? 1}</strong> thành viên
                                                </span>
                                                <span className="group-meta-dot">•</span>
                                                <span className="group-meta-item">
                                                    Tạo ngày{" "}
                                                    {new Date(group.created_at).toLocaleDateString("vi-VN", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                                {group.requires_approval && (
                                                    <>
                                                        <span className="group-meta-dot">•</span>
                                                        <span className="badge badge-light-info fs-8 d-inline-flex align-items-center gap-1 py-1 px-2.5">
                                                            <ShieldCheck size={13} />
                                                            <span>Có kiểm duyệt bài</span>
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action buttons on the RIGHT */}
                                    <div className="group-profile-right">
                                        {isMember ? (
                                            <>
                                                <span className="badge badge-light-success py-2.5 px-3.5 fs-7 fw-bold d-inline-flex align-items-center gap-1.5">
                                                    <Check size={14} />
                                                    <span>
                                                        {isOwner
                                                            ? "Trưởng nhóm"
                                                            : isAdmin
                                                            ? "Quản trị viên"
                                                            : isMod
                                                            ? "Kiểm duyệt viên"
                                                            : "Đã tham gia"}
                                                    </span>
                                                </span>
                                                {!isOwner && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light-danger fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-2"
                                                        disabled={actionBusy}
                                                        onClick={handleLeave}
                                                    >
                                                        <LogOut size={14} />
                                                        <span>Rời nhóm</span>
                                                    </button>
                                                )}
                                                {canManage && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light border fw-semibold d-inline-flex align-items-center gap-1.5 px-3 py-2"
                                                        onClick={() => setIsSettingsOpen(true)}
                                                    >
                                                        <Settings size={15} />
                                                        <span>Cài đặt</span>
                                                    </button>
                                                )}
                                            </>
                                        ) : isPending ? (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-light-warning fw-semibold px-4 py-2"
                                                disabled
                                            >
                                                <Clock size={14} className="me-1" />
                                                <span>Đang chờ duyệt</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary fw-semibold px-4 py-2 d-inline-flex align-items-center gap-1.5 shadow-sm"
                                                disabled={actionBusy}
                                                onClick={handleJoin}
                                            >
                                                <UserPlus size={15} />
                                                <span>Tham gia nhóm</span>
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* ── 2. THANH NAVIGATION TABS ── */}
                                <div className="group-nav-tabs-wrap">
                                    <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-6 fw-bold">
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link text-active-primary px-4 py-3 border-0 bg-transparent cursor-pointer ${
                                                    activeTab === "feed" ? "active border-bottom border-primary text-primary" : "text-gray-600"
                                                }`}
                                                onClick={() => startTransition(() => setActiveTab("feed"))}
                                            >
                                                <FileText size={16} className="me-1.5" />
                                                <span>Bảng tin</span>
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link text-active-primary px-4 py-3 border-0 bg-transparent cursor-pointer ${
                                                    activeTab === "members" ? "active border-bottom border-primary text-primary" : "text-gray-600"
                                                }`}
                                                onClick={() => startTransition(() => setActiveTab("members"))}
                                            >
                                                <Users size={16} className="me-1.5" />
                                                <span>Thành viên</span>
                                                <span className="badge badge-light-secondary badge-sm ms-1.5">
                                                    {memberTotal}
                                                </span>
                                            </button>
                                        </li>
                                        {canManageMembers && (
                                            <li className="nav-item">
                                                <button
                                                    type="button"
                                                    className={`nav-link text-active-primary px-4 py-3 border-0 bg-transparent cursor-pointer position-relative ${
                                                        activeTab === "pending-members" ? "active border-bottom border-primary text-primary" : "text-gray-600"
                                                    }`}
                                                    onClick={() => startTransition(() => setActiveTab("pending-members"))}
                                                >
                                                    <UserCheck size={16} className="me-1.5 text-primary" />
                                                    <span>Duyệt thành viên</span>
                                                    {pendingMembers.length > 0 && (
                                                        <span className="badge badge-danger badge-circle badge-sm ms-1.5">
                                                            {pendingMembers.length}
                                                        </span>
                                                    )}
                                                </button>
                                            </li>
                                        )}
                                        <li className="nav-item">
                                            <button
                                                type="button"
                                                className={`nav-link text-active-primary px-4 py-3 border-0 bg-transparent cursor-pointer ${
                                                    activeTab === "about" ? "active border-bottom border-primary text-primary" : "text-gray-600"
                                                }`}
                                                onClick={() => startTransition(() => setActiveTab("about"))}
                                            >
                                                <Info size={16} className="me-1.5" />
                                                <span>Giới thiệu</span>
                                            </button>
                                        </li>
                                        {canManage && (
                                            <li className="nav-item">
                                                <button
                                                    type="button"
                                                    className={`nav-link text-active-primary px-4 py-3 border-0 bg-transparent cursor-pointer position-relative ${
                                                        activeTab === "pending" ? "active border-bottom border-primary text-primary" : "text-gray-600"
                                                    }`}
                                                    onClick={() => startTransition(() => setActiveTab("pending"))}
                                                >
                                                    <ShieldCheck size={16} className="me-1.5 text-warning" />
                                                    <span>Duyệt bài</span>
                                                    {pendingPosts.length > 0 && (
                                                        <span className="badge badge-danger badge-circle badge-sm ms-1.5">
                                                            {pendingPosts.length}
                                                        </span>
                                                    )}
                                                </button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* ── 3. NỘI DUNG TỪNG TAB ── */}

                        {/* TAB BẢNG TIN (FEED) */}
                        {activeTab === "feed" && (
                            <div>
                                {/* Private group warning if non-member */}
                                {group.privacy === "PRIVATE" && !isMember ? (
                                    <div className="card shadow-sm border-0 p-8 text-center">
                                        <div className="w-60px h-60px rounded-circle bg-light-warning text-warning d-flex align-items-center justify-content-center mx-auto mb-3">
                                            <Lock size={28} />
                                        </div>
                                        <h2 className="fs-5 fw-bold text-gray-800 mb-2">
                                            Đây là nhóm riêng tư
                                        </h2>
                                        <p className="text-gray-600 fs-7 mb-4 max-w-500px mx-auto">
                                            Nội dung và bài viết trong nhóm này chỉ hiển thị cho các thành viên đã được Ban Quản trị phê duyệt.
                                        </p>
                                        {!isPending && (
                                            <button
                                                type="button"
                                                className="btn btn-primary btn-sm px-4 mx-auto"
                                                disabled={actionBusy}
                                                onClick={handleJoin}
                                            >
                                                Yêu cầu tham gia nhóm
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="row g-4">
                                        {/* Main feed column */}
                                        <div className="col-lg-8 col-xl-8">
                                            {/* Composer for members */}
                                            {isMember && (
                                                <Composer onPost={handleCreatePost} />
                                            )}

                                            {/* Posts List */}
                                            {loadingPosts && (
                                                <div className="card shadow-sm border-0 p-6 text-center text-gray-500">
                                                    Đang tải bài viết...
                                                </div>
                                            )}

                                            {!loadingPosts && posts.length === 0 && (
                                                <div className="card shadow-sm border-0 p-8 text-center bg-white rounded-3">
                                                    <div className="w-50px h-50px rounded-circle bg-light-primary text-primary mx-auto mb-3 d-flex align-items-center justify-content-center">
                                                        <FileText size={24} />
                                                    </div>
                                                    <h3 className="fs-6 fw-bold text-gray-800 mb-1">
                                                        Chưa có bài viết nào trong nhóm
                                                    </h3>
                                                    <p className="fs-7 text-muted mb-0">
                                                        Hãy là người đầu tiên chia sẻ nội dung thú vị với các thành viên!
                                                    </p>
                                                </div>
                                            )}

                                            {!loadingPosts &&
                                                posts.map(post => (
                                                    <PostCard
                                                        key={post.id}
                                                        post={post}
                                                        onStateChange={changePostState}
                                                        onLike={handleLikePost}
                                                        onUpdate={handleUpdatePost}
                                                        onDelete={handleDeletePost}
                                                        onReload={fetchPosts}
                                                    />
                                                ))}

                                            {/* Load more button */}
                                            {nextCursor && (
                                                <div className="text-center mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-light fw-semibold px-4"
                                                        disabled={loadingMore}
                                                        onClick={handleLoadMorePosts}
                                                    >
                                                        {loadingMore ? "Đang tải thêm..." : "Tải thêm bài viết"}
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Sidebar: About Group Info */}
                                        <div className="col-lg-4 col-xl-4">
                                            <div className="card shadow-sm border-0 p-4 sticky-top" style={{ top: "80px" }}>
                                                <h3 className="fs-6 fw-bold text-gray-900 mb-3">Giới thiệu về nhóm</h3>
                                                <p className="fs-7 text-gray-700 mb-4" style={{ lineHeight: 1.6 }}>
                                                    {group.description || "Nhóm chưa có phần giới thiệu chi tiết."}
                                                </p>
                                                <div className="d-flex flex-column gap-3 pt-3 border-top border-gray-100 fs-7 text-gray-600">
                                                    <div className="d-flex align-items-center gap-2.5">
                                                        {group.privacy === "PUBLIC" ? (
                                                            <>
                                                                <Globe size={18} className="text-primary flex-shrink-0" />
                                                                <div>
                                                                    <strong className="d-block text-gray-900 fs-7">Công khai</strong>
                                                                    <small className="text-muted fs-8">Bất kỳ ai cũng có thể xem bài viết</small>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock size={18} className="text-warning flex-shrink-0" />
                                                                <div>
                                                                    <strong className="d-block text-gray-900 fs-7">Riêng tư</strong>
                                                                    <small className="text-muted fs-8">Chỉ thành viên mới xem được bài viết</small>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2.5">
                                                        <Users size={18} className="text-primary flex-shrink-0" />
                                                        <div>
                                                            <strong className="d-block text-gray-900 fs-7">{group.memberCount ?? 1} thành viên</strong>
                                                            <small className="text-muted fs-8">Cùng trao đổi và thảo luận</small>
                                                        </div>
                                                    </div>
                                                    {group.requires_approval && (
                                                        <div className="d-flex align-items-center gap-2.5">
                                                            <ShieldCheck size={18} className="text-info flex-shrink-0" />
                                                            <div>
                                                                <strong className="d-block text-gray-900 fs-7">Kiểm duyệt bài</strong>
                                                                <small className="text-muted fs-8">Bài viết cần Ban Quản trị duyệt</small>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB THÀNH VIÊN (MEMBERS) */}
                        {activeTab === "members" && (
                            <div className="card shadow-sm border-0 p-5">
                                {/* Banner nhắc nhở duyệt thành viên cho Admin/Owner */}
                                {canManageMembers && pendingMembers.length > 0 && (
                                    <div className="alert alert-dismissible bg-light-primary d-flex flex-column flex-sm-row w-100 p-4 mb-5 rounded-3 border border-primary border-dashed align-items-sm-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <div className="w-40px h-40px rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0">
                                                <UserPlus size={20} />
                                            </div>
                                            <div>
                                                <h4 className="fw-bold fs-6 text-gray-900 mb-0.5">
                                                    Có {pendingMembers.length} yêu cầu tham gia đang chờ phê duyệt
                                                </h4>
                                                <span className="fs-7 text-muted">
                                                    Hãy xem danh sách và cấp quyền để các thành viên mới có thể giao lưu trong nhóm.
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ms-sm-auto mt-3 mt-sm-0 flex-shrink-0">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-primary fw-semibold"
                                                onClick={() => startTransition(() => setActiveTab("pending-members"))}
                                            >
                                                Xem và duyệt ngay
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-gray-100">
                                    <h2 className="fs-6 fw-bold text-gray-900 m-0">
                                        Danh sách thành viên ({memberTotal})
                                    </h2>
                                </div>

                                {loadingMembers && (
                                    <div className="text-center py-6 text-gray-500 fs-7">
                                        Đang tải danh sách thành viên...
                                    </div>
                                )}

                                {!loadingMembers && members.length === 0 && (
                                    <div className="text-center py-6 text-gray-500 fs-7">
                                        Chưa có thành viên nào.
                                    </div>
                                )}

                                {!loadingMembers && (
                                    <div className="row g-3">
                                        {members.map(member => {
                                            const u = member.user;
                                            const name =
                                                [u?.lastName, u?.firstName].filter(Boolean).join(" ") ||
                                                u?.userName ||
                                                "Người dùng";
                                            const isOwnerMember = member.role === "OWNER";
                                            const isAdminMember = member.role === "ADMIN";
                                            const isModMember = member.role === "MODERATOR";

                                            return (
                                                <div key={member.userId} className="col-sm-6 col-md-6 col-lg-6 col-xl-4">
                                                    <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border border-gray-100 h-100">
                                                        <div className="d-flex align-items-center gap-3 min-w-0">
                                                            {u?.avatar ? (
                                                                <img
                                                                    src={u.avatar}
                                                                    alt=""
                                                                    className="w-44px h-44px rounded-circle object-fit-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-44px h-44px rounded-circle bg-light-primary text-primary d-flex align-items-center justify-content-center fw-bold fs-6 flex-shrink-0">
                                                                    {name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <Link
                                                                    to={`/profile/${member.userId}`}
                                                                    className="fs-7 fw-bold text-gray-900 text-hover-primary text-truncate d-block text-decoration-none"
                                                                >
                                                                    {name}
                                                                </Link>
                                                                <small className="fs-9 text-muted d-block">
                                                                    Tham gia{" "}
                                                                    {new Date(member.joinedAt).toLocaleDateString("vi-VN")}
                                                                </small>
                                                            </div>
                                                        </div>

                                                        {/* Role Badge */}
                                                        <div>
                                                            {isOwnerMember ? (
                                                                <span className="badge badge-light-danger fs-8 fw-semibold px-2 py-1">
                                                                    Trưởng nhóm
                                                                </span>
                                                            ) : isAdminMember ? (
                                                                <span className="badge badge-light-primary fs-8 fw-semibold px-2 py-1">
                                                                    Quản trị viên
                                                                </span>
                                                            ) : isModMember ? (
                                                                <span className="badge badge-light-warning fs-8 fw-semibold px-2 py-1">
                                                                    Kiểm duyệt
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-light fs-8 text-gray-600 px-2 py-1">
                                                                    Thành viên
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB DUYỆT THÀNH VIÊN (PENDING MEMBERS) - Owner/Admin */}
                        {activeTab === "pending-members" && canManageMembers && (
                            <div className="card shadow-sm border-0 p-5">
                                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom border-gray-100">
                                    <div className="d-flex align-items-center gap-2">
                                        <UserCheck size={20} className="text-primary" />
                                        <h2 className="fs-6 fw-bold text-gray-900 m-0">
                                            Yêu cầu tham gia nhóm ({pendingMembers.length})
                                        </h2>
                                    </div>
                                </div>

                                {loadingPendingMembers && (
                                    <div className="text-center py-6 text-gray-500 fs-7">
                                        Đang tải danh sách chờ duyệt...
                                    </div>
                                )}

                                {!loadingPendingMembers && pendingMembers.length === 0 && (
                                    <div className="text-center py-8 bg-white rounded-3">
                                        <CheckCircle2 size={40} className="text-success mx-auto mb-2" />
                                        <h3 className="fs-6 fw-bold text-gray-800 mb-1">
                                            Không có yêu cầu chờ duyệt
                                        </h3>
                                        <p className="fs-7 text-muted mb-0">
                                            Hiện tại tất cả yêu cầu tham gia nhóm đều đã được xử lý!
                                        </p>
                                    </div>
                                )}

                                {!loadingPendingMembers && pendingMembers.length > 0 && (
                                    <div className="row g-3">
                                        {pendingMembers.map(member => {
                                            const u = member.user;
                                            const name =
                                                [u?.lastName, u?.firstName].filter(Boolean).join(" ") ||
                                                u?.userName ||
                                                "Người dùng";
                                            const isHandling = handlingMemberId === member.userId;

                                            return (
                                                <div key={member.userId} className="col-12 col-md-6">
                                                    <div className="d-flex align-items-center justify-content-between p-3.5 rounded-3 bg-light border border-gray-100">
                                                        <div className="d-flex align-items-center gap-3 min-w-0">
                                                            {u?.avatar ? (
                                                                <img
                                                                    src={u.avatar}
                                                                    alt=""
                                                                    className="w-48px h-48px rounded-circle object-fit-cover flex-shrink-0"
                                                                />
                                                            ) : (
                                                                <div className="w-48px h-48px rounded-circle bg-light-primary text-primary d-flex align-items-center justify-content-center fw-bold fs-5 flex-shrink-0">
                                                                    {name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <Link
                                                                    to={`/profile/${member.userId}`}
                                                                    className="fs-7 fw-bold text-gray-900 text-hover-primary text-truncate d-block text-decoration-none"
                                                                >
                                                                    {name}
                                                                </Link>
                                                                {u?.userName && (
                                                                    <small className="fs-8 text-muted d-block">
                                                                        @{u.userName}
                                                                    </small>
                                                                )}
                                                                <small className="fs-9 text-gray-500 d-block mt-0.5">
                                                                    Yêu cầu tham gia lúc {new Date(member.joinedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                                                                </small>
                                                            </div>
                                                        </div>

                                                        {/* Action buttons */}
                                                        <div className="d-flex align-items-center gap-2 flex-shrink-0 ms-3">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-light-danger px-3 d-inline-flex align-items-center gap-1"
                                                                disabled={isHandling}
                                                                onClick={() => handleRejectMember(member.userId)}
                                                                title="Từ chối yêu cầu"
                                                            >
                                                                <UserX size={15} />
                                                                <span>Từ chối</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-primary px-3 d-inline-flex align-items-center gap-1"
                                                                disabled={isHandling}
                                                                onClick={() => handleApproveMember(member.userId)}
                                                                title="Chấp nhận tham gia"
                                                            >
                                                                <UserCheck size={15} />
                                                                <span>{isHandling ? "Đang xử lý..." : "Chấp nhận"}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB GIỚI THIỆU (ABOUT) */}
                        {activeTab === "about" && (
                            <div className="card shadow-sm border-0 p-5">
                                <h2 className="fs-5 fw-bold text-gray-900 mb-4 pb-3 border-bottom border-gray-100">
                                    Về nhóm này
                                </h2>
                                <div className="mb-4">
                                    <h3 className="fs-7 fw-bold text-gray-800 mb-2">Mô tả</h3>
                                    <p className="fs-7 text-gray-700 whitespace-pre-wrap">
                                        {group.description || "Nhóm chưa có phần mô tả."}
                                    </p>
                                </div>

                                <div className="row g-4 mt-2">
                                    <div className="col-md-4">
                                        <div className="card p-4 bg-light border-0">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="w-36px h-36px rounded-circle bg-light-primary text-primary d-flex align-items-center justify-content-center">
                                                    {group.privacy === "PUBLIC" ? <Globe size={18} /> : <Lock size={18} />}
                                                </div>
                                                <div>
                                                    <span className="fs-8 text-muted d-block">Quyền riêng tư</span>
                                                    <strong className="fs-7 text-gray-900">
                                                        {group.privacy === "PUBLIC" ? "Công khai" : "Riêng tư"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card p-4 bg-light border-0">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="w-36px h-36px rounded-circle bg-light-primary text-primary d-flex align-items-center justify-content-center">
                                                    <Users size={18} />
                                                </div>
                                                <div>
                                                    <span className="fs-8 text-muted d-block">Số lượng thành viên</span>
                                                    <strong className="fs-7 text-gray-900">
                                                        {memberTotal} thành viên
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="card p-4 bg-light border-0">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="w-36px h-36px rounded-circle bg-light-primary text-primary d-flex align-items-center justify-content-center">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <div>
                                                    <span className="fs-8 text-muted d-block">Chế độ kiểm duyệt</span>
                                                    <strong className="fs-7 text-gray-900">
                                                        {group.requires_approval ? "Bật phê duyệt" : "Tự do đăng bài"}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB DUYỆT BÀI (PENDING POSTS) - Admin/Mod */}
                        {activeTab === "pending" && canManage && (
                            <div className="d-flex flex-column gap-4">
                                <div className="card shadow-sm border-0 p-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            <ShieldCheck size={20} className="text-warning" />
                                            <h2 className="fs-6 fw-bold text-gray-900 m-0">
                                                Bài viết đang chờ phê duyệt ({pendingPosts.length})
                                            </h2>
                                        </div>
                                    </div>
                                </div>

                                {loadingPending && (
                                    <div className="card shadow-sm border-0 p-6 text-center text-gray-500">
                                        Đang tải bài viết chờ duyệt...
                                    </div>
                                )}

                                {!loadingPending && pendingPosts.length === 0 && (
                                    <div className="card shadow-sm border-0 p-8 text-center bg-white rounded-3">
                                        <CheckCircle2 size={36} className="text-success mx-auto mb-2" />
                                        <h3 className="fs-6 fw-bold text-gray-800 mb-1">
                                            Không có bài viết chờ duyệt
                                        </h3>
                                        <p className="fs-7 text-muted mb-0">
                                            Tất cả bài viết trong nhóm đều đã được xử lý!
                                        </p>
                                    </div>
                                )}

                                {!loadingPending &&
                                    pendingPosts.map(post => (
                                        <article key={post.id} className="card shadow-sm border-0 p-5 position-relative">
                                            {/* Author header */}
                                            <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom border-gray-100">
                                                <div className="d-flex align-items-center gap-3">
                                                    {post.author.avatar ? (
                                                        <img
                                                            src={post.author.avatar}
                                                            alt=""
                                                            className="w-40px h-40px rounded-circle object-fit-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-40px h-40px rounded-circle bg-light-primary text-primary d-flex align-items-center justify-content-center fw-bold fs-7">
                                                            {post.author.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <strong className="fs-7 text-gray-900 d-block">
                                                            {post.author.name}
                                                        </strong>
                                                        <small className="fs-9 text-muted">
                                                            Gửi lúc{" "}
                                                            {new Date(post.createdAt).toLocaleString("vi-VN", {
                                                                dateStyle: "short",
                                                                timeStyle: "short",
                                                            })}
                                                        </small>
                                                    </div>
                                                </div>

                                                <span className="badge badge-light-warning fs-8 fw-semibold">
                                                    Chờ duyệt
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <p className="fs-7 text-gray-800 mb-3 whitespace-pre-wrap">
                                                {post.content}
                                            </p>

                                            {/* Media */}
                                            {post.media && post.media.length > 0 && (
                                                <div className="d-flex flex-wrap gap-2 mb-4">
                                                    {post.media.map(file => (
                                                        <div key={file.id} className="rounded-2 overflow-hidden border border-gray-200" style={{ maxWidth: "200px" }}>
                                                            {file.type.startsWith("video/") ? (
                                                                <video src={file.url} controls className="w-100 h-auto" />
                                                            ) : (
                                                                <img src={file.url} alt="" className="w-100 h-auto object-fit-contain" style={{ maxHeight: "250px" }} />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Action buttons */}
                                            <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top border-gray-100">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-light-danger fw-semibold d-inline-flex align-items-center gap-1.5"
                                                    disabled={approvingId === post.id}
                                                    onClick={() => handleApprove(post.id, "reject")}
                                                >
                                                    <XCircle size={15} />
                                                    <span>Từ chối</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-success fw-semibold d-inline-flex align-items-center gap-1.5"
                                                    disabled={approvingId === post.id}
                                                    onClick={() => handleApprove(post.id, "approve")}
                                                >
                                                    <CheckCircle2 size={15} />
                                                    <span>{approvingId === post.id ? "Đang xử lý..." : "Duyệt bài"}</span>
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                            </div>
                        )}
                    </div>
                </main>

                {/* Modal Settings Preview / Info */}
                <Modal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    title="Cài đặt nhóm"
                    size="md"
                    footer={
                        <button
                            type="button"
                            className="btn btn-light-primary btn-sm px-4"
                            onClick={() => setIsSettingsOpen(false)}
                        >
                            Đóng
                        </button>
                    }
                >
                    <div className="fs-7 text-gray-700">
                        <div className="mb-3">
                            <strong>Tên nhóm:</strong> {group.name}
                        </div>
                        <div className="mb-3">
                            <strong>Quyền riêng tư:</strong>{" "}
                            {group.privacy === "PUBLIC" ? "Công khai" : "Riêng tư"}
                        </div>
                        <div className="mb-3">
                            <strong>Duyệt bài viết:</strong>{" "}
                            {group.requires_approval
                                ? "Bật (Bài viết từ thành viên cần được phê duyệt)"
                                : "Tắt (Bài viết hiển thị ngay)"}
                        </div>
                        <div className="text-muted fs-8 mt-4 pt-3 border-top">
                            Để thay đổi quyền quản trị hoặc cài đặt nâng cao, vui lòng cập nhật qua Ban Quản trị.
                        </div>
                    </div>
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
