import { SupabaseClient } from "npm:@supabase/supabase-js@2.81.1";
import { ProfilesListReponse } from "./profiles.dto.ts";
import { Profile } from "../_shared/types.ts";

export class ProfilesService {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly supabaseAdmin: SupabaseClient
  ) {}

  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.log(error);
      throw error;
    }
    return data;
  }

  async getAllProfilesInTeam(teamId: string): Promise<ProfilesListReponse[]> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("team_id", teamId);

    if (error) {
      throw error;
    }
    return data;
  }

  async updateProfile(req: Request, userId: string): Promise<Profile> {
    const formData = await req.formData();

    const usernameEntry = formData.get("username");
    const username =
      typeof usernameEntry === "string" ? usernameEntry.trim() : null;

    if (!username) {
      throw new Error("Username is required");
    }

    const emailEntry = formData.get("email");
    const email = typeof emailEntry === "string" ? emailEntry.trim() : null;

    // Check if email is being changed and if it's already taken
    if (email) {
      const { data: existingProfile, error: checkError } =
        await this.supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", email)
          .neq("id", userId)
          .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingProfile) {
        throw new Error("This email is already in use by another user");
      }
    }

    const avatarEntry = formData.get("avatar");
    const avatar =
      avatarEntry instanceof File && avatarEntry.size > 0 ? avatarEntry : null;

    const avatarUrl = avatar ? await this.uploadAvatar(avatar, userId) : null;

    const updateData: Record<string, unknown> = {
      name: username,
      profile_completed: true,
    };

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl;
    }

    if (email) {
      updateData.email = email;
    }

    const { data, error: updateError } = await this.supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    return data;
  }

  private async uploadAvatar(avatar: File, userId: string): Promise<string> {
    const fileExt = avatar.name.split(".").pop() || "png";
    const fileName = `avatars/${userId}.${fileExt}`;

    const { error: uploadError } = await this.supabase.storage
      .from("avatars")
      .upload(fileName, avatar, {
        upsert: true,
        contentType: avatar.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const envUrl = Deno.env.get("SUPABASE_URL") ?? "http://127.0.0.1:54321";

    const publicHost = envUrl.replace(
      "http://kong:8000",
      "http://127.0.0.1:54321"
    );

    const publicUrl = `${publicHost}/storage/v1/object/public/avatars/${fileName}`;

    return publicUrl;
  }
}
