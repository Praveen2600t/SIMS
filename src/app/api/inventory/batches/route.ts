import { NextRequest, NextResponse } from "@/lib/next-server-shim";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (productId) where.productId = productId;
    if (status && status !== "ALL") where.status = status;

    const batches = await prisma.inventoryBatch.findMany({
      where,
      orderBy: { expiryDate: "asc" },
      include: {
        product: { select: { id: true, name: true, productCode: true, unit: true, district: true } },
        supplier: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ data: batches });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
