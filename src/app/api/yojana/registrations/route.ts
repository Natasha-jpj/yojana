// /api/yojana/registrations/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RegistrationModel, {
  Occasion,
  Experience,
  Dining,
  Budget,
} from "@/models/YojanaRegistration";

/* -----------------------------
   Helpers
----------------------------- */
function isOneOf<T extends readonly string[]>(
  v: unknown,
  list: T
): v is T[number] {
  return typeof v === "string" && (list as readonly string[]).includes(v);
}
function toPaymentFilter(v: string | null): "paid" | "pending" | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase();
  if (s === "paid") return "paid";
  if (s === "pending") return "pending";
  return undefined;
}

/* Query typing to avoid `any` */
type MongoRegex = { $regex: string; $options?: string };
type RegistrationQuery = {
  paymentConfirmed?: boolean;
  $or?: Array<Record<string, MongoRegex>>;
};

/* -----------------------------
   GET  /api/yojana/registrations
   ?q=&payment=paid|pending&sortBy=createdAt|name|startDateTime&order=asc|desc&limit=&page=
----------------------------- */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const skip = (page - 1) * limit;

    const q = (searchParams.get("q") || "").trim();
    const payment = toPaymentFilter(searchParams.get("payment"));
    const sortBy = (searchParams.get("sortBy") || "createdAt") as
      | "createdAt"
      | "name"
      | "startDateTime";
    const order: 1 | -1 =
      (searchParams.get("order") || "desc").toLowerCase() === "asc" ? 1 : -1;

    const query: RegistrationQuery = {};
    if (payment) query.paymentConfirmed = payment === "paid";

    if (q) {
      const rx: MongoRegex = { $regex: q, $options: "i" };
      query.$or = [
        { name: rx },
        { email: rx },
        { phone: rx },
        { emergencyContact: rx },
        { occasion: rx },
        { experience: rx },
        { dining: rx },
        { budget: rx },
        { dietAllergies: rx },
        { personalNote: rx },
      ];
    }

    const [docs, total] = await Promise.all([
      RegistrationModel.find(query)
        .sort({ [sortBy]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      RegistrationModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: docs,
      page,
      pageSize: limit,
      total,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/* -----------------------------
   POST /api/yojana/registrations
   Body must match new 9-point schema
----------------------------- */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body: unknown = await req.json();

    // Safe access helper
    const getStr = (v: unknown): string => String(v ?? "").trim();

    // 1) Date & time (REQUIRED)
    const startStr = getStr((body as Record<string, unknown>)?.startDateTime);
    const endStr = getStr((body as Record<string, unknown>)?.endDateTime);
    const startMs = Date.parse(startStr);
    const endMs = Date.parse(endStr);

    if (!startStr || Number.isNaN(startMs)) {
      return NextResponse.json(
        { success: false, error: "Valid startDateTime is required" },
        { status: 400 }
      );
    }
    if (!endStr || Number.isNaN(endMs)) {
      return NextResponse.json(
        { success: false, error: "Valid endDateTime is required" },
        { status: 400 }
      );
    }
    if (endMs <= startMs) {
      return NextResponse.json(
        { success: false, error: "endDateTime must be after startDateTime" },
        { status: 400 }
      );
    }

    // 2) Occasion (REQUIRED)
    const occasion = getStr((body as Record<string, unknown>)?.occasion);
    if (!isOneOf(occasion, Occasion)) {
      return NextResponse.json(
        { success: false, error: "Valid occasion is required" },
        { status: 400 }
      );
    }

    // 3) Experience (REQUIRED)
    const experience = getStr((body as Record<string, unknown>)?.experience);
    if (!isOneOf(experience, Experience)) {
      return NextResponse.json(
        { success: false, error: "Valid experience is required" },
        { status: 400 }
      );
    }

    // 4) Dining (REQUIRED)
    const dining = getStr((body as Record<string, unknown>)?.dining);
    if (!isOneOf(dining, Dining)) {
      return NextResponse.json(
        { success: false, error: "Valid dining is required" },
        { status: 400 }
      );
    }

    // 5) Dietary restrictions (optional)
    const dietVeg = Boolean((body as Record<string, unknown>)?.dietVeg);
    const dietHalal = Boolean((body as Record<string, unknown>)?.dietHalal);
    const dietAllergies = getStr(
      (body as Record<string, unknown>)?.dietAllergies
    );

    // 6) Personal touches (optional)
    const flowers = Boolean((body as Record<string, unknown>)?.flowers);
    const cake = Boolean((body as Record<string, unknown>)?.cake);

    // 7) Budget (REQUIRED)
    const budget = getStr((body as Record<string, unknown>)?.budget);
    if (!isOneOf(budget, Budget)) {
      return NextResponse.json(
        { success: false, error: "Valid budget is required" },
        { status: 400 }
      );
    }

    // 8) Personal note (optional)
    const personalNote = getStr(
      (body as Record<string, unknown>)?.personalNote
    );

    // 9) Customer details (REQUIRED: name, email, phone; optional emergency)
    const name = getStr((body as Record<string, unknown>)?.name);
    if (name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Name is required (min 2 chars)" },
        { status: 400 }
      );
    }
    const email = getStr((body as Record<string, unknown>)?.email);
    const phone = getStr((body as Record<string, unknown>)?.phone);
    const emergencyContact = getStr(
      (body as Record<string, unknown>)?.emergencyContact
    );

    const emailOk = /\S+@\S+\.\S+/.test(email);
    const phoneDigits = phone.replace(/\D/g, "");
    if (!emailOk) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }
    if (phoneDigits.length < 7) {
      return NextResponse.json(
        { success: false, error: "Valid phone is required" },
        { status: 400 }
      );
    }

    // Payment flag (optional boolean)
    const paymentConfirmed = Boolean(
      (body as Record<string, unknown>)?.paymentConfirmed
    );

    // Create
    const doc = await RegistrationModel.create({
      startDateTime: new Date(startMs),
      endDateTime: new Date(endMs),
      occasion,
      experience,
      dining,
      dietVeg,
      dietHalal,
      dietAllergies,
      flowers,
      cake,
      budget,
      personalNote,
      name,
      phone,
      email,
      emergencyContact,
      paymentConfirmed,
    });

    return NextResponse.json({ success: true, data: doc }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    console.error(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
