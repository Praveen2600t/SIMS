import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AlertStatus, AlertSeverity, AlertType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as AlertStatus | null;
    const severity = searchParams.get("severity") as AlertSeverity | null;
    const type = searchParams.get("type") as AlertType | null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const where: Record<string, unknown> = {};
    if (status && status !== ("ALL" as unknown)) {
      where.status = status;
    } else {
      // By default show OPEN alerts first unless requested
      where.status = "OPEN";
    }

    if (severity && severity !== ("ALL" as unknown)) {
      where.severity = severity;
    }
    if (type && type !== ("ALL" as unknown)) {
      where.alertType = type;
    }

    const [total, alerts] = await Promise.all([
      prisma.alert.count({ where }),
      prisma.alert.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
        include: {
          product: {
            select: {
              id: true,
              name: true,
              productCode: true,
              unit: true,
              currentQuantity: true,
              minStockLevel: true,
              district: true,
              marketLocation: true,
            },
          },
          batch: {
            select: {
              id: true,
              batchNumber: true,
              expiryDate: true,
              quantity: true,
            },
          },
          resolvedBy: {
            select: { name: true, role: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: alerts,
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
