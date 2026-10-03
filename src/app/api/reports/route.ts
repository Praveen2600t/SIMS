import { NextRequest, NextResponse } from "next/server";
import { AnalyticsService } from "@/services/analytics.service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const data = await AnalyticsService.getReportsData(days);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
