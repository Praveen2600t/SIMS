import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateDataset, TAMIL_NADU_DISTRICTS, TAMIL_NADU_SUPPLIERS } from "./generate-dataset";
import { MonitoringService } from "../src/services/monitoring.service";

const prisma = new PrismaClient();

const CATEGORY_DEFINITIONS = [
  { code: "CAT_VEG", name: "Vegetables", description: "Fresh agricultural vegetables from Tamil Nadu mandis" },
  { code: "CAT_FRUIT", name: "Fruits", description: "Tropical and hill-grown fruits across Tamil Nadu districts" },
  { code: "CAT_BEV", name: "Beverages", description: "Natural tender coconuts, regional teas, coffees, and soft drinks" },
  { code: "CAT_FFI", name: "Fast-food ingredients", description: "Buns, crusts, sauces, cheese, fries, and cooking oils" },
  { code: "CAT_GRAIN", name: "Grains and staples", description: "Traditional paddy varieties, millets, dals, and flours" },
  { code: "CAT_DAIRY", name: "Dairy", description: "Fresh milk, curd, ghee, paneer, and butter products" },
  { code: "CAT_BAKE", name: "Bakery products", description: "Breads, rusks, cakes, and baking ingredients" },
  { code: "CAT_SPICE", name: "Spices and condiments", description: "Erode turmeric, dry chillies, whole spices, and salts" },
  { code: "CAT_MEAT", name: "Meat and frozen food", description: "Poultry, mutton, coastal sea catches, and frozen veggies" },
  { code: "CAT_GROC", name: "Grocery and packaged foods", description: "Sugar, jaggery, cooking oils, appalams, and batters" },
];

