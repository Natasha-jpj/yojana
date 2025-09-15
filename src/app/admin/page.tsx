"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  RefreshCcw,
  Download,
  Search as SearchIcon,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from "lucide-react";

/* -----------------------------
   Types (updated to new schema)
----------------------------- */
type Experience = "romantic-escape" | "adventure-date" | "mystery-box" | "";
type Dining =
  | ""
  | "italian"
  | "asian"
  | "nepali-fusion"
  | "continental"
  | "surprise-me";
type BudgetRange = "" | "tbd" | "3k" | "5k" | "10k";

type Registration = {
  _id?: string;
  createdAt?: string;

  // 1) Date & Time
  startDateTime: string;
  endDateTime: string;

  // 2) Occasion
  occasion: "" | "birthday" | "anniversary" | "just-a-date" | "surprise-gift";

  // 3) Experience
  experience: Experience;

  // 4) Dining Preferences
  dining: Dining;

  // 5) Dietary Restrictions
  dietVeg: boolean;
  dietHalal: boolean;
  dietAllergies: string;

  // 6) Personal Touches
  flowers: boolean;
  cake: boolean;

  // 7) Budget
  budget: BudgetRange;

  // 8) Personal Note
  personalNote: string;

  // 9) Customer Details
  name: string;
  phone: string;
  email: string;
  emergencyContact: string;

  // Payment
  paymentConfirmed: boolean;
};

/* -----------------------------
   Theme / helpers
----------------------------- */
const bgUrl = "url('/background.jpg')";

function fmt(dt?: string | Date) {
  if (!dt) return "—";
  try {
    return new Date(dt as any).toLocaleString();
  } catch {
    return String(dt);
  }
}
function daysUntil(dt?: string) {
  if (!dt) return Infinity;
  const d = new Date(dt).getTime();
  const now = Date.now();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}
const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* -----------------------------
   Tiny toast card
----------------------------- */
type ToastType = "success" | "error" | "info";
function InlineToast({
  type,
  title,
  message,
  onClose,
}: {
  type: ToastType;
  title: string;
  message?: string;
  onClose: () => void;
}) {
  const base =
    "fixed bottom-6 right-6 z-[9999] rounded-xl px-4 py-3 shadow-2xl border backdrop-blur";
  const tone =
    type === "success"
      ? "bg-emerald-900/40 border-emerald-400/40 text-emerald-50"
      : type === "error"
      ? "bg-red-900/40 border-red-400/40 text-red-50"
      : "bg-stone-900/60 border-white/15 text-white";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className={`${base} ${tone}`}
      role="status"
    >
      <div className="font-semibold">{title}</div>
      {message ? <div className="text-sm opacity-90">{message}</div> : null}
      <div className="mt-2 text-right">
        <Button size="sm" variant="ghost" onClick={onClose} className="text-white">
          Close
        </Button>
      </div>
    </motion.div>
  );
}

