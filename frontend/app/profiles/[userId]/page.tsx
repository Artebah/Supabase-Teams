"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/profiles.api";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "react-toastify";
import { ProfileForm } from "@/components/profile-form";

export default function ProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        // Fetch profile
        const { data, error } = await supabase.functions.invoke(
          `profiles?id=${userId}`,
          {
            method: "GET",
          }
        );

        if (error) {
          toast.error(error.message);
          router.back();
          return;
        }

        setProfile(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load profile");
        }
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const isOwnProfile = currentUserId === userId;

  return (
    <div className="py-6 space-y-6 w-full">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          {isOwnProfile
            ? "Manage your profile information"
            : "View profile information"}
        </p>
      </div>

      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            {isOwnProfile
              ? "Update your profile details"
              : "User profile details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} isOwnProfile={isOwnProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
