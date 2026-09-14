import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET =
  process.env.JWT_SECRET || "is_a_coder_default_super_secret_fallback_key";
const COOKIE_NAME = "is_a_coder_token";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
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
