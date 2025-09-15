// src/app/api/yojana/registrations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import RegistrationModel, {
  Occasion,
  Experience,
  Dining,
  Budget,
} from "@/models/YojanaRegistration";

/* ---------- helpers ---------- */
function isOneOf<T extends readonly string[]>(v: unknown, list: T): v is T[number] {
  return typeof v === "string" && (list as readonly string[]).includes(v);
}
function parseDateMaybe(v: unknown): Date | undefined {
  if (typeof v !== "string") return undefined;
  const ms = Date.parse(v);
  return Number.isNaN(ms) ? undefined : new Date(ms);
}
function errMessage(e: unknown, fallback = "Server error"): string {
  return e instanceof Error ? e.message : fallback;
}

type ParamsCtx = { params: Promise<{ id: string }> };

type UpdateBody = {
  startDateTime?: string;
  endDateTime?: string;
  occasion?: typeof Occasion[number];
  experience?: typeof Experience[number];
  dining?: typeof Dining[number];
  budget?: typeof Budget[number];
  dietVeg?: boolean;
  dietHalal?: boolean;
  dietAllergies?: string;
  flowers?: boolean;
  cake?: boolean;
  personalNote?: string;
  name?: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  paymentConfirmed?: boolean;
};

/* ---------- GET /:id ---------- */
export async function GET(_req: NextRequest, ctx: ParamsCtx) {
  try {
    const { id } = await ctx.params;
    await dbConnect();
    const doc = await RegistrationModel.findById(id).lean();
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: doc });
  } catch (e: unknown) {
  console.error("GET /registrations/:id", e);
  return NextResponse.json(
    { success: false, error: errMessage(e) },
    { status: 500 }
  );
}
}

/* ---------- PATCH /:id (partial update) ---------- */
export async function PATCH(req: NextRequest, ctx: ParamsCtx) {
  try {
    const { id } = await ctx.params;
    await dbConnect();

    const body = (await req.json()) as UpdateBody;
    const update: Record<string, unknown> = {};

    // Dates (optional)
    if (body.startDateTime !== undefined) {
      const d = parseDateMaybe(body.startDateTime);
      if (!d) {
        return NextResponse.json(
          { success: false, error: "Invalid startDateTime" },
          { status: 400 }
        );
      }
      update.startDateTime = d;
    }
    if (body.endDateTime !== undefined) {
      const d = parseDateMaybe(body.endDateTime);
      if (!d) {
        return NextResponse.json(
          { success: false, error: "Invalid endDateTime" },
          { status: 400 }
        );
      }
      update.endDateTime = d;
    }
    if (
      update.startDateTime instanceof Date &&
      update.endDateTime instanceof Date &&
      +update.endDateTime <= +update.startDateTime
    ) {
      return NextResponse.json(
        { success: false, error: "endDateTime must be after startDateTime" },
        { status: 400 }
      );
    }

    // Enumerations (optional)
    if (body.occasion !== undefined) {
      if (!isOneOf(body.occasion, Occasion)) {
        return NextResponse.json(
          { success: false, error: "Invalid occasion" },
          { status: 400 }
        );
      }
      update.occasion = body.occasion;
    }
    if (body.experience !== undefined) {
      if (!isOneOf(body.experience, Experience)) {
        return NextResponse.json(
          { success: false, error: "Invalid experience" },
          { status: 400 }
        );
      }
      update.experience = body.experience;
    }
    if (body.dining !== undefined) {
      if (!isOneOf(body.dining, Dining)) {
        return NextResponse.json(
          { success: false, error: "Invalid dining" },
          { status: 400 }
        );
      }
      update.dining = body.dining;
    }
    if (body.budget !== undefined) {
      if (!isOneOf(body.budget, Budget)) {
        return NextResponse.json(
          { success: false, error: "Invalid budget" },
          { status: 400 }
        );
      }
      update.budget = body.budget;
    }

    // Booleans / strings (optional)
    if (body.dietVeg !== undefined) update.dietVeg = Boolean(body.dietVeg);
    if (body.dietHalal !== undefined) update.dietHalal = Boolean(body.dietHalal);
    if (body.dietAllergies !== undefined)
      update.dietAllergies = String(body.dietAllergies || "").trim();

    if (body.flowers !== undefined) update.flowers = Boolean(body.flowers);
    if (body.cake !== undefined) update.cake = Boolean(body.cake);

    if (body.personalNote !== undefined)
      update.personalNote = String(body.personalNote || "").trim();

    if (body.name !== undefined) {
      const name = String(body.name || "").trim();
      if (name && name.length < 2) {
        return NextResponse.json(
          { success: false, error: "Name must be at least 2 chars" },
          { status: 400 }
        );
      }
      update.name = name;
    }

    if (body.phone !== undefined) {
      const phone = String(body.phone || "").trim();
      const digits = phone.replace(/\D/g, "");
      if (phone && digits.length < 7) {
        return NextResponse.json(
          { success: false, error: "Invalid phone" },
          { status: 400 }
        );
      }
      update.phone = phone;
    }

    if (body.email !== undefined) {
      const email = String(body.email || "").trim();
      const ok = email ? /\S+@\S+\.\S+/.test(email) : true;
      if (!ok) {
        return NextResponse.json(
          { success: false, error: "Invalid email" },
          { status: 400 }
        );
      }
      update.email = email;
    }

    if (body.emergencyContact !== undefined) {
      update.emergencyContact = String(body.emergencyContact || "").trim();
    }

    if (body.paymentConfirmed !== undefined) {
      update.paymentConfirmed = Boolean(body.paymentConfirmed);
    }

    const doc = await RegistrationModel.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: doc });
  } catch (e: unknown) {
    console.error("PATCH /registrations/:id", e);
    return NextResponse.json(
      { success: false, error: errMessage(e) },
      { status: 500 }
    );
  }
}

/* ---------- DELETE /:id ---------- */
export async function DELETE(_req: NextRequest, ctx: ParamsCtx) {
  try {
    const { id } = await ctx.params;
    await dbConnect();
    const doc = await RegistrationModel.findByIdAndDelete(id);
    if (!doc) {
      return NextResponse.json(
        { success: false, error: "Registration not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error("DELETE /registrations/:id", e);
    return NextResponse.json(
      { success: false, error: errMessage(e) },
      { status: 500 }
    );
  }
}
