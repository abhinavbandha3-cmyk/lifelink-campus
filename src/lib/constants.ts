/** Display constants shared by the forms and components. */

import type { BloodGroup, Urgency } from "./types";

export const DEPARTMENTS = [
  "CSE",
  "IT",
  "ECE",
  "Electrical",
  "ME",
  "CE",
  "Biotech",
  "BBA",
  "MBA",
  "Law",
  "Arts & Humanities",
  "Admin & Accounts",
] as const;

export const YEARS = ["1", "2", "3", "4", "PG"] as const;

export const HOSTELS = [
  "Aravali Hostel",
  "Nilgiri Hostel",
  "Shivalik Hostel",
  "Satpura Hostel",
  "Vindhya Hostel",
  "Cauvery Hostel",
  "Faculty Housing",
  "Day Scholar",
] as const;

export const URGENCIES: Urgency[] = ["Normal", "Urgent", "Critical"];

export const URGENCY_STYLES: Record<Urgency, string> = {
  Normal: "bg-stone-100 text-stone-700 border-stone-200",
  Urgent: "bg-orange-50 text-orange-700 border-orange-200",
  Critical: "bg-red-50 text-red-700 border-red-200",
};

/** Brand hues per blood-family; negative groups use the outline variant. */
const FAMILY_HUES: Record<string, { solid: string; outline: string }> = {
  A: {
    solid: "bg-[#c62828] text-white",
    outline: "border-[#c62828] text-[#c62828] bg-transparent",
  },
  B: {
    solid: "bg-[#b45309] text-white",
    outline: "border-[#b45309] text-[#b45309] bg-transparent",
  },
  AB: {
    solid: "bg-[#86198f] text-white",
    outline: "border-[#86198f] text-[#86198f] bg-transparent",
  },
  O: {
    solid: "bg-[#2e7d32] text-white",
    outline: "border-[#2e7d32] text-[#2e7d32] bg-transparent",
  },
};

export function groupStyle(group: BloodGroup): { solid: string; outline: string } {
  const family = group.replace(/[+-]/, "");
  return FAMILY_HUES[family] ?? FAMILY_HUES.A;
}
