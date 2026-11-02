"use client";

import { motion } from "framer-motion";
import { BellRing, Droplets, HeartHandshake, Users } from "lucide-react";

import { getStats } from "@/lib/api";
import type { LifelinkData } from "@/lib/types";

export function StatsStrip({ data }: { data: LifelinkData }) {
  const stats = getStats(data);
  const items = [
    {
      label: "Registered donors",
      value: stats.registeredDonors,
      icon: Users,
      tint: "text-primary bg-accent",
    },
    {
      label: "Available now",
      value: stats.availableNow,
      icon: Droplets,
      tint: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Requests fulfilled",
      value: stats.requestsFulfilled,
      icon: HeartHandshake,
      tint: "text-orange-700 bg-orange-50",
    },
    {
      label: "Open requests",
      value: stats.openRequests,
      icon: BellRing,
      tint: "text-amber-700 bg-amber-50",
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.35 }}
        >
          <div className="flex h-full items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <span
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.tint}`}
              aria-hidden="true"
            >
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <dd className="text-2xl font-bold leading-none text-stone-900">
                {item.value}
              </dd>
              <dt className="mt-1 text-xs font-medium text-stone-500">
                {item.label}
              </dt>
            </div>
          </div>
        </motion.div>
      ))}
    </dl>
  );
}
