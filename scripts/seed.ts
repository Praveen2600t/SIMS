import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateGenericDataset, GENERIC_WAREHOUSES, GENERIC_SUPPLIERS } from "./generate-dataset";
import { MonitoringService } from "../src/services/monitoring.service";

const prisma = new PrismaClient();

const CATEGORY_DEFINITIONS = [
  { code: "CAT_ELEC", name: "Electronics", description: "Microcontrollers, semiconductors, sensors, power modules" },
  { code: "CAT_MED", name: "Pharmaceuticals", description: "Medicines, sterile supplies, vaccines, medical devices" },
  { code: "CAT_RAW", name: "Industrial Raw Materials", description: "Metals, copper, polymers, sheet metal, structural tubing" },
  { code: "CAT_FMCG", name: "Consumer Goods", description: "Cleaning chemicals, detergents, personal care products" },
  { code: "CAT_FOOD", name: "Food & Perishables", description: "Baking ingredients, dairy batches, concentrates, flours" },
  { code: "CAT_AUTO", name: "Automotive Parts", description: "Braking systems, fluids, filters, spark plugs" },
  { code: "CAT_LAB", name: "Laboratory Chemicals", description: "Analytical solvents, reagents, buffers, laboratory glassware" },
  { code: "CAT_PKG", name: "Packaging Supplies", description: "Corrugated boxes, stretch films, thermal barcode labels" },
  { code: "CAT_HRD", name: "Hardware & Tools", description: "Fasteners, drill bits, ratchet straps, precision metrology" },
  { code: "CAT_OFC", name: "Office Supplies", description: "Laser toner cartridges, copy paper, logistics hardware" },
];

