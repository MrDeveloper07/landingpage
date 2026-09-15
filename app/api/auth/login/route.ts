import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { comparePassword, generateToken } from "@/lib/auth";
import {
  checkRateLimit,
  resetRateLimit,
  getClientIp,
  validateEmail,
  validatePassword,
  dummyComparePassword,
} from "@/lib/security";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // IP-level rate limit: max 15 requests per 15 minutes
    const ipLimit = checkRateLimit(`login:ip:${clientIp}`, 15, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many login attempts from your IP. Please try again in ${Math.ceil(
            ipLimit.retryAfterSeconds / 60
          )} minutes.`,
        },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { email, password } = body;

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid || !emailValidation.normalized) {
      return NextResponse.json(
        { error: emailValidation.error || "Invalid email address format" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || "Invalid password format" },
        { status: 400 }
      );
    }

    const normalizedEmail = emailValidation.normalized;
    const cleanPassword = password as string;

    // Account-level rate limit: max 5 failed attempts per 15 minutes
    const accountLimit = checkRateLimit(
      `login:email:${normalizedEmail}`,
      5,
      15 * 60 * 1000
    );
    if (!accountLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts for this account. For your security, this account is temporarily locked. Try again in ${Math.ceil(
            accountLimit.retryAfterSeconds / 60
          )} minutes or reset your password.`,
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: normalizedEmail });

    // Mitigate timing attack if user not found
    if (!user || !user.password) {
      await dummyComparePassword(cleanPassword);
      return NextResponse.json(
        { error: "Invalid email address or password" },
        { status: 401 }
      );
    }

    // Check database-level lockUntil
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / (60 * 1000)
      );
      return NextResponse.json(
        {
          error: `Account is temporarily locked due to consecutive failed attempts. Please wait ${remainingMinutes} minute(s) or reset your password.`,
        },
        { status: 429 }
      );
    }

    const isMatch = await comparePassword(cleanPassword, user.password);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      // Lock account for 15 minutes after 5 consecutive failures
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();

      const remainingTries = Math.max(0, 5 - user.failedLoginAttempts);
      const hint =
        remainingTries > 0
          ? ` (${remainingTries} attempts remaining before temporary lockout)`
          : "";

      return NextResponse.json(
        { error: `Invalid email address or password${hint}` },
        { status: 401 }
      );
    }

    // Single Active Session: Generate a new unique session identifier
    const newSessionId = crypto.randomUUID();
    user.currentSessionId = newSessionId;
    user.lastLoginAt = new Date();
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          currentSessionId: newSessionId,
          lastLoginAt: new Date(),
          failedLoginAttempts: 0,
        },
        $unset: { lockUntil: "" },
      }
    );

    resetRateLimit(`login:email:${normalizedEmail}`);
    resetRateLimit(`login:ip:${clientIp}`);

    // Auto promote to admin if configured in env
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());
    if (adminEmails.includes(normalizedEmail) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

    const sessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      sessionId: newSessionId,
    };

    const token = generateToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
    });

    response.cookies.set("is_a_coder_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Login Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
