import { create } from "zustand";
import { Profile } from "@/types/profiles.api";

interface ProfileStore {
  profile: Profile | null;
  setProfile: (profileRes: Profile | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useProfileStore;
