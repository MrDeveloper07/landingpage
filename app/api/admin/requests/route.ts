import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SubdomainRequest from "@/models/SubdomainRequest";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    const requests = await SubdomainRequest.find(query).sort({ createdAt: -1 });

    const totalCount = await SubdomainRequest.countDocuments();
    const pendingCount = await SubdomainRequest.countDocuments({ status: "pending" });
    const approvedCount = await SubdomainRequest.countDocuments({ status: "approved" });
    const rejectedCount = await SubdomainRequest.countDocuments({ status: "rejected" });

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      requests,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Admin Fetch Requests Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
