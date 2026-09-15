import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";

const JWT_SECRET =
  process.env.JWT_SECRET || "is_a_coder_default_super_secret_fallback_key";
const COOKIE_NAME = "is_a_coder_token";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  sessionId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function generateToken(user: SessionUser): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      sessionId: user.sessionId,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Validates session against database to enforce Single Active Session
 * (invalidates older session when a user signs in from a second device).
 */
export async function getVerifiedSession(): Promise<{
  session: SessionUser | null;
  sessionTerminated?: boolean;
  user?: IUser | null;
}> {
  try {
    const session = await getSession();
    if (!session) return { session: null };

    await connectToDatabase();
    const user = await User.findById(session.id);
    if (!user) return { session: null };

    // If user's current active session ID in DB does not match the token's session ID
    if (user.currentSessionId && user.currentSessionId !== session.sessionId) {
      return {
        session: null,
        sessionTerminated: true,
        user,
      };
    }

    return { session, user };
  } catch (err) {
    console.error("getVerifiedSession Error:", err);
    return { session: null };
  }
}

export const RESERVED_SUBDOMAINS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "blog",
  "cdn",
  "cloud",
  "control",
  "dashboard",
  "dev",
  "dns",
  "docs",
  "ftp",
  "git",
  "help",
  "imap",
  "internal",
  "is-a-coder",
  "login",
  "mail",
  "mx",
  "ns1",
  "ns2",
  "panel",
  "pay",
  "pop",
  "portal",
  "root",
  "secure",
  "server",
  "smtp",
  "ssh",
  "ssl",
  "staging",
  "status",
  "support",
  "test",
  "vpn",
  "webmail",
  "www",
]);

export function isReservedSubdomain(name: string): boolean {
  return RESERVED_SUBDOMAINS.has(name.toLowerCase().trim());
}

export function isValidSubdomainFormat(name: string): boolean {
  const regex = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
  return regex.test(name.toLowerCase().trim()) && name.length >= 2 && name.length <= 63;
}
