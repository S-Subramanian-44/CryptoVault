import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"

export function getUserIdFromAuth(authHeader?: string | null): string | null {
  if (!authHeader) return null
  const [, token] = authHeader.split(" ")
  if (!token) return null

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    return payload?.sub || payload?.userId || null
  } catch {
    // allow non-JWT simple token "user-123" for development
    if (authHeader.startsWith("Bearer user-")) return authHeader.replace("Bearer ", "")
    return null
  }
}
