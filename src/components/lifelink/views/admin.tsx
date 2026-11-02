"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Activity,
  BarChart3,
  CalendarClock,
  Download,
  FlaskConical,
  Save,
  Search,
  Siren,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { BloodPill } from "@/components/lifelink/blood-pill";
import {
  donorsByDepartment,
  donorsByGroup,
  maskPhone,
  requestsPerDay,
  resetToSeed,
  shortageGroups,
  updateSettings,
} from "@/lib/api";
import { downloadCsv } from "@/lib/csv";
import { isEligible } from "@/lib/eligibility";
import { useDemoStore } from "@/lib/demo-store";
import { URGENCY_STYLES } from "@/lib/constants";
import type { BloodGroup, LifelinkData } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AdminView({ data }: { data: LifelinkData }) {
  const [donorQuery, setDonorQuery] = useState("");
  const [requestQuery, setRequestQuery] = useState("");
  const [gapDays, setGapDays] = useState(String(data.settings.donationGapDays));
  const { active, start, open, dismiss, reopen } = useDemoStore();

  const shortages = useMemo(() => shortageGroups(data), [data]);

  // Demo checklist step: admin shortage alert viewed.
  // Depends on `active` too so the step completes when demo mode is started
  // while already on this page.
  useEffect(() => {
    if (active && shortages.length > 0) {
      useDemoStore.getState().complete("admin_shortage");
    }
  }, [active, shortages.length]);

  const groupData = useMemo(() => donorsByGroup(data), [data]);
  const departmentData = useMemo(() => donorsByDepartment(data), [data]);
  const timeline = useMemo(() => requestsPerDay(data, 30), [data]);

  const donors = useMemo(() => {
    const q = donorQuery.trim().toLowerCase();
    if (!q) return data.donors;
    return data.donors.filter((donor) =>
      [
        donor.firstName,
        donor.lastName,
        donor.department,
        donor.bloodGroup,
        donor.hostel,
        donor.phone,
        donor.year,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [data.donors, donorQuery]);

  const requests = useMemo(() => {
    const q = requestQuery.trim().toLowerCase();
    if (!q) return data.requests;
    return data.requests.filter((request) =>
      [
        request.patientBloodGroup,
        request.hospital,
        request.contactName,
        request.contactPhone,
        request.urgency,
        request.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [data.requests, requestQuery]);

  const exportDonorsCsv = () => {
    const rows: (string | number)[][] = [
      [
        "First name",
        "Last name",
        "Department",
        "Year",
        "Blood group",
        "Phone",
        "Hostel/Area",
        "Date of birth",
        "Weight (kg)",
        "Last donation",
        "Available",
        "Eligible today",
        "Hidden",
      ],
      ...data.donors.map((donor) => [
        donor.firstName,
        donor.lastName,
        donor.department,
        donor.year,
        donor.bloodGroup,
        donor.phone,
        donor.hostel,
        donor.dateOfBirth,
        donor.weightKg,
        donor.lastDonationDate ?? "never",
        donor.available ? "yes" : "no",
        isEligible(donor, data.settings).eligible ? "yes" : "no",
        donor.hidden ? "yes" : "no",
      ]),
    ];
    downloadCsv("lifelink-donors.csv", rows);
    toast.success(`Exported ${data.donors.length} donors to CSV`);
  };

  const exportRequestsCsv = () => {
    const rows: (string | number)[][] = [
      [
        "Created",
        "Patient group",
        "Units",
        "Hospital",
        "Urgency",
        "Contact name",
        "Contact phone",
        "Status",
        "Notified donors",
      ],
      ...data.requests.map((request) => [
        format(new Date(request.createdAt), "yyyy-MM-dd HH:mm"),
        request.patientBloodGroup,
        request.unitsNeeded,
        request.hospital,
        request.urgency,
        request.contactName,
        request.contactPhone,
        request.status,
        request.notifiedCount,
      ]),
    ];
    downloadCsv("lifelink-requests.csv", rows);
    toast.success(`Exported ${data.requests.length} requests to CSV`);
  };

  const saveGap = () => {
    const value = Number(gapDays);
    if (!(value >= 15 && value <= 365)) {
      toast.error("Donation gap must be between 15 and 365 days.");
      return;
    }
    updateSettings({ donationGapDays: value });
    toast.success(`Donation gap updated to ${value} days`, {
      description: "Eligibility everywhere now uses this gap.",
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            Admin overview
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Campus-wide donor pool, request flow and shortage watch.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={active ? "outline" : "default"}
            className={cn(!active && "bg-primary hover:bg-primary/90")}
            onClick={() => {
              resetToSeed();
              start();
              toast.success("Demo mode started", {
                description: "Data reset to the seed set — follow the checklist.",
              });
            }}
          >
            <FlaskConical className="mr-2 h-4 w-4" aria-hidden="true" />
            {active ? "Restart demo data" : "Start demo mode"}
          </Button>
          {active && !open && (
            <Button variant="outline" onClick={() => reopen()}>
              Show demo checklist
            </Button>
          )}
        </div>
      </div>

      {/* Shortage alerts */}
      <div className="mt-6 space-y-3" aria-live="polite">
        {shortages.length > 0 ? (
          <Alert className="border-red-200 bg-red-50">
            <Siren className="h-4 w-4 !text-red-600" />
            <AlertTitle className="text-sm font-bold text-red-900">
              Shortage alert — {shortages.length} group
              {shortages.length === 1 ? "" : "s"} below safe level
            </AlertTitle>
            <AlertDescription>
              <div className="mt-2 flex flex-wrap gap-2">
                {shortages.map((shortage) => (
                  <span
                    key={shortage.group}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-800"
                  >
                    <BloodPill group={shortage.group} size="sm" />
                    only {shortage.eligibleCount} eligible
                    {shortage.eligibleCount === 0 ? " — none!" : ""}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-red-800">
                Fewer than 3 eligible donors per group triggers this alert.
                Consider a targeted donation drive for these groups.
              </p>
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-emerald-200 bg-emerald-50">
            <Siren className="h-4 w-4 !text-emerald-600" />
            <AlertTitle className="text-sm font-bold text-emerald-900">
              All groups have at least 3 eligible donors
            </AlertTitle>
            <AlertDescription className="text-xs text-emerald-800">
              No shortages right now. Keep availability fresh — it changes daily.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-stone-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" aria-hidden="true" />
              Donors by blood group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="group" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#e7e5e4" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "#fdecea" }} formatter={(value) => [`${value} donors`, "Donors"]} />
                  <Bar dataKey="donors" fill="#c62828" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-stone-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" aria-hidden="true" />
              Donors by department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  layout="vertical"
                  margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="department"
                    width={104}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: "#e7e5e4" }}
                  />
                  <Tooltip cursor={{ fill: "#fdecea" }} formatter={(value) => [`${value} donors`, "Donors"]} />
                  <Bar dataKey="donors" fill="#e65100" radius={[0, 6, 6, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-stone-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
              Requests · last 30 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reqFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c62828" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#c62828" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={6} tickLine={false} axisLine={{ stroke: "#e7e5e4" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => [`${value} request(s)`, "Requests"]} />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#c62828"
                    strokeWidth={2}
                    fill="url(#reqFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings + activity */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="rounded-xl border-stone-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />
              Donation gap setting
            </CardTitle>
            <CardDescription>
              Minimum days between whole-blood donations (default 90).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="gap-days">Gap in days</Label>
                <Input
                  id="gap-days"
                  inputMode="numeric"
                  value={gapDays}
                  onChange={(e) => setGapDays(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                />
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={saveGap}>
                <Save className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-stone-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="scroll-slim max-h-44 space-y-2 overflow-y-auto pr-1">
              {data.activity.slice(0, 12).map((entry) => (
                <li key={entry.id} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
                  <span className="text-stone-700">{entry.text}</span>
                  <span className="ml-auto shrink-0 text-xs text-stone-400">
                    {format(new Date(entry.at), "d MMM, h:mm a")}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <Tabs defaultValue="donors" className="mt-6">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="donors">Donors ({data.donors.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({data.requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="donors">
          <Card className="rounded-xl border-stone-200 shadow-sm">
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
              <CardTitle className="text-base">Donor registry</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                  <Input
                    placeholder="Search donors…"
                    className="w-44 pl-8 sm:w-64"
                    value={donorQuery}
                    onChange={(e) => setDonorQuery(e.target.value)}
                    aria-label="Search donors"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={exportDonorsCsv}>
                  <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="scroll-slim max-h-96 overflow-y-auto rounded-lg border border-stone-100">
                <Table>
                  <TableHeader className="sticky top-0 bg-stone-50">
                    <TableRow>
                      <TableHead>Donor</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Dept · Year</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donors.map((donor) => {
                      const check = isEligible(donor, data.settings);
                      return (
                        <TableRow key={donor.id}>
                          <TableCell className="font-medium">
                            {donor.firstName} {donor.lastName}
                          </TableCell>
                          <TableCell>
                            <BloodPill group={donor.bloodGroup as BloodGroup} size="sm" />
                          </TableCell>
                          <TableCell className="text-stone-600">
                            {donor.department} · {donor.year}
                          </TableCell>
                          <TableCell className="text-stone-600">{donor.hostel}</TableCell>
                          <TableCell className="font-mono text-xs text-stone-600">
                            {donor.phone}
                          </TableCell>
                          <TableCell>
                            {donor.available && check.eligible ? (
                              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                Available
                              </Badge>
                            ) : donor.available ? (
                              <Badge className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
                                Next {check.nextEligibleDate ? format(parseISO(check.nextEligibleDate), "d MMM") : "—"}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-stone-500">
                                Unavailable
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {donors.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-sm text-stone-500">
                          No donors match “{donorQuery}”.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card className="rounded-xl border-stone-200 shadow-sm">
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 pb-3">
              <CardTitle className="text-base">Blood requests</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                  <Input
                    placeholder="Search requests…"
                    className="w-44 pl-8 sm:w-64"
                    value={requestQuery}
                    onChange={(e) => setRequestQuery(e.target.value)}
                    aria-label="Search requests"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={exportRequestsCsv}>
                  <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="scroll-slim max-h-96 overflow-y-auto rounded-lg border border-stone-100">
                <Table>
                  <TableHeader className="sticky top-0 bg-stone-50">
                    <TableRow>
                      <TableHead>Created</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="whitespace-nowrap text-stone-600">
                          {format(new Date(request.createdAt), "d MMM, h:mm a")}
                        </TableCell>
                        <TableCell>
                          <BloodPill group={request.patientBloodGroup} size="sm" />
                        </TableCell>
                        <TableCell>{request.unitsNeeded}</TableCell>
                        <TableCell className="max-w-40 truncate text-stone-600">
                          {request.hospital}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-semibold", URGENCY_STYLES[request.urgency])}>
                            {request.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-stone-600">
                          {request.contactName}
                          <span className="block font-mono text-xs text-stone-400">
                            {maskPhone(request.contactPhone)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              request.status === "fulfilled"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                                : "border-primary/30 bg-accent text-accent-foreground hover:bg-accent"
                            )}
                          >
                            {request.status === "fulfilled" ? "Fulfilled" : "Open"}
                          </Badge>
                          <span className="ml-1 text-xs text-stone-400">
                            · {request.notifiedCount} notified
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {requests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-sm text-stone-500">
                          No requests match “{requestQuery}”.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="mt-4 text-xs text-stone-400">
        Donor trust is the product — use these records only for coordination,
        never spam. All records here are fictional demo data.
      </p>
    </div>
  );
}
