import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { getVerifiedSession, comparePassword, hashPassword, generateToken } from "@/lib/auth";
import { validateName, validatePassword } from "@/lib/security";

// GET: Return current authenticated user profile
export async function GET() {
  try {
    const { session, sessionTerminated, user } = await getVerifiedSession();
    if (sessionTerminated) {
      const response = NextResponse.json(
        {
          authenticated: false,
          sessionTerminated: true,
          reason: "session_replaced",
          error: "Your account was logged into on another device. This session has been terminated.",
        },
        { status: 401 }
      );
      response.cookies.delete("is_a_coder_token");
      return response;
    }

    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT / POST: Update profile (Name or Password)
export async function PUT(req: Request) {
  try {
    const { session, sessionTerminated, user } = await getVerifiedSession();
    if (sessionTerminated) {
      const response = NextResponse.json(
        {
          authenticated: false,
          sessionTerminated: true,
          reason: "session_replaced",
          error: "Your account was logged into on another device. This session has been terminated.",
        },
        { status: 401 }
      );
      response.cookies.delete("is_a_coder_token");
      return response;
    }

    if (!session || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, currentPassword, newPassword } = body;

    let nameUpdated = false;
    let passwordUpdated = false;

    // 1. Update Name if provided
    if (name !== undefined) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid || !nameValidation.sanitized) {
        return NextResponse.json(
          { error: nameValidation.error || "Invalid name provided" },
          { status: 400 }
        );
      }
      user.name = nameValidation.sanitized;
      nameUpdated = true;
    }

    // 2. Update Password if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password" },
          { status: 400 }
        );
      }

      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return NextResponse.json(
          { error: passwordValidation.error || "Invalid new password" },
          { status: 400 }
        );
      }

      if (!user.password) {
        return NextResponse.json(
          { error: "Password not configured for this account" },
          { status: 400 }
        );
      }

      const isCurrentCorrect = await comparePassword(currentPassword, user.password);
      if (!isCurrentCorrect) {
        return NextResponse.json(
          { error: "Incorrect current password" },
          { status: 400 }
        );
      }

      const hashedNew = await hashPassword(newPassword);
      user.password = hashedNew;
      passwordUpdated = true;
    }

    if (!nameUpdated && !passwordUpdated) {
      return NextResponse.json(
        { error: "No changes provided to update." },
        { status: 400 }
      );
    }

    await user.save();

    const updatedSession = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      sessionId: user.currentSessionId || session.sessionId,
    };

    const newToken = generateToken(updatedSession);

    const response = NextResponse.json({
      success: true,
      message: passwordUpdated
        ? "Password and profile updated successfully!"
        : "Profile name updated successfully!",
      user: updatedSession,
    });

    response.cookies.set("is_a_coder_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
