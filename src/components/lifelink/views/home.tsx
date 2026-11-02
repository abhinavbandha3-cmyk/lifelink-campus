"use client";

import { motion } from "framer-motion";
import { Droplets, Search, UserPlus, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BloodPill } from "@/components/lifelink/blood-pill";
import {
  CompatibilityExplainer,
} from "@/components/lifelink/compatibility-explainer";
import { HeartbeatLine } from "@/components/lifelink/heartbeat";
import { StatsStrip } from "@/components/lifelink/stats-strip";
import type { LifelinkData } from "@/lib/types";
import type { Route } from "@/lib/routes";

const STEPS = [
  {
    icon: UserPlus,
    title: "1 · Register",
    body: "Students and staff sign up with their blood group, hostel and availability in under two minutes.",
  },
  {
    icon: Search,
    title: "2 · Search",
    body: "Filter by blood group with compatible matches, department and area — exact matches come first.",
  },
  {
    icon: Zap,
    title: "3 · Connect",
    body: "Send a contact request or notify every eligible match at once. Phone numbers stay private until the donor accepts.",
  },
];

export function HomeView({
  data,
  onNavigate,
}: {
  data: LifelinkData;
  onNavigate: (route: Route) => void;
}) {
  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-b from-accent/70 via-white to-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
              <Droplets className="h-3.5 w-3.5" aria-hidden="true" />
              The campus blood donor network
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl">
              Find a blood donor on campus in{" "}
              <span className="text-primary">under a minute</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
              When a student, staff member or a relative needs blood urgently,
              LifeLink Campus finds eligible, nearby, willing donors — without
              the group-chat panic.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="w-full bg-primary text-base hover:bg-primary/90 sm:w-auto"
                onClick={() => onNavigate("find")}
              >
                <Search className="mr-2 h-5 w-5" aria-hidden="true" />
                I need blood
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-primary/40 text-base text-primary hover:bg-accent hover:text-primary sm:w-auto"
                onClick={() => onNavigate("register")}
              >
                <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                Become a donor
              </Button>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("emergency")}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              Is it urgent? Post an emergency request instead →
            </button>
          </motion.div>

          <div className="mt-12 flex items-center gap-3 text-primary/40" aria-hidden="true">
            <span className="drop-float hidden h-9 w-9 shrink-0 sm:block">
              <BloodPill group="O-" size="sm" className="h-full w-full" />
            </span>
            <HeartbeatLine className="h-10 w-full" />
            <span className="drop-float hidden h-9 w-9 shrink-0 sm:block">
              <BloodPill group="AB+" size="sm" className="h-full w-full" />
            </span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="Live statistics" className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <StatsStrip data={data} />
      </section>

      {/* How it works */}
      <section
        aria-labelledby="how-heading"
        className="mx-auto max-w-6xl px-4 pt-14 sm:px-6"
      >
        <h2
          id="how-heading"
          className="text-center text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl"
        >
          How it works
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-stone-500">
          Three steps between “we need blood” and “donor is on the way”.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.08, duration: 0.35 }}
              className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-bold text-stone-900">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                {step.body}
              </p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Compatibility explainer */}
      <section
        aria-label="Compatibility explainer"
        className="mx-auto max-w-6xl px-4 pt-14 sm:px-6"
      >
        <CompatibilityExplainer />
      </section>
    </div>
  );
}
