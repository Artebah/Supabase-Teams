import { create } from "zustand";
import { Profile } from "@/types/profiles.api";

interface TeamMembersStore {
  teamMembers: Profile[];
  setTeamMembers: (teamMembers: Profile[]) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const useTeamMembersStore = create<TeamMembersStore>((set) => ({
  teamMembers: [],
  setTeamMembers: (teamMembers) => set({ teamMembers }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useTeamMembersStore;
