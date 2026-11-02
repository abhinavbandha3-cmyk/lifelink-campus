/** In-app routes. The sandbox exposes a single `/` page, so views are
 * switched client-side with hash URLs (e.g. /#/find) — browser back/forward
 * and deep links keep working. */

export type Route =
  | "home"
  | "find"
  | "register"
  | "emergency"
  | "dashboard"
  | "admin";

export const ROUTES: Route[] = [
  "home",
  "find",
  "register",
  "emergency",
  "dashboard",
  "admin",
];

export function routeFromHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, "").split("?")[0];
  const found = ROUTES.find((route) => route === clean);
  return found ?? "home";
}

export function hashForRoute(route: Route): string {
  return route === "home" ? "#/" : `#/${route}`;
}
