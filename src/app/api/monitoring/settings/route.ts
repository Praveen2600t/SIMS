import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { MonitoringService, DEFAULT_MONITORING_CONFIG } from "@/services/monitoring.service";

export async function GET() {
  try {
    const config = await MonitoringService.getConfig();
    return NextResponse.json({ success: true, config });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { expiryWarningDays, anomalyDropPercentage, rapidAdjustmentLimit } = body;

    const updates = [
      { key: "expiryWarningDays", value: String(expiryWarningDays || DEFAULT_MONITORING_CONFIG.expiryWarningDays), description: "Perishable expiry warning window (days)" },
      { key: "anomalyDropPercentage", value: String(anomalyDropPercentage || DEFAULT_MONITORING_CONFIG.anomalyDropPercentage), description: "Sudden stock deduction threshold (%)" },
      { key: "rapidAdjustmentLimit", value: String(rapidAdjustmentLimit || DEFAULT_MONITORING_CONFIG.rapidAdjustmentLimit), description: "Frequent manual audit adjustment threshold" },
    ];

    for (const item of updates) {
      await prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: item,
      });
    }

    // Automatically re-evaluate monitoring rules with new settings
    const result = await MonitoringService.evaluateAll({
      expiryWarningDays: Number(expiryWarningDays),
      anomalyDropPercentage: Number(anomalyDropPercentage),
      rapidAdjustmentLimit: Number(rapidAdjustmentLimit),
    });

    return NextResponse.json({
      success: true,
      message: "Monitoring rules updated and system re-evaluated",
      result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
