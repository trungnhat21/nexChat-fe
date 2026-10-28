import { useCallback, useState, type ReactNode } from "react";
import type { AcceptedFriend } from "../../axios/friends";
import FloatingChat from "./components/FloatingChat";
import { FloatingChatContext } from "./floating-chat-context";

export default function FloatingChatProvider({ children }: { children: ReactNode }) {
    const [friend, setFriend] = useState<AcceptedFriend | null>(null);
    const [minimized, setMinimized] = useState(false);
    const openChat = useCallback((nextFriend: AcceptedFriend) => {
        setFriend(nextFriend);
        setMinimized(false);
    }, []);
    const closeChat = useCallback(() => {
        setFriend(null);
        setMinimized(false);
    }, []);

    return <FloatingChatContext.Provider value={{ openChat }}>
        {children}
        {friend && <FloatingChat key={friend.id} friend={friend} minimized={minimized} onMinimizedChange={setMinimized} onClose={closeChat} />}
    </FloatingChatContext.Provider>;
}