async function main() {
  console.log("🌱 Starting General Smart Inventory System (SICMS) Database Seeding...");

  // 1. Clear existing transactional data in proper order
  console.log("Cleaning old data...");
  await prisma.auditLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.location.deleteMany();
  await prisma.category.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Default System Settings (Configurable Rules)
  console.log("Seeding configurable monitoring rules...");
  await prisma.systemSetting.createMany({
    data: [
      { key: "expiryWarningDays", value: "14", description: "Perishable batch expiry warning horizon (days)" },
      { key: "anomalyDropPercentage", value: "35", description: "Sudden stock deduction anomaly trigger (%)" },
      { key: "rapidAdjustmentLimit", value: "3", description: "Threshold for repeated manual stock audit alerts" },
    ],
  });

  // 3. Seed Users
  console.log("Seeding Administrator and Inventory Officer users...");
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const staffPasswordHash = await bcrypt.hash("StaffPassword123!", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@sicms.io",
      name: "Marcus Vance (Inventory Manager)",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: "staff@sicms.io",
      name: "Elena Rostova (Warehouse Supervisor)",
      passwordHash: staffPasswordHash,
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  console.log(`Users seeded: Admin (${adminUser.email}), Staff (${staffUser.email})`);

  // 4. Seed Categories
  console.log("Seeding product categories...");
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORY_DEFINITIONS) {
    const created = await prisma.category.create({
      data: cat,
    });
    categoryMap.set(cat.name, created.id);
  }

  // 5. Seed Facilities / Warehouses
  console.log("Seeding warehouse storage facilities...");
  const locationMap = new Map<string, string>();
  for (const wh of GENERIC_WAREHOUSES) {
    const created = await prisma.location.create({
      data: {
        name: wh,
        district: "Central Operations",
        marketLocation: wh,
        type: wh.includes("Cold") ? "COLD_STORAGE" : wh.includes("Hazmat") ? "HAZMAT" : "WAREHOUSE",
        address: `${wh}, Logistics Park, Industrial Zone`,
      },
    });
    locationMap.set(wh, created.id);
  }

  // 6. Seed Suppliers
  console.log("Seeding industrial and commercial suppliers...");
  const supplierMap = new Map<string, string>();
  for (const sup of GENERIC_SUPPLIERS) {
    const created = await prisma.supplier.create({
      data: {
        supplierCode: sup.code,
        name: sup.name,
        contactPerson: `Account Rep (${sup.sector})`,
        email: `orders@${sup.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        phone: "+1 (800) 555-" + Math.floor(1000 + Math.random() * 9000),
        address: `100 Enterprise Way, Suite 400`,
        district: "National Distribution",
        rating: 4.6 + (Math.random() * 0.3),
        isActive: true,
        isSampleData: true,
      },
    });
    supplierMap.set(sup.code, created.id);
  }

  // 7. Generate and Seed Products & Batches
  console.log("Generating 200 diverse inventory items across all categories...");
  const dataset = generateGenericDataset(200);

  const productEntities = [];
  for (const item of dataset) {
    const categoryId = categoryMap.get(item.category) || Array.from(categoryMap.values())[0];
    const locationId = locationMap.get(item.storage_location) || Array.from(locationMap.values())[0];
    const supplierId = supplierMap.get(item.supplier_id) || Array.from(supplierMap.values())[0];

    const product = await prisma.product.create({
      data: {
        productCode: item.product_code,
        name: item.product_name,
        categoryId,
        subcategory: item.subcategory,
        unit: item.unit,
        purchasePrice: item.purchase_price,
        sellingPrice: item.selling_price,
        currentQuantity: item.current_quantity,
        minStockLevel: item.minimum_stock_level,
        maxStockLevel: item.maximum_stock_level,
        reorderQuantity: item.reorder_quantity,
        storageLocation: item.storage_location,
        storageType: item.storage_type,
        district: "Primary Warehouse",
        marketLocation: item.storage_location,
        supplierId,
        locationId,
        dataSource: item.data_source,
        isSampleData: true,
      },
    });

    productEntities.push(product);

    // Create batch if product has initial quantity or test expiry
    const mfgDate = item.manufacture_date ? new Date(item.manufacture_date) : null;
    const expDate = item.expiry_date ? new Date(item.expiry_date) : null;

    let batchStatus: "ACTIVE" | "EXPIRED" = "ACTIVE";
    if (expDate && expDate < new Date()) {
      batchStatus = "EXPIRED";
    }

    const batch = await prisma.inventoryBatch.create({
      data: {
        productId: product.id,
        batchNumber: item.batch_number,
        quantity: item.current_quantity,
        initialQuantity: Math.max(item.current_quantity, item.reorder_quantity),
        manufactureDate: mfgDate,
        expiryDate: expDate,
        purchasePrice: item.purchase_price,
        supplierId,
        locationId,
        status: batchStatus,
      },
    });

    // Record initial stock movement
    if (item.current_quantity > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          batchId: batch.id,
          movementType: "IN",
          quantity: item.current_quantity,
          previousQuantity: 0,
          newQuantity: item.current_quantity,
          reason: "Initial Inventory Baseline Load",
          referenceType: "BASELINE_LOAD",
          unitPrice: item.purchase_price,
          performedByUserId: adminUser.id,
        },
      });
    }
  }

  console.log(`Seeded ${productEntities.length} generic products with batches and stock movements.`);

  // 8. Seed Sample Procurement Orders
  console.log("Seeding sample purchase orders...");
  await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-2026-00101",
      supplierId: Array.from(supplierMap.values())[0],
      orderDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "APPROVED",
      totalCost: 28400,
      notes: "Monthly replenishment for Central Assembly Depot",
      createdByUserId: adminUser.id,
      items: {
        create: [
          {
            productId: productEntities[0].id,
            quantity: 100,
            receivedQuantity: 0,
            unitCost: productEntities[0].purchasePrice,
            totalCost: productEntities[0].purchasePrice * 100,
          },
          {
            productId: productEntities[1].id,
            quantity: 80,
            receivedQuantity: 0,
            unitCost: productEntities[1].purchasePrice,
            totalCost: productEntities[1].purchasePrice * 80,
          },
        ],
      },
    },
  });

  // 9. Seed Sample Outbound Dispatches / Sales
  console.log("Seeding sample outbound orders...");
  await prisma.sale.create({
    data: {
      invoiceNumber: "DISP-2026-0501",
      customerName: "Global Engineering Labs Inc",
      customerPhone: "+1 (555) 234-5678",
      totalAmount: 14200,
      paymentStatus: "PAID",
      paymentMethod: "CREDIT",
      locationId: Array.from(locationMap.values())[0],
      createdByUserId: staffUser.id,
      items: {
        create: [
          {
            productId: productEntities[0].id,
            quantity: 20,
            unitPrice: productEntities[0].sellingPrice,
            totalPrice: productEntities[0].sellingPrice * 20,
          },
        ],
      },
    },
  });

  // 10. Run Continuous Monitoring Engine to evaluate all products and seed alerts!
  console.log("Running Continuous Monitoring Engine to evaluate alerts...");
  const monitoringResult = await MonitoringService.evaluateAll();
  console.log(`Monitoring complete: Evaluated ${monitoringResult.productsEvaluated} products, generated ${monitoringResult.alertsCreated} active alerts (${monitoringResult.anomaliesDetected} anomalies detected).`);

  console.log("✅ General inventory database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
