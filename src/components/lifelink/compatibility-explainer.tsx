"use client";

import { useState } from "react";
import { ArrowRight, Droplet, HeartPulse } from "lucide-react";

import { BLOOD_GROUPS, type BloodGroup } from "@/lib/types";
import { compatibleDonorGroups, canDonateTo } from "@/lib/compatibility";
import { BloodPill } from "./blood-pill";
import { cn } from "@/lib/utils";

/** Interactive explainer: who can give to whom, for all 8 groups. */
export function CompatibilityExplainer() {
  const [group, setGroup] = useState<BloodGroup>("O-");
  const [asDonor, setAsDonor] = useState(false);

  const donorsForMe = compatibleDonorGroups(group);
  const recipients = BLOOD_GROUPS.filter((candidate) =>
    canDonateTo(group, candidate)
  );
  const list = asDonor ? recipients : donorsForMe;

  return (
    <section
      aria-labelledby="compat-heading"
      className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="compat-heading"
            className="flex items-center gap-2 text-lg font-bold text-stone-900"
          >
            <Droplet className="h-5 w-5 text-primary" aria-hidden="true" />
            Blood group compatibility
          </h3>
          <p className="mt-1 text-sm text-stone-500">
            Pick a group to see who can give to whom. Works for all 8 groups.
          </p>
        </div>
        <div
          role="tablist"
          aria-label="View compatibility as"
          className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-1"
        >
          {(
            [
              [false, "As patient"],
              [true, "As donor"],
            ] as [boolean, string][]
          ).map(([value, label]) => (
            <button
              key={label}
              role="tab"
              aria-selected={asDonor === value}
              onClick={() => setAsDonor(value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary",
                asDonor === value
                  ? "bg-white text-primary shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Choose a blood group">
        {BLOOD_GROUPS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            onClick={() => setGroup(candidate)}
            aria-pressed={group === candidate}
            className={cn(
              "rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              group === candidate
                ? "ring-2 ring-primary ring-offset-2"
                : "opacity-80 hover:opacity-100"
            )}
          >
            <BloodPill
              group={candidate}
              variant={candidate.endsWith("-") ? "outline" : "solid"}
              size="md"
              className={cn(
                group === candidate && candidate.endsWith("-") && "bg-accent"
              )}
            />
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-stone-100 bg-stone-50/80 p-4">
        <p className="text-sm font-medium text-stone-700">
          {asDonor ? (
            <>
              As a{" "}
              <BloodPill group={group} size="sm" className="mx-1 align-middle" />
              donor, you can help patients with:
            </>
          ) : (
            <>
              A patient with{" "}
              <BloodPill group={group} size="sm" className="mx-1 align-middle" />
              can receive blood from:
            </>
          )}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {list.map((candidate, index) => (
            <span key={candidate} className="inline-flex items-center gap-2">
              {index > 0 && (
                <span className="text-stone-300" aria-hidden="true">
                  ·
                </span>
              )}
              <BloodPill
                group={candidate}
                variant={candidate.endsWith("-") ? "outline" : "solid"}
                size="sm"
              />
            </span>
          ))}
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-stone-500">
          {asDonor ? (
            <>
              <HeartPulse className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
              {group === "O-"
                ? "O− is the universal donor — O− units can be given to any patient in an emergency."
                : group === "AB+"
                  ? "AB+ can receive from everyone, but as a donor AB+ blood helps AB+ patients only."
                  : "Rh− donors can give to Rh− and Rh+ patients of the same ABO family."}
            </>
          ) : (
            <>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" aria-hidden="true" />
              {group === "AB+"
                ? "AB+ is the universal recipient — every group can donate to an AB+ patient."
                : group === "O-"
                  ? "O− patients can only receive O− blood, which is why O− donors are precious."
                  : "Exact matches are always best; compatible groups are listed for emergencies."}
            </>
          )}
        </p>
      </div>
    </section>
  );
}
