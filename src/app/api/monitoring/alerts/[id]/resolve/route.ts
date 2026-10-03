import { NextRequest, NextResponse } from "@/lib/next-server-shim";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body.action || "RESOLVE"; // RESOLVE or ACKNOWLEDGE

    const alert = await prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        status: action === "ACKNOWLEDGE" ? "ACKNOWLEDGED" : "RESOLVED",
        resolvedAt: action === "RESOLVE" ? new Date() : undefined,
        resolvedByUserId: user.id,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: `ALERT_${action}`,
        entityType: "ALERT",
        entityId: alert.id,
        detailsJson: JSON.stringify({
          alertType: alert.alertType,
          productId: alert.productId,
          message: alert.message,
        }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
