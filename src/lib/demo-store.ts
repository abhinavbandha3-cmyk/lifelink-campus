"use client";

/**
 * Demo mode — guided checklist state shown in Admin.
 * Persisted so a page refresh does not lose progress.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DemoStepId =
  | "search_aplus"
  | "request_contact"
  | "emergency_request"
  | "notify_matches"
  | "admin_shortage";

export const DEMO_STEPS: { id: DemoStepId; label: string }[] = [
  { id: "search_aplus", label: "Search for an A+ patient in Find Donor" },
  { id: "request_contact", label: "Send a “Request contact” to a donor" },
  { id: "emergency_request", label: "Submit an emergency request" },
  { id: "notify_matches", label: "Notify all matches" },
  { id: "admin_shortage", label: "View the admin shortage alert" },
];

interface DemoState {
  active: boolean;
  open: boolean;
  steps: Record<DemoStepId, boolean>;
  start: () => void;
  dismiss: () => void;
  reopen: () => void;
  stop: () => void;
  complete: (step: DemoStepId) => void;
}

export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      active: false,
      open: false,
      steps: {
        search_aplus: false,
        request_contact: false,
        emergency_request: false,
        notify_matches: false,
        admin_shortage: false,
      },
      start: () =>
        set({
          active: true,
          open: true,
          steps: {
            search_aplus: false,
            request_contact: false,
            emergency_request: false,
            notify_matches: false,
            admin_shortage: false,
          },
        }),
      dismiss: () => set({ open: false }),
      reopen: () => set({ open: true }),
      stop: () =>
        set({
          active: false,
          open: false,
          steps: {
            search_aplus: false,
            request_contact: false,
            emergency_request: false,
            notify_matches: false,
            admin_shortage: false,
          },
        }),
      complete: (step) =>
        set((prev) =>
          prev.steps[step] ? prev : { steps: { ...prev.steps, [step]: true } }
        ),
    }),
    { name: "lifelink:demo:v1" }
  )
);
