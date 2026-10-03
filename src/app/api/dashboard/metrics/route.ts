import { NextResponse } from "@/lib/next-server-shim";
import { AnalyticsService } from "@/services/analytics.service";

export async function GET() {
  try {
    const data = await AnalyticsService.getDashboardMetrics();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