async function main() {
  console.log("🌱 Starting SICMS Database Seeding...");

  // 1. Clear existing transactional data in proper order (for clean idempotency)
  console.log("Cleaning old test data...");
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
  await prisma.user.deleteMany();

  // 2. Seed Users
  console.log("Seeding default Administrator and Staff users...");
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const staffPasswordHash = await bcrypt.hash("StaffPassword123!", 10);

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@sicms.tn.gov.in",
      name: "Senthil Nathan (Admin)",
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      email: "staff@sicms.tn.gov.in",
      name: "Priya Murugan (Staff)",
      passwordHash: staffPasswordHash,
      role: UserRole.STAFF,
      isActive: true,
    },
  });

  console.log(`Users seeded: Admin (${adminUser.email}), Staff (${staffUser.email})`);

  // 3. Seed Categories
  console.log("Seeding product categories...");
  const categoryMap = new Map<string, string>();
  for (const cat of CATEGORY_DEFINITIONS) {
    const created = await prisma.category.create({
      data: cat,
    });
    categoryMap.set(cat.name, created.id);
  }

  // 4. Seed Locations
  console.log("Seeding Tamil Nadu market locations...");
  const locationMap = new Map<string, string>();
  for (const loc of TAMIL_NADU_DISTRICTS) {
    const key = `${loc.district}_${loc.market}`;
    if (!locationMap.has(key)) {
      const created = await prisma.location.create({
        data: {
          name: `${loc.district} ${loc.market}`,
          district: loc.district,
          marketLocation: loc.market,
          type: "CENTRAL_MARKET",
          address: `${loc.market}, ${loc.district} District, Tamil Nadu, India`,
        },
      });
      locationMap.set(key, created.id);
    }
  }

  // 5. Seed Suppliers
  console.log("Seeding Tamil Nadu sample suppliers...");
  const supplierMap = new Map<string, string>();
  for (const sup of TAMIL_NADU_SUPPLIERS) {
    const created = await prisma.supplier.create({
      data: {
        supplierCode: sup.code,
        name: sup.name,
        contactPerson: `Manager (${sup.name})`,
        email: `contact@${sup.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.sample.tn`,
        phone: "+91 944" + Math.floor(1000000 + Math.random() * 9000000),
        address: `Agri Business Complex, ${sup.district}, Tamil Nadu`,
        district: sup.district,
        rating: 4.5 + (Math.random() * 0.4),
        isActive: true,
        isSampleData: true,
      },
    });
    supplierMap.set(sup.code, created.id);
  }

  // 6. Generate and Seed Products & Batches
  console.log("Generating 220 Tamil Nadu product items...");
  const dataset = generateDataset(220);

  const productEntities = [];
  for (const item of dataset) {
    const categoryId = categoryMap.get(item.category) || Array.from(categoryMap.values())[0];
    const locKey = `${item.district}_${item.market_location}`;
    const locationId = locationMap.get(locKey) || Array.from(locationMap.values())[0];
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
        reorderQuantity: item.reorder_quantity,
        storageType: item.storage_type,
        district: item.district,
        marketLocation: item.market_location,
        supplierId,
        locationId,
        dataSource: item.data_source,
        isSampleData: true,
      },
    });

    productEntities.push(product);

    // Create batch if quantity > 0 or if expiry test case
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
          referenceType: "BASELINE_MIGRATION",
          unitPrice: item.purchase_price,
          performedByUserId: adminUser.id,
        },
      });
    }
  }

  console.log(`Seeded ${productEntities.length} products with batch records and baseline movements.`);

  // 7. Seed Sample Purchase Orders
  console.log("Seeding sample Purchase Orders...");
  const po1 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-TN-2026-001",
      supplierId: Array.from(supplierMap.values())[0],
      orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "APPROVED",
      totalCost: 18500,
      notes: "Weekly replenishment for Coimbatore Central Mandi",
      createdByUserId: adminUser.id,
      items: {
        create: [
          {
            productId: productEntities[0].id,
            quantity: 200,
            receivedQuantity: 0,
            unitCost: productEntities[0].purchasePrice,
            totalCost: productEntities[0].purchasePrice * 200,
          },
          {
            productId: productEntities[1].id,
            quantity: 150,
            receivedQuantity: 0,
            unitCost: productEntities[1].purchasePrice,
            totalCost: productEntities[1].purchasePrice * 150,
          },
        ],
      },
    },
  });

  const po2 = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-TN-2026-002",
      supplierId: Array.from(supplierMap.values())[1],
      orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: "RECEIVED",
      totalCost: 32400,
      notes: "Spices dispatch received in full at George Town Hub",
      createdByUserId: staffUser.id,
      items: {
        create: [
          {
            productId: productEntities[4].id,
            quantity: 300,
            receivedQuantity: 300,
            unitCost: productEntities[4].purchasePrice,
            totalCost: productEntities[4].purchasePrice * 300,
          },
        ],
      },
    },
  });

  // 8. Seed Sample Sales Orders
  console.log("Seeding sample Sales transactions...");
  const sale1 = await prisma.sale.create({
    data: {
      invoiceNumber: "INV-TN-2026-1001",
      customerName: "Saravana Bhavan Kitchens",
      customerPhone: "+91 98401 23456",
      totalAmount: 4850,
      paymentStatus: "PAID",
      paymentMethod: "UPI",
      locationId: Array.from(locationMap.values())[0],
      createdByUserId: staffUser.id,
      items: {
        create: [
          {
            productId: productEntities[1].id,
            quantity: 50,
            unitPrice: productEntities[1].sellingPrice,
            totalPrice: productEntities[1].sellingPrice * 50,
          },
        ],
      },
    },
  });

  const sale2 = await prisma.sale.create({
    data: {
      invoiceNumber: "INV-TN-2026-1002",
      customerName: "Aachi Mess & Caterers",
      customerPhone: "+91 98842 88899",
      totalAmount: 8900,
      paymentStatus: "PAID",
      paymentMethod: "CASH",
      locationId: Array.from(locationMap.values())[2],
      createdByUserId: adminUser.id,
      items: {
        create: [
          {
            productId: productEntities[2].id,
            quantity: 40,
            unitPrice: productEntities[2].sellingPrice,
            totalPrice: productEntities[2].sellingPrice * 40,
          },
        ],
      },
    },
  });

  // 9. Run Continuous Monitoring Engine to evaluate all products and seed alerts!
  console.log("Running Continuous Monitoring Engine to evaluate alerts...");
  const monitoringResult = await MonitoringService.evaluateAll();
  console.log(`Monitoring complete: Evaluated ${monitoringResult.productsEvaluated} products, generated ${monitoringResult.alertsCreated} active alerts (${monitoringResult.anomaliesDetected} anomalies detected).`);

  console.log("✅ Database seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
