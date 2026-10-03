import { NextRequest, NextResponse } from "@/lib/next-server-shim";
import prisma from "@/lib/prisma";
import { CreateSaleSchema } from "@/schemas/sale.schema";
import { InventoryService } from "@/services/inventory.service";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        createdBy: { select: { name: true } },
        location: { select: { name: true, district: true } },
        items: {
          include: {
            product: { select: { name: true, productCode: true, unit: true } },
          },
        },
      },
    });
    return NextResponse.json({ data: sales });
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
    const parsed = CreateSaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const { customerName, customerPhone, paymentMethod, locationId, items } = parsed.data;

    // Validate that stock is available for each item
    for (const item of items) {
      const prod = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!prod) {
        return NextResponse.json({ error: `Product ID ${item.productId} not found` }, { status: 400 });
      }
      if (prod.currentQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${prod.name}. Available: ${prod.currentQuantity} ${prod.unit}, Requested: ${item.quantity} ${prod.unit}` },
          { status: 400 }
        );
      }
    }

    const count = await prisma.sale.count();
    const invoiceNumber = `INV-TN-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    const totalAmount = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

    const sale = await prisma.sale.create({
      data: {
        invoiceNumber,
        customerName: customerName || "Retail Walk-in Customer",
        customerPhone,
        paymentMethod,
        totalAmount,
        paymentStatus: "PAID",
        locationId,
        createdByUserId: user.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            batchId: item.batchId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Deduct stock for each item using InventoryService for full consistency & audit
    for (const item of items) {
      await InventoryService.processStockOut(
        {
          productId: item.productId,
          batchId: item.batchId,
          quantity: item.quantity,
          movementType: "SALE",
          reason: `Sale ${invoiceNumber} to ${customerName || "Walk-in"}`,
          referenceType: "SALE",
          referenceId: sale.id,
        },
        user.id
      );
    }

    return NextResponse.json({ success: true, data: sale }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
