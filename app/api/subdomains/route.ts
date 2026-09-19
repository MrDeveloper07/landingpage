import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import SubdomainRequest from "@/models/SubdomainRequest";
import { getVerifiedSession, isReservedSubdomain, isValidSubdomainFormat } from "@/lib/auth";

// GET: List all subdomains for the logged-in user
export async function GET() {
  try {
    const { session, sessionTerminated } = await getVerifiedSession();

    if (sessionTerminated) {
      const response = NextResponse.json(
        {
          error: "Your account was logged into on another device. This session has been terminated.",
          sessionTerminated: true,
          reason: "session_replaced",
        },
        { status: 401 }
      );
      response.cookies.delete("is_a_coder_token");
      return response;
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please login." }, { status: 401 });
    }

    await connectToDatabase();

    const subdomains = await SubdomainRequest.find({ userId: session.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ success: true, subdomains });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Fetch User Subdomains Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST: Submit a new subdomain request
export async function POST(req: Request) {
  try {
    const { session, sessionTerminated } = await getVerifiedSession();

    if (sessionTerminated) {
      const response = NextResponse.json(
        {
          error: "Your account was logged into on another device. This session has been terminated.",
          sessionTerminated: true,
          reason: "session_replaced",
        },
        { status: 401 }
      );
      response.cookies.delete("is_a_coder_token");
      return response;
    }

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to request a subdomain." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { subdomain, recordType, target, description, repoUrl } = body;

    if (!subdomain || !recordType || !target) {
      return NextResponse.json(
        { error: "Subdomain, record type, and destination target are required." },
        { status: 400 }
      );
    }

    if (
      typeof subdomain !== "string" ||
      typeof recordType !== "string" ||
      typeof target !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid input data format." },
        { status: 400 }
      );
    }

    const cleanTarget = target.trim();
    if (cleanTarget.length > 255) {
      return NextResponse.json(
        { error: "Target value cannot exceed 255 characters." },
        { status: 400 }
      );
    }

    const normalizedSubdomain = subdomain.toLowerCase().trim();

    if (!isValidSubdomainFormat(normalizedSubdomain)) {
      return NextResponse.json(
        { error: "Invalid subdomain format. Use 2-63 characters (letters, numbers, hyphens)." },
        { status: 400 }
      );
    }

    if (isReservedSubdomain(normalizedSubdomain)) {
      return NextResponse.json(
        { error: `"${normalizedSubdomain}" is reserved and cannot be registered.` },
        { status: 400 }
      );
    }

    const validTypes = ["CNAME", "A", "AAAA", "TXT"];
    const upperRecordType = recordType.toUpperCase().trim();
    if (!validTypes.includes(upperRecordType)) {
      return NextResponse.json(
        { error: `Invalid record type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Look up user custom quota limit or default to 3
    const userDoc = await User.findById(session.id);
    const allowedLimit = (userDoc && typeof userDoc.maxSubdomains === "number" && userDoc.maxSubdomains > 0)
      ? userDoc.maxSubdomains
      : 3;

    // Check if user has already reached active quota limit
    const userActiveCount = await SubdomainRequest.countDocuments({
      userId: session.id,
      status: { $in: ["pending", "approved"] },
    });

    if (userActiveCount >= allowedLimit && session.role !== "admin") {
      return NextResponse.json(
        { error: `You have reached your limit of ${allowedLimit} subdomains for this account. Delete an inactive subdomain or contact support to request an increase.` },
        { status: 400 }
      );
    }

    // Check if subdomain is already taken or pending
    const existing = await SubdomainRequest.findOne({
      subdomain: normalizedSubdomain,
      status: { $in: ["pending", "approved"] },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Subdomain "${normalizedSubdomain}.is-a-coder.in" is already taken or pending approval.` },
        { status: 409 }
      );
    }

    const newRequest = await SubdomainRequest.create({
      userId: session.id,
      userName: session.name,
      userEmail: session.email,
      subdomain: normalizedSubdomain,
      recordType: upperRecordType as "CNAME" | "A" | "AAAA" | "TXT",
      target: cleanTarget,
      description: description && typeof description === "string" ? description.trim() : "",
      repoUrl: repoUrl && typeof repoUrl === "string" ? repoUrl.trim() : "",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      message: "Subdomain request submitted successfully!",
      subdomain: newRequest,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Create Subdomain Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE: Delete / Cancel a user's own subdomain request
export async function DELETE(req: Request) {
  try {
    const { session, sessionTerminated } = await getVerifiedSession();

    if (sessionTerminated) {
      const response = NextResponse.json(
        {
          error: "Your account was logged into on another device. This session has been terminated.",
          sessionTerminated: true,
          reason: "session_replaced",
        },
        { status: 401 }
      );
      response.cookies.delete("is_a_coder_token");
      return response;
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subdomain ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const subdomain = await SubdomainRequest.findOne({ _id: id, userId: session.id });

    if (!subdomain) {
      return NextResponse.json(
        { error: "Subdomain record not found or you do not have permission to delete it" },
        { status: 404 }
      );
    }

    await SubdomainRequest.deleteOne({ _id: id });

    return NextResponse.json({
      success: true,
      message: `Subdomain ${subdomain.subdomain}.is-a-coder.in removed successfully!`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Delete Subdomain Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
