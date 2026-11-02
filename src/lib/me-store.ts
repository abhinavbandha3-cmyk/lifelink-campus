"use client";

/** "Sign in as" demo identity, persisted across refreshes. */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MeState {
  meId: string;
  signIn: (id: string) => void;
}

export const useMeStore = create<MeState>()(
  persist(
    (set) => ({
      meId: "",
      signIn: (meId) => set({ meId }),
    }),
    { name: "lifelink:me:v1" }
  )
);
