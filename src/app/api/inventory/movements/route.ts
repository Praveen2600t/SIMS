import { NextRequest, NextResponse } from "@/lib/next-server-shim";
import prisma from "@/lib/prisma";
import { MovementType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const type = searchParams.get("type");
    const productId = searchParams.get("productId");

    const where: Record<string, unknown> = {};
    if (type && type !== "ALL") {
      where.movementType = type as MovementType;
    }
    if (productId) {
      where.productId = productId;
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, productCode: true, unit: true, district: true } },
          batch: { select: { id: true, batchNumber: true, expiryDate: true } },
          performedBy: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
