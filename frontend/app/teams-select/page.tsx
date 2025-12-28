import TeamsSelect from "@/components/teams-select";

export default async function TeamsSelectPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-2 p-6 md:p-10 max-md:pt-16 max-md:pb-6">
      <TeamsSelect />
    </div>
  );
}
