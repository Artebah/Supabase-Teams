import { Profile } from "../_shared/types.ts";

export interface UpdateProfileDto {
  name?: string;
  email?: string;
  avatar?: File;
}

export type ProfilesListReponse = Profile[];
