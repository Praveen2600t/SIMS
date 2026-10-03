import { describe, it, expect, beforeAll, afterAll } from "vitest";
import prisma from "../src/lib/prisma";
import { InventoryService } from "../src/services/inventory.service";

describe("Inventory Transaction Consistency Service", () => {
  let testProductId: string;
  let testSupplierId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    // Setup test category & supplier
    const cat = await prisma.category.upsert({
      where: { code: "CAT_TEST" },
      update: {},
      create: { code: "CAT_TEST", name: "Test Category" },
    });
    testCategoryId = cat.id;

    const sup = await prisma.supplier.upsert({
      where: { supplierCode: "SUP-TEST" },
      update: {},
      create: { supplierCode: "SUP-TEST", name: "Test Agro Supplier", district: "Chennai" },
    });
    testSupplierId = sup.id;

    // Create fresh test product
    const prod = await prisma.product.create({
      data: {
        productCode: `TEST-SKU-${Date.now()}`,
        name: "Test Ponni Rice",
        categoryId: testCategoryId,
        subcategory: "Staples",
        unit: "kg",
        purchasePrice: 40,
        sellingPrice: 55,
        currentQuantity: 100,
        minStockLevel: 20,
        reorderQuantity: 50,
        district: "Chennai",
        marketLocation: "Koyambedu Wholesale Market",
        supplierId: testSupplierId,
      },
    });
    testProductId = prod.id;
  });

  afterAll(async () => {
    if (testProductId) {
      await prisma.product.delete({ where: { id: testProductId } }).catch(() => {});
    }
  });

  it("should successfully process Stock In and increase current quantity", async () => {
    const stockInResult = await InventoryService.processStockIn({
      productId: testProductId,
      quantity: 50,
      batchNumber: `TEST-BCH-${Date.now()}`,
      reason: "Test Inbound Receipt",
      referenceType: "TEST",
    });

    expect(stockInResult.product.currentQuantity).toBe(150);
    expect(stockInResult.movement.movementType).toBe("IN");
    expect(stockInResult.movement.newQuantity).toBe(150);
  });

  it("should successfully process Stock Out and reduce current quantity", async () => {
    const stockOutResult = await InventoryService.processStockOut({
      productId: testProductId,
      quantity: 30,
      movementType: "OUT",
      reason: "Test Outbound Requisition",
      referenceType: "MANUAL_DISPATCH",
    });

    expect(stockOutResult.product.currentQuantity).toBe(120);
    expect(stockOutResult.movement.newQuantity).toBe(120);
  });

  it("should strictly reject Stock Out when requested quantity exceeds available balance", async () => {
    await expect(
      InventoryService.processStockOut({
        productId: testProductId,
        quantity: 500, // exceeds 120
        movementType: "OUT",
        reason: "Excessive Dispatch",
        referenceType: "MANUAL_DISPATCH",
      })
    ).rejects.toThrow(/Insufficient stock/);
  });

  it("should correctly record stock adjustment and recalculate delta", async () => {
    const adjustResult = await InventoryService.processAdjustment({
      productId: testProductId,
      newQuantity: 80,
      reason: "Annual Physical Stocktake",
    });

    expect(adjustResult.product.currentQuantity).toBe(80);
    expect(adjustResult.movement.movementType).toBe("ADJUSTMENT");
    expect(adjustResult.movement.quantity).toBe(40); // 120 - 80 = 40 difference
  });
});
