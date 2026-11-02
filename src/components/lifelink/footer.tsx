"use client";

import { DropMark } from "./heartbeat";
import { hashForRoute } from "@/lib/routes";
import type { Route } from "@/lib/routes";

export function Footer({ onNavigate }: { onNavigate: (route: Route) => void }) {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <DropMark className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm font-bold text-stone-900">
                LifeLink <span className="text-primary">Campus</span>
              </p>
              <p className="text-xs text-stone-500">
                Neighbours saving neighbours, one unit at a time.
              </p>
            </div>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
            {(
              [
                ["find", "Find Donor"],
                ["register", "Become a Donor"],
                ["emergency", "Emergency Request"],
                ["dashboard", "My Dashboard"],
                ["admin", "Admin"],
              ] as [Route, string][]
            ).map(([route, label]) => (
              <a
                key={route}
                href={hashForRoute(route)}
                onClick={() => onNavigate(route)}
                className="text-sm text-stone-600 underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs leading-relaxed text-amber-900">
            <strong>For emergencies, contact the nearest hospital first.</strong>{" "}
            This app is a campus coordination tool, not medical advice. Donor
            eligibility shown here is indicative; final screening happens at the
            blood bank. All demo data is fictional.
          </p>
        </div>
        <p className="mt-4 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} LifeLink Campus · Built for the college
          community
        </p>
      </div>
    </footer>
  );
}
