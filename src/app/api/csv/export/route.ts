import { NextResponse } from "@/lib/next-server-shim";
import { CSVService } from "@/services/csv.service";

export async function GET() {
  try {
    const csvData = await CSVService.exportProductsCSV();
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `general_inventory_export_${dateStr}.csv`;

    return new NextResponse(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
