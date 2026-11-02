/**
 * Blood group compatibility — donor → recipient, correct for all 8 groups.
 *
 * Source of truth (whole blood, ABO/Rh):
 *   O-  → everyone
 *   O+  → O+, A+, B+, AB+
 *   A-  → A-, A+, AB-, AB+
 *   A+  → A+, AB+
 *   B-  → B-, B+, AB-, AB+
 *   B+  → B+, AB+
 *   AB- → AB-, AB+
 *   AB+ → AB+ only
 */

import type { BloodGroup } from "./types";

export const DONOR_TO_RECIPIENTS: Record<BloodGroup, BloodGroup[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

/** Which donor groups can donate to a recipient of the given group. */
export function compatibleDonorGroups(
  recipientGroup: BloodGroup
): BloodGroup[] {
  return (
    (Object.keys(DONOR_TO_RECIPIENTS) as BloodGroup[]).filter((donorGroup) =>
      DONOR_TO_RECIPIENTS[donorGroup].includes(recipientGroup)
    )
  );
}

/** Can a donor with `donorGroup` give blood to a recipient with `recipientGroup`? */
export function canDonateTo(
  donorGroup: BloodGroup,
  recipientGroup: BloodGroup
): boolean {
  return DONOR_TO_RECIPIENTS[donorGroup].includes(recipientGroup);
}

/** A stable sort rank so exact matches always float above compatible ones. */
export function matchRank(donorGroup: BloodGroup, patientGroup: BloodGroup): number {
  return donorGroup === patientGroup ? 0 : 1;
}

/** Human label for a compatible (non-exact) match, e.g. "Compatible · O−". */
export function matchLabel(
  donorGroup: BloodGroup,
  patientGroup: BloodGroup
): string {
  if (donorGroup === patientGroup) return "Exact match";
  return `Compatible · can donate to ${patientGroup}`;
}
