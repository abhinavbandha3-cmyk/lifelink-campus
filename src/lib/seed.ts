/**
 * Seed data — 100% FAKE donors, requests and history for the campus demo.
 * Phones are made-up 10-digit numbers; names are fictional.
 * Dates are generated relative to "now" so the demo always looks fresh.
 */

import { format, subDays } from "date-fns";

import type {
  ActivityEntry,
  BloodRequest,
  ContactRequest,
  DonationRecord,
  Donor,
  LifelinkData,
} from "./types";

function isoDaysAgo(days: number): string {
  return format(subDays(new Date(), days), "yyyy-MM-dd");
}

function tsDaysAgo(days: number, hours = 10): string {
  const d = subDays(new Date(), days);
  d.setHours(hours, 24, 0, 0);
  return d.toISOString();
}

/** Age (years) → ISO date of birth guaranteed to be at least that age.
 *  Birthdays are placed Jan–Mar so the age has always been reached by now. */
function dob(age: number, index: number): string {
  const year = new Date().getFullYear() - age;
  const month = (index % 3) + 1; // Jan..Mar
  const day = ((index * 7) % 27) + 1;
  return format(new Date(year, month - 1, day), "yyyy-MM-dd");
}

type Row = [
  string, // first
  string, // last
  string, // department
  string, // year
  Donor["bloodGroup"],
  string, // hostel/area
  number, // age
  number, // weight kg
  number | null, // days since last donation (null = never)
  boolean, // available
  string, // fake phone
];

const DONOR_ROWS: Row[] = [
  ["Aarav", "Sharma", "CSE", "2", "O+", "Aravali Hostel", 20, 68, 120, true, "9823014756"],
  ["Priya", "Patel", "BBA", "3", "B+", "Nilgiri Hostel", 21, 54, 30, true, "9765432890"],
  ["Rohan", "Mehta", "ME", "3", "A+", "Shivalik Hostel", 21, 72, null, true, "9811223344"],
  ["Ananya", "Iyer", "CSE", "1", "AB+", "Vindhya Hostel", 18, 50, null, true, "9876501234"],
  ["Vikram", "Singh", "Admin & Accounts", "Staff", "O-", "Faculty Housing", 41, 75, 200, true, "9845123456"],
  ["Sneha", "Reddy", "Biotech", "2", "B+", "Satpura Hostel", 19, 46, null, true, "9700112233"],
  ["Arjun", "Nair", "IT", "4", "O+", "Day Scholar", 22, 70, 15, false, "9833445566"],
  ["Kavya", "Menon", "Arts & Humanities", "2", "A-", "Cauvery Hostel", 19, 52, null, true, "9844556677"],
  ["Rahul", "Gupta", "ECE", "3", "B-", "Aravali Hostel", 21, 66, null, true, "9855667788"],
  ["Ishita", "Banerjee", "Law", "2", "AB-", "Nilgiri Hostel", 20, 49, 10, true, "9866778899"],
  ["Karthik", "Rao", "ME", "2", "O+", "Shivalik Hostel", 19, 74, null, true, "9877889900"],
  ["Meera", "Joshi", "BBA", "1", "A+", "Vindhya Hostel", 18, 44, null, false, "9888990011"],
  ["Aditya", "Verma", "CSE", "4", "B+", "Day Scholar", 22, 69, 95, true, "9899001122"],
  ["Divya", "Pillai", "MBA", "1", "O+", "Satpura Hostel", 23, 58, null, true, "9900112233"],
  ["Nikhil", "Desai", "IT", "2", "AB+", "Cauvery Hostel", 20, 63, null, true, "9911223344"],
  ["Pooja", "Malhotra", "Law", "3", "O-", "Nilgiri Hostel", 21, 55, 85, true, "9922334455"],
  ["Siddharth", "Chopra", "Electrical", "Staff", "A-", "Faculty Housing", 40, 80, 150, true, "9933445566"],
  ["Riya", "Kapoor", "ECE", "1", "B+", "Aravali Hostel", 18, 47, null, true, "9944556677"],
  ["Manish", "Tiwari", "CE", "3", "O+", "Day Scholar", 21, 77, null, false, "9955667788"],
  ["Shreya", "Ghosh", "Arts & Humanities", "1", "AB-", "Shivalik Hostel", 18, 46, 400, true, "9966778899"],
  ["Harsh", "Agarwal", "BBA", "2", "O+", "Satpura Hostel", 20, 65, null, true, "9977889900"],
  ["Nandini", "Shetty", "Biotech", "3", "A+", "Nilgiri Hostel", 21, 53, 200, true, "9988990011"],
  ["Aakash", "Jain", "IT", "1", "B-", "Vindhya Hostel", 18, 60, null, true, "9100123456"],
  ["Tanvi", "Kulkarni", "CSE", "2", "AB+", "Cauvery Hostel", 19, 51, null, true, "9111234567"],
  ["Varun", "Bhatt", "CE", "4", "A-", "Day Scholar", 22, 71, null, true, "9122345678"],
  ["Anjali", "Dubey", "ME", "1", "B+", "Shivalik Hostel", 18, 48, null, true, "9133456789"],
  ["Imran", "Khan", "Law", "2", "O+", "Aravali Hostel", 20, 67, null, true, "9144567890"],
  ["Fatima", "Sheikh", "Arts & Humanities", "3", "A+", "Day Scholar", 21, 50, null, false, "9155678901"],
  ["Deepak", "Yadav", "Electrical", "Staff", "O+", "Faculty Housing", 43, 78, 60, true, "9166789012"],
  ["Lakshmi", "Narayan", "Biotech", "4", "B+", "Satpura Hostel", 22, 56, null, true, "9177890123"],
  ["Gaurav", "Pandey", "MBA", "2", "AB+", "Nilgiri Hostel", 24, 64, null, true, "9188901234"],
  ["Neha", "Saxena", "IT", "3", "O+", "Vindhya Hostel", 21, 59, 25, true, "9199012345"],
  ["Rohit", "Kadam", "CE", "2", "A+", "Aravali Hostel", 20, 68, null, true, "9200123456"],
  ["Swara", "Bhosale", "Arts & Humanities", "2", "AB+", "Cauvery Hostel", 19, 45, 90, true, "9211234567"],
  ["Sameer", "Qureshi", "BBA", "4", "B-", "Day Scholar", 23, 72, null, false, "9222345678"],
  ["Meghna", "Trivedi", "Law", "1", "O-", "Shivalik Hostel", 18, 52, null, true, "9233456789"],
  ["Yash", "Soni", "Electrical", "Staff", "AB-", "Faculty Housing", 39, 76, 120, true, "9244567890"],
  ["Arti", "Kumari", "CE", "1", "A+", "Vindhya Hostel", 18, 49, null, true, "9255678901"],
  ["Pranav", "Mohan", "CSE", "3", "O-", "Day Scholar", 21, 62, 30, true, "9266789012"],
  ["Zoya", "Ali", "Biotech", "1", "A+", "Satpura Hostel", 19, 47, null, true, "9277890123"],
];

