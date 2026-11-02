/**
 * Donor eligibility rules (see also Admin settings for the configurable gap).
 *
 *   • Age 18 to 65 (inclusive) on the day of donation
 *   • Weight 45 kg or more
 *   • Minimum gap since last whole-blood donation (default 90 days)
 *
 * NOTE: thresholds should be reviewed against your country's blood
 * transfusion guidelines before real use.
 */

import {
  addDays,
  differenceInCalendarDays,
  differenceInYears,
  format,
  parseISO,
  startOfDay,
} from "date-fns";

import type { Donor, EligibilityCheck, Settings } from "./types";

export const MIN_AGE = 18;
export const MAX_AGE = 65;
export const MIN_WEIGHT_KG = 45;

export function computeAge(dateOfBirth: string): number | null {
  try {
    const dob = startOfDay(parseISO(dateOfBirth));
    if (Number.isNaN(dob.getTime())) return null;
    return differenceInYears(startOfDay(new Date()), dob);
  } catch {
    return null;
  }
}

/** Whole days between two ISO date strings (today if `to` omitted). */
export function daysSince(fromIso: string, toIso?: string): number | null {
  try {
    const from = startOfDay(parseISO(fromIso));
    const to = toIso ? startOfDay(parseISO(toIso)) : startOfDay(new Date());
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return null;
    return differenceInCalendarDays(to, from);
  } catch {
    return null;
  }
}

/** The date when the donation gap is over, or null if there is no known last donation. */
export function nextEligibleDate(
  lastDonationDate: string | null,
  gapDays: number
): string | null {
  if (!lastDonationDate) return null;
  try {
    const last = startOfDay(parseISO(lastDonationDate));
    if (Number.isNaN(last.getTime())) return null;
    return format(addDays(last, gapDays), "yyyy-MM-dd");
  } catch {
    return null;
  }
}

/** Full eligibility evaluation used by Register, Find, Dashboard and Admin. */
export function isEligible(
  donor: Pick<
    Donor,
    "dateOfBirth" | "weightKg" | "lastDonationDate"
  >,
  settings: Settings
): EligibilityCheck {
  const age = computeAge(donor.dateOfBirth);
  const ageOk = age !== null && age >= MIN_AGE && age <= MAX_AGE;
  const weightOk = donor.weightKg >= MIN_WEIGHT_KG;

  const nextDate = nextEligibleDate(donor.lastDonationDate, settings.donationGapDays);
  let gapOk = true;
  let daysUntilEligible = 0;
  if (donor.lastDonationDate && nextDate) {
    const daysLeft = daysSince(new Date().toISOString().slice(0, 10), nextDate) ?? 0;
    daysUntilEligible = Math.max(0, daysLeft);
    gapOk = daysUntilEligible === 0;
  }

  const failures: string[] = [];
  if (age === null) {
    failures.push("Date of birth is missing or invalid.");
  } else if (!ageOk) {
    failures.push(
      `Age must be between ${MIN_AGE} and ${MAX_AGE} years (currently ${age}).`
    );
  }
  if (!weightOk) {
    failures.push(`Weight must be at least ${MIN_WEIGHT_KG} kg (currently ${donor.weightKg} kg).`);
  }
  if (!gapOk && donor.lastDonationDate) {
    failures.push(
      `Only ${settings.donationGapDays - daysUntilEligible} day(s) since the last donation — the minimum gap is ${settings.donationGapDays} days.`
    );
  }

  return {
    eligible: ageOk && weightOk && gapOk,
    age,
    ageOk,
    weightOk,
    gapOk,
    daysUntilEligible,
    nextEligibleDate: gapOk ? null : nextDate,
    failures,
  };
}
