// /models/YojanaRegistration.ts
import mongoose, { Schema, Model } from "mongoose";

/** ----- Enums (exported for reuse) ----- */
export const Occasion = ["birthday", "anniversary", "just-a-date", "surprise-gift"] as const;
export type Occasion = (typeof Occasion)[number];

export const Experience = ["romantic-escape", "adventure-date", "mystery-box"] as const;
export type Experience = (typeof Experience)[number];

export const Dining = ["italian", "asian", "nepali-fusion", "continental", "surprise-me"] as const;
export type Dining = (typeof Dining)[number];

export const Budget = ["tbd", "3k", "5k", "10k"] as const;
export type Budget = (typeof Budget)[number];

/** ----- Document shape ----- */
export interface IYojanaRegistration {
  // 1) Date & Time
  startDateTime: Date;
  endDateTime: Date;

  // 2) Occasion
  occasion: Occasion;

  // 3) Experience
  experience: Experience;

  // 4) Dining
  dining: Dining;

  // 5) Dietary Restrictions
  dietVeg: boolean;
  dietHalal: boolean;
  dietAllergies?: string;

  // 6) Personal Touches
  flowers: boolean;
  cake: boolean;

  // 7) Budget
  budget: Budget;

  // 8) Personal Note
  personalNote?: string;

  // 9) Customer Details
  name: string;
  phone: string;
  email: string;
  emergencyContact?: string;

  // Payment
  paymentConfirmed: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

/** ----- Schema ----- */
const RegistrationSchema = new Schema<IYojanaRegistration>(
  {
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },

    occasion: { type: String, enum: Occasion, required: true },
    experience: { type: String, enum: Experience, required: true },
    dining: { type: String, enum: Dining, required: true },

    dietVeg: { type: Boolean, default: false },
    dietHalal: { type: Boolean, default: false },
    dietAllergies: { type: String, trim: true },

    flowers: { type: Boolean, default: false },
    cake: { type: Boolean, default: false },

    budget: { type: String, enum: Budget, required: true },

    personalNote: { type: String, trim: true },

    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    emergencyContact: { type: String, trim: true },

    paymentConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true, strict: true }
);

/** ----- Indexes ----- */
RegistrationSchema.index({ createdAt: -1 });
RegistrationSchema.index({ startDateTime: 1 });
RegistrationSchema.index({ paymentConfirmed: 1 });
RegistrationSchema.index({
  name: "text",
  email: "text",
  phone: "text",
  emergencyContact: "text",
  occasion: "text",
  experience: "text",
  dining: "text",
  budget: "text",
  dietAllergies: "text",
  personalNote: "text",
});

/**
 * Bust the model cache in dev AND keep using the same Mongo collection.
 * We bump model name to V3 but pin the collection name.
 */
const MODEL_NAME = "YojanaRegistrationV3";
const COLLECTION_NAME = "yojanaregistrations";

try {
  mongoose.deleteModel(MODEL_NAME);
} catch {}

const RegistrationModel: Model<IYojanaRegistration> =
  (mongoose.models[MODEL_NAME] as Model<IYojanaRegistration>) ||
  mongoose.model<IYojanaRegistration>(MODEL_NAME, RegistrationSchema, COLLECTION_NAME);

export default RegistrationModel;
