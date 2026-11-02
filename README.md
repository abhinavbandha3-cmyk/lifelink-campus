# 🩸 LifeLink Campus

**A Campus Blood Donor Finder — find eligible, nearby, willing blood donors on campus in under a minute.**

When a student, staff member, or their relative needs blood urgently, LifeLink Campus helps you find compatible donors around campus instantly, request contact, and coordinate — all from the browser.

> ⚠️ **For emergencies, contact the nearest hospital first.** This app is a demo tool and is **not medical advice**. All data is fake demo data.

---

## ✨ Features

| View | Route | What it does |
| --- | --- | --- |
| **Home** | `/#/` | Hero, live stats (registered donors, available now, requests fulfilled), how-it-works, interactive blood-group compatibility explainer |
| **Find Donor** | `/#/find` | Filter by blood group (with **compatible matches** — an A+ search also shows O−, O+, A−), department, hostel/area, availability. Phone numbers are masked (`98XXXXXX21`) until the donor accepts |
| **Become a Donor** | `/#/register` | Registration with **live eligibility checks** (age 18–65, weight ≥ 45 kg, minimum 90-day donation gap) and consent |
| **Emergency Request** | `/#/emergency` | Submit patient group, units, hospital and urgency; see matching eligible donors and "Notify all matches" |
| **My Dashboard** | `/#/dashboard` | Eligibility countdown, donation history, incoming requests (Accept / Decline — accepting reveals contact), "Hide my profile" toggle |
| **Admin** | `/#/admin` | Charts (donors by blood group / department, requests over time), **shortage alerts**, searchable tables, CSV download, donation-gap setting, and a **Demo mode** with a guided checklist |

Navigation uses hash URLs (`/#/find`), so the browser back/forward buttons and deep links work everywhere — including static hosting.

## 🛠 Tech Stack

- **[Next.js 16](https://nextjs.org)** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** components (Radix primitives)
- **Prisma** + **SQLite** (scaffolded data layer; demo data is seeded)
- **Framer Motion**, **Recharts**, **Sonner** toasts, **zustand** stores

## 🚀 Quick Start

Requirements: **Node.js 20.9+** (or [Bun](https://bun.sh) 1.1+). No database server needed — the app ships with a local SQLite file.

```bash
# 1. Install dependencies (pick ONE)
npm install
# or: bun install

# 2. Start the dev server
npm run dev
# or: bun run dev

# 3. Open the app
# http://localhost:3000
```

The first install runs `prisma generate` automatically. If the database file is missing or you want to recreate it:

```bash
npm run db:push     # creates db/custom.db from prisma/schema.prisma
```

### Production build

```bash
npm run build
npm run start       # serves on http://localhost:3000
```

## 📜 Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build on port 3000 |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Sync the Prisma schema to the SQLite database |
| `npm run db:generate` | Generate the Prisma client |
| `npm run db:migrate` | Create/apply a dev migration |
| `npm run db:reset` | Reset the database |

## 📁 Project Structure

```
lifelink-campus/
├── src/
│   ├── app/                  # Next.js App Router (single page + API route)
│   ├── components/
│   │   ├── lifelink/         # App views, navbar, donor cards, charts, checklist…
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # use-mobile, use-toast
│   └── lib/
│       ├── api.ts            # Data-access layer (swap in a real backend here)
│       ├── demo-store.ts     # Demo data store (seeded, localStorage-backed)
│       ├── compatibility.ts  # Blood-group compatibility for all 8 groups
│       ├── eligibility.ts    # Age / weight / donation-gap eligibility logic
│       ├── seed.ts           # 40 fake donors, 8 requests, donation history
│       ├── routes.ts         # Hash-based routing
│       └── db.ts             # Prisma client (scaffold)
├── prisma/schema.prisma      # Prisma schema (SQLite)
├── db/custom.db              # Pre-seeded SQLite database
├── public/                   # Logo, blood-drop icon, robots.txt
└── package.json
```

## 🧪 Demo Data

The app starts with **40 realistic fake donors** (Indian names, varied departments, years, hostels and blood groups — with O− and AB− intentionally rare so the Admin shortage alert triggers), 8 sample blood requests and donation history.

- Sign in as any demo donor from **My Dashboard → "Sign in as"**.
- Reset everything via **Admin → Demo mode** (guided checklist included).
- All state lives in the browser (localStorage); the Prisma/SQLite layer is scaffolded and ready to replace via `src/lib/api.ts`.

## ⬆️ Push This Project to Your Git Host

The folder **already contains a git repository** with an initial commit on the `main` branch — you only need to add a remote and push.

**GitHub**

```bash
# create an EMPTY repository on github.com first (no README/.gitignore),
# then inside this folder:
git remote add origin https://github.com/<your-username>/lifelink-campus.git
git branch -M main
git push -u origin main
```

**GitLab**

```bash
git remote add origin https://gitlab.com/<your-username>/lifelink-campus.git
git branch -M main
git push -u origin main
```

**Bitbucket / any other Git host** — same three commands, just use the remote URL the host gives you.

Using **GitHub Desktop** or **VS Code**? Open the folder, and the existing repository is detected automatically — publish/sync from the UI.

> Note: `.env` is committed intentionally (it only contains the local SQLite path — no secrets). Real secrets belong in `.env.local`, which is git-ignored.

## 🌍 Deploy

- **Vercel (recommended for Next.js):** push to GitHub → [vercel.com/new](https://vercel.com/new) → import the repo → Deploy. No env changes needed.
- **Netlify:** import the repo, build command `npm run build`.
- **Any Node.js host / VPS:** `npm run build && npm run start` (port 3000).

## 📄 License

Private demo project — add a LICENSE file if you plan to publish it.

---

Made with ❤️ for campus communities. Blood donation saves lives — [check your local eligibility guidelines](https://www.who.int/) before donating.
