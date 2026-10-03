import prisma from "@/lib/prisma";
import { parseCSV, toCSV } from "@/lib/utils";

export interface ImportResult {
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: { row: number; productCode?: string; message: string }[];
}

export class CSVService {
  /**
   * Generates a complete CSV export of all inventory products with active batches.
   */
  static async exportProductsCSV(): Promise<string> {
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      include: {
        category: true,
        supplier: true,
        batches: {
          where: { quantity: { gt: 0 } },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { productCode: "asc" },
    });

    const rows = products.map((p) => {
      const batch = p.batches[0];
      return {
        product_id: p.id,
        product_name: p.name,
        category: p.category.name,
        subcategory: p.subcategory,
        product_code: p.productCode,
        unit: p.unit,
        district: p.district,
        market_location: p.marketLocation,
        supplier_id: p.supplier?.supplierCode ?? "",
        supplier_name: p.supplier?.name ?? "Direct Market Farmer",
        purchase_price: p.purchasePrice,
        selling_price: p.sellingPrice,
        current_quantity: p.currentQuantity,
        minimum_stock_level: p.minStockLevel,
        reorder_quantity: p.reorderQuantity,
        batch_number: batch?.batchNumber ?? `INIT-${p.productCode}`,
        manufacture_date: batch?.manufactureDate ? batch.manufactureDate.toISOString().split("T")[0] : "",
        expiry_date: batch?.expiryDate ? batch.expiryDate.toISOString().split("T")[0] : "",
        storage_type: p.storageType,
        last_updated: p.updatedAt.toISOString(),
        data_source: p.dataSource,
        is_sample_data: p.isSampleData ? "true" : "false",
      };
    });

    return toCSV(rows);
  }

  /**
   * Imports products from CSV text with duplicate detection and error tracking.
   */
  static async importProductsCSV(csvContent: string): Promise<ImportResult> {
    const rows = parseCSV(csvContent);
    const result: ImportResult = {
      totalProcessed: rows.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
    };

    if (rows.length === 0) {
      return result;
    }

    // Preload categories and suppliers for fast in-memory matching
    const [categories, suppliers, locations] = await Promise.all([
      prisma.category.findMany(),
      prisma.supplier.findMany(),
      prisma.location.findMany(),
    ]);

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => {
      categoryMap.set(c.name.toLowerCase(), c.id);
      categoryMap.set(c.code.toLowerCase(), c.id);
    });

    const supplierMap = new Map<string, string>();
    suppliers.forEach((s) => {
      supplierMap.set(s.supplierCode.toLowerCase(), s.id);
      supplierMap.set(s.name.toLowerCase(), s.id);
    });

    const locationMap = new Map<string, string>();
    locations.forEach((loc) => {
      locationMap.set(`${loc.district.toLowerCase()}_${loc.marketLocation.toLowerCase()}`, loc.id);
    });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +1 for 0-index, +1 for header line

