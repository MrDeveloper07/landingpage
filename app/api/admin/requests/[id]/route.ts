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

    // Create Audit Log
    try {
      const AuditLog = (await import("@/models/AuditLog")).default;
      await AuditLog.create({
        action: `subdomain.${status}`,
        category: "subdomain",
        actorEmail: session.email,
        target: `${request.subdomain}.is-a-coder.in`,
        details: status === "rejected" ? `Reason: ${rejectionReason}` : `Target: ${request.target} (${request.recordType})`,
      });
    } catch (e) {
      console.error("Audit log error:", e);
    }

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

    let adminPassword = req.headers.get("x-admin-password") || "";
    try {
      const body = await req.json();
      if (body?.adminPassword) {
        adminPassword = body.adminPassword;
      }
    } catch {
      // Body may be empty if passed via header
    }

    if (!adminPassword || typeof adminPassword !== "string") {
      return NextResponse.json(
        { error: "Admin password is required to authorize subdomain deletion." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const User = (await import("@/models/User")).default;
    const bcrypt = (await import("bcryptjs")).default;
    const AuditLog = (await import("@/models/AuditLog")).default;

    const currentAdmin = await User.findOne({ email: session.email });
    if (!currentAdmin || !currentAdmin.password) {
      return NextResponse.json({ error: "Admin authentication failed." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(adminPassword, currentAdmin.password);
    if (!isMatch) {
      await AuditLog.create({
        action: "security.deletion_rejected",
        category: "security",
        actorEmail: session.email,
        target: id,
        details: "Failed admin password verification during subdomain deletion attempt",
      });
      return NextResponse.json(
        { error: "Incorrect admin password. Deletion authorization failed." },
        { status: 401 }
      );
    }

    const deleted = await SubdomainRequest.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Subdomain request not found" }, { status: 404 });
    }

    // Create Audit Log
    try {
      await AuditLog.create({
        action: "subdomain.deleted",
        category: "subdomain",
        actorEmail: session.email,
        target: `${deleted.subdomain}.is-a-coder.in`,
        details: `Deleted request from ${deleted.userEmail}`,
      });
    } catch (e) {
      console.error("Audit log error:", e);
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
