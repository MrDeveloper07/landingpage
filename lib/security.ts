import bcrypt from "bcryptjs";

// Dummy hash used to equalize execution timing when user is not found (prevents timing-based user enumeration)
const DUMMY_HASH = "$2a$10$e8w8G85W9j8c5L4B.zVKeO9nF7M1Pq4hI8rS5K2n1q5r4b5n7m";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory rate limiting store (cleans up automatically)
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Checks rate limiting for a given action key (IP or user identifier).
 * @param key Unique identifier (e.g., `login:ip:127.0.0.1` or `send-otp:user@example.com`)
 * @param maxRequests Maximum allowed requests within the time window
 * @param windowMs Time window in milliseconds (e.g., 15 * 60 * 1000 for 15 minutes)
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterSeconds: 0 };
  }

  if (record.count >= maxRequests) {
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Resets the rate limit for a given key upon successful action (e.g. valid login)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "127.0.0.1"
  );
}

/**
 * Strict email validation & sanitization (prevents NoSQL injection, malformed strings, length overflows)
 */
export function validateEmail(email: unknown): {
  valid: boolean;
  normalized?: string;
  error?: string;
} {
  if (typeof email !== "string") {
    return { valid: false, error: "Email must be a valid text string." };
  }

  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { valid: false, error: "Email address cannot be empty." };
  }

  if (trimmed.length > 100) {
    return { valid: false, error: "Email address is too long (maximum 100 characters)." };
  }

  // RFC 5322 compliant regex for safe email verification
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: "Please provide a valid email address format." };
  }

  return { valid: true, normalized: trimmed };
}

/**
 * Strict password validation (prevents DoS via gigantic bcrypt strings, enforces minimum length)
 */
export function validatePassword(password: unknown): {
  valid: boolean;
  error?: string;
} {
  if (typeof password !== "string") {
    return { valid: false, error: "Password must be a valid text string." };
  }

  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters long." };
  }

  if (password.length > 128) {
    return { valid: false, error: "Password is too long (maximum 128 characters)." };
  }

  return { valid: true };
}

/**
 * Strict name validation & sanitization
 */
export function validateName(name: unknown): {
  valid: boolean;
  sanitized?: string;
  error?: string;
} {
  if (typeof name !== "string") {
    return { valid: false, error: "Name must be a valid text string." };
  }

  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: "Name cannot be empty." };
  }

  if (trimmed.length > 80) {
    return { valid: false, error: "Name is too long (maximum 80 characters)." };
  }

  // Strip dangerous control / script characters
  const sanitized = trimmed.replace(/[<>]/g, "");

  return { valid: true, sanitized };
}

/**
 * Performs a constant-time dummy bcrypt comparison when user is not found
 * to prevent attackers from discovering registered emails via timing attacks.
 */
export async function dummyComparePassword(password: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, DUMMY_HASH);
  } catch {
    return false;
  }
}
