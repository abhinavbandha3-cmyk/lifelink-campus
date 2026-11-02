"use client";

/**
 * LifeLink Campus — single data access layer.
 *
 * Everything the UI knows about data goes through this module. It currently
 * persists to localStorage; replacing it with a real database (Supabase,
 * Prisma, …) later only requires re-implementing these functions.
 */

import { useSyncExternalStore } from "react";
import { format, subDays } from "date-fns";

import { buildSeedData } from "./seed";
import { compatibleDonorGroups } from "./compatibility";
import { isEligible } from "./eligibility";
import type {
  ActivityEntry,
  BloodGroup,
  BloodRequest,
  ContactRequest,
  Donor,
  LifelinkData,
  Settings,
} from "./types";

const STORAGE_KEY = "lifelink:data:v1";

let state: LifelinkData | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function persist() {
  if (typeof window === "undefined" || !state) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked — app still works in memory
  }
}

function mutate(fn: (data: LifelinkData) => LifelinkData): LifelinkData | null {
  if (!state) return null;
  state = fn(state);
  persist();
  emit();
  return state;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** React hook: returns the current store, or null until initialised on the client. */
export function useAppData(): LifelinkData | null {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => null
  );
}

export function getData(): LifelinkData | null {
  return state;
}

/** Load persisted data or seed on first client render. Safe to call repeatedly. */
export function initStore() {
  if (state) return;
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LifelinkData;
        if (parsed && Array.isArray(parsed.donors)) {
          state = parsed;
          emit();
          return;
        }
      }
    } catch {
      // corrupted storage → reseed
    }
  }
  state = buildSeedData();
  persist();
  emit();
}

export function resetToSeed() {
  state = buildSeedData();
  persist();
  emit();
}

function newId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

export function logActivity(
  kind: ActivityEntry["kind"],
  text: string
) {
  mutate((data) => ({
    ...data,
    activity: [
      { id: newId("a"), at: new Date().toISOString(), kind, text },
      ...data.activity,
    ].slice(0, 100),
  }));
}

/* ---------------------------------- Donors --------------------------------- */

export type NewDonor = Omit<Donor, "id" | "hidden" | "createdAt">;

export function addDonor(input: NewDonor): Donor | null {
  let created: Donor | null = null;
  mutate((data) => {
    created = {
      ...input,
      id: newId("d"),
      hidden: false,
      createdAt: new Date().toISOString(),
    };
    return {
      ...data,
      donors: [created, ...data.donors],
      activity: [
        {
          id: newId("a"),
          at: new Date().toISOString(),
          kind: "donor_registered" as const,
          text: `${created.firstName} ${created.lastName[0] ?? ""}. registered as a ${created.bloodGroup} donor.`,
        },
        ...data.activity,
      ].slice(0, 100),
    };
  });
  return created;
}

export function updateDonor(id: string, patch: Partial<Donor>) {
  mutate((data) => ({
    ...data,
    donors: data.donors.map((donor) =>
      donor.id === id ? { ...donor, ...patch } : donor
    ),
  }));
}

export function getDonor(data: LifelinkData, id: string): Donor | undefined {
  return data.donors.find((donor) => donor.id === id);
}

export function setDonorHidden(donor: Donor, hidden: boolean) {
  updateDonor(donor.id, { hidden });
  logActivity(
    hidden ? "profile_hidden" : "profile_shown",
    `${donor.firstName} ${donor.lastName[0] ?? ""}. ${hidden ? "hid" : "unhid"} their profile from search.`
  );
}

/* --------------------------------- Requests -------------------------------- */

export type NewRequest = Omit<
  BloodRequest,
  "id" | "status" | "notifiedCount" | "createdAt"
>;

export function addRequest(input: NewRequest): BloodRequest | null {
  let created: BloodRequest | null = null;
  mutate((data) => {
    created = {
      ...input,
      id: newId("r"),
      status: "open",
      notifiedCount: 0,
      createdAt: new Date().toISOString(),
    };
    return {
      ...data,
      requests: [created, ...data.requests],
      activity: [
        {
          id: newId("a"),
          at: new Date().toISOString(),
          kind: "emergency_request" as const,
          text: `Emergency request posted for ${created.patientBloodGroup} at ${created.hospital} (${created.urgency}).`,
        },
        ...data.activity,
      ].slice(0, 100),
    };
  });
  return created;
}

