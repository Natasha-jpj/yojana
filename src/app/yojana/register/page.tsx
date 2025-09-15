// "use client";

// import { useMemo, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import type { Variants } from "framer-motion";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// /** ------------------------------
//  * Minimal types / state
//  * ------------------------------ */
// type Gender = "male" | "female" | "other" | "";
// type DateStyle =
//   | "coffee"
//   | "dinner"
//   | "adventure"
//   | "movie"
//   | "picnic"
//   | "concert"
//   | "museum"
//   | "karaoke"
//   | "spa"
//   | "stargazing"
//   | "gaming"
//   | "cooking-class";
// type FoodPref =
//   | ""
//   | "nepali"
//   | "italian"
//   | "vegan"
//   | "anything"
//   | "indian"
//   | "chinese"
//   | "japanese"
//   | "korean"
//   | "thai"
//   | "mexican"
//   | "bbq"
//   | "mediterranean"
//   | "bakery";


// type FormState = {
//   name: string;
//   withPartner: boolean;
//   partnerName?: string;
//   gender: Gender;
//   foodPref: FoodPref;
//   /** CHANGED: multi-select */
//   datePref: DateStyle[];
//   activeList: string[]; // multi-select chips
//   surprise: boolean;
// };

// const initialState: FormState = {
//   name: "",
//   withPartner: true,
//   partnerName: "",
//   gender: "",
//   foodPref: "",
//   /** CHANGED: array */
//   datePref: [],
//   activeList: [],
//   surprise: false,
// };

// /** ------------------------------
//  * Animation variants
//  * ------------------------------ */
// const container = {
//   hidden: { opacity: 0, y: 20 },
//   show: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       staggerChildren: 0.1,
//       ease: [0.25, 0.1, 0.25, 1] as const,
//       duration: 0.5,
//     },
//   },
//   exit: {
//     opacity: 0,
//     y: -20,
//     transition: { duration: 0.3 },
//   },
// } satisfies Variants;

// const item = {
//   hidden: { opacity: 0, y: 20, scale: 0.95 },
//   show: {
//     opacity: 1,
//     y: 0,
//     scale: 1,
//     transition: { type: "spring" as const, damping: 12, stiffness: 200 },
//   },
//   exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
// } satisfies Variants;

// const floatingHearts = {
//   animate: {
//     y: [0, -10, 0],
//     transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
//   },
// } satisfies Variants;

// const pulseGlow = {
//   animate: {
//     boxShadow: [
//       "0 0 0 0 rgba(255, 105, 180, 0.7)",
//       "0 0 0 10px rgba(255, 105, 180, 0)",
//       "0 0 0 0 rgba(255, 105, 180, 0)",
//     ],
//     transition: { duration: 2, repeat: Infinity },
//   },
// } satisfies Variants;

// const bgUrl =
//   "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')";

// /** A little chip button */
// function Chip({
//   active,
//   children,
//   onClick,
// }: {
//   active?: boolean;
//   children: React.ReactNode;
//   onClick?: () => void;
// }) {
//   return (
//     <motion.button
//       type="button"
//       onClick={onClick}
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//       className={[
//         "px-4 py-2 rounded-full border backdrop-blur",
//         active
//           ? "bg-rose-500/30 border-rose-400 text-white shadow-lg"
//           : "bg-white/15 border-white/30 text-white/90 hover:bg-white/25",
//         "transition-all duration-300 shadow-sm",
//       ].join(" ")}
//     >
//       {children}
//     </motion.button>
//   );
// }

// /** Radio presented as big cards */
// function ChoiceCard({
//   id,
//   label,
//   value,
//   checked,
//   onChange,
//   subtitle,
//   emoji,
// }: {
//   id: string;
//   label: string;
//   subtitle?: string;
//   emoji?: string;
//   value: string;
//   checked: boolean;
//   onChange: (v: string) => void;
// }) {
//   return (
//     <motion.label
//       htmlFor={id}
//       className="cursor-pointer w-full"
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//     >
//       <div
//         className={[
//           "rounded-2xl border p-4 sm:p-5 backdrop-blur",
//           checked
//             ? "border-rose-400 bg-gradient-to-r from-rose-500/25 to-pink-500/15 shadow-lg"
//             : "border-white/30 bg-white/15 hover:bg-white/25",
//           "transition-all duration-300 flex items-center gap-4",
//         ].join(" ")}
//         onClick={() => onChange(value)}
//       >
//         <motion.div
//           className="text-2xl"
//           animate={checked ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
//           transition={{ duration: 0.5 }}
//         >
//           {emoji}
//         </motion.div>
//         <div className="flex-1">
//           <div className="font-semibold text-white">{label}</div>
//           {subtitle ? (
//             <div className="text-sm text-white/80">{subtitle}</div>
//           ) : null}
//         </div>
//         {checked && (
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ type: "spring", stiffness: 300 }}
//             className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center"
//           >
//             <svg
//               className="w-3 h-3 text-white"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={3}
//                 d="M5 13l4 4L19 7"
//               />
//             </svg>
//           </motion.div>
//         )}
//         <RadioGroupItem id={id} value={value} checked={checked} className="hidden" />
//       </div>
//     </motion.label>
//   );
// }

