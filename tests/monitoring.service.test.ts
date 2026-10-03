import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "../src/lib/prisma";
import { MonitoringService } from "../src/services/monitoring.service";

describe("Continuous Monitoring Engine & Anomaly Detection", () => {
  let zeroStockProductId: string;
  let lowStockProductId: string;
  let expiringProductId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    const cat = await prisma.category.upsert({
      where: { code: "CAT_MONITOR_TEST" },
      update: {},
      create: { code: "CAT_MONITOR_TEST", name: "Monitoring Test Category" },
    });
    testCategoryId = cat.id;

    // 1. Product with Zero Stock
    const pZero = await prisma.product.create({
      data: {
        productCode: `MON-ZERO-${Date.now()}`,
        name: "Zero Stock Test Veg",
        categoryId: testCategoryId,
        subcategory: "Vegetables",
        unit: "kg",
        currentQuantity: 0,
        minStockLevel: 25,
        district: "Madurai",
        marketLocation: "Mattuthavani Vegetable Market",
      },
    });
    zeroStockProductId = pZero.id;

    // 2. Product with Low Stock (10 <= 25)
    const pLow = await prisma.product.create({
      data: {
        productCode: `MON-LOW-${Date.now()}`,
        name: "Low Stock Test Fruit",
        categoryId: testCategoryId,
        subcategory: "Fruits",
        unit: "kg",
        currentQuantity: 10,
        minStockLevel: 25,
        district: "Salem",
        marketLocation: "Shevapet Wholesale Grain Market",
      },
    });
    lowStockProductId = pLow.id;

    // 3. Product with Expiring Soon Batch (expires in 3 days)
    const pExp = await prisma.product.create({
      data: {
        productCode: `MON-EXP-${Date.now()}`,
        name: "Expiring Batch Dairy",
        categoryId: testCategoryId,
        subcategory: "Dairy",
        unit: "packet",
        currentQuantity: 40,
        minStockLevel: 10,
        district: "Coimbatore",
        marketLocation: "MGR Wholesale Vegetable Mandi",
      },
    });
    expiringProductId = pExp.id;

    const inThreeDays = new Date();
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    await prisma.inventoryBatch.create({
      data: {
        productId: pExp.id,
        batchNumber: `EXP-BCH-${Date.now()}`,
        quantity: 40,
        initialQuantity: 40,
        expiryDate: inThreeDays,
        status: "ACTIVE",
      },
    });
  });

  afterAll(async () => {
    const ids = [zeroStockProductId, lowStockProductId, expiringProductId].filter(Boolean);
    await prisma.alert.deleteMany({ where: { productId: { in: ids } } });
    await prisma.inventoryBatch.deleteMany({ where: { productId: { in: ids } } });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
  });

  it("should evaluate and generate OUT_OF_STOCK and LOW_STOCK alerts", async () => {
    const runResult = await MonitoringService.evaluateAll();

    expect(runResult.productsEvaluated).toBeGreaterThan(0);

    // Verify zero stock alert
    const zeroAlert = await prisma.alert.findFirst({
      where: {
        productId: zeroStockProductId,
        alertType: "OUT_OF_STOCK",
        status: "OPEN",
      },
    });
    expect(zeroAlert).toBeDefined();
    expect(zeroAlert?.severity).toBe("CRITICAL");

    // Verify low stock alert
    const lowAlert = await prisma.alert.findFirst({
      where: {
        productId: lowStockProductId,
        alertType: "LOW_STOCK",
        status: "OPEN",
      },
    });
    expect(lowAlert).toBeDefined();
    expect(lowAlert?.severity).toBe("HIGH");
  });

  it("should detect perishable batch approaching expiry (EXPIRY_WARNING)", async () => {
    const expAlert = await prisma.alert.findFirst({
      where: {
        productId: expiringProductId,
        alertType: "EXPIRY_WARNING",
        status: "OPEN",
      },
    });
    expect(expAlert).toBeDefined();
    expect(expAlert?.message).toContain("expires in");
  });

  it("should auto-resolve alerts when stock is replenished", async () => {
    // Replenish zeroStockProduct to 100 units
    await prisma.product.update({
      where: { id: zeroStockProductId },
      data: { currentQuantity: 100 },
    });

    // Re-evaluate product
    await MonitoringService.evaluateProduct(zeroStockProductId);

    const resolvedAlert = await prisma.alert.findFirst({
      where: {
        productId: zeroStockProductId,
        alertType: "OUT_OF_STOCK",
      },
    });

    expect(resolvedAlert?.status).toBe("RESOLVED");
    expect(resolvedAlert?.message).toContain("AUTO-RESOLVED");
  });
});
