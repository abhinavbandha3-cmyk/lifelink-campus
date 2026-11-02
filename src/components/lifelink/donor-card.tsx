"use client";

import { format } from "date-fns";
import { CalendarClock, Eye, MapPin, Phone, ShieldCheck, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BloodPill } from "./blood-pill";
import { isEligible } from "@/lib/eligibility";
import { donorShortName, maskPhone } from "@/lib/api";
import type { LifelinkData } from "@/lib/types";
import type { DonorMatch } from "@/lib/api";
import { cn } from "@/lib/utils";

export function DonorCard({
  donor,
  data,
  patientGroup,
  phoneRevealed,
  requestSent,
  onRequestContact,
  className,
}: {
  donor: DonorMatch;
  data: LifelinkData;
  /** Patient group the current search is for (enables match badges) */
  patientGroup?: string | null;
  phoneRevealed: boolean;
  requestSent: boolean;
  onRequestContact: (donor: DonorMatch) => void;
  className?: string;
}) {
  const check = isEligible(donor, data.settings);
  const isExact = donor.bloodGroup === patientGroup;

  return (
    <Card
      className={cn(
        "rounded-xl border-stone-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        !donor.available && "opacity-90",
        className
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <BloodPill group={donor.bloodGroup} />
            <div>
              <p className="font-semibold leading-tight text-stone-900">
                {donorShortName(donor)}
              </p>
              <p className="text-xs text-stone-500">
                {donor.department} · {donor.year === "Staff" ? "Staff" : `Year ${donor.year}`}
              </p>
            </div>
          </div>
          {donor.available && check.eligible ? (
            <Badge className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Available now
            </Badge>
          ) : donor.available ? (
            <Badge className="gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
              <CalendarClock className="h-3 w-3" aria-hidden="true" />
              Next eligible {check.nextEligibleDate ? format(new Date(check.nextEligibleDate), "d MMM") : "—"}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-stone-200 text-stone-500">
              Unavailable
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
            {donor.hostel}
          </span>
          <span className="inline-flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
            {phoneRevealed ? (
              <span className="font-medium text-stone-900">{donor.phone}</span>
            ) : (
              <span className="font-mono tracking-wider text-stone-500">
                {maskPhone(donor.phone)}
              </span>
            )}
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {patientGroup ? (
            isExact ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Exact match
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
                <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                Compatible with {patientGroup}
              </span>
            )
          ) : (
            <span className="text-xs text-stone-400">
              {donor.weightKg} kg · {check.age} yrs
            </span>
          )}

          {phoneRevealed ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              Contact shared
            </span>
          ) : requestSent ? (
            <Button size="sm" variant="outline" disabled className="border-emerald-200 text-emerald-700">
              Request sent ✓
            </Button>
          ) : (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={() => onRequestContact(donor)}
            >
              Request contact
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