// /** Floating hearts decoration */
// function FloatingHearts() {
//   return (
//     <>
//       {[...Array(5)].map((_, i) => (
//         <motion.div
//           key={i}
//           className="absolute text-rose-400/30 text-2xl pointer-events-none"
//           style={{ left: `${10 + i * 20}%`, top: `${20 + Math.random() * 60}%` }}
//           variants={floatingHearts}
//           initial="animate"
//           animate="animate"
//         >
//           ❤️
//         </motion.div>
//       ))}
//     </>
//   );
// }

// /** ------------------------------
//  * Page
//  * ------------------------------ */
// export default function RegisterQnA() {
//   const [step, setStep] = useState(0);
//   const [data, setData] = useState<FormState>(initialState);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const total = 7; // steps 0..6

//   const canNext = useMemo(() => {
//     switch (step) {
//       case 0:
//         return data.name.trim().length >= 2;
//       case 1:
//         return true;
//       case 2:
//         return data.gender !== "";
//       case 3:
//         return data.foodPref !== "";
//       case 4:
//         /** CHANGED: must choose at least one vibe */
//         return data.datePref.length > 0;
//       case 5:
//         return data.activeList.length > 0;
//       case 6:
//         return true;
//       default:
//         return true;
//     }
//   }, [step, data]);

//   function next() {
//     if (step < total && canNext) setStep((s) => s + 1);
//   }
//   function back() {
//     if (step > 0) setStep((s) => s - 1);
//   }

//   function toggleActive(tag: string) {
//     setData((d) => {
//       const exists = d.activeList.includes(tag);
//       return {
//         ...d,
//         activeList: exists ? d.activeList.filter((t) => t !== tag) : [...d.activeList, tag],
//       };
//     });
//   }

//   /** NEW: toggle for multi-select date vibes */
//   function toggleDate(vibe: DateStyle) {
//     setData((d) => {
//       const exists = d.datePref.includes(vibe);
//       return {
//         ...d,
//         datePref: exists ? d.datePref.filter((t) => t !== vibe) : [...d.datePref, vibe],
//       };
//     });
//   }

//   async function submit() {
//     setIsSubmitting(true);
//     await new Promise((resolve) => setTimeout(resolve, 1500));
//     console.log("YOJANA date plan:", data);
//     if (typeof window !== "undefined") {
//       const confetti = await import("canvas-confetti");
//       confetti.default({
//         particleCount: 150,
//         spread: 70,
//         origin: { y: 0.6 },
//         colors: ["#ff1493", "#ff69b4", "#ff85a2", "#fbb6ce", "#f9a8d4"],
//       });
//     }
//     setIsSubmitting(false);
//     alert("💖 Your romantic date plan is saved! (Check console)");
//   }

//   /** progress % */
//   const pct = Math.round(((step + 1) / (total + 1)) * 100);

//   return (
//     <div
//       className="min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
//       style={{ backgroundImage: bgUrl }}
//     >
//       <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-rose-900/40 to-pink-900/30" />

//       {/* Animated floating hearts */}
//       <FloatingHearts />

//       <div className="relative z-10 px-4 py-10 sm:p-10 flex items-center justify-center min-h-screen">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7, ease: "easeOut" }}
//           className="w-full max-w-3xl"
//         >
//           {/* Header / Progress */}
//           <div className="mb-6 sm:mb-8 flex flex-col gap-3">
//             <motion.h1
//               className="text-3xl sm:text-4xl font-bold text-white tracking-tight text-center"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//             >
//               Yojana — Plan a Romantic Date
//             </motion.h1>
//             <motion.p
//               className="text-white/80 text-center"
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//             >
//               Craft your perfect date experience with our magical questionnaire.
//             </motion.p>

