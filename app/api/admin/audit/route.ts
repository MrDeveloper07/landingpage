import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
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
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase().trim();

    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (category && category !== "all") {
      query.category = category;
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(100);

    const filtered = search
      ? logs.filter(
          (l) =>
            l.action.toLowerCase().includes(search) ||
            l.actorEmail.toLowerCase().includes(search) ||
            (l.target && l.target.toLowerCase().includes(search)) ||
            l.details.toLowerCase().includes(search)
        )
      : logs;

    return NextResponse.json({
      success: true,
      logs: filtered,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Admin Fetch Audit Logs Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
