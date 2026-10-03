import { NextRequest, NextResponse } from "next/server";
import { MonitoringService } from "@/services/monitoring.service";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Check either session authentication OR Cron Secret Bearer header
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "sicms_monitoring_cron_secret_tn_2026";
    const isCronAuthorized = authHeader === `Bearer ${cronSecret}`;

    if (!isCronAuthorized) {
      const user = await getUserFromRequest(req);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const result = await MonitoringService.evaluateAll();
    return NextResponse.json({
      success: true,
      message: "Continuous monitoring evaluation executed successfully",
      result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
