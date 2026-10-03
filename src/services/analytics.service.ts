import prisma from "@/lib/prisma";

export class AnalyticsService {
  /**
   * Fetches centralized real-time dashboard metrics calculated directly from the database.
   * Performs safe sequential batches to respect connection pool limits.
   */
  static async getDashboardMetrics() {
    const now = new Date();
    const expiryWarningDate = new Date();
    expiryWarningDate.setDate(now.getDate() + 14);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Batch 1: Products & Categories
    const totalProducts = await prisma.product.count({ where: { isArchived: false } });
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        name: true,
        productCode: true,
        currentQuantity: true,
        minStockLevel: true,
        purchasePrice: true,
        sellingPrice: true,
        storageLocation: true,
        categoryId: true,
      },
    });

    const categories = await prisma.category.findMany({
      select: { id: true, name: true, code: true },
    });

    // Batch 2: Alerts & Expiries
    const [openAlerts, expiringBatches, expiredBatches] = await Promise.all([
      prisma.alert.findMany({
        where: { status: "OPEN" },
        include: {
          product: { select: { name: true, productCode: true, unit: true, storageLocation: true } },
        },
        orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
        take: 12,
      }),
      prisma.inventoryBatch.count({
        where: {
          status: "ACTIVE",
          quantity: { gt: 0 },
          expiryDate: {
            gte: now,
            lte: expiryWarningDate,
          },
        },
      }),
      prisma.inventoryBatch.count({
        where: {
          status: "EXPIRED",
          quantity: { gt: 0 },
        },
      }),
    ]);

    // Batch 3: Recent Movements & Sales
    const [recentMovements, todayMovements, totalSalesAgg, recentSales] = await Promise.all([
      prisma.stockMovement.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, productCode: true, unit: true, storageLocation: true } },
          performedBy: { select: { name: true, role: true } },
        },
      }),
      prisma.stockMovement.findMany({
        where: { createdAt: { gte: startOfDay } },
        select: { movementType: true, quantity: true },
      }),
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: { select: { name: true, productCode: true } } },
          },
        },
      }),
    ]);

    // Daily Stock Analysis
    let receivedToday = 0;
    let issuedToday = 0;
    for (const m of todayMovements) {
      if (m.movementType === "IN" || m.movementType === "RETURN") {
        receivedToday += m.quantity;
      } else if (m.movementType === "OUT" || m.movementType === "SALE" || m.movementType === "DAMAGE") {
        issuedToday += m.quantity;
      }
    }

    // Core stock counts and inventory valuation
    let totalInventoryValue = 0;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const locationMap = new Map<string, { count: number; value: number; stock: number }>();
    const categoryMap = new Map<string, { count: number; value: number }>();

    for (const p of products) {
      const itemValue = p.currentQuantity * p.purchasePrice;
      totalInventoryValue += itemValue;
      totalStockUnits += p.currentQuantity;

      if (p.currentQuantity <= 0) {
        outOfStockCount++;
      } else if (p.currentQuantity <= p.minStockLevel) {
        lowStockCount++;
      }

      // Warehouse / Storage Zone aggregation
      const loc = p.storageLocation || "Central Warehouse";
      const existingLoc = locationMap.get(loc) || { count: 0, value: 0, stock: 0 };
      locationMap.set(loc, {
        count: existingLoc.count + 1,
        value: existingLoc.value + itemValue,
        stock: existingLoc.stock + p.currentQuantity,
      });

      // Category aggregation
      const catId = p.categoryId;
      const existingCat = categoryMap.get(catId) || { count: 0, value: 0 };
      categoryMap.set(catId, {
        count: existingCat.count + 1,
        value: existingCat.value + itemValue,
      });
    }

    const categoryNameLookup = new Map(categories.map((c) => [c.id, c.name]));
    const categoryDistribution = Array.from(categoryMap.entries()).map(([catId, data]) => ({
      categoryId: catId,
      name: categoryNameLookup.get(catId) || "General",
      productsCount: data.count,
      inventoryValue: Math.round(data.value),
    }));

    const storageDistribution = Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        productsCount: data.count,
        totalStock: Math.round(data.stock),
        inventoryValue: Math.round(data.value),
      }))
      .sort((a, b) => b.inventoryValue - a.inventoryValue);

    const openAlertsCount = openAlerts.length;
    const criticalAlertsCount = openAlerts.filter((a) => a.severity === "CRITICAL").length;

    // Daily Stock Balance Analysis Summary
    const dailyStockAnalysis = {
      openingStock: Math.max(0, Math.round(totalStockUnits - receivedToday + issuedToday)),
      receivedToday: Math.round(receivedToday),
      issuedToday: Math.round(issuedToday),
      closingStock: Math.round(totalStockUnits),
      netDailyChange: Math.round(receivedToday - issuedToday),
    };

    // Daily Summary Report Object
    const dailySummary = {
      totalMonitored: totalProducts,
      totalStockUnits: Math.round(totalStockUnits),
      lowStockItems: lowStockCount,
      outOfStockItems: outOfStockCount,
      nearExpiryBatches: expiringBatches,
      expiredBatches: expiredBatches,
      unresolvedAlerts: openAlertsCount,
      totalValuation: Math.round(totalInventoryValue),
    };

    return {
      overview: {
        totalProducts,
        totalInventoryValue: Math.round(totalInventoryValue),
        totalStockUnits: Math.round(totalStockUnits),
        lowStockCount,
        outOfStockCount,
        expiringSoonCount: expiringBatches,
        expiredCount: expiredBatches,
        openAlertsCount,
        criticalAlertsCount,
        totalSalesRevenue: totalSalesAgg._sum.totalAmount || 0,
        totalSalesOrders: totalSalesAgg._count.id || 0,
      },
      dailyStockAnalysis,
      dailySummary,
      categoryDistribution,
      storageDistribution,
      recentAlerts: openAlerts,
      recentMovements,
      recentSales,
    };
  }

  /**
   * Generates dated reports across custom day horizons (7, 30, 90 days)
   */
  static async getReportsData(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const movementsByType = await prisma.stockMovement.groupBy({
      by: ["movementType"],
      where: { createdAt: { gte: startDate } },
      _count: { id: true },
      _sum: { quantity: true },
    });

    const salesOverTime = await prisma.sale.findMany({
      where: { createdAt: { gte: startDate } },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const alertsSummary = await prisma.alert.groupBy({
      by: ["alertType", "status"],
      _count: { id: true },
    });

    return {
      movementsByType,
      salesOverTime,
      alertsSummary,
    };
  }
}
