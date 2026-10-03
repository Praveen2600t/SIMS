import prisma from "@/lib/prisma";
import { MovementType } from "@prisma/client";
import { StockInInput, StockOutInput, StockAdjustmentInput } from "@/schemas/stock.schema";
import { MonitoringService } from "./monitoring.service";

export class InventoryService {
  /**
   * Process Stock In (Receipt of goods with batch tracking)
   */
  static async processStockIn(input: StockInInput, userId?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch current product
      const product = await tx.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const previousQuantity = product.currentQuantity;
      const newQuantity = previousQuantity + input.quantity;

      // 2. Upsert or find batch
      let batch = await tx.inventoryBatch.findUnique({
        where: {
          productId_batchNumber: {
            productId: input.productId,
            batchNumber: input.batchNumber,
          },
        },
      });

      if (batch) {
        batch = await tx.inventoryBatch.update({
          where: { id: batch.id },
          data: {
            quantity: batch.quantity + input.quantity,
            status: "ACTIVE",
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : batch.expiryDate,
          },
        });
      } else {
        batch = await tx.inventoryBatch.create({
          data: {
            productId: input.productId,
            batchNumber: input.batchNumber,
            quantity: input.quantity,
            initialQuantity: input.quantity,
            manufactureDate: input.manufactureDate ? new Date(input.manufactureDate) : null,
            expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
            purchasePrice: input.purchasePrice ?? product.purchasePrice,
            supplierId: input.supplierId ?? product.supplierId,
            locationId: input.locationId ?? product.locationId,
            status: "ACTIVE",
          },
        });
      }

      // 3. Update product current quantity
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { currentQuantity: newQuantity },
      });

      // 4. Record stock movement
      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          batchId: batch.id,
          movementType: "IN",
          quantity: input.quantity,
          previousQuantity,
          newQuantity,
          reason: input.reason,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          unitPrice: input.purchasePrice ?? product.purchasePrice,
          performedByUserId: userId,
        },
      });

      // 5. Create audit log
      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "STOCK_IN",
            entityType: "PRODUCT",
            entityId: product.id,
            detailsJson: JSON.stringify({
              quantity: input.quantity,
              batchNumber: input.batchNumber,
              newStock: newQuantity,
            }),
          },
        });
      }

      return { product: updatedProduct, batch, movement };
    }).then(async (res) => {
      // Real-time alert re-evaluation after transaction commits
      await MonitoringService.evaluateProduct(input.productId);
      return res;
    });
  }

  /**
   * Process Stock Out (Dispatch, Sales, Wastage, Returns)
   */
  static async processStockOut(input: StockOutInput, userId?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch current product
      const product = await tx.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.currentQuantity < input.quantity) {
        throw new Error(
          `Insufficient stock. Available: ${product.currentQuantity} ${product.unit}, Requested: ${input.quantity} ${product.unit}`
        );
      }

      const previousQuantity = product.currentQuantity;
      const newQuantity = previousQuantity - input.quantity;

      // 2. Deduct from batch if batchId provided, otherwise FIFO across active batches
      let batchId = input.batchId;
      if (batchId) {
        const batch = await tx.inventoryBatch.findUnique({
          where: { id: batchId },
        });

        if (!batch) {
          throw new Error("Specified inventory batch not found");
        }

        if (batch.quantity < input.quantity) {
          throw new Error(
            `Insufficient batch stock. Batch [${batch.batchNumber}] has ${batch.quantity} ${product.unit}`
          );
        }

        const newBatchQty = batch.quantity - input.quantity;
        await tx.inventoryBatch.update({
          where: { id: batch.id },
          data: {
            quantity: newBatchQty,
            status: newBatchQty === 0 ? "EXHAUSTED" : "ACTIVE",
          },
        });
      } else {
        // FIFO batch deduction
        const activeBatches = await tx.inventoryBatch.findMany({
          where: { productId: product.id, quantity: { gt: 0 }, status: "ACTIVE" },
          orderBy: { createdAt: "asc" },
        });

        let remainingToDeduct = input.quantity;
        for (const b of activeBatches) {
          if (remainingToDeduct <= 0) break;
          const deductFromThis = Math.min(b.quantity, remainingToDeduct);
          const newBatchQty = b.quantity - deductFromThis;
          await tx.inventoryBatch.update({
            where: { id: b.id },
            data: {
              quantity: newBatchQty,
              status: newBatchQty === 0 ? "EXHAUSTED" : "ACTIVE",
            },
          });
          remainingToDeduct -= deductFromThis;
          if (!batchId) batchId = b.id;
        }
      }

      // 3. Update product current quantity
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { currentQuantity: newQuantity },
      });

      // 4. Record stock movement
      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          batchId,
          movementType: (input.movementType as MovementType) || "OUT",
          quantity: input.quantity,
          previousQuantity,
          newQuantity,
          reason: input.reason,
          referenceType: input.referenceType,
          referenceId: input.referenceId,
          unitPrice: product.sellingPrice,
          performedByUserId: userId,
        },
      });

      // 5. Create audit log
      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "STOCK_OUT",
            entityType: "PRODUCT",
            entityId: product.id,
            detailsJson: JSON.stringify({
              quantity: input.quantity,
              movementType: input.movementType,
              reason: input.reason,
              newStock: newQuantity,
            }),
          },
        });
      }

      return { product: updatedProduct, movement };
    }).then(async (res) => {
      // Trigger real-time alert evaluation
      await MonitoringService.evaluateProduct(input.productId);
      return res;
    });
  }

  /**
   * Process Stock Adjustment (Physical audit correction)
   */
  static async processAdjustment(input: StockAdjustmentInput, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: input.productId },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const previousQuantity = product.currentQuantity;
      const difference = input.newQuantity - previousQuantity;

      // Update product current quantity
      const updatedProduct = await tx.product.update({
        where: { id: product.id },
        data: { currentQuantity: input.newQuantity },
      });

      // Update batch if provided
      if (input.batchId) {
        await tx.inventoryBatch.update({
          where: { id: input.batchId },
          data: {
            quantity: input.newQuantity,
            status: input.newQuantity === 0 ? "EXHAUSTED" : "ACTIVE",
          },
        });
      }

      // Record movement
      const movement = await tx.stockMovement.create({
        data: {
          productId: product.id,
          batchId: input.batchId,
          movementType: "ADJUSTMENT",
          quantity: Math.abs(difference),
          previousQuantity,
          newQuantity: input.newQuantity,
          reason: input.reason,
          referenceType: "AUDIT_RECONCILIATION",
          unitPrice: product.purchasePrice,
          performedByUserId: userId,
        },
      });

      if (userId) {
        await tx.auditLog.create({
          data: {
            userId,
            action: "STOCK_ADJUSTMENT",
            entityType: "PRODUCT",
            entityId: product.id,
            detailsJson: JSON.stringify({
              previousQuantity,
              newQuantity: input.newQuantity,
              reason: input.reason,
            }),
          },
        });
      }

      return { product: updatedProduct, movement };
    }).then(async (res) => {
      await MonitoringService.evaluateProduct(input.productId);
      return res;
    });
  }
}
