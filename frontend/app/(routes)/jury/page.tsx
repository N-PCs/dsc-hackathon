"use client";

import { JuryPortal } from "@/components/jury/JuryPortal";
import { useTeams } from "@/hooks/useTeams";

export default function JuryPage() {
  const { teams, refreshData } = useTeams();

  const handleScoreProject = async (teamId: string, score: any) => {
    // implement
  };

  return (
    <JuryPortal
      teams={teams}
      onScoreProject={handleScoreProject}
      onRefreshData={refreshData}
    />
  );
}