//             <motion.div
//               className="h-2 w-full rounded-full bg-white/20 overflow-hidden mt-2"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4 }}
//             >
//               <motion.div
//                 className="h-2 bg-gradient-to-r from-rose-500 to-pink-500"
//                 initial={{ width: 0 }}
//                 animate={{ width: `${pct}%` }}
//                 transition={{ duration: 0.6, ease: "easeOut" }}
//               />
//             </motion.div>
//             <div className="text-white/75 text-sm text-center">{pct}% complete</div>
//           </div>

//           {/* Glass Card */}
//           <motion.div variants={pulseGlow} animate="animate">
//             <Card className="bg-white/10 border-white/30 backdrop-blur-2xl text-white rounded-3xl shadow-2xl overflow-hidden">
//               <CardHeader className="pb-0">
//                 <CardTitle className="text-2xl text-center">
//                   {[
//                     "What's your name, beautiful?",
//                     data.withPartner
//                       ? "Are you planning this together?"
//                       : "Going solo or adding later?",
//                     "How do you identify?",
//                     "What cuisine speaks to your heart?",
//                     "Choose your ideal date vibes",
//                     "What activities make your heart flutter?",
//                     "Should we keep it a surprise?",
//                   ][step]}
//                 </CardTitle>
//                 <CardDescription className="text-white/70 text-center">
//                   {[
//                     "We'll make this experience uniquely yours.",
//                     "Your partner can join now or later — your choice.",
//                     "We celebrate all identities with love.",
//                     "We'll find places that delight your palate.",
//                     "Pick as many vibes as you like.",
//                     "Select all that make you smile.",
//                     "The best surprises come from the heart.",
//                   ][step]}
//                 </CardDescription>
//               </CardHeader>

//               <CardContent className="pt-6">
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={step}
//                     variants={container}
//                     initial="hidden"
//                     animate="show"
//                     exit="exit"
//                     className="space-y-6"
//                   >
//                     {/* STEP 0 — Name */}
//                     {step === 0 && (
//                       <motion.div variants={item} className="space-y-3">
//                         <Label className="text-white/90">Your Name</Label>
//                         <Input
//                           placeholder="e.g., Sophia"
//                           value={data.name}
//                           onChange={(e) =>
//                             setData((d) => ({ ...d, name: e.target.value }))
//                           }
//                           className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-rose-400"
//                         />
//                       </motion.div>
//                     )}

//                     {/* STEP 1 — With partner? + optional partner name */}
//                     {step === 1 && (
//                       <>
//                         <motion.div variants={item} className="flex gap-3 flex-wrap justify-center">
//                           <Chip
//                             active={data.withPartner}
//                             onClick={() => setData((d) => ({ ...d, withPartner: true }))}
//                           >
//                             Together ❤️
//                           </Chip>
//                           <Chip
//                             active={!data.withPartner}
//                             onClick={() => setData((d) => ({ ...d, withPartner: false }))}
//                           >
//                             Solo for now
//                           </Chip>
//                         </motion.div>

//                         {data.withPartner && (
//                           <motion.div
//                             variants={item}
//                             className="space-y-3"
//                             initial={{ opacity: 0, height: 0 }}
//                             animate={{ opacity: 1, height: "auto" }}
//                             transition={{ delay: 0.2 }}
//                           >
//                             <Label className="text-white/90">Partner's Name</Label>
//                             <Input
//                               placeholder="e.g., Alexander"
//                               value={data.partnerName}
//                               onChange={(e) =>
//                                 setData((d) => ({ ...d, partnerName: e.target.value }))
//                               }
//                               className="bg-white/10 border-white/30 text-white placeholder:text-white/50 focus:ring-2 focus:ring-rose-400"
//                             />
//                           </motion.div>
//                         )}
//                       </>
//                     )}

