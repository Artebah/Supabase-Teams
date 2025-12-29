"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Calendar, Hash } from "lucide-react";
import CopyTextButton from "@/components/copy-text-button";
import { TeamPageSkeleton } from "@/components/skeletons/team-page-skeleton";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useTeam } from "@/hooks/useTeam";
import { useParams } from "next/navigation";
import useProfileStore from "@/zustand/useProfileStore";
import { usePresenceStore } from "@/zustand/usePresenceStore";

function TeamPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const { team, isLoading: isLoadingTeam } = useTeam(teamId);
  const { teamMembers, isLoading: isLoadingTeamMembers } = useTeamMembers();
  const { profile } = useProfileStore();
  const { onlineUserIds } = usePresenceStore();

  if (isLoadingTeam || isLoadingTeamMembers) {
    return <TeamPageSkeleton />;
  }

  if (!team) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-500">No team data available</p>
      </div>
    );
  }

  const teamCreatedDate = new Date(team.created_at).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Team Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">{team.name}</h1>
        <p className="text-muted-foreground">Welcome to your team dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Team Slug</CardTitle>
            <Hash className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{team.slug}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unique team identifier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Members</CardTitle>
            <Users className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card className="sm:max-lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Created</CardTitle>
            <Calendar className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(team.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {teamCreatedDate}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current user as a member */}
            {teamMembers.map((teamMember) => (
              <div
                key={"team-member-" + teamMember.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={teamMember.avatar_url}
                      alt={teamMember.name}
                    />
                    <AvatarFallback>
                      {teamMember?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {onlineUserIds.includes(teamMember.id) ? (
                    <div className="size-3 rounded-full bg-green-400 border-2 border-white absolute bottom-0 right-0" />
                  ) : (
                    <div className="size-3 rounded-full bg-gray-400 border-2 border-white absolute bottom-0 right-0" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{teamMember.name}</p>
                  {profile && teamMember.id === profile.id && (
                    <p className="text-sm text-muted-foreground">You</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Team Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Team ID
              </h3>
              <div className="group max-w-[500px] relative text-sm font-mono bg-muted p-2 rounded">
                <p>{team.id}</p>
                <CopyTextButton
                  text={team.id}
                  className="max-md:opacity-0 max-md:size-full group-hover:opacity-100 opacity-0 absolute top-1/2 -translate-y-1/2 right-3"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Invite Code
              </h3>
              <div className="group max-w-[500px] relative text-sm font-mono bg-muted p-2 rounded">
                <p>{team.invite_code}</p>
                <CopyTextButton
                  text={team.invite_code}
                  className="max-md:opacity-0 max-md:size-full group-hover:opacity-100 opacity-0 absolute top-1/2 -translate-y-1/2 right-3"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default TeamPage;
