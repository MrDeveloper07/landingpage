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
        { available: false, error: "Subdomain name query parameter is required" },
        { status: 400 }
      );
    }

    const name = rawName.toLowerCase().trim();

    if (!isValidSubdomainFormat(name)) {
      return NextResponse.json(
        {
          available: false,
          error: "Invalid subdomain format. Use 2-63 lowercase alphanumeric characters or hyphens.",
        },
        { status: 400 }
      );
    }

    if (isReservedSubdomain(name)) {
      return NextResponse.json(
        {
          available: false,
          error: `"${name}" is a reserved system subdomain and cannot be registered.`,
        },
        { status: 200 }
      );
    }

    await connectToDatabase();

    const existing = await SubdomainRequest.findOne({
      subdomain: name,
      status: { $in: ["pending", "approved"] },
    });

    if (existing) {
      return NextResponse.json(
        {
          available: false,
          error: `"${name}.is-a-coder.in" is already taken or currently under review.`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      available: true,
      subdomain: name,
      fullDomain: `${name}.is-a-coder.in`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Check Subdomain Error:", error);
    return NextResponse.json({ available: false, error: message }, { status: 500 });
  }
}
