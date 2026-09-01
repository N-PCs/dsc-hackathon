"use client";

import React, { useState } from "react";
import { ProjectSubmissionModal } from "@/components/team/ProjectSubmissionModal";
import { TeamLoginModal } from "@/components/team/TeamLoginModal";
import { useTeams } from "@/context/TeamsContext"; // ← changed import
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const { activeTeam, setActiveTeam } = useTeams();
  const router = useRouter();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleProjectSubmitted = (updatedTeam: any) => {
    setActiveTeam(updatedTeam);
    router.push("/team");
  };

  return (
    <>
      <ProjectSubmissionModal
        team={activeTeam}
        onProjectSubmitted={handleProjectSubmitted}
        onSwitchToTeamLogin={() => setLoginModalOpen(true)}
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