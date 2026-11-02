"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CalendarClock,
  CheckCircle2,
  PartyPopper,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BloodPill } from "@/components/lifelink/blood-pill";
import { addDonor } from "@/lib/api";
import { DEPARTMENTS, HOSTELS } from "@/lib/constants";
import { isEligible, MAX_AGE, MIN_AGE, MIN_WEIGHT_KG } from "@/lib/eligibility";
import { BLOOD_GROUPS, type BloodGroup, type Donor, type LifelinkData } from "@/lib/types";
import { YEARS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Route } from "@/lib/routes";

interface FormState {
  firstName: string;
  lastName: string;
  department: string;
  year: string;
  bloodGroup: BloodGroup | "";
  phone: string;
  hostel: string;
  dateOfBirth: string;
  weightKg: string;
  lastDonationDate: string;
  available: boolean;
  consent: boolean;
}

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  department: "",
  year: "",
  bloodGroup: "",
  phone: "",
  hostel: "",
  dateOfBirth: "",
  weightKg: "",
  lastDonationDate: "",
  available: true,
  consent: false,
};

export function RegisterView({
  data,
  onNavigate,
}: {
  data: LifelinkData;
  onNavigate: (route: Route) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  /** Live eligibility against the typed-in values. */
  const liveCheck = useMemo(() => {
    const weight = Number(form.weightKg);
    return isEligible(
      {
        dateOfBirth: form.dateOfBirth || "2000-01-01",
        weightKg: Number.isFinite(weight) && weight > 0 ? weight : 0,
        lastDonationDate: form.lastDonationDate || null,
      },
      data.settings
    );
  }, [form.dateOfBirth, form.weightKg, form.lastDonationDate, data.settings]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (form.firstName && form.firstName.trim().length < 2)
      e.firstName = "First name looks too short.";
    if (form.lastName && form.lastName.trim().length < 1)
      e.lastName = "Last name is required.";
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      e.phone = "Enter a 10-digit Indian mobile number starting with 6-9.";
    if (form.weightKg && !(Number(form.weightKg) > 0 && Number(form.weightKg) < 200))
      e.weightKg = "Enter a realistic weight in kg.";
    if (form.dateOfBirth && liveCheck.age === null)
      e.dateOfBirth = "Enter a valid date of birth.";
    return e;
  }, [form, liveCheck.age]);

  const criteria = [
    {
      ok: liveCheck.ageOk,
      label: `Age ${MIN_AGE}–${MAX_AGE} years`,
      detail:
        liveCheck.age !== null
          ? `You are ${liveCheck.age}.`
          : "Pick your date of birth.",
    },
    {
      ok: liveCheck.weightOk,
      label: `Weight at least ${MIN_WEIGHT_KG} kg`,
      detail:
        form.weightKg && Number(form.weightKg) > 0
          ? `You entered ${form.weightKg} kg.`
          : "Enter your weight.",
    },
    {
      ok: liveCheck.gapOk,
      label: `${data.settings.donationGapDays}-day gap since last donation`,
      detail: form.lastDonationDate
        ? liveCheck.gapOk
          ? "Enough time has passed."
          : `Next eligible ${format(new Date(liveCheck.nextEligibleDate!), "d MMM yyyy")}.`
        : "Never donated? You’re good.",
    },
  ];

  const submit = () => {
    const missing: string[] = [];
    if (!form.firstName.trim()) missing.push("first name");
    if (!form.lastName.trim()) missing.push("last name");
    if (!form.department) missing.push("department");
    if (!form.year) missing.push("year");
    if (!form.bloodGroup) missing.push("blood group");
    if (!/^[6-9]\d{9}$/.test(form.phone)) missing.push("a valid 10-digit phone");
    if (!form.hostel) missing.push("hostel / area");
    if (!form.dateOfBirth) missing.push("date of birth");
    if (!(Number(form.weightKg) > 0)) missing.push("weight");
    if (!form.consent) missing.push("consent");

    if (missing.length > 0) {
      toast.error(`Please add ${missing.slice(0, 3).join(", ")}${missing.length > 3 ? "…" : ""}`);
      return;
    }

    const donor: Omit<Donor, "id" | "hidden" | "createdAt"> = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      department: form.department,
      year: form.year,
      bloodGroup: form.bloodGroup as BloodGroup,
      phone: form.phone,
      hostel: form.hostel,
      dateOfBirth: form.dateOfBirth,
      weightKg: Number(form.weightKg),
      lastDonationDate: form.lastDonationDate || null,
      available: form.available,
      consent: true,
    };
    const created = addDonor(donor);
    if (created) {
      setSubmitted(true);
      toast.success("Welcome to LifeLink Campus!", {
        description: `You are registered as a ${created.bloodGroup} donor. Thank you for signing up.`,
      });
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Card className="rounded-xl border-emerald-200 bg-emerald-50/50 text-center shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <PartyPopper className="h-8 w-8 text-emerald-600" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">
                You’re on the list, {form.firstName}!
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {form.bloodGroup && <BloodPill group={form.bloodGroup} size="sm" className="mr-1 align-middle" />}
                Your profile is live in donor searches from {form.hostel}.
                Keep your availability updated — that’s what saves time in an
                emergency.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button className="bg-primary hover:bg-primary/90" onClick={() => onNavigate("dashboard")}>
                Open my dashboard
              </Button>
              <Button variant="outline" onClick={() => onNavigate("home")}>
                Back to home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
        Become a donor
      </h1>
      <p className="mt-1 max-w-xl text-sm text-stone-500">
        Two minutes now, a life saved later. You stay in control — hide your
        profile or pause availability any time from the dashboard.
      </p>

      <Card className="mt-6 rounded-xl border-stone-200 shadow-sm">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="grid gap-2">
            <Label htmlFor="r-first">First name</Label>
            <Input
              id="r-first"
              placeholder="e.g. Aarav"
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              aria-invalid={Boolean(errors.firstName)}
            />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-last">Last name</Label>
            <Input
              id="r-last"
              placeholder="e.g. Sharma"
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              aria-invalid={Boolean(errors.lastName)}
            />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="r-dept">Department</Label>
            <Select value={form.department} onValueChange={(v) => set("department", v)}>
              <SelectTrigger id="r-dept">
                <SelectValue placeholder="Choose department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-year">Year</Label>
            <Select value={form.year} onValueChange={(v) => set("year", v)}>
              <SelectTrigger id="r-year">
                <SelectValue placeholder="Choose year" />
              </SelectTrigger>
              <SelectContent>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year === "PG" ? "PG" : `Year ${year}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="r-group">Blood group</Label>
            <Select
              value={form.bloodGroup}
              onValueChange={(v) => set("bloodGroup", v as BloodGroup)}
            >
              <SelectTrigger id="r-group">
                <SelectValue placeholder="Choose blood group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group.replace("-", "−")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-phone">Phone</Label>
            <Input
              id="r-phone"
              inputMode="numeric"
              placeholder="10-digit mobile"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
              aria-invalid={Boolean(errors.phone)}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
            <p className="text-xs text-stone-400">
              Masked (98XXXXXX21) until you accept a request.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="r-hostel">Hostel / area</Label>
            <Select value={form.hostel} onValueChange={(v) => set("hostel", v)}>
              <SelectTrigger id="r-hostel">
                <SelectValue placeholder="Where are you on campus?" />
              </SelectTrigger>
              <SelectContent>
                {HOSTELS.map((hostel) => (
                  <SelectItem key={hostel} value={hostel}>
                    {hostel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-dob">Date of birth</Label>
            <Input
              id="r-dob"
              type="date"
              value={form.dateOfBirth}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("dateOfBirth", e.target.value)}
              aria-invalid={Boolean(errors.dateOfBirth)}
            />
            {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="r-weight">Weight (kg)</Label>
            <Input
              id="r-weight"
              inputMode="numeric"
              placeholder="e.g. 58"
              value={form.weightKg}
              onChange={(e) => set("weightKg", e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
              aria-invalid={Boolean(errors.weightKg)}
            />
            {errors.weightKg && <p className="text-xs text-destructive">{errors.weightKg}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-lastdon">Last donation date (optional)</Label>
            <Input
              id="r-lastdon"
              type="date"
              value={form.lastDonationDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => set("lastDonationDate", e.target.value)}
            />
          </div>

          {/* Live eligibility panel */}
          <div className="sm:col-span-2">
            <div
              aria-live="polite"
              className={cn(
                "rounded-xl border p-4 transition-colors",
                liveCheck.eligible
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-amber-200 bg-amber-50/60"
              )}
            >
              <p className="flex items-center gap-2 text-sm font-bold">
                {liveCheck.eligible ? (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                    <span className="text-emerald-800">
                      You’re eligible to donate!
                    </span>
                  </>
                ) : (
                  <>
                    <CalendarClock className="h-4 w-4 text-amber-600" aria-hidden="true" />
                    <span className="text-amber-800">
                      Eligibility check — {liveCheck.failures.length} item
                      {liveCheck.failures.length === 1 ? "" : "s"} to review
                      {liveCheck.nextEligibleDate
                        ? ` · next eligible ${format(new Date(liveCheck.nextEligibleDate), "d MMM yyyy")}`
                        : ""}
                    </span>
                  </>
                )}
              </p>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
                {criteria.map((criterion) => (
                  <li key={criterion.label} className="flex items-start gap-1.5 text-xs">
                    {criterion.ok ? (
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                    )}
                    <span className={criterion.ok ? "text-stone-600" : "text-stone-700"}>
                      <span className="font-medium">{criterion.label}</span>
                      <span className="block text-stone-500">{criterion.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {!liveCheck.eligible && (
                <p className="mt-3 text-xs leading-relaxed text-stone-600">
                  You can still register — you’ll simply be marked unavailable
                  until {liveCheck.nextEligibleDate ? format(new Date(liveCheck.nextEligibleDate), "d MMM yyyy") : "you meet the criteria"}.
                  You are not eligible right now to donate; please don’t accept
                  requests until then.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 px-3 py-2.5 sm:col-span-2">
            <div>
              <Label htmlFor="r-avail" className="text-sm font-medium">
                Available to donate now
              </Label>
              <p className="text-xs text-stone-500">
                Turn off any time — you’ll stop appearing in “available now”.
              </p>
            </div>
            <Switch
              id="r-avail"
              checked={form.available}
              onCheckedChange={(checked) => set("available", checked)}
            />
          </div>

          <label
            htmlFor="r-consent"
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 px-3 py-3 sm:col-span-2"
          >
            <Checkbox
              id="r-consent"
              checked={form.consent}
              onCheckedChange={(checked) => set("consent", checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm leading-relaxed text-stone-600">
              I consent to my first name, blood group, department and area being
              shown in donor searches. My phone number is shared only when I
              accept a contact request. I confirm the information above is true
              and I am donating voluntarily, without payment.
            </span>
          </label>

          <div className="sm:col-span-2">
            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
              onClick={submit}
            >
              Register as a donor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
