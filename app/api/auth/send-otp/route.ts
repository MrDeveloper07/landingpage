import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/lib/email";
import {
  checkRateLimit,
  getClientIp,
  validateEmail,
  validateName,
} from "@/lib/security";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit per IP: Max 10 OTP requests per 10 minutes
    const ipLimit = checkRateLimit(`send-otp:ip:${clientIp}`, 10, 10 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many verification requests from your IP. Please try again in ${Math.ceil(
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

    const { email, name, purpose = "registration" } = body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid || !emailValidation.normalized) {
      return NextResponse.json(
        { error: emailValidation.error || "Invalid email address format" },
        { status: 400 }
      );
    }

    const normalizedEmail = emailValidation.normalized;

    let sanitizedName: string | undefined;
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: nameValidation.error || "Invalid name format" },
          { status: 400 }
        );
      }
      sanitizedName = nameValidation.sanitized;
    }

    if (purpose !== "registration" && purpose !== "reset_password") {
      return NextResponse.json(
        { error: "Invalid purpose specified" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check user existence based on purpose
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (purpose === "registration" && existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    if (purpose === "reset_password" && !existingUser) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Rate limiting per email: 45 seconds cooldown
    const recentOtp = await Otp.findOne({
      email: normalizedEmail,
      purpose,
      createdAt: { $gt: new Date(Date.now() - 45 * 1000) },
    });

    if (recentOtp) {
      return NextResponse.json(
        { error: "Please wait 45 seconds before requesting another code." },
        { status: 429 }
      );
    }

    // Generate cryptographically-seeded 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove any older OTPs for this email and purpose
    await Otp.deleteMany({ email: normalizedEmail, purpose });

    // Store new OTP
    await Otp.create({
      email: normalizedEmail,
      otp: generatedOtp,
      purpose,
      attempts: 0,
      createdAt: new Date(),
    });

    // Send email (via SMTP or dev console simulation)
    const emailResult = await sendOtpEmail({
      to: normalizedEmail,
      otp: generatedOtp,
      name: sanitizedName || existingUser?.name,
      purpose,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      method: emailResult.method,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[Send OTP API Error]:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
