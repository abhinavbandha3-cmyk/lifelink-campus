/**
 * LifeLink Campus — shared domain types.
 * All data access lives in src/lib/api.ts; swap it for a real DB later
 * without touching the UI.
 */

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export type Urgency = "Normal" | "Urgent" | "Critical";

export type RequestStatus = "open" | "fulfilled";

export type ContactRequestStatus = "pending" | "accepted" | "declined";

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  department: string;
  /** Year of study, or "Staff" / "PG" */
  year: string;
  bloodGroup: BloodGroup;
  /** 10-digit fake phone number, never a real number */
  phone: string;
  /** Hostel or campus area */
  hostel: string;
  /** ISO date string (yyyy-mm-dd) */
  dateOfBirth: string;
  weightKg: number;
  /** ISO date string or null if never donated */
  lastDonationDate: string | null;
  available: boolean;
  consent: boolean;
  /** When true the donor does not appear in search results */
  hidden: boolean;
  createdAt: string;
}

export interface BloodRequest {
  id: string;
  patientBloodGroup: BloodGroup;
  unitsNeeded: number;
  hospital: string;
  urgency: Urgency;
  contactName: string;
  contactPhone: string;
  status: RequestStatus;
  /** How many eligible donors were notified */
  notifiedCount: number;
  createdAt: string;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  /** ISO date string */
  date: string;
  location: string;
  units: number;
}

export interface ContactRequest {
  id: string;
  donorId: string;
  requestId: string | null;
  requesterName: string;
  requesterPhone: string;
  note: string;
  status: ContactRequestStatus;
  createdAt: string;
}

export interface ActivityEntry {
  id: string;
  at: string;
  kind:
    | "donor_registered"
    | "contact_request"
    | "request_accepted"
    | "request_declined"
    | "emergency_request"
    | "notify_matches"
    | "settings"
    | "demo_reset"
    | "profile_hidden"
    | "profile_shown";
  text: string;
}

export interface Settings {
  /** Minimum gap between whole-blood donations, in days */
  donationGapDays: number;
}

export interface LifelinkData {
  donors: Donor[];
  requests: BloodRequest[];
  donations: DonationRecord[];
  contactRequests: ContactRequest[];
  activity: ActivityEntry[];
  settings: Settings;
}

export interface EligibilityCheck {
  eligible: boolean;
  age: number | null;
  ageOk: boolean;
  weightOk: boolean;
  gapOk: boolean;
  /** Days left until the donor becomes eligible again (0 when eligible) */
  daysUntilEligible: number;
  nextEligibleDate: string | null;
  failures: string[];
}