export function setRequestStatus(id: string, status: BloodRequest["status"]) {
  mutate((data) => ({
    ...data,
    requests: data.requests.map((request) =>
      request.id === id ? { ...request, status } : request
    ),
  }));
}

export function markRequestNotified(id: string, count: number) {
  mutate((data) => ({
    ...data,
    requests: data.requests.map((request) =>
      request.id === id ? { ...request, notifiedCount: count } : request
    ),
  }));
  logActivity("notify_matches", `${count} matching donor(s) notified for an emergency request.`);
}

/* ----------------------------- Contact requests ---------------------------- */

export function addContactRequest(input: {
  donorId: string;
  requestId: string | null;
  requesterName: string;
  requesterPhone: string;
  note: string;
}): ContactRequest | null {
  let created: ContactRequest | null = null;
  mutate((data) => {
    const donor = data.donors.find((d) => d.id === input.donorId);
    created = {
      ...input,
      id: newId("c"),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    return {
      ...data,
      contactRequests: [created, ...data.contactRequests],
      activity: [
        {
          id: newId("a"),
          at: new Date().toISOString(),
          kind: "contact_request" as const,
          text: donor
            ? `Contact request sent to ${donor.firstName} ${donor.lastName[0] ?? ""}. (${donor.bloodGroup}).`
            : "A contact request was sent.",
        },
        ...data.activity,
      ].slice(0, 100),
    };
  });
  return created;
}

export function respondToContactRequest(
  id: string,
  status: "accepted" | "declined"
) {
  mutate((data) => ({
    ...data,
    contactRequests: data.contactRequests.map((request) =>
      request.id === id ? { ...request, status } : request
    ),
  }));
  const entry = state?.contactRequests.find((request) => request.id === id);
  const donor = entry
    ? state?.donors.find((d) => d.id === entry.donorId)
    : undefined;
  if (donor && entry) {
    logActivity(
      status === "accepted" ? "request_accepted" : "request_declined",
      `${donor.firstName} ${donor.lastName[0] ?? ""}. ${status} a contact request from ${entry.requesterName}.`
    );
  }
}

export function hasAcceptedContactRequest(
  data: LifelinkData,
  donorId: string
): boolean {
  return data.contactRequests.some(
    (request) => request.donorId === donorId && request.status === "accepted"
  );
}

export function getContactRequestsForDonor(
  data: LifelinkData,
  donorId: string
): ContactRequest[] {
  return data.contactRequests
    .filter((request) => request.donorId === donorId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* --------------------------------- Settings -------------------------------- */

export function updateSettings(patch: Partial<Settings>) {
  mutate((data) => ({ ...data, settings: { ...data.settings, ...patch } }));
  if (typeof patch.donationGapDays === "number") {
    logActivity("settings", `Donation gap set to ${patch.donationGapDays} days.`);
  }
}

/* --------------------------------- Derived --------------------------------- */

export interface DonorMatch extends Donor {
  matchType: "exact" | "compatible";
}

export interface SearchFilters {
  bloodGroup: BloodGroup | "all";
  includeCompatible: boolean;
  department: string;
  hostel: string;
  availableOnly: boolean;
}

export const DEFAULT_FILTERS: SearchFilters = {
  bloodGroup: "all",
  includeCompatible: true,
  department: "",
  hostel: "",
  availableOnly: false,
};

/**
 * Search donors the way the Find Donor page does.
 * Exact blood-group matches always float above compatible ones;
 * hidden profiles and non-consenting donors never appear.
 */
export function searchDonors(
  data: LifelinkData,
  filters: SearchFilters
): DonorMatch[] {
  const matches: DonorMatch[] = [];

  for (const donor of data.donors) {
    if (donor.hidden || !donor.consent) continue;
    if (filters.department && donor.department !== filters.department) continue;
    if (filters.hostel && donor.hostel !== filters.hostel) continue;

    if (filters.availableOnly) {
      const check = isEligible(donor, data.settings);
      if (!donor.available || !check.eligible) continue;
    }

    if (filters.bloodGroup === "all") {
      matches.push({ ...donor, matchType: "exact" });
      continue;
    }

    if (donor.bloodGroup === filters.bloodGroup) {
      matches.push({ ...donor, matchType: "exact" });
    } else if (
      filters.includeCompatible &&
      compatibleDonorGroups(filters.bloodGroup).includes(donor.bloodGroup)
    ) {
      matches.push({ ...donor, matchType: "compatible" });
    }
  }

  return matches.sort((a, b) => {
    if (a.matchType !== b.matchType) return a.matchType === "exact" ? -1 : 1;
    const aEligible = isEligible(a, data.settings).eligible ? 0 : 1;
    const bEligible = isEligible(b, data.settings).eligible ? 0 : 1;
    if (aEligible !== bEligible) return aEligible - bEligible;
    return a.firstName.localeCompare(b.firstName);
  });
}

/** Eligible, available, non-hidden donors who can give to `patientGroup`. */
export function findMatchingDonors(
  data: LifelinkData,
  patientGroup: BloodGroup
): Donor[] {
  const compatible = compatibleDonorGroups(patientGroup);
  return data.donors
    .filter(
      (donor) =>
        !donor.hidden &&
        donor.consent &&
        donor.available &&
        compatible.includes(donor.bloodGroup) &&
        isEligible(donor, data.settings).eligible
    )
    .sort((a, b) => {
      if ((a.bloodGroup === patientGroup) !== (b.bloodGroup === patientGroup)) {
        return a.bloodGroup === patientGroup ? -1 : 1;
      }
      return a.firstName.localeCompare(b.firstName);
    });
}

export function getStats(data: LifelinkData) {
  const registeredDonors = data.donors.length;
  const availableNow = data.donors.filter(
    (donor) =>
      donor.available &&
      !donor.hidden &&
      donor.consent &&
      isEligible(donor, data.settings).eligible
  ).length;
  const requestsFulfilled = data.requests.filter(
    (request) => request.status === "fulfilled"
  ).length;
  const openRequests = data.requests.filter(
    (request) => request.status === "open"
  ).length;
  return { registeredDonors, availableNow, requestsFulfilled, openRequests };
}

/** Groups with fewer than 3 currently eligible, available donors. */
export function shortageGroups(data: LifelinkData): {
  group: BloodGroup;
  eligibleCount: number;
}[] {
  const groups: BloodGroup[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
  return groups
    .map((group) => ({
      group,
      eligibleCount: data.donors.filter(
        (donor) =>
          donor.bloodGroup === group &&
          donor.available &&
          !donor.hidden &&
          donor.consent &&
          isEligible(donor, data.settings).eligible
      ).length,
    }))
    .filter((entry) => entry.eligibleCount < 3);
}

export function donorsByGroup(data: LifelinkData) {
  const groups: BloodGroup[] = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
  return groups.map((group) => ({
    group,
    donors: data.donors.filter((donor) => donor.bloodGroup === group).length,
  }));
}

export function donorsByDepartment(data: LifelinkData) {
  const counts = new Map<string, number>();
  for (const donor of data.donors) {
    counts.set(donor.department, (counts.get(donor.department) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([department, donors]) => ({ department, donors }))
    .sort((a, b) => b.donors - a.donors);
}

export function requestsPerDay(data: LifelinkData, days = 30) {
  const buckets: { day: string; label: string; requests: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    buckets.push({
      day: format(date, "yyyy-MM-dd"),
      label: format(date, "d MMM"),
      requests: 0,
    });
  }
  const index = new Map(buckets.map((bucket, i) => [bucket.day, i]));
  for (const request of data.requests) {
    const day = request.createdAt.slice(0, 10);
    const i = index.get(day);
    if (i !== undefined) buckets[i].requests += 1;
  }
  return buckets;
}

export function getDonationsForDonor(data: LifelinkData, donorId: string) {
  return data.donations
    .filter((donation) => donation.donorId === donorId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/* --------------------------------- Display --------------------------------- */

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, 2)}${"X".repeat(Math.max(2, phone.length - 4))}${phone.slice(-2)}`;
}

export function donorShortName(donor: Donor): string {
  return `${donor.firstName} ${(donor.lastName[0] ?? "").toUpperCase()}.`;
}

export function formatDateTime(iso: string): string {
  try {
    return format(new Date(iso), "d MMM yyyy, h:mm a");
  } catch {
    return iso;
  }
}
