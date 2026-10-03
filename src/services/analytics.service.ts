import prisma from "@/lib/prisma";

export class AnalyticsService {
  /**
   * Fetches centralized real-time dashboard metrics calculated directly from the database.
   */
  static async getDashboardMetrics() {
    const now = new Date();
    const expiryWarningDate = new Date();
    expiryWarningDate.setDate(now.getDate() + 7);

    // Parallel aggregate queries for maximum performance
    const [
      totalProducts,
      products,
      categories,
      activeAlerts,
      recentMovements,
      totalSalesAgg,
      recentSales,
      expiringBatches,
      expiredBatches,
    ] = await Promise.all([
      // 1. Total products count
      prisma.product.count({ where: { isArchived: false } }),

      // 2. Products for stock metrics, values, and location breakdowns
      prisma.product.findMany({
        where: { isArchived: false },
        select: {
          id: true,
          currentQuantity: true,
          minStockLevel: true,
          purchasePrice: true,
          sellingPrice: true,
          district: true,
          categoryId: true,
        },
      }),

      // 3. Categories
      prisma.category.findMany({
        select: { id: true, name: true, code: true },
      }),

      // 4. Open alerts
      prisma.alert.findMany({
        where: { status: "OPEN" },
        include: {
          product: { select: { name: true, district: true, unit: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),

      // 5. Recent stock movements
      prisma.stockMovement.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { name: true, productCode: true, unit: true, district: true } },
          performedBy: { select: { name: true, role: true } },
        },
      }),

      // 6. Total sales
      prisma.sale.aggregate({
        _sum: { totalAmount: true },
        _count: { id: true },
      }),

      // 7. Recent sales
      prisma.sale.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      }),

      // 8. Batches expiring within 7 days
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

      // 9. Expired batches with quantity > 0
      prisma.inventoryBatch.count({
        where: {
          status: "EXPIRED",
          quantity: { gt: 0 },
        },
      }),
    ]);

    // Calculate core metrics
    let totalInventoryValue = 0;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const districtMap = new Map<string, { count: number; value: number; stock: number }>();
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

      // District aggregation
      const dist = p.district || "Other";
      const existingDist = districtMap.get(dist) || { count: 0, value: 0, stock: 0 };
      districtMap.set(dist, {
        count: existingDist.count + 1,
        value: existingDist.value + itemValue,
        stock: existingDist.stock + p.currentQuantity,
      });

      // Category aggregation
      const catId = p.categoryId;
      const existingCat = categoryMap.get(catId) || { count: 0, value: 0 };
      categoryMap.set(catId, {
        count: existingCat.count + 1,
        value: existingCat.value + itemValue,
      });
    }

    // Format category distribution
    const categoryNameLookup = new Map(categories.map((c) => [c.id, c.name]));
    const categoryDistribution = Array.from(categoryMap.entries()).map(([catId, data]) => ({
      categoryId: catId,
      name: categoryNameLookup.get(catId) || "Unknown",
      productsCount: data.count,
      inventoryValue: Math.round(data.value),
    }));

    // Format district distribution (sorted by inventory value)
    const districtDistribution = Array.from(districtMap.entries())
      .map(([district, data]) => ({
        district,
        productsCount: data.count,
        totalStock: Math.round(data.stock),
        inventoryValue: Math.round(data.value),
      }))
      .sort((a, b) => b.inventoryValue - a.inventoryValue);

    // Open alerts counts by severity
    const openAlertsCount = await prisma.alert.count({ where: { status: "OPEN" } });
    const criticalAlertsCount = await prisma.alert.count({
      where: { status: "OPEN", severity: "CRITICAL" },
    });

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
      categoryDistribution,
      districtDistribution,
      recentAlerts: activeAlerts,
      recentMovements,
      recentSales,
    };
  }

  /**
   * Reports data: Stock movement velocity, loss/waste report, and supplier order performance.
   */
  static async getReportsData(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [movementsByType, salesOverTime, alertsSummary] = await Promise.all([
      // Movement grouped by type
      prisma.stockMovement.groupBy({
        by: ["movementType"],
        where: { createdAt: { gte: startDate } },
        _count: { id: true },
        _sum: { quantity: true },
      }),

      // Sales over past days
      prisma.sale.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          totalAmount: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),

      // Alerts breakdown
      prisma.alert.groupBy({
        by: ["alertType", "status"],
        _count: { id: true },
      }),
    ]);

    return {
      movementsByType,
      salesOverTime,
      alertsSummary,
    };
  }
}
