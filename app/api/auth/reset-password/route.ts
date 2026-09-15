import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { hashPassword } from "@/lib/auth";
import {
  checkRateLimit,
  getClientIp,
  validateEmail,
  validatePassword,
} from "@/lib/security";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);

    // Rate limit per IP: Max 10 reset attempts per 15 minutes
    const ipLimit = checkRateLimit(`reset-pass:ip:${clientIp}`, 10, 15 * 60 * 1000);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many password reset requests from your IP. Please try again in ${Math.ceil(
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

    const { email, newPassword, otp } = body;

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid || !emailValidation.normalized) {
      return NextResponse.json(
        { error: emailValidation.error || "Invalid email address format" },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || "Invalid new password format" },
        { status: 400 }
      );
    }

    const normalizedEmail = emailValidation.normalized;
    const cleanNewPassword = newPassword as string;

    await connectToDatabase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address" },
        { status: 404 }
      );
    }

    // If OTP is provided, verify it strictly
    if (otp) {
      const cleanOtp = otp.toString().trim();
      const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        purpose: "reset_password",
      });

      if (!otpRecord) {
        return NextResponse.json(
          { error: "Verification code has expired or was not requested. Please request a new code." },
          { status: 400 }
        );
      }

      if (otpRecord.attempts >= 5) {
        await Otp.deleteOne({ _id: otpRecord._id });
        return NextResponse.json(
          { error: "Too many incorrect attempts. Please request a new code." },
          { status: 400 }
        );
      }

      if (otpRecord.otp !== cleanOtp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return NextResponse.json(
          { error: `Invalid verification code. (${5 - otpRecord.attempts} attempts remaining)` },
          { status: 400 }
        );
      }

      await Otp.deleteMany({ email: normalizedEmail, purpose: "reset_password" });
    }

    const hashedPassword = await hashPassword(cleanNewPassword);
    user.password = hashedPassword;
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Reset Password Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
