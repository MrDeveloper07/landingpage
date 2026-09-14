import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SubdomainRequest from "@/models/SubdomainRequest";
import { isReservedSubdomain, isValidSubdomainFormat } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawName = searchParams.get("name");

    if (!rawName) {
      return NextResponse.json(
        { available: false, error: "Subdomain name is required" },
        { status: 200 }
      );
    }

    const name = rawName.toLowerCase().trim();

    if (!isValidSubdomainFormat(name)) {
      return NextResponse.json(
        {
          available: false,
          error: "Use 2-63 lowercase alphanumeric characters or hyphens.",
        },
        { status: 200 }
      );
    }

    if (isReservedSubdomain(name)) {
      return NextResponse.json(
        {
          available: false,
          error: `"${name}" is a reserved system name.`,
        },
        { status: 200 }
      );
    }

    try {
      await connectToDatabase();

      const existing = await SubdomainRequest.findOne({
        subdomain: name,
        status: { $in: ["pending", "approved"] },
      });

      if (existing) {
        return NextResponse.json(
          {
            available: false,
            error: `"${name}.is-a-coder.in" is already taken or under review.`,
          },
          { status: 200 }
        );
      }
    } catch (dbError) {
      console.warn("MongoDB check warning (fallback to local verification):", dbError);
      // Fallback: if database has a connection issue, allow user to continue based on reserved words validation
    }

    return NextResponse.json({
      available: true,
      subdomain: name,
      fullDomain: `${name}.is-a-coder.in`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Check Subdomain Error:", error);
    return NextResponse.json({ available: false, error: message }, { status: 200 });
  }
}
