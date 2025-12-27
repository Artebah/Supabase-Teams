"use client";

import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { useProfile } from "@/hooks/useProfile";

function CreateTeamForm() {
  const [teamName, setTeamName] = React.useState("");
  const [teamSlug, setTeamSlug] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const router = useRouter();
  const { refetch } = useProfile();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (teamName.trim()) {
      try {
        const supabase = createClient();

        const { data, error } = await supabase.functions.invoke(
          "team-actions",
          {
            body: {
              action: "create",
              payload: {
                name: teamName,
                slug: teamSlug.trim() || undefined,
              },
            },
          }
        );

        if (error) {
          console.error("Function error:", error);
          toast.error(`Error: ${error.message}`);
          return;
        }

        // Оновлюємо профіль після створення команди
        await refetch();

        router.push(ROUTES.TEAM(data.team.id));
        toast.success("Team created successfully!");
      } catch (error) {
        console.error("Catch error:", error);
        toast.error(error instanceof Error ? error.message : "Unknown error");
      }
    } else {
      setErrorMessage("Team name is required");
    }
  };

  return (
    <Card className="min-w-[400px] px-4 pb-10">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Create a Team</CardTitle>
        <CardDescription className="text-center">
          Start a new team and invite members to collaborate
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              type="text"
              placeholder="My Awesome Team"
              value={teamName}
              onChange={(e) => {
                setErrorMessage(null);
                setTeamName(e.target.value);
              }}
            />
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="team-slug">Team Slug (optional)</Label>
            <Input
              id="team-slug"
              type="text"
              placeholder="my-awesome-team"
              value={teamSlug}
              onChange={(e) => {
                setErrorMessage(null);
                setTeamSlug(e.target.value);
              }}
            />
            <p className="text-xs text-muted-foreground">
              If empty, we will create one automatically from your team name
            </p>
          </div>
        </div>
        <div className="mt-4">
          <Button type="submit" className="w-full">
            Create team
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default CreateTeamForm;
