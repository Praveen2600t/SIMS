import { NextRequest, NextResponse } from "next/server";
import { CSVService } from "@/services/csv.service";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";
    let csvText = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No CSV file provided in form data" }, { status: 400 });
      }
      csvText = await file.text();
    } else {
      csvText = await req.text();
    }

    if (!csvText || csvText.trim().length === 0) {
      return NextResponse.json({ error: "CSV content is empty" }, { status: 400 });
    }

    const result = await CSVService.importProductsCSV(csvText);

    return NextResponse.json({
      success: true,
      message: `Processed ${result.totalProcessed} records: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped.`,
      result,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
