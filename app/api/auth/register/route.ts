import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { generateToken, hashPassword } from "@/lib/auth";
import {
  checkRateLimit,
  getClientIp,
  validateEmail,
  validatePassword,
  validateName,
} from "@/lib/security";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // IP Rate limit on registration submissions: Max 15 attempts per 15 minutes
    const ipLimit = checkRateLimit(`register:ip:${clientIp}`, 15, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many registration attempts. Please try again in ${Math.ceil(
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

    const { name, email, password, otp } = body;

    const nameValidation = validateName(name);
    if (!nameValidation.valid || !nameValidation.sanitized) {
      return NextResponse.json(
        { error: nameValidation.error || "Please provide a valid name" },
        { status: 400 }
      );
    }

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

    if (!otp || typeof otp !== "string" || otp.trim().length !== 6 || !/^\d{6}$/.test(otp.trim())) {
      return NextResponse.json(
        { error: "A valid 6-digit numeric verification code is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = emailValidation.normalized;
    const cleanOtp = otp.trim();
    const cleanName = nameValidation.sanitized;
    const cleanPassword = password as string;

    // Verify OTP record
    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose: "registration",
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Verification code has expired or was not requested. Please request a new code." },
        { status: 400 }
      );
    }

    // Check brute force attempts on the OTP code
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { error: "Too many incorrect OTP attempts. Please request a new verification code." },
        { status: 400 }
      );
    }

    if (otpRecord.otp !== cleanOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remaining = 5 - otpRecord.attempts;
      return NextResponse.json(
        { error: `Invalid verification code. (${remaining} attempt(s) remaining)` },
        { status: 400 }
      );
    }

    // OTP is valid! Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      await Otp.deleteMany({ email: normalizedEmail, purpose: "registration" });
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Clean up OTP record
    await Otp.deleteMany({ email: normalizedEmail, purpose: "registration" });

    // Check admin role
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase());
    const role = adminEmails.includes(normalizedEmail) ? "admin" : "user";

    const hashedPassword = await hashPassword(cleanPassword);
    const newSessionId = crypto.randomUUID();

    const newUser = await User.create({
      name: cleanName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      currentSessionId: newSessionId,
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
    });

    const sessionUser = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      sessionId: newSessionId,
    };

    const token = generateToken(sessionUser);

    const response = NextResponse.json({
      success: true,
      user: sessionUser,
      message: "Account verified and created successfully!",
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
    console.error("Register Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
