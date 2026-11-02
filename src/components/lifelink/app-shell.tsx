"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { DemoChecklist } from "./demo-checklist";
import { HomeView } from "./views/home";
import { FindDonorView } from "./views/find-donor";
import { RegisterView } from "./views/register";
import { EmergencyView } from "./views/emergency";
import { DashboardView } from "./views/dashboard";
import { AdminView } from "./views/admin";
import { initStore, useAppData } from "@/lib/api";
import { routeFromHash, type Route } from "@/lib/routes";
import { BLOOD_GROUPS } from "@/lib/types";

export function LifeLinkApp() {
  const [route, setRoute] = useState<Route>("home");
  const [findGroup, setFindGroup] = useState<string | undefined>(undefined);
  const data = useAppData();
  const ready = data !== null;

  useEffect(() => {
    initStore();
    const apply = () => {
      const hash = window.location.hash;
      setRoute(routeFromHash(hash));
      const query = hash.split("?")[1];
      const group = query ? new URLSearchParams(query).get("group") : null;
      setFindGroup(
        group && BLOOD_GROUPS.includes(group as never) ? group : undefined
      );
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const navigate = useCallback((next: Route) => {
    window.location.hash = next === "home" ? "/" : `/${next}`;
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  // scroll to top when the route changes (e.g. via browser back)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [route]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar current={route} onNavigate={navigate} />

      <main className="flex-1">
        {!ready ? (
          <div
            className="flex min-h-[60vh] items-center justify-center"
            role="status"
            aria-label="Loading LifeLink Campus"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
              <p className="text-sm font-medium text-stone-500">
                Warming up the donor network…
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={route}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {route === "home" && <HomeView data={data} onNavigate={navigate} />}
              {route === "find" && (
                <FindDonorView
                  key={`find-${findGroup ?? "all"}`}
                  data={data}
                  initialBloodGroup={findGroup}
                  onNavigate={navigate}
                />
              )}
              {route === "register" && (
                <RegisterView data={data} onNavigate={navigate} />
              )}
              {route === "emergency" && <EmergencyView data={data} />}
              {route === "dashboard" && <DashboardView data={data} />}
              {route === "admin" && <AdminView data={data} />}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer onNavigate={navigate} />
      <DemoChecklist />
    </div>
  );
}
