import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please set MONGODB_URI in .env.local");
}

/** Prevent multiple connections in dev */
let cached = (global as any)._mongooseCache;
if (!cached) cached = (global as any)._mongooseCache = { conn: null as any, promise: null as any };

export default async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        dbName: undefined, // use db in URI
      })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
