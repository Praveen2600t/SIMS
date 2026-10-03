import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "sicms_default_jwt_secret_dev_mode_2026";
const key = new TextEncoder().encode(JWT_SECRET);
export const AUTH_COOKIE_NAME = "sicms_auth_token";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export function parseCookies(cookieHeader?: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  const map: Record<string, string> = {};
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx !== -1) {
      const k = pair.substring(0, idx).trim();
      const v = decodeURIComponent(pair.substring(idx + 1).trim());
      map[k] = v;
    }
  }
  return map;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

/**
 * Universal request user extractor - compatible with Node IncomingMessage, VercelRequest, or Web API Request
 */
export async function getUserFromRequest(request: any): Promise<SessionUser | null> {
  if (!request) return null;

  // 1. Authorization header (Bearer token)
  let authHeader: string | null = null;
  if (typeof request.headers?.get === "function") {
    authHeader = request.headers.get("authorization");
  } else if (request.headers?.authorization) {
    authHeader = request.headers.authorization;
  }

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifySessionToken(token);
  }

  // 2. Cookie extraction
  let token: string | undefined = undefined;
  if (request.cookies && typeof request.cookies === "object" && request.cookies[AUTH_COOKIE_NAME]) {
    token = request.cookies[AUTH_COOKIE_NAME];
  } else if (typeof request.cookies?.get === "function") {
    token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  } else {
    let cookieHeader: string | null = null;
    if (typeof request.headers?.get === "function") {
      cookieHeader = request.headers.get("cookie");
    } else if (request.headers?.cookie) {
      cookieHeader = request.headers.cookie;
    }
    const parsed = parseCookies(cookieHeader);
    token = parsed[AUTH_COOKIE_NAME];
  }

  if (token) {
    return verifySessionToken(token);
  }

  return null;
}

export async function requireUser(request?: any): Promise<SessionUser> {
  const user = await getUserFromRequest(request);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(request?: any): Promise<SessionUser> {
  const user = await requireUser(request);
  if (user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}
