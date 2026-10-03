import { NextRequest, NextResponse } from "@/lib/next-server-shim";
import prisma from "@/lib/prisma";
import { ReceivePurchaseOrderSchema } from "@/schemas/purchase.schema";
import { InventoryService } from "@/services/inventory.service";
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
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!po) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = ReceivePurchaseOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { receivedItems, locationId } = parsed.data;

    // Process each item through InventoryService
    for (const item of receivedItems) {
      if (item.quantityReceived <= 0) continue;

      const orderItem = po.items.find((i) => i.id === item.orderItemId);
      if (!orderItem) continue;

      await InventoryService.processStockIn(
        {
          productId: item.productId,
          quantity: item.quantityReceived,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          purchasePrice: orderItem.unitCost,
          supplierId: po.supplierId,
          locationId: locationId ?? undefined,
          reason: `Goods Received against PO ${po.orderNumber}`,
          referenceType: "PURCHASE_ORDER",
          referenceId: po.id,
        },
        user.id
      );

      // Update purchase order item received quantity
      await prisma.purchaseOrderItem.update({
        where: { id: orderItem.id },
        data: {
          receivedQuantity: orderItem.receivedQuantity + item.quantityReceived,
        },
      });
    }

    // Update PO status
    const updatedPO = await prisma.purchaseOrder.update({
      where: { id: po.id },
      data: { status: "RECEIVED" },
      include: { items: true, supplier: true },
    });

    return NextResponse.json({ success: true, data: updatedPO });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
