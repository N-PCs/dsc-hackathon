"use client";

import React, { useState } from "react";
import { TeamPassTicket } from "@/components/team/TeamPassTicket";
import { TeamLoginModal } from "@/components/team/TeamLoginModal";
import { useTeams } from "@/hooks/useTeams";
import { useRouter } from "next/navigation";

export default function TeamPage() {
  const { activeTeam, setActiveTeam, refreshData } = useTeams();
  const router = useRouter();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <>
      <TeamPassTicket
        team={activeTeam}
        onNavigateToSubmit={() => router.push("/submit")}
        onSwitchTeamLogin={() => setLoginModalOpen(true)}
        onRefreshTeamData={refreshData}
      />

      <TeamLoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(team) => {
          setActiveTeam(team);
          setLoginModalOpen(false);
        }}
        onNavigateToRegister={() => {
          setLoginModalOpen(false);
          router.push("/register");
        }}
      />
    </>
  );
}