import mongoose from 'mongoose';
import dns from 'node:dns';

// Some local/ISP router DNS resolvers silently drop TXT queries, which
// mongodb+srv:// needs. MONGODB_URI is a direct mongodb:// string (no SRV
// lookup) specifically to avoid that, but this fallback stays as a safety
// net in case it's ever switched back to a +srv connection string.
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Cached connection for serverless (Vercel) — avoids exhausting the
// Atlas free-tier connection pool on every cold start.
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable');
}

let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        // M0 free tier: keep the pool small so we don't hit the 500-conn cap.
        maxPoolSize: 5,
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false,
      })
      .catch((err) => {
        // Don't cache a failed connection attempt — let the next call retry.
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
