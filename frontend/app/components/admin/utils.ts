import { Team } from "@/types";

/**
 * Computes the registration fee for a team.
 * Falls back to a per-member calculation (₹219 Day Scholar / ₹100 Hosteller)
 * if `amountPaid` was not recorded, and finally to a ₹100 floor.
 */
export const calcTeamFee = (t: Team) => {
  if (typeof t.amountPaid === "number" && t.amountPaid > 0) return t.amountPaid;
  let fee = 0;
  const members = [t.leader, t.member2, t.member3, t.member4, t.member5];
  members.forEach((m) => {
    if (m && m.name) {
      fee += m.residentialStatus === "Day Scholar" ? 219 : 100;
    }
  });
  return fee || 100;
};