export function buildSeedData(): LifelinkData {
  const donors: Donor[] = DONOR_ROWS.map((row, i) => {
    const [firstName, lastName, department, year, bloodGroup, hostel, age, weightKg, lastDonationDaysAgo, available, phone] = row;
    return {
      id: `d${String(i + 1).padStart(2, "0")}`,
      firstName,
      lastName,
      department,
      year,
      bloodGroup,
      phone,
      hostel,
      dateOfBirth: dob(age, i + 1),
      weightKg,
      lastDonationDate:
        lastDonationDaysAgo === null ? null : isoDaysAgo(lastDonationDaysAgo),
      available,
      consent: true,
      hidden: false,
      createdAt: tsDaysAgo(120 - i * 2, 9 + (i % 8)),
    };
  });

  const requests: BloodRequest[] = [
    {
      id: "r01",
      patientBloodGroup: "A+",
      unitsNeeded: 3,
      hospital: "Kanta Hospital",
      urgency: "Critical",
      contactName: "Ravi Kulkarni",
      contactPhone: "9812000011",
      status: "fulfilled",
      notifiedCount: 4,
      createdAt: tsDaysAgo(12, 8),
    },
    {
      id: "r02",
      patientBloodGroup: "O+",
      unitsNeeded: 2,
      hospital: "City Care Hospital",
      urgency: "Urgent",
      contactName: "Sunita Rao",
      contactPhone: "9812000012",
      status: "fulfilled",
      notifiedCount: 5,
      createdAt: tsDaysAgo(9, 14),
    },
    {
      id: "r03",
      patientBloodGroup: "AB-",
      unitsNeeded: 1,
      hospital: "Kanta Hospital",
      urgency: "Critical",
      contactName: "Mohan Lal",
      contactPhone: "9812000013",
      status: "open",
      notifiedCount: 2,
      createdAt: tsDaysAgo(7, 19),
    },
    {
      id: "r04",
      patientBloodGroup: "B+",
      unitsNeeded: 2,
      hospital: "St. Mary's Hospital",
      urgency: "Normal",
      contactName: "Farah Khan",
      contactPhone: "9812000014",
      status: "fulfilled",
      notifiedCount: 3,
      createdAt: tsDaysAgo(6, 11),
    },
    {
      id: "r05",
      patientBloodGroup: "O-",
      unitsNeeded: 1,
      hospital: "Civil Hospital",
      urgency: "Urgent",
      contactName: "Geeta Devi",
      contactPhone: "9812000015",
      status: "open",
      notifiedCount: 2,
      createdAt: tsDaysAgo(4, 16),
    },
    {
      id: "r06",
      patientBloodGroup: "A+",
      unitsNeeded: 1,
      hospital: "Kanta Hospital",
      urgency: "Normal",
      contactName: "Ramesh Iyer",
      contactPhone: "9812000016",
      status: "open",
      notifiedCount: 3,
      createdAt: tsDaysAgo(2, 10),
    },
    {
      id: "r07",
      patientBloodGroup: "B+",
      unitsNeeded: 4,
      hospital: "Red Cross Blood Bank",
      urgency: "Urgent",
      contactName: "Anita Bose",
      contactPhone: "9812000017",
      status: "open",
      notifiedCount: 3,
      createdAt: tsDaysAgo(1, 13),
    },
    {
      id: "r08",
      patientBloodGroup: "O+",
      unitsNeeded: 2,
      hospital: "City Care Hospital",
      urgency: "Critical",
      contactName: "Suresh Nair",
      contactPhone: "9812000018",
      status: "open",
      notifiedCount: 0,
      createdAt: tsDaysAgo(0, 9),
    },
  ];

  const donations: DonationRecord[] = [
    { id: "g01", donorId: "d01", date: isoDaysAgo(120), location: "Campus Blood Drive — Main Auditorium", units: 1 },
    { id: "g02", donorId: "d01", date: isoDaysAgo(240), location: "Red Cross Blood Bank", units: 1 },
    { id: "g03", donorId: "d03", date: isoDaysAgo(150), location: "Kanta Hospital Blood Bank", units: 1 },
    { id: "g04", donorId: "d05", date: isoDaysAgo(200), location: "Rotary Club Camp", units: 1 },
    { id: "g05", donorId: "d05", date: isoDaysAgo(320), location: "Campus Blood Drive — Main Auditorium", units: 1 },
    { id: "g06", donorId: "d13", date: isoDaysAgo(95), location: "City Care Hospital drive", units: 1 },
    { id: "g07", donorId: "d13", date: isoDaysAgo(210), location: "Red Cross Blood Bank", units: 1 },
    { id: "g08", donorId: "d16", date: isoDaysAgo(85), location: "Kanta Hospital Blood Bank", units: 1 },
    { id: "g09", donorId: "d17", date: isoDaysAgo(150), location: "Campus Blood Drive — Sports Complex", units: 1 },
    { id: "g10", donorId: "d20", date: isoDaysAgo(400), location: "Red Cross Blood Bank", units: 1 },
    { id: "g11", donorId: "d22", date: isoDaysAgo(200), location: "Campus Blood Drive — Main Auditorium", units: 1 },
    { id: "g12", donorId: "d29", date: isoDaysAgo(60), location: "City Care Hospital", units: 1 },
    { id: "g13", donorId: "d34", date: isoDaysAgo(90), location: "Campus Blood Drive — Sports Complex", units: 1 },
    { id: "g14", donorId: "d37", date: isoDaysAgo(120), location: "Rotary Club Camp", units: 1 },
    { id: "g15", donorId: "d02", date: isoDaysAgo(30), location: "Kanta Hospital Blood Bank", units: 1 },
  ];

  const contactRequests: ContactRequest[] = [
    {
      id: "c01",
      donorId: "d05",
      requestId: "r05",
      requesterName: "Geeta Devi",
      requesterPhone: "9812000015",
      note: "My father needs one unit of O- at Civil Hospital today.",
      status: "pending",
      createdAt: tsDaysAgo(1, 18),
    },
    {
      id: "c02",
      donorId: "d01",
      requestId: "r08",
      requesterName: "Suresh Nair",
      requesterPhone: "9812000018",
      note: "Cousin admitted at City Care, needs O+ units urgently.",
      status: "pending",
      createdAt: tsDaysAgo(0, 9),
    },
    {
      id: "c03",
      donorId: "d20",
      requestId: "r03",
      requesterName: "Mohan Lal",
      requesterPhone: "9812000013",
      note: "AB- unit needed at Kanta Hospital.",
      status: "accepted",
      createdAt: tsDaysAgo(6, 12),
    },
    {
      id: "c04",
      donorId: "d22",
      requestId: "r06",
      requesterName: "Ramesh Iyer",
      requesterPhone: "9812000016",
      note: "Elective surgery next week — A+ units needed.",
      status: "declined",
      createdAt: tsDaysAgo(2, 15),
    },
  ];

  const activity: ActivityEntry[] = [
    { id: "a01", at: tsDaysAgo(0, 9), kind: "emergency_request", text: "Emergency request posted for O+ at City Care Hospital (Critical)." },
    { id: "a02", at: tsDaysAgo(1, 18), kind: "contact_request", text: "Contact request sent to Vikram S. (O-)." },
    { id: "a03", at: tsDaysAgo(4, 16), kind: "emergency_request", text: "Emergency request posted for O- at Civil Hospital (Urgent)." },
    { id: "a04", at: tsDaysAgo(6, 12), kind: "request_accepted", text: "Shreya G. accepted a contact request." },
  ];

  return {
    donors,
    requests,
    donations,
    contactRequests,
    activity,
    settings: { donationGapDays: 90 },
  };
}
