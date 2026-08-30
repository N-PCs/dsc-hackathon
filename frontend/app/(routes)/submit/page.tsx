"use client";

import { ProjectSubmissionModal } from "@/components/team/ProjectSubmissionModal";
import { useTeams } from "@/hooks/useTeams";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const { activeTeam, setActiveTeam } = useTeams();
  const router = useRouter();

  const handleProjectSubmitted = (updatedTeam: any) => {
    setActiveTeam(updatedTeam);
    router.push("/team");
  };

  return (
    <ProjectSubmissionModal
      team={activeTeam}
      onProjectSubmitted={handleProjectSubmitted}
      onSwitchToTeamLogin={() => router.push("/team")}
    />
  );
}