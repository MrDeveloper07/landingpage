import { NextResponse } from "next/server";
import { getVerifiedSession } from "@/lib/auth";

export async function GET() {
  try {
    const { session, sessionTerminated, user } = await getVerifiedSession();

    if (sessionTerminated) {
      const response = NextResponse.json(
        {
          authenticated: false,
          sessionTerminated: true,
          reason: "session_replaced",
          error: "Your account was signed into from another device or browser. This session has been terminated.",
        },
        { status: 401 }
      );
      // Invalidate cookie on this client
      response.cookies.delete("is_a_coder_token");
      return response;
    }

    if (!session || !user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        name: session.name,
        email: session.email,
        role: session.role,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

