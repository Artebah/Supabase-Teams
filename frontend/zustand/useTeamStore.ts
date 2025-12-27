import { create } from "zustand";
import { Team } from "@/types/profiles.api";

interface TeamStore {
  team: Team | null;
  setTeam: (team: Team | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const useTeamStore = create<TeamStore>((set) => ({
  team: null,
  setTeam: (team) => set({ team }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useTeamStore;
