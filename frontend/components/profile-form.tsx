"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import useProfileStore from "@/zustand/useProfileStore";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Profile } from "@/types/profiles.api";
import { toastSupabaseError } from "@/utils/toastSupabaseError";

interface ProfileFormProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function ProfileForm({ profile, isOwnProfile }: ProfileFormProps) {
  const { setProfile: setStoreProfile } = useProfileStore();
  const [username, setUsername] = useState(profile.name || "");
  const [email, setEmail] = useState(profile.email || "");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url || null
  );
  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setImageError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    setIsSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const formData = new FormData();
      formData.append("username", username.trim());

      if (email.trim()) {
        formData.append("email", email.trim());
      }

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const { data, error } = await supabase.functions.invoke("profiles", {
        method: "PATCH",
        body: formData,
      });

      if (error) {
        toastSupabaseError(error);
        return;
      }

      if (data) {
        setStoreProfile(data);
        setAvatarPreview(data.avatar_url || null);
        setAvatar(null);
        setImageError(false);
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Couldn't update profile");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Preview */}
      <div className="flex flex-col items-center gap-4">
        <Label>Avatar</Label>
        {avatarPreview && !imageError ? (
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-gray-100">
            <Image
              src={avatarPreview}
              alt={username || "Avatar"}
              width={120}
              height={120}
              className="w-full h-full object-cover"
              unoptimized
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <Avatar className="w-[120px] h-[120px]">
            <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-600 text-4xl font-semibold">
              {username.charAt(0).toUpperCase()}
            </div>
          </Avatar>
        )}

        {isOwnProfile && (
          <div className="w-full max-w-sm">
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={!isOwnProfile}
            />
            <Label
              htmlFor="avatar"
              className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              {avatar ? avatar.name : "Choose a file"}
            </Label>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            readOnly={!isOwnProfile}
            disabled={!isOwnProfile}
            className={!isOwnProfile ? "bg-gray-50" : ""}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            readOnly={!isOwnProfile}
            disabled={!isOwnProfile}
            className={!isOwnProfile ? "bg-gray-50" : ""}
            placeholder="john@example.com"
          />
          {isOwnProfile && (
            <p className="text-xs text-muted-foreground">
              Optional: Update your email address
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="userId">User ID</Label>
          <Input
            id="userId"
            value={profile.id}
            readOnly
            disabled
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamId">Team ID</Label>
          <Input
            id="teamId"
            value={profile.team_id || "No team"}
            readOnly
            disabled
            className="bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profileCompleted">Profile Completed</Label>
          <Input
            id="profileCompleted"
            value={profile.profile_completed ? "Yes" : "No"}
            readOnly
            disabled
            className="bg-gray-50"
          />
        </div>
      </div>

      {isOwnProfile && (
        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      )}
    </form>
  );
}