//                     {/* STEP 2 — Gender (as big choice cards) */}
//                     {step === 2 && (
//                       <motion.div variants={item}>
//                         <RadioGroup
//                           value={data.gender}
//                           onValueChange={(v) =>
//                             setData((d) => ({ ...d, gender: v as Gender }))
//                           }
//                           className="grid sm:grid-cols-3 gap-3"
//                         >
//                           <ChoiceCard
//                             id="g-male"
//                             label="Male"
//                             subtitle="he/him"
//                             emoji="❤️"
//                             value="male"
//                             checked={data.gender === "male"}
//                             onChange={(v) => setData((d) => ({ ...d, gender: v as Gender }))}
//                           />
//                           <ChoiceCard
//                             id="g-female"
//                             label="Female"
//                             subtitle="she/her"
//                             emoji="💖"
//                             value="female"
//                             checked={data.gender === "female"}
//                             onChange={(v) => setData((d) => ({ ...d, gender: v as Gender }))}
//                           />
//                           <ChoiceCard
//                             id="g-other"
//                             label="Other"
//                             subtitle="they/them"
//                             emoji="💕"
//                             value="other"
//                             checked={data.gender === "other"}
//                             onChange={(v) => setData((d) => ({ ...d, gender: v as Gender }))}
//                           />
//                         </RadioGroup>
//                       </motion.div>
//                     )}

//                     {/* STEP 3 — Food preference (chips) - EXPANDED */}
//                     {step === 3 && (
//                       <motion.div variants={item} className="flex gap-3 flex-wrap justify-center">
//                         {(
//                           [
//                             ["nepali", "Nepali", "🍛"],
//                             ["indian", "Indian", "🍲"],
//                             ["italian", "Italian", "🍝"],
//                             ["chinese", "Chinese", "🥟"],
//                             ["japanese", "Japanese", "🍣"],
//                             ["korean", "Korean", "🧆"],
//                             ["thai", "Thai", "🍜"],
//                             ["mexican", "Mexican", "🌮"],
//                             ["bbq", "BBQ/Grill", "🍖"],
//                             ["mediterranean", "Mediterranean", "🥗"],
//                             ["bakery", "Bakery/Desserts", "🍰"],
//                             ["vegan", "Vegan", "🌱"],
//                             ["anything", "Surprise me", "🎁"],
//                           ] as const
//                         ).map(([val, label, emoji]) => (
//                           <motion.div key={val} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                             <Chip
//                               active={data.foodPref === val}
//                               onClick={() => setData((d) => ({ ...d, foodPref: val }))}
//                             >
//                               <span className="mr-2">{emoji}</span> {label}
//                             </Chip>
//                           </motion.div>
//                         ))}
//                       </motion.div>
//                     )}

//                     {/* STEP 4 — Date style (MULTI-SELECT chips) */}
//                     {step === 4 && (
//                       <motion.div variants={item} className="flex gap-3 flex-wrap justify-center">
//                         {(
//                           [
//                             ["coffee", "Coffee Date", "☕"],
//                             ["dinner", "Fine Dining", "🍷"],
//                             ["adventure", "Adventure", "🏞️"],
//                             ["movie", "Movie Night", "🎬"],
//                             ["picnic", "Picnic", "🧺"],
//                             ["concert", "Live Concert", "🎶"],
//                             ["museum", "Museum/Art", "🏛️"],
//                             ["karaoke", "Karaoke", "🎤"],
//                             ["spa", "Spa & Relax", "🧖"],
//                             ["stargazing", "Stargazing", "✨"],
//                             ["gaming", "Gaming Lounge", "🎮"],
//                             ["cooking-class", "Cooking Class", "👩‍🍳"],
//                           ] as const
//                         ).map(([val, title, emoji]) => (
//                           <motion.div key={val} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                             <Chip
//                               active={data.datePref.includes(val)}
//                               onClick={() => toggleDate(val)}
//                             >
//                               <span className="mr-2">{emoji}</span> {title}
//                             </Chip>
//                           </motion.div>
//                         ))}
//                       </motion.div>
//                     )}

//                     {/* STEP 5 — Activities multi-select (chips) */}
//                     {step === 5 && (
//                       <motion.div variants={item} className="flex gap-3 flex-wrap justify-center">
//                         {[
//                           ["Hiking", "🥾"],
//                           ["Cooking", "👩‍🍳"],
//                           ["Karaoke", "🎤"],
//                           ["Museum", "🏛️"],
//                           ["Stargazing", "✨"],
//                           ["Gaming", "🎮"],
//                           ["Dancing", "💃"],
//                           ["Spa", "🧖"],
//                         ].map(([tag, emoji]) => (
//                           <motion.div key={tag} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                             <Chip
//                               active={data.activeList.includes(tag)}
//                               onClick={() => toggleActive(tag)}
//                             >
//                               <span className="mr-1">{emoji}</span> {tag}
//                             </Chip>
//                           </motion.div>
//                         ))}
//                       </motion.div>
//                     )}

