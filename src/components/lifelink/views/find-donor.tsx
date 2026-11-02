"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, FilterX, HeartPulse, Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Switch } from "@/components/ui/switch";
import { DonorCard } from "@/components/lifelink/donor-card";
import { ContactRequestDialog } from "@/components/lifelink/contact-request-dialog";
import {
  DEFAULT_FILTERS,
  hasAcceptedContactRequest,
  searchDonors,
  type DonorMatch,
} from "@/lib/api";
import { compatibleDonorGroups } from "@/lib/compatibility";
import { DEPARTMENTS, HOSTELS } from "@/lib/constants";
import { useDemoStore } from "@/lib/demo-store";
import { BLOOD_GROUPS, type LifelinkData } from "@/lib/types";
import type { Route } from "@/lib/routes";

export function FindDonorView({
  data,
  initialBloodGroup,
  onNavigate,
}: {
  data: LifelinkData;
  initialBloodGroup?: string;
  onNavigate: (route: Route) => void;
}) {
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    bloodGroup:
      initialBloodGroup && BLOOD_GROUPS.includes(initialBloodGroup as never)
        ? (initialBloodGroup as (typeof BLOOD_GROUPS)[number])
        : ("all" as const),
  });
  const [dialogDonor, setDialogDonor] = useState<DonorMatch | null>(null);
  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const complete = useDemoStore((s) => s.complete);

  useEffect(() => {
    if (filters.bloodGroup === "A+") {
      complete("search_aplus");
    }
  }, [filters.bloodGroup, complete]);

  const results = useMemo(() => searchDonors(data, filters), [data, filters]);
  const showingCompatible =
    filters.bloodGroup !== "all" && filters.includeCompatible;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Find a donor
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {results.length} donor{results.length === 1 ? "" : "s"} match your
            filters. Exact matches always come first.
          </p>
        </div>
        <Alert className="w-full max-w-sm border-amber-200 bg-amber-50 text-amber-900 sm:w-auto">
          <AlertTriangle className="h-4 w-4 !text-amber-600" />
          <AlertDescription className="text-xs leading-snug">
            Is it critical right now?{" "}
            <button
              className="font-bold underline underline-offset-2"
              onClick={() => onNavigate("emergency")}
            >
              Post an emergency request
            </button>{" "}
            and notify every eligible match at once.
          </AlertDescription>
        </Alert>
      </div>

      {/* Filters */}
      <Card className="mt-6 rounded-xl border-stone-200 shadow-sm">
        <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:p-5">
          <div className="grid gap-2">
            <Label htmlFor="f-group">Patient blood group</Label>
            <Select
              value={filters.bloodGroup}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, bloodGroup: value as never }))
              }
            >
              <SelectTrigger id="f-group" aria-label="Patient blood group">
                <SelectValue placeholder="All groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {BLOOD_GROUPS.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group.replace("-", "−")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="f-dept">Department</Label>
            <Select
              value={filters.department || "any"}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, department: value === "any" ? "" : value }))
              }
            >
              <SelectTrigger id="f-dept" aria-label="Department">
                <SelectValue placeholder="Any department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any department</SelectItem>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="f-hostel">Hostel / area</Label>
            <Select
              value={filters.hostel || "any"}
              onValueChange={(value) =>
                setFilters((f) => ({ ...f, hostel: value === "any" ? "" : value }))
              }
            >
              <SelectTrigger id="f-hostel" aria-label="Hostel or area">
                <SelectValue placeholder="Anywhere on campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Anywhere on campus</SelectItem>
                {HOSTELS.map((hostel) => (
                  <SelectItem key={hostel} value={hostel}>
                    {hostel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 px-3 py-2.5 sm:col-span-2">
            <div>
              <Label htmlFor="f-compat" className="text-sm font-medium">
                Include compatible matches
              </Label>
              <p className="text-xs text-stone-500">
                {filters.bloodGroup === "all" ? (
                  "Pick a patient group first"
                ) : (
                  <>
                    {compatibleDonorGroups(filters.bloodGroup)
                      .filter((g) => g !== filters.bloodGroup)
                      .join(" · ") || "No compatible groups"}
                  </>
                )}
              </p>
            </div>
            <Switch
              id="f-compat"
              checked={filters.includeCompatible}
              disabled={filters.bloodGroup === "all"}
              onCheckedChange={(checked) =>
                setFilters((f) => ({ ...f, includeCompatible: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 px-3 py-2.5">
            <div>
              <Label htmlFor="f-avail" className="text-sm font-medium">
                Available now only
              </Label>
              <p className="text-xs text-stone-500">
                Available and eligible today
              </p>
            </div>
            <Switch
              id="f-avail"
              checked={filters.availableOnly}
              onCheckedChange={(checked) =>
                setFilters((f) => ({ ...f, availableOnly: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {filters.bloodGroup !== "all" && (
        <p className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground">
          <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
          {showingCompatible
            ? `Showing exact and compatible matches for ${filters.bloodGroup.replace("-", "−")} — exact first.`
            : `Showing exact ${filters.bloodGroup.replace("-", "−")} matches only.`}
        </p>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((donor) => (
            <DonorCard
              key={donor.id}
              donor={donor}
              data={data}
              patientGroup={filters.bloodGroup === "all" ? null : filters.bloodGroup}
              phoneRevealed={hasAcceptedContactRequest(data, donor.id)}
              requestSent={requestedIds.has(donor.id)}
              onRequestContact={setDialogDonor}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-6 rounded-xl border-dashed border-stone-300 bg-stone-50">
          <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent">
              <FilterX className="h-7 w-7 text-primary" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold text-stone-900">
                No donors match these filters yet
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm text-stone-500">
                Try widening the area or turning compatible matches on. If it
                can’t wait, post an emergency request and we’ll notify every
                eligible donor who can give this group.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => onNavigate("emergency")}
              >
                <HeartPulse className="mr-2 h-4 w-4" aria-hidden="true" />
                Post an emergency request
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    ...DEFAULT_FILTERS,
                    bloodGroup: filters.bloodGroup,
                  })
                }
              >
                Reset filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ContactRequestDialog
        donor={dialogDonor}
        open={dialogDonor !== null}
        onOpenChange={(open) => {
          if (!open) setDialogDonor(null);
        }}
        onSent={(donorId) =>
          setRequestedIds((prev) => new Set(prev).add(donorId))
        }
      />
    </div>
  );
}
