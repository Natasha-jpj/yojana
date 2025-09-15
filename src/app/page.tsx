"use client";

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/* ================= Types ================= */
type Experience = "romantic-escape" | "adventure-date" | "mystery-box" | "";
type Dining =
  | ""
  | "italian"
  | "asian"
  | "nepali-fusion"
  | "continental"
  | "surprise-me";
type BudgetRange = "" | "tbd" | "3k" | "5k" | "10k";
type FormState = {
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

const initialState: FormState = {
  startDateTime: "",
  endDateTime: "",
  occasion: "",
  experience: "",
  dining: "",
  dietVeg: false,
  dietHalal: false,
  dietAllergies: "",
  flowers: false,
  cake: false,
  budget: "",
  personalNote: "",
  name: "",
  phone: "",
  email: "",
  emergencyContact: "",
  paymentConfirmed: false,
};

/* ================ Steps (fixed) ================ */
// Intro CTA (Home page with big button)
const INTRO = -1;

// 1–9: the nine points
const STEP_DATETIME = 0;       // Date & Time
const STEP_OCCASION = 1;       // Occasion
const STEP_EXPERIENCE = 2;     // Pick your adventure
const STEP_DINING = 3;         // Dining preferences
const STEP_DIET = 4;           // Dietary restrictions
const STEP_TOUCHES = 5;        // Personal touches
const STEP_BUDGET = 6;         // Budget
const STEP_NOTE = 7;           // Personal note
const STEP_CONTACT = 8;        // Customer details

// Payment & confirmation page
const STEP_PAYMENT = 9;        // Payment (QR) & confirm
const STEP_SUMMARY = 10;       // Confirmation message

/* ================ Animations ================ */
const container = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      ease: [0.25, 0.1, 0.25, 1] as const,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
} satisfies Variants;

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, damping: 12, stiffness: 200 },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
} satisfies Variants;

const floatingHearts = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
  },
} satisfies Variants;

const pulseGlow = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(214, 162, 105, 0.7)",
      "0 0 0 10px rgba(214, 162, 105, 0)",
      "0 0 0 0 rgba(214, 162, 105, 0)",
    ],
    transition: { duration: 2, repeat: Infinity },
  },
} satisfies Variants;

/* ================ Shared UI ================ */
const bgUrl = "url('/background.jpg')";

function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={[
        "px-4 py-2 rounded-full border backdrop-blur",
        active
          ? "bg-amber-500/30 border-amber-400 text-white shadow-lg"
          : "bg-white/15 border-white/30 text-white/90 hover:bg-white/25",
        "transition-all duration-300 shadow-sm",
      ].join(" ")}
    >
      {children}
    </motion.button>
  );
}

function ChoiceCard({
  id,
  label,
  value,
  checked,
  onChange,
  subtitle,
  emoji,
}: {
  id: string;
  label: string;
  subtitle?: string;
  emoji?: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <motion.label
      htmlFor={id}
      className="cursor-pointer w-full"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className={[
          "rounded-2xl border p-4 sm:p-5 backdrop-blur",
          checked
            ? "border-amber-400 bg-gradient-to-r from-amber-500/25 to-stone-500/15 shadow-lg"
            : "border-white/30 bg-white/15 hover:bg-white/25",
          "transition-all duration-300 flex items-center gap-4",
        ].join(" ")}
        onClick={() => onChange(value)}
      >
        <motion.div
          className="text-2xl"
          animate={checked ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          {emoji}
        </motion.div>
        <div className="flex-1">
          <div className="font-semibold text-white">{label}</div>
          {subtitle ? (
            <div className="text-sm text-white/80">{subtitle}</div>
          ) : null}
        </div>
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center"
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
        <RadioGroupItem id={id} value={value} checked={checked} className="hidden" />
      </div>
    </motion.label>
  );
}

function FloatingHearts() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-amber-400/30 text-2xl pointer-events-none"
          style={{ left: `${10 + i * 20}%`, top: `${20 + Math.random() * 60}%` }}
          variants={floatingHearts}
          initial="animate"
          animate="animate"
        >
          ❤️
        </motion.div>
      ))}
    </>
  );
}

