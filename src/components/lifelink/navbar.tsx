"use client";

import { useState } from "react";
import { Menu, PhoneIncoming, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { DropMark } from "./heartbeat";
import type { Route } from "@/lib/routes";
import { hashForRoute } from "@/lib/routes";

const LINKS: { route: Route; label: string }[] = [
  { route: "home", label: "Home" },
  { route: "find", label: "Find Donor" },
  { route: "register", label: "Become a Donor" },
  { route: "dashboard", label: "My Dashboard" },
  { route: "admin", label: "Admin" },
];

export function Navbar({
  current,
  onNavigate,
}: {
  current: Route;
  onNavigate: (route: Route) => void;
}) {
  const [open, setOpen] = useState(false);

  const go = (route: Route) => {
    setOpen(false);
    onNavigate(route);
  };

  const linkClass = (route: Route) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
      current === route
        ? "bg-accent text-accent-foreground"
        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
    );

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6"
      >
        <a
          href={hashForRoute("home")}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="LifeLink Campus home"
        >
          <DropMark className="h-7 w-7 text-primary" />
          <span className="text-lg font-bold tracking-tight text-stone-900">
            LifeLink <span className="text-primary">Campus</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.route}
              href={hashForRoute(link.route)}
              className={linkClass(link.route)}
              aria-current={current === link.route ? "page" : undefined}
            >
              {link.label}
            </a>
          ))}
          <a
            href={hashForRoute("emergency")}
            className="ml-2"
            aria-current={current === "emergency" ? "page" : undefined}
          >
            <Button
              size="sm"
              variant={current === "emergency" ? "default" : "outline"}
              className={cn(
                "gap-1.5",
                current !== "emergency" &&
                  "border-primary/40 text-primary hover:bg-accent hover:text-primary"
              )}
            >
              <PhoneIncoming className="h-4 w-4" aria-hidden="true" />
              Emergency
            </Button>
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-stone-700 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-stone-200 bg-white px-4 pb-4 pt-2 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.route}
                href={hashForRoute(link.route)}
                className={linkClass(link.route)}
                aria-current={current === link.route ? "page" : undefined}
                onClick={() => go(link.route)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={hashForRoute("emergency")}
              className="mt-1"
              onClick={() => setOpen(false)}
            >
              <Button className="w-full gap-1.5">
                <UserPlus className="h-4 w-4 rotate-90" aria-hidden="true" />
                Emergency request
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
