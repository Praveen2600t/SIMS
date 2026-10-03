import { NextRequest, NextResponse } from "@/lib/next-server-shim";
import prisma from "@/lib/prisma";
import { CreatePurchaseOrderSchema } from "@/schemas/purchase.schema";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        supplier: { select: { id: true, name: true, district: true } },
        createdBy: { select: { name: true } },
        items: {
          include: {
            product: { select: { name: true, productCode: true, unit: true } },
          },
        },
      },
    });
    return NextResponse.json({ data: orders });
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
    const parsed = CreatePurchaseOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { supplierId, expectedDeliveryDate, notes, items } = parsed.data;

    const count = await prisma.purchaseOrder.count();
    const orderNumber = `PO-TN-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const totalCost = items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);

    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        notes,
        totalCost,
        status: "APPROVED",
        createdByUserId: user.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            totalCost: item.quantity * item.unitCost,
          })),
        },
      },
      include: {
        supplier: true,
        items: { include: { product: true } },
      },
    });

    return NextResponse.json({ success: true, data: po }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