function SupportFab() {
  const [open, setOpen] = useState(false);

  const EMAIL = "yojana12@gmail.com";
  const PHONE_DISPLAY = "+977 9864243870";
  const TEL = "+977 9864243870";

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-5 right-5 z-[9998] rounded-full px-4 py-3
                   bg-white/15 border border-white/30 text-white backdrop-blur
                   shadow-lg hover:bg-white/25 transition-colors"
        aria-label="Contact & support"
      >
        <span className="hidden sm:inline mr-2">Need help?</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-20 right-5 z-[9998] w-[min(92vw,320px)]"
          >
            <div className="rounded-2xl p-4 bg-white/12 border border-white/25
                            backdrop-blur-xl shadow-2xl text-white">
              <div className="font-semibold">Contact & Support</div>
              <p className="text-white/80 text-sm mt-1 mb-3">
                Questions or special requests? We’d love to help.
              </p>

              <div className="flex flex-col gap-2">
                <a
                  href={`mailto:${EMAIL}`}
                  className="w-full rounded-full px-3 py-2 bg-amber-500/20
                             border border-amber-400/40 hover:bg-amber-500/30
                             transition text-white text-sm"
                >
                  Email us - {EMAIL}
                </a>

                <a
                  href={`tel:${TEL}`}
                  className="w-full rounded-full px-3 py-2 bg-white/10
                             border border-white/25 hover:bg-white/20
                             transition text-white text-sm"
                >
                  Call us - {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ================ Page ================ */
export default function RegisterQnA() {
  const [step, setStep] = useState<number>(INTRO);
  const [data, setData] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get("start") === "1") {
      setStep(STEP_DATETIME);
      try { window.scrollTo(0, 0); } catch {}
      router.replace("/");
    }
  }, [searchParams, router]);

  const flowSteps = [
    STEP_DATETIME,
    STEP_OCCASION,
    STEP_EXPERIENCE,
    STEP_DINING,
    STEP_DIET,
    STEP_TOUCHES,
    STEP_BUDGET,
    STEP_NOTE,
    STEP_CONTACT,
    STEP_PAYMENT,
    STEP_SUMMARY,
  ];

  const canNext = useMemo(() => {
    switch (step) {
      case STEP_DATETIME: {
        if (!data.startDateTime || !data.endDateTime) return false;
        const s = new Date(data.startDateTime).getTime();
        const e = new Date(data.endDateTime).getTime();
        return !Number.isNaN(s) && !Number.isNaN(e) && e > s;
      }
      case STEP_OCCASION:
        return data.occasion !== "";
      case STEP_EXPERIENCE:
        return data.experience !== "";
      case STEP_DINING:
        return data.dining !== "";
      case STEP_DIET:
        return true; // optional allergies/toggles
      case STEP_TOUCHES:
        return true; // optional
      case STEP_BUDGET:
        return data.budget !== "";
      case STEP_NOTE:
        return true; // optional
      case STEP_CONTACT: {
        const emailOk = /\S+@\S+\.\S+/.test(data.email);
        const digits = (data.phone || "").replace(/\D/g, "");
        return data.name.trim().length >= 2 && emailOk && digits.length >= 7;
      }
      case STEP_PAYMENT:
        return data.paymentConfirmed === true;
      case STEP_SUMMARY:
        return true;
      default:
        return true;
    }
  }, [step, data]);

  function next() {
    if (!canNext) return;
    const idx = flowSteps.indexOf(step);
    if (idx >= 0 && idx < flowSteps.length - 1) setStep(flowSteps[idx + 1]);
  }
  function back() {
    const idx = flowSteps.indexOf(step);
    if (idx > 0) setStep(flowSteps[idx - 1]);
  }

  async function submit() {
    try {
      setIsSubmitting(true);
      const payload = {
        ...data,
        startDateTime: new Date(data.startDateTime).toISOString(),
        endDateTime: new Date(data.endDateTime).toISOString(),
      };
      const res = await fetch("/api/yojana/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");

      if (typeof window !== "undefined") {
        // const confetti = await import("canvas-confetti");
        // confetti.default({
        //   particleCount: 180,
        //   spread: 75,
        //   startVelocity: 35,
        //   gravity: 0.9,
        //   origin: { y: 0.6 },
        //   colors: ["#d4af37", "#f2e8cf", "#b88b5a", "#8b5e34", "#fde4cf"],
        // });
      }
      setShowPopup(true);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ===== Titles & Descriptions aligned to spec ===== */
  function titleOf(st: number) {
    switch (st) {
      case INTRO: return "यो-jana Turning stories into dates";
      case STEP_DATETIME: return "Date & Time";
      case STEP_OCCASION: return "Occasion";
      case STEP_EXPERIENCE: return "Pick your adventure";
      case STEP_DINING: return "What’s on the menu?";
      case STEP_DIET: return "Any dietary preferences or allergies?";
      case STEP_TOUCHES: return "Should we add something special?";
      case STEP_BUDGET: return "What’s your comfort zone?";
      case STEP_NOTE: return "Write a secret message (optional)";
      case STEP_CONTACT: return "Customer Details";
      case STEP_PAYMENT: return "Payment & Confirmation";
      case STEP_SUMMARY: return "Your Yojana is set ✨";
      default: return "";
    }
  }
  function descOf(st: number) {
    switch (st) {
      case INTRO:
        return "यो-jana Turning stories into dates.";
      case STEP_DATETIME:
        return "Select when you want the experience to happen.";
      case STEP_OCCASION:
        return "Birthday, anniversary, just a date, or a surprise gift.";
      case STEP_EXPERIENCE:
        return "Romantic escape, Adventure date, or Mystery box.";
      case STEP_DINING:
        return "Italian, Asian, Nepali fusion, Continental, or Surprise me.";
      case STEP_DIET:
        return "Toggle Veg/Halal and note allergies if any.";
      case STEP_TOUCHES:
        return "Choose flowers and cake if you like.";
      case STEP_BUDGET:
        return "Pick TBD or a comfortable range.";
      case STEP_NOTE:
        return "We’ll seal this inside a Yojana envelope.";
      case STEP_CONTACT:
        return "We’ll use these to coordinate and confirm.";
      case STEP_PAYMENT:
        return "Scan the QR to pay, then confirm below.";
      case STEP_SUMMARY:
        return "The mystery unfolds on your selected date.";
      default:
        return "";
    }
  }

  const currentIndex = Math.max(flowSteps.indexOf(step), 0);
  const pct = Math.round(((currentIndex + 1) / (flowSteps.length + 1)) * 100);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
      style={{ backgroundImage: bgUrl }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-stone-900/55 to-yellow-900/25" />

      <FloatingHearts />

      {/* Intro (Home page style with Big Button: Plan my date) */}
      {step === INTRO && (
        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-2xl"
          >
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white drop-shadow">
              योjana - Turning stories into dates
            </h1>
            <p className="mt-4 text-stone-100/85">
              Craft your date vibe — quick, warm, and a touch of gold.
            </p>
            <motion.div className="mt-8 inline-flex" whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => { setStep(STEP_DATETIME); try { window?.scrollTo?.(0,0); } catch {} }}
                className="rounded-full px-8 py-6 text-base bg-gradient-to-r from-yellow-500 via-yellow-600 to-amber-600 hover:from-yellow-900 hover:via-yellow-500 hover:to-amber-600 text-black font-semibold shadow-[0_10px_30px_rgba(212,175,55,0.25)]"
              >
                Plan my date
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Flow */}
      {step !== INTRO && (
        <div className="relative z-10 px-4 py-10 sm:p-10 flex items-center justify-center min-h-screen">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="w-full max-w-3xl">
            {/* Header / Progress */}
            <div className="mb-6 sm:mb-8 flex flex-col gap-3">
              <motion.h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                यो-jana — craft your date vibe
              </motion.h1>
              <motion.p className="text-white/80 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                Follow the simple steps to lock your perfect plan.
              </motion.p>

              <motion.div className="h-2 w-full rounded-full bg-white/20 overflow-hidden mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <motion.div className="h-2 bg-gradient-to-r from-amber-600 to-stone-500" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
              </motion.div>
              <div className="text-white/75 text-sm text-center">{pct}% complete</div>
            </div>

            <motion.div variants={pulseGlow} animate="animate">
              <Card className="bg-white/10 border-white/30 backdrop-blur-2xl text-white rounded-3xl shadow-2xl overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="text-2xl text-center">{titleOf(step)}</CardTitle>
                  <CardDescription className="text-white/70 text-center">{descOf(step)}</CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <AnimatePresence mode="wait">
                    <motion.div key={step} variants={container} initial="hidden" animate="show" exit="exit" className="space-y-6">

                      {/* 1) Date & Time */}
                      {step === STEP_DATETIME && (
                        <motion.div variants={item} className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white/90">Start (from)</Label>
                            <Input
                              type="datetime-local"
                              value={data.startDateTime}
                              onChange={(e) => setData((d) => ({ ...d, startDateTime: e.target.value }))}
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/90">End (to)</Label>
                            <Input
                              type="datetime-local"
                              value={data.endDateTime}
                              onChange={(e) => setData((d) => ({ ...d, endDateTime: e.target.value }))}
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* 2) Occasion */}
                      {step === STEP_OCCASION && (
                        <motion.div variants={item} className="flex gap-3 flex-wrap justify-center">
                          {([
                            ["birthday", "Birthday 🎂"],
                            ["anniversary", "Anniversary 💍"],
                            ["just-a-date", "Just a Date ❤️"],
                            ["surprise-gift", "Surprise Gift 🎁"],
                          ] as const).map(([val, label]) => (
                            <Chip key={val} active={data.occasion === val} onClick={() => setData((d) => ({ ...d, occasion: val as FormState["occasion"] }))}>
                              {label}
                            </Chip>
                          ))}
                        </motion.div>
                      )}

                      {/* 3) Experience */}
                      {step === STEP_EXPERIENCE && (
                        <motion.div variants={item} className="flex gap-3 flex-wrap justify-center">
                          {([
                            ["romantic-escape", "Romantic escape 💖"],
                            ["adventure-date", "Adventure date 🏞️"],
                            ["mystery-box", "Mystery box ✨"],
                          ] as const).map(([val, label]) => (
                            <Chip key={val} active={data.experience === val} onClick={() => setData((d) => ({ ...d, experience: val as Experience }))}>
                              {label}
                            </Chip>
                          ))}
                        </motion.div>
                      )}

                      {/* 4) Dining Preferences */}
                      {step === STEP_DINING && (
                        <motion.div variants={item} className="flex gap-3 flex-wrap justify-center">
                          {([
                            ["italian", "Italian 🍝"],
                            ["asian", "Asian 🍜"],
                            ["nepali-fusion", "Nepali fusion 🍛"],
                            ["continental", "Continental 🥗"],
                            ["surprise-me", "Surprise me 🎁"],
                          ] as const).map(([val, label]) => (
                            <Chip key={val} active={data.dining === val} onClick={() => setData((d) => ({ ...d, dining: val as Dining }))}>
                              {label}
                            </Chip>
                          ))}
                        </motion.div>
                      )}

                      {/* 5) Dietary Restrictions */}
                      {step === STEP_DIET && (
                        <motion.div variants={item} className="space-y-4">
                          <div className="flex gap-3 flex-wrap justify-center">
                            <Chip active={data.dietVeg} onClick={() => setData((d) => ({ ...d, dietVeg: !d.dietVeg }))}>Veg ✅</Chip>
                            <Chip active={data.dietHalal} onClick={() => setData((d) => ({ ...d, dietHalal: !d.dietHalal }))}>Halal ✅</Chip>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/90">Allergies (optional)</Label>
                            <Input
                              placeholder="e.g., peanuts, shellfish"
                              value={data.dietAllergies}
                              onChange={(e) => setData((d) => ({ ...d, dietAllergies: e.target.value }))}
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* 6) Personal Touches */}
                      {step === STEP_TOUCHES && (
                        <motion.div variants={item} className="flex gap-3 flex-wrap justify-center">
                          <Chip active={data.flowers} onClick={() => setData((d) => ({ ...d, flowers: !d.flowers }))}>Flowers 🌷</Chip>
                          <Chip active={data.cake} onClick={() => setData((d) => ({ ...d, cake: !d.cake }))}>Cake 🎂</Chip>
                        </motion.div>
                      )}

                      {/* 7) Budget */}
             {step === STEP_BUDGET && (
  <motion.div variants={item} className="flex gap-3 flex-wrap justify-center">
    {(
      [
        ["tbd", "To be decided"],
        ["3k", "₨3,000"],
        ["5k", "₨5,000"],
        ["10k", "₨10,000"],
      ] as const
    ).map(([val, label]) => (
      <Chip
        key={val}
        active={data.budget === val}
        onClick={() => setData((d) => ({ ...d, budget: val as BudgetRange }))}
      >
        {label}
      </Chip>
    ))}
  </motion.div>
)}


                      {/* 8) Personal Note */}
                      {step === STEP_NOTE && (
                        <motion.div variants={item} className="space-y-2">
                          <Label className="text-white/90">Personal Note (we’ll seal it in a Yojana envelope)</Label>
                          <textarea
                            rows={4}
                            placeholder="Write a secret message for your partner…"
                            value={data.personalNote}
                            onChange={(e) => setData((d) => ({ ...d, personalNote: e.target.value }))}
                            className="w-full rounded-xl bg-white/10 border border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-amber-400 p-3"
                          />
                        </motion.div>
                      )}

                      {/* 9) Customer Details */}
                      {step === STEP_CONTACT && (
                        <motion.div variants={item} className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white/90">Name</Label>
                            <Input
                              placeholder="Your full name"
                              value={data.name}
                              onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/90">Phone</Label>
                            <Input
                              type="tel"
                              placeholder="+977 98xxxxxxx"
                              value={data.phone}
                              onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/90">Email</Label>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              value={data.email}
                              onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white/90">Emergency contact (optional)</Label>
                            <Input
                              type="tel"
                              placeholder="+977 98xxxxxxx"
                              value={data.emergencyContact}
                              onChange={(e) => setData((d) => ({ ...d, emergencyContact: e.target.value }))}
                              className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-amber-400"
                            />
                          </div>
                        </motion.div>
                      )}

                      {/* Payment (QR) */}
                      {step === STEP_PAYMENT && (
                        <motion.div variants={item} className="space-y-4">
                          <div className="rounded-2xl border border-white/30 bg-white/10 p-4 backdrop-blur">
                            <div className="font-semibold mb-2 text-center">Scan to pay (QR)</div>
                            <div className="flex items-center justify-center">
                              <img
                                src="/qr.png"
                                alt="Payment QR"
                                className="w-40 h-40 rounded-xl border border-white/30 bg-white/5 object-contain"
                              />
                            </div>
                            <p className="text-xs text-white/70 text-center mt-2">
                              After completing payment, tap “I’ve paid”.
                            </p>
                          </div>
                          <div className="flex justify-center">
                            <Chip
                              active={data.paymentConfirmed}
                              onClick={() => setData((d) => ({ ...d, paymentConfirmed: !d.paymentConfirmed }))}
                            >
                              I’ve paid ✅
                            </Chip>
                          </div>
                        </motion.div>
                      )}

                      {/* Confirmation Page */}
                      {step === STEP_SUMMARY && (
                        <motion.div variants={item} className="space-y-5">
                          <motion.div
                            className="rounded-2xl border border-white/30 bg-gradient-to-b from-amber-500/10 to-stone-500/10 p-5 backdrop-blur"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                          >
                            <div className="font-semibold mb-3 text-center text-lg">
                              Your Yojana is set ✨
                            </div>
                            <p className="text-white/85 text-center">
                              The mystery unfolds on{" "}
                              <strong>
                                {new Date(data.startDateTime).toLocaleString()}
                              </strong>
                              . (A glowing envelope opens slightly…)
                            </p>
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Nav */}
                  <div className="mt-8 flex items-center justify-between">
                    <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={back}
                        disabled={step === STEP_DATETIME}
                        className="text-white hover:bg-white/15 hover:text-white disabled:opacity-40 rounded-full px-6"
                      >
                        ← Back
                      </Button>
                    </motion.div>

                    {step < STEP_SUMMARY ? (
                      <motion.div whileHover={{ scale: canNext ? 1.05 : 1 }} whileTap={{ scale: canNext ? 0.95 : 1 }}>
                        <Button
                          type="button"
                          onClick={() => (step === STEP_PAYMENT ? submit() : next())}
                          disabled={!canNext}
                          className="bg-gradient-to-r from-amber-600 to-stone-600 hover:from-amber-700 hover:to-stone-700 disabled:opacity-50 rounded-full px-8 shadow-lg"
                        >
                          {step === STEP_PAYMENT ? "Finish →" : "Next →"}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          type="button"
                          onClick={() => setShowPopup(true)}
                          className="bg-gradient-to-r from-amber-700 to-stone-700 hover:from-amber-800 hover:to-stone-800 rounded-full px-8 shadow-lg"
                        >
                          Done
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Success Popup */}
      {/* Success Popup */}
{/* Success Popup */}
{/* Success Popup */}
{/* Success Popup */}
<AnimatePresence>
  {showPopup && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-[340px] h-[220px]"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Envelope body (decorative) */}
        <div
          className="absolute inset-0 rounded-md border shadow-lg z-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, #fffdf8, #f6e7c9)",
            borderColor: "rgba(184,139,90,0.5)",
          }}
        />

        {/* Inner letter / content (interactive) */}
        <motion.div
          className="absolute inset-x-3 bottom-3 top-10 rounded-md px-4 pt-6 pb-4 text-center z-20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3, ease: "easeOut" }}
          style={{
            background: "#fffefc",
            border: "1px solid rgba(162, 123, 80, 0.4)",
          }}
        >
          <h2 className="text-base font-semibold text-amber-800 mb-1">💌 Confirmation</h2>
          <p className="text-sm text-stone-700">
            <span className="font-medium">Your Yojana is set.</span><br />
            The mystery unfolds on{" "}
            <span className="font-semibold">
              {data.startDateTime
                ? new Date(data.startDateTime).toLocaleDateString()
                : "your chosen date"}
            </span>.
          </p>

          <Button
            type="button"
            onClick={() => setShowPopup(false)}
            className="mt-4 rounded-full px-6 bg-gradient-to-r from-amber-600 to-stone-600 hover:from-amber-700 hover:to-stone-700 text-white"
          >
            Close
          </Button>
        </motion.div>

        {/* Top flap (decorative) */}
        <motion.div
          className="absolute left-0 right-0 top-0 h-1/2 origin-top z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, #f6d98c, #eac771)",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            borderBottom: "1px solid rgba(184,139,90,0.5)",
            backfaceVisibility: "hidden",
          }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: 160 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Side folds (decorative) */}
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.05), transparent 40%), linear-gradient(225deg, rgba(0,0,0,0.05), transparent 40%)",
            mixBlendMode: "multiply",
          }}
        />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>





      <SupportFab />
    </div>
  );
}
