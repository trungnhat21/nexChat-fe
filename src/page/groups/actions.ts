import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {
    createGroup,
    getGroups,
    joinGroup,
    leaveGroup,
    type Group,
} from "../../axios/groups";
import { showError, showSuccess, confirmDelete } from "../../utils/swal";
import { useHomeLayoutActions } from "../home/actions";
import { initialGroupCreateForm, type GroupCreateForm } from "./config";

export function useGroupsActions() {
    const navigate = useNavigate();
    const { search: headerSearch, setSearch: setHeaderSearch, notice, setNotice, user, setPanel } = useHomeLayoutActions();

    const [joined, setJoined] = useState<Group[]>([]);
    const [suggested, setSuggested] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyGroupId, setBusyGroupId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState<GroupCreateForm>({ ...initialGroupCreateForm });

    const fetchGroupsList = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        void fetchGroupsList();
    }, [fetchGroupsList]);

    const handleJoin = async (group: Group) => {
        try {
            setBusyGroupId(group.id);
            const result = await joinGroup(group.id);
            showSuccess(result.message);

            if (result.membership?.status === "JOINED") {
                setSuggested(previous => previous.filter(item => item.id !== group.id));
                setJoined(previous => [
                    {
                        ...group,
                        memberCount: (group.memberCount ?? 0) + 1,
                        membership: { role: "MEMBER", status: "JOINED" },
                    },
                    ...previous,
                ]);
            } else {
                setSuggested(previous => previous.map(item =>
                    item.id === group.id
                        ? { ...item, membership: { role: "MEMBER", status: "PENDING" } }
                        : item,
                ));
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : "Không thể tham gia nhóm.");
        } finally {
            setBusyGroupId(null);
        }
    };

    const handleLeave = async (group: Group) => {
        if (!(await confirmDelete(`Bạn có chắc muốn rời nhóm "${group.name}"?`))) return;

        try {
            setBusyGroupId(group.id);
            await leaveGroup(group.id);
            showSuccess(`Đã rời nhóm "${group.name}".`);
            setJoined(previous => previous.filter(item => item.id !== group.id));
            if (group.privacy === "PUBLIC") {
                setSuggested(previous => [
                    {
                        ...group,
                        memberCount: Math.max(0, (group.memberCount ?? 1) - 1),
                        membership: null,
                    },
                    ...previous,
                ]);
            }
        } catch (error) {
            showError(error instanceof Error ? error.message : "Không thể rời nhóm.");
        } finally {
            setBusyGroupId(null);
        }
    };

    const handleCreateSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const name = createForm.name.trim();
        if (!name) {
            showError("Vui lòng nhập tên nhóm.");
            return;
        }

        try {
            setCreating(true);
            const newGroup = await createGroup({
                name,
                description: createForm.description.trim() || null,
                privacy: createForm.privacy,
                requires_approval: createForm.requires_approval,
            });
            showSuccess(`Tạo nhóm "${newGroup.name}" thành công!`);
            setIsCreateOpen(false);
            setCreateForm({ ...initialGroupCreateForm });
            navigate(`/groups/${newGroup.id}`);
        } catch (error) {
            showError(error instanceof Error ? error.message : "Không thể tạo nhóm.");
        } finally {
            setCreating(false);
        }
    };

    const query = searchQuery.trim().toLowerCase();
    const filteredJoined = useMemo(() => {
        if (!query) return joined;
        return joined.filter(group =>
            group.name.toLowerCase().includes(query)
            || Boolean(group.description?.toLowerCase().includes(query)),
        );
    }, [joined, query]);
    const filteredSuggested = useMemo(() => {
        if (!query) return suggested;
        return suggested.filter(group =>
            group.name.toLowerCase().includes(query)
            || Boolean(group.description?.toLowerCase().includes(query)),
        );
    }, [suggested, query]);

    return {
        headerSearch,
        setHeaderSearch,
        notice,
        setNotice,
        user,
        setPanel,
        joined,
        suggested,
        loading,
        busyGroupId,
        searchQuery,
        setSearchQuery,
        isCreateOpen,
        setIsCreateOpen,
        creating,
        createForm,
        setCreateForm,
        filteredJoined,
        filteredSuggested,
        handleJoin,
        handleLeave,
        handleCreateSubmit,
    };
}
