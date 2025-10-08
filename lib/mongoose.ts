import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable")
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined
}

let cached = global._mongooseConn
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null }
}

export async function dbConnect() {
  if (cached!.conn) return cached!.conn
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(MONGODB_URI!, {
      dbName: "cryptodashboard",
    })
  }
  cached!.conn = await cached!.promise
  return cached!.conn
}
