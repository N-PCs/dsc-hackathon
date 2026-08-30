"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { HackathonScheduleRules } from "@/components/sections/HackathonScheduleRules";
import { FAQSection } from "@/components/sections/FAQSection";
import { useTeams } from "@/hooks/useTeams";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { stats } = useTeams();
  const router = useRouter();

  return (
    <>
      <HeroSection
        stats={stats}
        onNavigate={(tab) => router.push(tab === "home" ? "/" : `/${tab}`)}
        onSelectTrack={() => {}}
      />
      <HackathonScheduleRules />
      <FAQSection />
    </>
  );
}