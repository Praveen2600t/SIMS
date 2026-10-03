import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProductUpdateSchema } from "@/schemas/product.schema";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        location: true,
        batches: {
          orderBy: { createdAt: "desc" },
        },
        stockMovements: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            performedBy: { select: { name: true, role: true } },
          },
        },
        alerts: {
          where: { status: "OPEN" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = ProductUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: {
        category: true,
        supplier: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin role required" }, { status: 403 });
    }

    const { id } = await params;

    // Soft delete/archive to preserve historical financial and audit consistency
    await prisma.product.update({
      where: { id },
      data: { isArchived: true },
    });

    return NextResponse.json({ success: true, message: "Product archived successfully" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
