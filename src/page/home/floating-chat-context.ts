import { createContext, useContext } from "react";
import type { AcceptedFriend } from "../../axios/friends";

type FloatingChatContextValue = { openChat: (friend: AcceptedFriend) => void };
export const FloatingChatContext = createContext<FloatingChatContextValue>({ openChat: () => undefined });

export function useFloatingChat() { return useContext(FloatingChatContext); }
