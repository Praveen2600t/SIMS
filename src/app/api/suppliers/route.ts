import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true, purchaseOrders: true },
        },
      },
    });
    return NextResponse.json({ data: suppliers });
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
    const { name, district, contactPerson, email, phone, address } = body;

    if (!name || !district) {
      return NextResponse.json({ error: "Name and district are required" }, { status: 400 });
    }

    const count = await prisma.supplier.count();
    const supplierCode = `SUP-TN-${String(count + 1).padStart(2, "0")}`;

    const newSupplier = await prisma.supplier.create({
      data: {
        supplierCode,
        name,
        district,
        contactPerson,
        email,
        phone,
        address,
        isSampleData: false,
      },
    });

    return NextResponse.json({ success: true, data: newSupplier }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
