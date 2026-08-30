"use client";

import { TeamPassTicket } from "@/components/team/TeamPassTicket";
import { useTeams } from "@/hooks/useTeams";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const { activeTeam, setActiveTeam, refreshData } = useTeams();
  const router = useRouter();

  return (
    <TeamPassTicket
      team={activeTeam}
      onNavigateToSubmit={() => router.push("/submit")}
      onSwitchTeamLogin={() => router.push("/team")} // or open modal
      onRefreshTeamData={refreshData}
    />
  );
}