//                     {/* STEP 6 — Surprise toggle + summary */}
//                     {step === 6 && (
//                       <motion.div variants={item} className="space-y-5">
//                         <motion.div
//                           className="flex items-center gap-3 p-4 rounded-xl bg-white/10 border border-white/20"
//                           whileHover={{ scale: 1.02 }}
//                         >
//                           <Checkbox
//                             id="surprise"
//                             checked={data.surprise}
//                             onCheckedChange={(c) =>
//                               setData((d) => ({ ...d, surprise: Boolean(c) }))
//                             }
//                             className="data-[state=checked]:bg-rose-500 border-white/30"
//                           />
//                           <Label htmlFor="surprise" className="text-white/90 text-lg">
//                             Make it a magical surprise? ✨
//                           </Label>
//                         </motion.div>

//                         <motion.div
//                           className="rounded-2xl border border-white/30 bg-gradient-to-b from-rose-500/10 to-pink-500/10 p-5 backdrop-blur"
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           transition={{ delay: 0.3 }}
//                         >
//                           <div className="font-semibold mb-3 text-center text-lg">
//                             Your Romantic Preview
//                           </div>
//                           <ul className="text-white/80 space-y-2 text-sm">
//                             <li className="flex items-center">
//                               <span className="w-6">👤</span> Name: {data.name || "—"}
//                             </li>
//                             <li className="flex items-center">
//                               <span className="w-6">🫶</span> With partner: {data.withPartner ? "Yes" : "No"}
//                               {data.withPartner && data.partnerName ? ` (${data.partnerName})` : ""}
//                             </li>
//                             <li className="flex items-center">
//                               <span className="w-6">⚧</span> Gender: {data.gender || "—"}
//                             </li>
//                             <li className="flex items-center">
//                               <span className="w-6">🍽️</span> Food: {data.foodPref || "—"}
//                             </li>
//                             <li className="flex items-center">
//                               <span className="w-6">🎯</span> Vibes:{" "}
//                               {data.datePref.length ? data.datePref.join(", ") : "—"}
//                             </li>
//                             <li className="flex items-center">
//                               <span className="w-6">🧩</span> Activities:{" "}
//                               {data.activeList.length ? data.activeList.join(", ") : "—"}
//                             </li>
//                             <li className="flex items-center">
//                               <span className="w-6">🎁</span> Surprise: {data.surprise ? "Yes" : "No"}
//                             </li>
//                           </ul>
//                         </motion.div>
//                       </motion.div>
//                     )}
//                   </motion.div>
//                 </AnimatePresence>

//                 {/* Nav */}
//                 <div className="mt-8 flex items-center justify-between">
//                   <motion.div whileHover={{ x: -3 }} whileTap={{ scale: 0.95 }}>
//                     <Button
//                       type="button"
//                       variant="ghost"
//                       onClick={back}
//                       disabled={step === 0}
//                       className="text-white hover:bg-white/15 hover:text-white disabled:opacity-40 rounded-full px-6"
//                     >
//                       ← Back
//                     </Button>
//                   </motion.div>

//                   {step < total ? (
//                     <motion.div whileHover={{ scale: canNext ? 1.05 : 1 }} whileTap={{ scale: canNext ? 0.95 : 1 }}>
//                       <Button
//                         type="button"
//                         onClick={next}
//                         disabled={!canNext}
//                         className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 rounded-full px-8 shadow-lg"
//                       >
//                         Next →
//                       </Button>
//                     </motion.div>
//                   ) : (
//                     <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//                       <Button
//                         type="button"
//                         onClick={submit}
//                         disabled={isSubmitting}
//                         className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-full px-8 shadow-lg relative overflow-hidden"
//                       >
//                         {isSubmitting ? (
//                           <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
//                             <svg
//                               className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                             >
//                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                               <path
//                                 className="opacity-75"
//                                 fill="currentColor"
//                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                               />
//                             </svg>
//                             Creating Magic...
//                           </motion.span>
//                         ) : (
//                           <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
//                             Save My Romantic Plan 💖
//                           </motion.span>
//                         )}
//                       </Button>
//                     </motion.div>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </motion.div>
//       </div>
//     </div>
//   );
// }
