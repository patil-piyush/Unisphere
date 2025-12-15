// src/lib/auth/auth.ts
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode"

type DecodedToken = {
  userId?: string
  _id?: string
  id?: string
}

export function getCurrentUserIdFromCookie(): string | null {
  const token = Cookies.get("token")
  if (!token) return null

  try {
    const decoded = jwtDecode<DecodedToken>(token)
    return decoded.userId || decoded._id || decoded.id || null
  } catch {
    return null
  }
}


