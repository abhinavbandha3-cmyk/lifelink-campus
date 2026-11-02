"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarClock,
  Check,
  Droplet,
  Eye,
  EyeOff,
  Handshake,
  History,
  Inbox,
  LogIn,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { BloodPill } from "@/components/lifelink/blood-pill";
import {
  donorShortName,
  getContactRequestsForDonor,
  getDonationsForDonor,
  maskPhone,
  respondToContactRequest,
  setDonorHidden,
  updateDonor,
} from "@/lib/api";
import { isEligible } from "@/lib/eligibility";
import { useMeStore } from "@/lib/me-store";
import type { LifelinkData } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardView({ data }: { data: LifelinkData }) {
  const meId = useMeStore((s) => s.meId);
  const signIn = useMeStore((s) => s.signIn);

  const me = useMemo(
    () => data.donors.find((donor) => donor.id === meId) ?? null,
    [data.donors, meId]
  );

  const sortedDonors = useMemo(
    () =>
      [...data.donors].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      ),
    [data.donors]
  );

  if (!me) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Card className="rounded-xl border-stone-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LogIn className="h-5 w-5 text-primary" aria-hidden="true" />
              My dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-stone-600">
              This demo has no passwords. Pick a donor to act as them — see
              their eligibility countdown, donation history, incoming requests
              and privacy toggles.
            </p>
            <div className="grid gap-2">
              <Label htmlFor="me-select">Sign in as</Label>
              <Select value={meId} onValueChange={signIn}>
                <SelectTrigger id="me-select">
                  <SelectValue placeholder="Choose a demo donor" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {sortedDonors.map((donor) => (
                    <SelectItem key={donor.id} value={donor.id}>
                      {donor.firstName} {donor.lastName[0]}. · {donor.bloodGroup} ·{" "}
                      {donor.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-500">
              Tip: sign in as <strong>Vikram Singh (O−, Staff)</strong> or{" "}
              <strong>Aarav Sharma (O+)</strong> — both have pending requests in
              the seeded demo data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const check = isEligible(me, data.settings);
  const requests = getContactRequestsForDonor(data, me.id);
  const pending = requests.filter((request) => request.status === "pending");
  const history = getDonationsForDonor(data, me.id);
  const gapPct = Math.min(
    100,
    Math.round(
      100 -
        (check.daysUntilEligible / Math.max(1, data.settings.donationGapDays)) * 100
    )
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <BloodPill group={me.bloodGroup} size="lg" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
              {me.firstName} {me.lastName}
            </h1>
            <p className="text-sm text-stone-500">
              {me.department} · {me.year === "Staff" ? "Staff" : `Year ${me.year}`} ·{" "}
              {me.hostel}
            </p>
          </div>
        </div>
        <div className="grid w-full gap-2 sm:w-72">
          <Label htmlFor="me-switch" className="sr-only">
            Sign in as another donor
          </Label>
          <Select value={meId} onValueChange={signIn}>
            <SelectTrigger id="me-switch" aria-label="Sign in as another donor">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {sortedDonors.map((donor) => (
                <SelectItem key={donor.id} value={donor.id}>
                  {donor.firstName} {donor.lastName[0]}. · {donor.bloodGroup}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Eligibility */}
        <Card className="rounded-xl border-stone-200 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Droplet className="h-4 w-4 text-primary" aria-hidden="true" />
              Eligibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            {check.eligible ? (
              <div
                aria-live="polite"
                className="rounded-lg bg-emerald-50 p-4 text-center"
              >
                <ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
                <p className="mt-2 font-bold text-emerald-800">Eligible now</p>
                <p className="mt-1 text-xs text-emerald-700">
                  You can donate today. Thank you for standing by.
                </p>
              </div>
            ) : (
              <div aria-live="polite" className="rounded-lg bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-amber-600" aria-hidden="true" />
                  <p className="text-sm font-bold text-amber-800">
                    Not eligible yet
                  </p>
                </div>
                {check.nextEligibleDate ? (
                  <>
                    <p className="mt-2 text-xs text-amber-800">
                      Next eligible date:{" "}
                      <strong>
                        {format(parseISO(check.nextEligibleDate), "EEE, d MMM yyyy")}
                      </strong>
                    </p>
                    <Progress value={gapPct} className="mt-3 h-2" aria-label="Donation gap progress" />
                    <p className="mt-1.5 text-xs text-amber-700">
                      {check.daysUntilEligible} day
                      {check.daysUntilEligible === 1 ? "" : "s"} to go
                    </p>
                  </>
                ) : (
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-amber-800">
                    {check.failures.map((failure) => (
                      <li key={failure}>{failure}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <p className="mt-3 text-xs text-stone-500">
              Last donation:{" "}
              {me.lastDonationDate
                ? format(parseISO(me.lastDonationDate), "d MMM yyyy")
                : "never donated yet"}
            </p>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card className="rounded-xl border-stone-200 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4 text-primary" aria-hidden="true" />
              Visibility &amp; availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-stone-800">Available to donate</p>
                <p className="text-xs text-stone-500">Shown as “Available now” in search.</p>
              </div>
              <Switch
                checked={me.available}
                onCheckedChange={(checked) => {
                  updateDonor(me.id, { available: checked });
                  toast.success(
                    checked ? "You are available again" : "You are marked unavailable"
                  );
                }}
                aria-label="Toggle availability"
              />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
              <div>
                <p className="text-sm font-medium text-stone-800">Hide my profile</p>
                <p className="text-xs text-stone-500">
                  {me.hidden
                    ? "Hidden — you don’t appear in any search."
                    : "Visible in donor searches."}
                </p>
              </div>
              <Switch
                checked={me.hidden}
                onCheckedChange={(checked) => {
                  setDonorHidden(me, checked);
                  toast.success(
                    checked ? "Profile hidden from search" : "Profile visible again"
                  );
                }}
                aria-label="Toggle profile visibility"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
              {me.hidden ? (
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Your phone {maskPhone(me.phone)} is only revealed when you accept a request.
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="rounded-xl border-stone-200 shadow-sm lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-primary" aria-hidden="true" />
              Donation history
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <ol className="scroll-slim max-h-56 space-y-3 overflow-y-auto pr-1">
                {history.map((donation) => (
                  <li key={donation.id} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        {format(parseISO(donation.date), "d MMM yyyy")}
                      </p>
                      <p className="text-xs text-stone-500">
                        {donation.location} · {donation.units} unit
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-lg bg-stone-50 px-3 py-4 text-xs text-stone-500">
                No donations recorded yet. Your first one will appear here.
              </p>
            )}
            <p className="mt-3 border-t border-stone-100 pt-3 text-xs font-semibold text-stone-700">
              {history.length} donation{history.length === 1 ? "" : "s"} ·{" "}
              {history.length} potential life{history.length === 1 ? "" : "s"} helped
            </p>
          </CardContent>
        </Card>

        {/* Incoming requests */}
        <Card className="rounded-xl border-stone-200 shadow-sm lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-4 w-4 text-primary" aria-hidden="true" />
              Incoming requests
              {pending.length > 0 && (
                <Badge className="bg-primary hover:bg-primary">
                  {pending.length} new
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="rounded-lg bg-stone-50 px-3 py-6 text-center text-sm text-stone-500">
                No contact requests yet. When someone needs your blood group,
                their request lands here.
              </p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {requests.map((request) => (
                  <li
                    key={request.id}
                    className={cn(
                      "rounded-xl border p-4",
                      request.status === "pending"
                        ? "border-primary/30 bg-accent/40"
                        : "border-stone-200 bg-white"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-stone-900">
                          {request.requesterName}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">
                          {format(new Date(request.createdAt), "d MMM, h:mm a")}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          request.status === "accepted" &&
                            "border-emerald-200 text-emerald-700",
                          request.status === "declined" &&
                            "border-stone-200 text-stone-500",
                          request.status === "pending" &&
                            "border-primary/40 text-primary"
                        )}
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">
                      “{request.note}”
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm">
                      <Phone className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                      {request.status === "accepted" ? (
                        <span className="font-semibold text-emerald-700">
                          {request.requesterPhone}
                        </span>
                      ) : (
                        <span className="font-mono tracking-wider text-stone-400">
                          {maskPhone(request.requesterPhone)}
                        </span>
                      )}
                    </p>
                    {request.status === "pending" && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => {
                            respondToContactRequest(request.id, "accepted");
                            toast.success("Request accepted", {
                              description:
                                "The requester can now see your phone number, and you can see theirs.",
                            });
                          }}
                        >
                          <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            respondToContactRequest(request.id, "declined");
                            toast("Request declined", {
                              description: "They won’t see your contact details.",
                            });
                          }}
                        >
                          <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
                          Decline
                        </Button>
                      </div>
                    )}
                    {request.status === "accepted" && (
                      <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                        <Handshake className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        Contact details are now shared between you both.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
