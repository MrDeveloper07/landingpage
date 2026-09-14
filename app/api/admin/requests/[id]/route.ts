import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import SubdomainRequest from "@/models/SubdomainRequest";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { status, rejectionReason } = await req.json();

    if (!["approved", "rejected", "pending", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    await connectToDatabase();

    const request = await SubdomainRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "Subdomain request not found" }, { status: 404 });
    }

    request.status = status;
    if (status === "rejected") {
      request.rejectionReason = rejectionReason || "Rejected by administrator";
    } else if (status === "approved") {
      request.rejectionReason = undefined;
    }

    await request.save();

    return NextResponse.json({
      success: true,
      message: `Subdomain status updated to ${status}`,
      subdomain: request,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Admin Update Request Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await params;

    await connectToDatabase();

    const deleted = await SubdomainRequest.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Subdomain request not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Subdomain request deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Admin Delete Request Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
