import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import SubdomainRequest from "@/models/SubdomainRequest";
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
    const search = searchParams.get("search")?.toLowerCase().trim();

    await connectToDatabase();

    const users = await User.find({}, "-password").sort({ createdAt: -1 }).lean();

    // High-performance MongoDB aggregation pipeline for user subdomain counts
    const aggregationResults = await SubdomainRequest.aggregate([
      {
        $group: {
          _id: "$userId",
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
        },
      },
    ]);

    const subdomainsByUser: Record<string, { total: number; approved: number }> = {};
    aggregationResults.forEach((item) => {
      if (item._id) {
        subdomainsByUser[item._id.toString()] = {
          total: item.total || 0,
          approved: item.approved || 0,
        };
      }
    });

    const enrichedUsers = users.map((u) => {
      const counts = subdomainsByUser[u._id.toString()] || { total: 0, approved: 0 };
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        maxSubdomains: typeof u.maxSubdomains === "number" ? u.maxSubdomains : 3,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        subdomainCount: counts.total,
        approvedSubdomains: counts.approved,
      };
    });

    const filtered = search
      ? enrichedUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            u.role.toLowerCase().includes(search)
        )
      : enrichedUsers;

    return NextResponse.json({
      success: true,
      users: filtered,
      stats: {
        totalUsers: users.length,
        adminUsers: users.filter((u) => u.role === "admin").length,
        standardUsers: users.filter((u) => u.role === "user").length,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Admin Fetch Users Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, name, email, role, maxSubdomains } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectToDatabase();

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const changes: string[] = [];

    if (name && typeof name === "string" && name.trim() !== targetUser.name) {
      changes.push(`name: "${targetUser.name}" → "${name.trim()}"`);
      targetUser.name = name.trim();
    }

    if (email && typeof email === "string" && email.trim().toLowerCase() !== targetUser.email.toLowerCase()) {
      const existingUser = await User.findOne({ email: email.trim().toLowerCase(), _id: { $ne: userId } });
      if (existingUser) {
        return NextResponse.json({ error: "Email is already taken by another account." }, { status: 400 });
      }
      changes.push(`email: "${targetUser.email}" → "${email.trim().toLowerCase()}"`);
      targetUser.email = email.trim().toLowerCase();
    }

    if (role && ["user", "admin"].includes(role) && role !== targetUser.role) {
      changes.push(`role: "${targetUser.role}" → "${role}"`);
      targetUser.role = role;
    }

    if (typeof maxSubdomains === "number" && maxSubdomains >= 1 && maxSubdomains !== targetUser.maxSubdomains) {
      const prevLimit = targetUser.maxSubdomains || 3;
      changes.push(`subdomain quota: ${prevLimit} → ${maxSubdomains}`);
      targetUser.maxSubdomains = maxSubdomains;
    }

    if (changes.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No changes detected",
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          maxSubdomains: targetUser.maxSubdomains || 3,
        },
      });
    }

    await targetUser.save();

    // Log audit trail
    await AuditLog.create({
      action: "user.updated",
      category: "user",
      actorEmail: session.email,
      target: targetUser.email,
      details: `Updated user account (${changes.join(", ")})`,
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        maxSubdomains: targetUser.maxSubdomains || 3,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Admin Update User Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    let userId = searchParams.get("id");
    let adminPassword = req.headers.get("x-admin-password") || "";

    try {
      const body = await req.json();
      if (body?.id) userId = body.id;
      if (body?.adminPassword) adminPassword = body.adminPassword;
    } catch {
      // Body may be empty if passed via query/headers
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!adminPassword || typeof adminPassword !== "string") {
      return NextResponse.json(
        { error: "Admin password is required to authorize account deletion." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify current admin's password
    const bcrypt = (await import("bcryptjs")).default;
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
        target: userId,
        details: "Failed admin password verification during user deletion attempt",
      });
      return NextResponse.json(
        { error: "Incorrect admin password. Deletion authorization failed." },
        { status: 401 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser.email === session.email) {
      return NextResponse.json({ error: "You cannot delete your own admin account" }, { status: 400 });
    }

    // Delete user and associated subdomains
    await User.findByIdAndDelete(userId);
    await SubdomainRequest.deleteMany({ userId });

    // Log audit trail
    await AuditLog.create({
      action: "user.deleted",
      category: "user",
      actorEmail: session.email,
      target: targetUser.email,
      details: `Deleted user account and cleaned up associated subdomain requests`,
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Admin Delete User Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
