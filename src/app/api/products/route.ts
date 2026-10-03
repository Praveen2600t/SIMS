import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ProductSchema, ProductQuerySchema } from "@/schemas/product.schema";
import { getUserFromRequest } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryObj = {
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      district: searchParams.get("district") || undefined,
      marketLocation: searchParams.get("marketLocation") || undefined,
      supplierId: searchParams.get("supplierId") || undefined,
      stockStatus: (searchParams.get("stockStatus") as "ALL" | "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK") || undefined,
      expiryStatus: (searchParams.get("expiryStatus") as "ALL" | "EXPIRING_SOON" | "EXPIRED" | "VALID") || undefined,
      sortBy: (searchParams.get("sortBy") as "name" | "currentQuantity" | "purchasePrice" | "sellingPrice" | "createdAt" | "district") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const parsed = ProductQuerySchema.safeParse(queryObj);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid query parameters", details: parsed.error.format() }, { status: 400 });
    }

    const { page, limit, search, category, district, marketLocation, supplierId, stockStatus, expiryStatus, sortBy, sortOrder } = parsed.data;

    const where: Prisma.ProductWhereInput = {
      isArchived: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { productCode: { contains: search, mode: "insensitive" } },
        { subcategory: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (district) {
      where.district = { equals: district, mode: "insensitive" };
    }

    if (marketLocation) {
      where.marketLocation = { equals: marketLocation, mode: "insensitive" };
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (stockStatus && stockStatus !== "ALL") {
      if (stockStatus === "OUT_OF_STOCK") {
        where.currentQuantity = { lte: 0 };
      } else if (stockStatus === "LOW_STOCK") {
        // low stock condition: currentQuantity > 0 and currentQuantity <= minStockLevel
        // In Prisma, we can filter currentQuantity or handle via raw/computed or post-filter if needed.
        // For direct query:
        where.currentQuantity = { gt: 0, lte: 20 };
      } else if (stockStatus === "NORMAL") {
        where.currentQuantity = { gt: 20 };
      }
    }

    const now = new Date();
    const expiryWindow = new Date();
    expiryWindow.setDate(now.getDate() + 7);

    if (expiryStatus && expiryStatus !== "ALL") {
      if (expiryStatus === "EXPIRED") {
        where.batches = {
          some: {
            status: "EXPIRED",
            quantity: { gt: 0 },
          },
        };
      } else if (expiryStatus === "EXPIRING_SOON") {
        where.batches = {
          some: {
            status: "ACTIVE",
            quantity: { gt: 0 },
            expiryDate: {
              gte: now,
              lte: expiryWindow,
            },
          },
        };
      } else if (expiryStatus === "VALID") {
        where.batches = {
          some: {
            status: "ACTIVE",
            quantity: { gt: 0 },
            expiryDate: {
              gt: expiryWindow,
            },
          },
        };
      }
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: { select: { id: true, name: true, code: true } },
          supplier: { select: { id: true, name: true, supplierCode: true } },
          batches: {
            where: { quantity: { gt: 0 } },
            orderBy: { expiryDate: "asc" },
            take: 3,
          },
          alerts: {
            where: { status: "OPEN" },
            select: { id: true, alertType: true, severity: true, message: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      data: products,
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

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { productCode: parsed.data.productCode },
    });

    if (existing) {
      return NextResponse.json({ error: "Product code already exists" }, { status: 409 });
    }

    const newProduct = await prisma.product.create({
      data: {
        ...parsed.data,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    // Create initial batch if quantity > 0
    if (parsed.data.currentQuantity > 0) {
      const batchNumber = `BCH-INIT-${newProduct.productCode}`;
      await prisma.inventoryBatch.create({
        data: {
          productId: newProduct.id,
          batchNumber,
          quantity: parsed.data.currentQuantity,
          initialQuantity: parsed.data.currentQuantity,
          purchasePrice: parsed.data.purchasePrice,
          supplierId: parsed.data.supplierId,
          locationId: parsed.data.locationId,
          status: "ACTIVE",
        },
      });

      await prisma.stockMovement.create({
        data: {
          productId: newProduct.id,
          movementType: "IN",
          quantity: parsed.data.currentQuantity,
          previousQuantity: 0,
          newQuantity: parsed.data.currentQuantity,
          reason: "Initial Product Creation Stock",
          referenceType: "PRODUCT_CREATION",
          unitPrice: parsed.data.purchasePrice,
          performedByUserId: user.id,
        },
      });
    }

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
