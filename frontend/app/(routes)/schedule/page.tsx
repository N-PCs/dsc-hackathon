"use client";

import { HackathonScheduleRules } from "@/components/sections/HackathonScheduleRules";
import { SponsorsSection } from "@/components/sections/SponsorsSection";

export default function SchedulePage() {
  return (
    <>
      <HackathonScheduleRules />
      <SponsorsSection />
    </>
  );
}