/* -----------------------------
   Page
----------------------------- */
export default function AdminDashboard() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Controls
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "pending">(
    "all"
  );
  const [sortKey, setSortKey] = useState<"createdAt" | "startDateTime" | "name">(
    "createdAt"
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selected, setSelected] = useState<Registration | null>(null);

  // for email + delete flows
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // toast state
  const [toast, setToast] = useState<{
    type: ToastType;
    title: string;
    message?: string;
  } | null>(null);
  const showToast = (type: ToastType, title: string, message?: string) =>
    setToast({ type, title, message });

  // delete confirmation dialog state
  const [confirmReg, setConfirmReg] = useState<Registration | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  async function fetchRows() {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/yojana/registrations", { method: "GET" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to fetch");
      setRows((json?.data as Registration[]) || []);
    } catch (e: any) {
      setErrorMsg(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRows();
  }, []);

  // Derived / filtered
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = rows.slice();

    if (q) {
      list = list.filter((r) => {
        const hay =
          (
            [
              r.name,
              r.email,
              r.phone,
              r.occasion,
              r.experience,
              r.dining,
              r.budget,
              r.dietAllergies,
              r.emergencyContact,
              (r.personalNote || "").replace(/\r?\n/g, " "),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase() +
            ` ${fmt(r.startDateTime)} ${fmt(r.endDateTime)}`
          ).toString();
        return hay.includes(q);
      });
    }

    if (paymentFilter !== "all") {
      list = list.filter((r) =>
        paymentFilter === "paid" ? r.paymentConfirmed : !r.paymentConfirmed
      );
    }

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av =
        sortKey === "name"
          ? (a.name || "").toLowerCase()
          : new Date((a as any)[sortKey] || 0).getTime();
      const bv =
        sortKey === "name"
          ? (b.name || "").toLowerCase()
          : new Date((b as any)[sortKey] || 0).getTime();
      return av > bv ? dir : av < bv ? -dir : 0;
    });

    return list;
  }, [rows, query, paymentFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  // Stats
  const stats = useMemo(() => {
    const total = rows.length;
    const paid = rows.filter((r) => r.paymentConfirmed).length;
    const pending = total - paid;
    const in7 = rows.filter((r) => daysUntil(r.startDateTime) <= 7).length;
    return { total, paid, pending, in7 };
  }, [rows]);

  function toggleSort(k: typeof sortKey) {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  }

  function exportCSV() {
    const cols = [
      "_id",
      "createdAt",
      "name",
      "email",
      "phone",
      "emergencyContact",
      "startDateTime",
      "endDateTime",
      "occasion",
      "experience",
      "dining",
      "dietVeg",
      "dietHalal",
      "dietAllergies",
      "flowers",
      "cake",
      "budget",
      "personalNote",
      "paymentConfirmed",
    ];
    const header = cols.join(",");
    const lines = filtered.map((r) =>
      [
        r._id || "",
        r.createdAt || "",
        r.name,
        r.email,
        r.phone,
        r.emergencyContact || "",
        r.startDateTime,
        r.endDateTime,
        r.occasion,
        r.experience,
        r.dining,
        r.dietVeg,
        r.dietHalal,
        r.dietAllergies || "",
        r.flowers,
        r.cake,
        r.budget,
        (r.personalNote || "").replace(/\r?\n/g, " "),
        r.paymentConfirmed,
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yojana_registrations_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Email confirmation (toast for success/error)
  async function sendPlanEmail(r: Registration) {
    if (!r.email) {
      showToast("error", "No email", "This entry has no email address.");
      return;
    }
    const rowKey = r._id || r.email;
    setSendingId(rowKey);

    try {
      const subject = "We received your Yojana form";
      const html = `
<div style="font-family:Inter,system-ui,Segoe UI,Arial; color:#111; line-height:1.55">
  <p>Hi ${escapeHtml(r.name || "there")},</p>
  <p>Thanks for submitting your <b>Yojana</b> date request. This is a quick confirmation that we’ve received your form.</p>
  <p><b>Requested time window:</b><br/>${fmt(r.startDateTime)} → ${fmt(r.endDateTime)}</p>
  <p style="margin-top:16px">— Yojana Team</p>
</div>`.trim();

      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: r.email, subject, html }),
      });

      const j = await res.json();
      if (!res.ok || !j?.ok) throw new Error(j?.error || "Email failed");
      showToast("success", "Email sent", `Confirmation email sent to ${r.email}.`);
    } catch (e: any) {
      showToast("error", "Email failed", e?.message || "Could not send email.");
    } finally {
      setSendingId(null);
    }
  }

  // Delete — confirmed via custom dialog
  async function confirmDelete() {
    if (!confirmReg?._id) {
      setConfirmReg(null);
      return;
    }
    try {
      setConfirmBusy(true);
      setDeletingId(confirmReg._id);
      const res = await fetch(`/api/yojana/registrations/${confirmReg._id}`, {
        method: "DELETE",
      });
      const j = await res.json();
      if (!res.ok || !j?.success) throw new Error(j?.error || "Delete failed");
      setRows((prev) => prev.filter((x) => x._id !== confirmReg._id));
      showToast("success", "Deleted", "The registration has been removed.");
    } catch (e: any) {
      showToast("error", "Delete failed", e?.message || "Something went wrong.");
    } finally {
      setConfirmBusy(false);
      setDeletingId(null);
      setConfirmReg(null);
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: bgUrl }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-stone-900/55 to-yellow-900/25" />

      <div className="relative z-10 px-4 py-10 sm:p-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Admin — Yojana Registrations
          </h1>
          <p className="text-white/80 mt-2">
            View, search, filter, sort, email, delete and export submissions.
          </p>
        </motion.div>

        {/* Controls */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-xl text-white mb-4">
          <CardContent className="pt-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search name, email, phone, occasion, dining, budget…"
                    className="pl-9 bg-white/10 border-white/25 text-white placeholder:text-white/60 focus-visible:ring-amber-400"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center lg:justify-end">
                <Select
                  value={paymentFilter}
                  onValueChange={(v: "all" | "paid" | "pending") => {
                    setPaymentFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[150px] bg-white/10 border-white/25 text-white">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900/95 border-white/10 text-white">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortKey}
                  onValueChange={(v: "createdAt" | "startDateTime" | "name") => {
                    setSortKey(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[150px] bg-white/10 border-white/25 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900/95 border-white/10 text-white">
                    <SelectItem value="createdAt">Created</SelectItem>
                    <SelectItem value="startDateTime">Start</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={sortDir}
                  onValueChange={(v: "asc" | "desc") => {
                    setSortDir(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[110px] bg-white/10 border-white/25 text-white">
                    <div className="flex items-center gap-1">
                      {sortDir === "asc" ? (
                        <ArrowUpNarrowWide className="h-4 w-4" />
                      ) : (
                        <ArrowDownWideNarrow className="h-4 w-4" />
                      )}
                      <SelectValue placeholder="Order" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900/95 border-white/10 text-white">
                    <SelectItem value="asc">Asc</SelectItem>
                    <SelectItem value="desc">Desc</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => {
                    setPageSize(Number(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[100px] bg-white/10 border-white/25 text-white">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent className="bg-stone-900/95 border-white/10 text-white">
                    {[10, 20, 50, 100].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={fetchRows}
                  className="bg-amber-600 hover:bg-amber-700 rounded-full px-4"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={exportCSV}
                  variant="outline"
                  className="rounded-full px-4 border-amber-500/60 text-amber-100 hover:bg-amber-500/20"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/70">Total</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-gradient-to-br from-amber-600/30 to-amber-400/20 border-white/20 backdrop-blur text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/80">Paid</CardDescription>
              <CardTitle className="text-3xl">{stats.paid}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/70">Pending</CardDescription>
              <CardTitle className="text-3xl">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/10 border-white/20 backdrop-blur text-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-white/70">
                In next 7 days
              </CardDescription>
              <CardTitle className="text-3xl">{stats.in7}</CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Table/Card list */}
        <Card className="bg-white/10 border-white/20 backdrop-blur text-white">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl">All registrations</CardTitle>
            <CardDescription className="text-white/70">
              {loading
                ? "Loading…"
                : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
              {errorMsg ? ` • ${errorMsg}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {/* MOBILE — cards */}
            <div className="md:hidden space-y-3">
              {loading && (
                <div className="rounded-xl bg-white/10 border border-white/20 p-4 animate-pulse h-24" />
              )}
              {!loading && pageRows.length === 0 && (
                <div className="rounded-xl bg-white/10 border border-white/20 p-4 text-white/80">
                  No results.
                </div>
              )}
              {!loading &&
                pageRows.map((r) => {
                  const rowKey =
                    r._id || `${r.name}-${r.email}-${r.startDateTime}`;
                  return (
                    <div
                      key={rowKey}
                      className="rounded-xl bg-white/10 border border-white/20 p-4 backdrop-blur"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">
                            {r.name || "—"}
                          </div>
                          <div className="mt-2 text-xs text-white/70">
                            <div>📧 {r.email || "—"}</div>
                            <div>📱 {r.phone || "—"}</div>
                          </div>
                        </div>
                        <span
                          className={
                            "px-2 py-1 rounded-full text-[11px] whitespace-nowrap " +
                            (r.paymentConfirmed
                              ? "bg-amber-600/30 border border-amber-500/70"
                              : "bg-white/10 border border-white/20")
                          }
                        >
                          {r.paymentConfirmed ? "Paid" : "Pending"}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/80">
                        <div className="rounded-lg bg-white/10 border border-white/20 p-2">
                          <div className="text-white/60 mb-1">Start</div>
                          <div className="font-medium">
                            {fmt(r.startDateTime)}
                          </div>
                        </div>
                        <div className="rounded-lg bg-white/10 border border-white/20 p-2">
                          <div className="text-white/60 mb-1">End</div>
                          <div className="font-medium">
                            {fmt(r.endDateTime)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-white/80 space-y-1">
                        <div>
                          <span className="text-white/60">Occasion:</span>{" "}
                          {r.occasion || "—"}
                        </div>
                        <div>
                          <span className="text-white/60">Experience:</span>{" "}
                          {r.experience || "—"}
                        </div>
                        <div>
                          <span className="text-white/60">Dining:</span>{" "}
                          {r.dining || "—"}
                        </div>
                        <div>
                          <span className="text-white/60">Diet:</span>{" "}
                          {[
                            r.dietVeg ? "Veg" : "",
                            r.dietHalal ? "Halal" : "",
                            r.dietAllergies
                              ? `Allergies: ${r.dietAllergies}`
                              : "",
                          ]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </div>
                        <div>
                          <span className="text-white/60">Touches:</span>{" "}
                          {[r.flowers ? "Flowers" : "", r.cake ? "Cake" : ""]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </div>
                        <div>
                          <span className="text-white/60">Budget:</span>{" "}
                          {r.budget || "—"}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelected(r)}
                          className="rounded-full px-4 py-2 bg-gradient-to-r from-amber-600 to-stone-600 text-white text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => sendPlanEmail(r)}
                          disabled={sendingId === rowKey}
                          className="rounded-full px-4 py-2 border border-amber-500/50 bg-amber-500/20 text-amber-100 text-sm disabled:opacity-60"
                        >
                          {sendingId === rowKey ? "Sending…" : "Send"}
                        </button>
                        <button
                          onClick={() => setConfirmReg(r)}
                          disabled={deletingId === r._id || !r._id}
                          className="rounded-full px-4 py-2 bg-red-900/85 hover:bg-red-800 text-white text-sm disabled:opacity-60"
                        >
                          {deletingId === r._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* DESKTOP/TABLET — table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-white/80">
                  <tr className="border-b border-white/10">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th
                      className="py-3 pr-4 cursor-pointer"
                      onClick={() => toggleSort("startDateTime")}
                    >
                      Start
                    </th>
                    <th className="py-3 pr-4">End</th>
                    <th className="py-3 pr-4">Payment</th>
                    <th className="py-3 pr-4 hidden xl:table-cell">
                      Occasion / Experience
                    </th>
                    <th className="py-3 pr-4 hidden lg:table-cell">
                      Dining / Budget
                    </th>
                    <th className="py-3 pr-4 hidden xl:table-cell">
                      Diet / Touches
                    </th>
                    <th
                      className="py-3 pr-4 cursor-pointer hidden md:table-cell"
                      onClick={() => toggleSort("createdAt")}
                    >
                      Created
                    </th>
                    <th className="py-3 pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && pageRows.length === 0 && (
                    <tr>
                      <td className="py-6 text-white/70" colSpan={11}>
                        No results.
                      </td>
                    </tr>
                  )}

                  {loading &&
                    Array.from({ length: pageSize }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3 pr-4">
                          <div className="h-4 w-40 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-4">
                          <div className="h-4 w-48 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-4">
                          <div className="h-4 w-32 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-4">
                          <div className="h-4 w-40 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-4">
                          <div className="h-4 w-40 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-4">
                          <div className="h-4 w-24 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-4 hidden xl:table-cell">
                          <div className="h-4 w-56 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-4 hidden lg:table-cell">
                          <div className="h-4 w-56 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-4 hidden xl:table-cell">
                          <div className="h-4 w-56 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-4 hidden md:table-cell">
                          <div className="h-4 w-36 bg-white/20 rounded" />
                        </td>
                        <td className="py-3 pr-2">
                          <div className="h-8 w-28 bg-white/20 rounded" />
                        </td>
                      </tr>
                    ))}

                  {!loading &&
                    pageRows.map((r) => {
                      const rowKey =
                        r._id || `${r.name}-${r.email}-${r.startDateTime}`;
                      return (
                        <tr
                          key={rowKey}
                          className="border-t border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 pr-4">
                            <div className="font-medium">{r.name || "—"}</div>
                          </td>
                          <td className="py-3 pr-4">{r.email || "—"}</td>
                          <td className="py-3 pr-4">{r.phone || "—"}</td>

                          <td className="py-3 pr-4">{fmt(r.startDateTime)}</td>
                          <td className="py-3 pr-4">{fmt(r.endDateTime)}</td>

                          <td className="py-3 pr-4">
                            <span
                              className={
                                "px-2 py-1 rounded-full text-xs " +
                                (r.paymentConfirmed
                                  ? "bg-amber-600/30 border border-amber-500/70"
                                  : "bg-white/10 border border-white/20")
                              }
                            >
                              {r.paymentConfirmed ? "Paid" : "Pending"}
                            </span>
                          </td>

                          <td className="py-3 pr-4 hidden xl:table-cell">
                            <div className="text-white/90">
                              {r.occasion || "—"}
                            </div>
                            <div className="text-white/70 text-xs">
                              {r.experience || "—"}
                            </div>
                          </td>

                          <td className="py-3 pr-4 hidden lg:table-cell">
                            <div className="text-white/90">
                              {r.dining || "—"}
                            </div>
                            <div className="text-white/70 text-xs">
                              {r.budget
                                ? r.budget === "tbd"
                                  ? "TBD"
                                  : `₨${r.budget.replace("k", "000")}`
                                : "—"}
                            </div>
                          </td>

                          <td className="py-3 pr-4 hidden xl:table-cell">
                            <div className="text-white/90">
                              {[r.dietVeg ? "Veg" : "", r.dietHalal ? "Halal" : ""]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </div>
                            <div className="text-white/70 text-xs">
                              {r.dietAllergies
                                ? `Allergies: ${r.dietAllergies}`
                                : "—"}
                            </div>
                            <div className="text-white/70 text-xs">
                              {[r.flowers ? "Flowers" : "", r.cake ? "Cake" : ""]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </div>
                          </td>

                          <td className="py-3 pr-4 hidden md:table-cell">
                            {fmt(r.createdAt)}
                          </td>

                          <td className="py-3 pr-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-amber-600 to-stone-600 hover:from-amber-700 hover:to-stone-700 rounded-full"
                                onClick={() => setSelected(r)}
                              >
                                View
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                disabled={sendingId === rowKey}
                                onClick={() => sendPlanEmail(r)}
                                className="rounded-full border-amber-500/50 text-amber-100 bg-amber-500/20"
                              >
                                {sendingId === rowKey ? "Sending…" : "Send"}
                              </Button>

                              <Button
                                size="sm"
                                onClick={() => setConfirmReg(r)}
                                disabled={deletingId === r._id || !r._id}
                                className="rounded-full bg-red-900/85 hover:bg-red-800 text-white"
                                title="Delete this registration"
                              >
                                {deletingId === r._id ? "Deleting…" : "Delete"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 text-sm">
                <div className="text-white/70">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration details</DialogTitle>
            <DialogDescription>Full information for this submission.</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold">Name</div>
                <div>{selected.name || "—"}</div>
              </div>
              <div>
                <div className="font-semibold">Email</div>
                <div>{selected.email || "—"}</div>
              </div>

              <div>
                <div className="font-semibold">Phone</div>
                <div>{selected.phone || "—"}</div>
              </div>
              <div>
                <div className="font-semibold">Emergency Contact</div>
                <div>{selected.emergencyContact || "—"}</div>
              </div>

              <div>
                <div className="font-semibold">Start</div>
                <div>{fmt(selected.startDateTime)}</div>
              </div>
              <div>
                <div className="font-semibold">End</div>
                <div>{fmt(selected.endDateTime)}</div>
              </div>

              <div>
                <div className="font-semibold">Occasion</div>
                <div>{selected.occasion || "—"}</div>
              </div>
              <div>
                <div className="font-semibold">Experience</div>
                <div>{selected.experience || "—"}</div>
              </div>

              <div>
                <div className="font-semibold">Dining</div>
                <div>{selected.dining || "—"}</div>
              </div>
              <div>
                <div className="font-semibold">Budget</div>
                <div>
                  {selected.budget
                    ? selected.budget === "tbd"
                      ? "TBD"
                      : `₨${selected.budget.replace("k", "000")}`
                    : "—"}
                </div>
              </div>

              <div>
                <div className="font-semibold">Diet</div>
                <div>
                  {[selected.dietVeg ? "Veg" : "", selected.dietHalal ? "Halal" : ""]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
              </div>
              <div>
                <div className="font-semibold">Allergies</div>
                <div>{selected.dietAllergies || "—"}</div>
              </div>

              <div>
                <div className="font-semibold">Flowers</div>
                <div>{selected.flowers ? "Yes" : "No"}</div>
              </div>
              <div>
                <div className="font-semibold">Cake</div>
                <div>{selected.cake ? "Yes" : "No"}</div>
              </div>

              <div className="sm:col-span-2">
                <div className="font-semibold">Personal Note</div>
                <div className="whitespace-pre-wrap break-words">
                  {selected.personalNote || "—"}
                </div>
              </div>

              <div>
                <div className="font-semibold">Payment</div>
                <div>{selected.paymentConfirmed ? "Paid" : "Pending"}</div>
              </div>
              <div>
                <div className="font-semibold">Created</div>
                <div>{fmt(selected.createdAt)}</div>
              </div>

              <div className="sm:col-span-2">
                <div className="font-semibold">ID</div>
                <div className="break-all">{selected._id || "—"}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!confirmReg}
        onOpenChange={(open) => {
          if (!open && !confirmBusy) setConfirmReg(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete “{confirmReg?.name || "this entry"}”?
            </DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmReg(null)}
              disabled={confirmBusy}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={confirmBusy}
              className="bg-red-600 hover:bg-red-700"
            >
              {confirmBusy ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast */}
      {toast ? (
        <InlineToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