      try {
        const productCode = (row["product_code"] || row["product_id"] || "").trim();
        const productName = (row["product_name"] || row["name"] || "").trim();
        const categoryName = (row["category"] || "Grocery and Packaged Foods").trim();
        const subcategory = (row["subcategory"] || "General").trim();
        const unit = (row["unit"] || "kg").trim();
        const district = (row["district"] || "Chennai").trim();
        const marketLocation = (row["market_location"] || "Koyambedu Wholesale Market").trim();
        const supplierName = (row["supplier_name"] || "").trim();
        const supplierCode = (row["supplier_id"] || "").trim();
        const purchasePrice = parseFloat(row["purchase_price"] || "0") || 0;
        const sellingPrice = parseFloat(row["selling_price"] || "0") || 0;
        const currentQuantity = parseFloat(row["current_quantity"] || "0") || 0;
        const minStockLevel = parseFloat(row["minimum_stock_level"] || "10") || 10;
        const reorderQuantity = parseFloat(row["reorder_quantity"] || "50") || 50;
        const storageType = (row["storage_type"] || "ROOM_TEMP").toUpperCase();
        const batchNumber = (row["batch_number"] || `B-${Date.now().toString().slice(-6)}`).trim();
        const mfgDateStr = row["manufacture_date"]?.trim();
        const expDateStr = row["expiry_date"]?.trim();

        if (!productCode) {
          result.errors.push({ row: rowNumber, message: "Missing required product_code" });
          result.skipped++;
          continue;
        }

        if (!productName) {
          result.errors.push({ row: rowNumber, productCode, message: "Missing product_name" });
          result.skipped++;
          continue;
        }

        // Find or create category
        let categoryId = categoryMap.get(categoryName.toLowerCase());
        if (!categoryId) {
          const code = categoryName.toUpperCase().replace(/\s+/g, "_").slice(0, 20);
          const newCat = await prisma.category.create({
            data: {
              name: categoryName,
              code: `${code}_${Date.now().toString().slice(-4)}`,
              description: `Category ${categoryName}`,
            },
          });
          categoryId = newCat.id;
          categoryMap.set(categoryName.toLowerCase(), newCat.id);
        }

        // Find supplier if specified
        let supplierId: string | null = null;
        if (supplierCode && supplierMap.has(supplierCode.toLowerCase())) {
          supplierId = supplierMap.get(supplierCode.toLowerCase())!;
        } else if (supplierName && supplierMap.has(supplierName.toLowerCase())) {
          supplierId = supplierMap.get(supplierName.toLowerCase())!;
        }

        // Find location
        const locKey = `${district.toLowerCase()}_${marketLocation.toLowerCase()}`;
        let locationId = locationMap.get(locKey) ?? null;
        if (!locationId && district && marketLocation) {
          const newLoc = await prisma.location.create({
            data: {
              name: `${district} - ${marketLocation}`,
              district,
              marketLocation,
              type: "CENTRAL_MARKET",
            },
          });
          locationId = newLoc.id;
          locationMap.set(locKey, newLoc.id);
        }

        // Check if product already exists (duplicate detection)
        const existingProduct = await prisma.product.findUnique({
          where: { productCode },
        });

        const mfgDate = mfgDateStr ? new Date(mfgDateStr) : null;
        const expDate = expDateStr ? new Date(expDateStr) : null;

        if (existingProduct) {
          // Update existing product
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              name: productName,
              categoryId,
              subcategory,
              unit,
              district,
              marketLocation,
              purchasePrice,
              sellingPrice,
              currentQuantity,
              minStockLevel,
              reorderQuantity,
              storageType,
              supplierId,
              locationId,
            },
          });

          // Upsert batch if provided
          if (batchNumber && currentQuantity > 0) {
            await prisma.inventoryBatch.upsert({
              where: {
                productId_batchNumber: {
                  productId: existingProduct.id,
                  batchNumber,
                },
              },
              create: {
                productId: existingProduct.id,
                batchNumber,
                quantity: currentQuantity,
                initialQuantity: currentQuantity,
                manufactureDate: isNaN(mfgDate?.getTime() ?? NaN) ? null : mfgDate,
                expiryDate: isNaN(expDate?.getTime() ?? NaN) ? null : expDate,
                purchasePrice,
                supplierId,
                locationId,
                status: "ACTIVE",
              },
              update: {
                quantity: currentQuantity,
                expiryDate: isNaN(expDate?.getTime() ?? NaN) ? null : expDate,
              },
            });
          }

          result.updated++;
        } else {
          // Create new product
          const newProduct = await prisma.product.create({
            data: {
              productCode,
              name: productName,
              categoryId,
              subcategory,
              unit,
              district,
              marketLocation,
              purchasePrice,
              sellingPrice,
              currentQuantity,
              minStockLevel,
              reorderQuantity,
              storageType,
              supplierId,
              locationId,
              dataSource: "CSV_IMPORT",
              isSampleData: row["is_sample_data"] === "true",
            },
          });

          // Create initial batch if quantity > 0
          if (currentQuantity > 0) {
            await prisma.inventoryBatch.create({
              data: {
                productId: newProduct.id,
                batchNumber,
                quantity: currentQuantity,
                initialQuantity: currentQuantity,
                manufactureDate: isNaN(mfgDate?.getTime() ?? NaN) ? null : mfgDate,
                expiryDate: isNaN(expDate?.getTime() ?? NaN) ? null : expDate,
                purchasePrice,
                supplierId,
                locationId,
                status: "ACTIVE",
              },
            });

            // Initial stock movement record
            await prisma.stockMovement.create({
              data: {
                productId: newProduct.id,
                movementType: "IN",
                quantity: currentQuantity,
                previousQuantity: 0,
                newQuantity: currentQuantity,
                reason: "Initial CSV Import Seed",
                referenceType: "CSV_IMPORT",
                unitPrice: purchasePrice,
              },
            });
          }

          result.created++;
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Unknown row processing error";
        result.errors.push({
          row: rowNumber,
          productCode: rows[i]["product_code"],
          message: errorMsg,
        });
        result.skipped++;
      }
    }

    return result;
  }
}
