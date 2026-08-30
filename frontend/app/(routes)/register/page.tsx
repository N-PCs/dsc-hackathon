"use client";

import { RegistrationForm } from "@/components/team/RegistrationForm";
import { useRouter } from "next/navigation";
import { useTeams } from "@/hooks/useTeams";

export default function RegisterPage() {
  const router = useRouter();
  const { setActiveTeam } = useTeams();

  const handleRegistrationSuccess = (team: any) => {
    setActiveTeam(team);
    router.push("/team");
  };

  return (
    <RegistrationForm
      selectedTrack="AI & Machine Learning"
      onRegisteredSuccess={handleRegistrationSuccess}
      onSwitchToLogin={() => router.push("/team")}
    />
  );
}