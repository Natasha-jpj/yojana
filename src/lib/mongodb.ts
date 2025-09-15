// src/lib/mongodb.ts
import mongoose, { type Mongoose } from "mongoose";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Please set ${name} in .env.local`);
  return v;
}

const MONGODB_URI = requiredEnv("MONGODB_URI");

/** Prevent multiple connections in dev (typed global cache) */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}
const globalWithMongoose = globalThis as unknown as { _mongooseCache?: MongooseCache };
const cached: MongooseCache =
  globalWithMongoose._mongooseCache ??
  (globalWithMongoose._mongooseCache = { conn: null, promise: null });

export default async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
