import { NextRequest, NextResponse } from "next/server";
import { StockAdjustmentSchema } from "@/schemas/stock.schema";
import { InventoryService } from "@/services/inventory.service";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = StockAdjustmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const result = await InventoryService.processAdjustment(parsed.data, user.id);
    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
