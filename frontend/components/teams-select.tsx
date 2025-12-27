import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function TeamsSelect() {
  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Join a Team</CardTitle>
          <CardDescription>
            Join an existing team using an invitation code
          </CardDescription>
        </CardHeader>
        <CardContent className="grow">
          <p className="text-sm text-muted-foreground">
            If you have received an invitation code from a team member, you can
            use it to join their team and start collaborating.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild>
            <Link href="join-team">Join with Code</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card className="flex-1">
        <CardHeader>
          <CardTitle>Create a Team</CardTitle>
          <CardDescription>Start a new team and invite members</CardDescription>
        </CardHeader>
        <CardContent className="grow">
          <p className="text-sm text-muted-foreground">
            Create your own team, customize it, and invite team members to
            collaborate on products together.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" asChild variant="outline">
            <Link href="create-team">Create New Team</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default TeamsSelect;
