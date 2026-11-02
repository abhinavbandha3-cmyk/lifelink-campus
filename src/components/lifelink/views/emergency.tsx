"use client";

import { useMemo, useState } from "react";
import { BellRing, CheckCircle2, Hospital, Info, Zap } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BloodPill } from "@/components/lifelink/blood-pill";
import { addRequest, donorShortName, findMatchingDonors, markRequestNotified } from "@/lib/api";
import { URGENCIES, URGENCY_STYLES } from "@/lib/constants";
import { useDemoStore } from "@/lib/demo-store";
import type { BloodGroup, BloodRequest, Donor, LifelinkData, Urgency } from "@/lib/types";
import { BLOOD_GROUPS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EmergencyView({ data }: { data: LifelinkData }) {
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | "">("");
  const [units, setUnits] = useState("1");
  const [hospital, setHospital] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("Urgent");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [posted, setPosted] = useState<{
    request: BloodRequest;
    matches: Donor[];
  } | null>(null);
  const [notified, setNotified] = useState(false);
  const complete = useDemoStore((s) => s.complete);

  const matches = useMemo(() => {
    return bloodGroup ? findMatchingDonors(data, bloodGroup) : [];
    // recompute when a request is posted too
  }, [bloodGroup, posted, data]);

  const submit = () => {
    const problems: string[] = [];
    if (!bloodGroup) problems.push("patient blood group");
    if (!hospital.trim()) problems.push("hospital");
    if (!contactName.trim()) problems.push("contact name");
    if (!/^[6-9]\d{9}$/.test(contactPhone)) problems.push("a valid 10-digit contact phone");
    const unitsNum = Number(units);
    if (!(unitsNum >= 1 && unitsNum <= 10)) problems.push("units between 1 and 10");
    if (problems.length > 0) {
      toast.error(`Please add ${problems.slice(0, 3).join(", ")}`);
      return;
    }

    const request = addRequest({
      patientBloodGroup: bloodGroup as BloodGroup,
      unitsNeeded: unitsNum,
      hospital: hospital.trim(),
      urgency,
      contactName: contactName.trim(),
      contactPhone,
    });
    if (!request) return;

    complete("emergency_request");
    setPosted({ request, matches: findMatchingDonors(data, bloodGroup as BloodGroup) });
    setNotified(false);
    toast.success("Emergency request posted", {
      description: `${findMatchingDonors(data, bloodGroup as BloodGroup).length} eligible donor(s) can give ${bloodGroup}.`,
    });
  };

  const notifyAll = () => {
    if (!posted) return;
    markRequestNotified(posted.request.id, posted.matches.length);
    complete("notify_matches");
    setNotified(true);
    toast.success(`Notified ${posted.matches.length} donor${posted.matches.length === 1 ? "" : "s"}`, {
      description: "In a live deployment this sends SMS/push. Here it is simulated and logged.",
    });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md">
          <Zap className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Emergency request
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Post the need once — every eligible, available donor who can give
            that group gets notified.
          </p>
        </div>
      </div>

      <Alert className="mt-5 border-red-200 bg-red-50 text-red-900">
        <Hospital className="h-4 w-4 !text-red-600" />
        <AlertTitle className="text-sm font-bold">Life-threatening? Go to the hospital first</AlertTitle>
        <AlertDescription className="text-xs leading-relaxed">
          For critical situations, rush to the nearest hospital and let them
          arrange blood from the official blood bank. Use this page to
          coordinate campus donors in parallel — it is not a replacement for
          emergency medical care.
        </AlertDescription>
      </Alert>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="rounded-xl border-stone-200 shadow-sm lg:col-span-3">
          <CardContent className="grid gap-4 p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="e-group">Patient blood group</Label>
                <Select
                  value={bloodGroup}
                  onValueChange={(v) => setBloodGroup(v as BloodGroup)}
                >
                  <SelectTrigger id="e-group">
                    <SelectValue placeholder="Choose group" />
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
                <Label htmlFor="e-units">Units needed</Label>
                <Select value={units} onValueChange={(v) => setUnits(v)}>
                  <SelectTrigger id="e-units">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} unit{n > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="e-hospital">Hospital</Label>
              <Input
                id="e-hospital"
                placeholder="e.g. Kanta Hospital, Ward 4B"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Urgency</Label>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Urgency">
                {URGENCIES.map((level) => (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={urgency === level}
                    onClick={() => setUrgency(level)}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      URGENCY_STYLES[level],
                      urgency === level
                        ? "ring-2 ring-primary ring-offset-1"
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="e-name">Your name</Label>
                <Input
                  id="e-name"
                  placeholder="Requester name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="e-phone">Your phone</Label>
                <Input
                  id="e-phone"
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                />
              </div>
            </div>

            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={submit}>
              <Zap className="mr-2 h-5 w-5" aria-hidden="true" />
              Post request &amp; find matches
            </Button>
          </CardContent>
        </Card>

        {/* Matches */}
        <div className="lg:col-span-2">
          {!posted ? (
            <div className="flex h-full flex-col justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
              <Info className="mx-auto h-8 w-8 text-stone-400" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-stone-700">
                Matches appear here
              </p>
              <p className="mt-1 text-xs leading-relaxed text-stone-500">
                We look for available donors who are eligible today and
                compatible with the patient’s group — exact matches first.
              </p>
              {bloodGroup && (
                <p className="mt-3 text-xs text-stone-600">
                  <BloodPill group={bloodGroup} size="sm" className="align-middle" />{" "}
                  can receive from:{" "}
                  <span className="font-semibold">
                    {matches.length}
                  </span>{" "}
                  eligible donor(s) on campus right now.
                </p>
              )}
            </div>
          ) : (
            <Card className="rounded-xl border-stone-200 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 font-bold text-stone-900">
                      <BloodPill group={posted.request.patientBloodGroup} size="sm" />
                      {posted.request.unitsNeeded} unit{posted.request.unitsNeeded > 1 ? "s" : ""} ·{" "}
                      {posted.request.urgency}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {posted.request.hospital}
                    </p>
                  </div>
                  <Badge className="border-red-200 bg-red-50 text-red-700 hover:bg-red-50">
                    {posted.matches.length} match{posted.matches.length === 1 ? "" : "es"}
                  </Badge>
                </div>

                <div className="scroll-slim mt-4 max-h-72 space-y-2 overflow-y-auto pr-1" role="list">
                  {posted.matches.map((donor) => (
                    <div
                      key={donor.id}
                      role="listitem"
                      className="flex items-center justify-between gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <BloodPill group={donor.bloodGroup} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-stone-900">
                            {donorShortName(donor)}
                          </p>
                          <p className="text-xs text-stone-500">{donor.hostel}</p>
                        </div>
                      </div>
                      {donor.available ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Available
                        </span>
                      ) : (
                        <span className="text-xs text-stone-400">Away</span>
                      )}
                    </div>
                  ))}
                  {posted.matches.length === 0 && (
                    <p className="rounded-lg bg-amber-50 px-3 py-4 text-xs leading-relaxed text-amber-800">
                      No eligible compatible donors are available right now.
                      Contact the hospital blood bank or try again shortly —
                      availability changes through the day.
                    </p>
                  )}
                </div>

                <Button
                  className="mt-4 w-full bg-primary hover:bg-primary/90"
                  onClick={notifyAll}
                  disabled={notified || posted.matches.length === 0}
                >
                  {notified ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                      {posted.matches.length} donor{posted.matches.length === 1 ? "" : "s"} notified ✓
                    </>
                  ) : (
                    <>
                      <BellRing className="mr-2 h-4 w-4" aria-hidden="true" />
                      Notify all {posted.matches.length} match{posted.matches.length === 1 ? "" : "es"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
