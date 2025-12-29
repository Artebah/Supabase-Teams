import { create } from "zustand";

interface UsePresenceStore {
  onlineUserIds: string[];
  setOnlineUsers: (ids: string[]) => void;
}

export const usePresenceStore = create<UsePresenceStore>((set) => ({
  onlineUserIds: [],
  setOnlineUsers: (ids) => set({ onlineUserIds: ids }),
}));
