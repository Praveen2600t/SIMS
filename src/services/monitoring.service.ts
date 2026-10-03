import prisma from "@/lib/prisma";
import { AlertType, AlertSeverity, AlertStatus } from "@prisma/client";

export interface MonitoringConfig {
  expiryWarningDays: number;
  anomalyDropPercentage: number;
  rapidAdjustmentLimit: number;
}

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  expiryWarningDays: 14,
  anomalyDropPercentage: 35,
  rapidAdjustmentLimit: 3,
};

export interface MonitoringRunResult {
  timestamp: string;
  productsEvaluated: number;
  batchesEvaluated: number;
  alertsCreated: number;
  alertsResolved: number;
  anomaliesDetected: number;
  details: string[];
}

/**
 * Smart Inventory Continuous Monitoring Service
 * Evaluates stock thresholds, batch expiry timelines, and statistical/rule anomalies.
 * Operates on a generic, multi-sector inventory dataset.
 */
export class MonitoringService {
  /**
   * Fetches active system settings or returns defaults
   */
  static async getConfig(): Promise<MonitoringConfig> {
    try {
      const settings = await prisma.systemSetting.findMany();
      const config = { ...DEFAULT_MONITORING_CONFIG };

      for (const s of settings) {
        if (s.key === "expiryWarningDays") config.expiryWarningDays = parseInt(s.value, 10) || 14;
        if (s.key === "anomalyDropPercentage") config.anomalyDropPercentage = parseInt(s.value, 10) || 35;
        if (s.key === "rapidAdjustmentLimit") config.rapidAdjustmentLimit = parseInt(s.value, 10) || 3;
      }

      return config;
    } catch {
      return DEFAULT_MONITORING_CONFIG;
    }
  }

  /**
   * Run full system continuous monitoring evaluation
   */
  static async evaluateAll(customConfig?: Partial<MonitoringConfig>): Promise<MonitoringRunResult> {
    const baseConfig = await this.getConfig();
    const config: MonitoringConfig = { ...baseConfig, ...customConfig };

    const details: string[] = [];
    let alertsCreated = 0;
    let alertsResolved = 0;
    let anomaliesDetected = 0;

    const now = new Date();
    const expiryThresholdDate = new Date();
    expiryThresholdDate.setDate(now.getDate() + config.expiryWarningDays);

    // Fetch active products with their batches and recent movements
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      include: {
        batches: {
          where: {
            quantity: { gt: 0 },
          },
        },
        stockMovements: {
          take: 6,
          orderBy: { createdAt: "desc" },
        },
        alerts: {
          where: { status: "OPEN" },
        },
      },
    });

    for (const product of products) {
      const openAlerts = product.alerts;

      // ----------------------------------------------------
      // 1. OUT OF STOCK DETECTION (Quantity <= 0)
      // ----------------------------------------------------
      const existingOutOfStockAlert = openAlerts.find((a) => a.alertType === "OUT_OF_STOCK");

      if (product.currentQuantity <= 0) {
        if (!existingOutOfStockAlert) {
          await prisma.alert.create({
            data: {
              productId: product.id,
              alertType: "OUT_OF_STOCK",
              severity: "CRITICAL",
              status: "OPEN",
              message: `Item [${product.name}] (SKU: ${product.productCode}) is completely OUT OF STOCK at ${product.storageLocation || "Main Facility"}.`,
              recommendedAction: `Create an immediate replenishment purchase order for target quantity (${product.reorderQuantity} ${product.unit}) to prevent operational disruption.`,
              detailsJson: JSON.stringify({
                currentQuantity: product.currentQuantity,
                minStockLevel: product.minStockLevel,
                reorderQuantity: product.reorderQuantity,
                storageLocation: product.storageLocation,
              }),
            },
          });
          alertsCreated++;
          details.push(`Created OUT_OF_STOCK alert for ${product.name}`);
        }
      } else if (existingOutOfStockAlert) {
        // Condition rectified, auto-resolve
        await prisma.alert.update({
          where: { id: existingOutOfStockAlert.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            message: `${existingOutOfStockAlert.message} [AUTO-RESOLVED: Replenished to ${product.currentQuantity} ${product.unit}]`,
          },
        });
        alertsResolved++;
        details.push(`Auto-resolved OUT_OF_STOCK alert for ${product.name}`);
      }

      // ----------------------------------------------------
      // 2. LOW STOCK MONITORING (0 < Quantity <= minStockLevel)
      // ----------------------------------------------------
      const existingLowStockAlert = openAlerts.find((a) => a.alertType === "LOW_STOCK");

      if (product.currentQuantity > 0 && product.currentQuantity <= product.minStockLevel) {
        if (!existingLowStockAlert) {
          await prisma.alert.create({
            data: {
              productId: product.id,
              alertType: "LOW_STOCK",
              severity: "HIGH",
              status: "OPEN",
              message: `Item [${product.name}] has fallen below threshold (${product.currentQuantity} ${product.unit} remaining, Min: ${product.minStockLevel} ${product.unit}).`,
              recommendedAction: `Issue reorder requisition for ${product.reorderQuantity} ${product.unit} before stock exhausts.`,
              detailsJson: JSON.stringify({
                currentQuantity: product.currentQuantity,
                minStockLevel: product.minStockLevel,
                reorderQuantity: product.reorderQuantity,
                storageLocation: product.storageLocation,
              }),
            },
          });
          alertsCreated++;
          details.push(`Created LOW_STOCK alert for ${product.name}`);
        }
      } else if (existingLowStockAlert && product.currentQuantity > product.minStockLevel) {
        await prisma.alert.update({
          where: { id: existingLowStockAlert.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            message: `${existingLowStockAlert.message} [AUTO-RESOLVED: Current stock (${product.currentQuantity} ${product.unit}) is above threshold]`,
          },
        });
        alertsResolved++;
        details.push(`Auto-resolved LOW_STOCK alert for ${product.name}`);
      }

      // ----------------------------------------------------
      // 3. BATCH EXPIRY SURVEILLANCE
      // ----------------------------------------------------
      for (const batch of product.batches) {
        if (!batch.expiryDate) continue;

        const isExpired = batch.expiryDate < now;
        const isExpiringSoon = !isExpired && batch.expiryDate <= expiryThresholdDate;

        const existingBatchAlert = openAlerts.find((a) => a.batchId === batch.id);

        if (isExpired) {
          if (!existingBatchAlert || existingBatchAlert.alertType !== "EXPIRED") {
            await prisma.inventoryBatch.update({
              where: { id: batch.id },
              data: { status: "EXPIRED" },
            });

            await prisma.alert.create({
              data: {
                productId: product.id,
                batchId: batch.id,
                alertType: "EXPIRED",
                severity: "CRITICAL",
                status: "OPEN",
                message: `Lot/Batch [${batch.batchNumber}] of ${product.name} expired on ${batch.expiryDate.toISOString().split("T")[0]}. Affected quantity: ${batch.quantity} ${product.unit}.`,
                recommendedAction: `Quarantine batch immediately from active pick locations and process return or write-off documentation.`,
                detailsJson: JSON.stringify({
                  batchNumber: batch.batchNumber,
                  expiryDate: batch.expiryDate,
                  quantity: batch.quantity,
                  unit: product.unit,
                }),
              },
            });
            alertsCreated++;
            details.push(`Created EXPIRED alert for ${product.name} batch ${batch.batchNumber}`);
          }
        } else if (isExpiringSoon) {
          if (!existingBatchAlert) {
            const daysLeft = Math.ceil((batch.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            await prisma.alert.create({
              data: {
                productId: product.id,
                batchId: batch.id,
                alertType: "EXPIRY_WARNING",
                severity: "HIGH",
                status: "OPEN",
                message: `Batch [${batch.batchNumber}] of ${product.name} expires in ${daysLeft} days (${batch.expiryDate.toISOString().split("T")[0]}). Quantity at risk: ${batch.quantity} ${product.unit}.`,
                recommendedAction: `Prioritize outbound dispatches (FIFO / FEFO) to utilize remaining stock prior to expiration.`,
                detailsJson: JSON.stringify({
                  batchNumber: batch.batchNumber,
                  expiryDate: batch.expiryDate,
                  daysLeft,
                  quantity: batch.quantity,
                }),
              },
            });
            alertsCreated++;
            details.push(`Created EXPIRY_WARNING alert for ${product.name} batch ${batch.batchNumber}`);
          }
        }
      }

      // ----------------------------------------------------
      // 4. INVENTORY ANOMALY DETECTION
      // ----------------------------------------------------
      // Anomaly Rule A: Rapid manual adjustments
      const manualAdjustments = product.stockMovements.filter((m) => m.movementType === "ADJUSTMENT");
      const existingAnomalyAlert = openAlerts.find((a) => a.alertType === "ANOMALY_REVIEW");

      if (manualAdjustments.length >= config.rapidAdjustmentLimit && !existingAnomalyAlert) {
        await prisma.alert.create({
          data: {
            productId: product.id,
            alertType: "ANOMALY_REVIEW",
            severity: "HIGH",
            status: "OPEN",
            message: `Unusual adjustment frequency: Product [${product.name}] has had ${manualAdjustments.length} manual adjustments in recent movements.`,
            recommendedAction: `Audit recent reconciliation logs and initiate physical supervisor cycle count to identify root cause.`,
            detailsJson: JSON.stringify({
              adjustmentsCount: manualAdjustments.length,
              movementIds: manualAdjustments.map((m) => m.id),
            }),
          },
        });
        alertsCreated++;
        anomaliesDetected++;
        details.push(`Detected ANOMALY: Frequent adjustments on ${product.name}`);
      }

      // Anomaly Rule B: Sudden sharp deduction without sales order
      const latestMovement = product.stockMovements[0];
      if (
        latestMovement &&
        latestMovement.movementType === "OUT" &&
        latestMovement.previousQuantity > 20 &&
        latestMovement.quantity >= latestMovement.previousQuantity * (config.anomalyDropPercentage / 100) &&
        !existingAnomalyAlert
      ) {
        const dropPercent = Math.round((latestMovement.quantity / latestMovement.previousQuantity) * 100);
        await prisma.alert.create({
          data: {
            productId: product.id,
            alertType: "ANOMALY_REVIEW",
            severity: "MEDIUM",
            status: "OPEN",
            message: `Sudden inventory drop: Single deduction of ${latestMovement.quantity} ${product.unit} (${dropPercent}% of stock) on [${product.name}] without sales invoice.`,
            recommendedAction: `Review dispatch manifest and check for accidental double-entry or shrinkage.`,
            detailsJson: JSON.stringify({
              deduction: latestMovement.quantity,
              previousQuantity: latestMovement.previousQuantity,
              reason: latestMovement.reason,
            }),
          },
        });
        alertsCreated++;
        anomaliesDetected++;
        details.push(`Detected ANOMALY: Sudden large reduction on ${product.name}`);
      }
    }

    return {
      timestamp: new Date().toISOString(),
      productsEvaluated: products.length,
      batchesEvaluated: products.reduce((acc, p) => acc + p.batches.length, 0),
      alertsCreated,
      alertsResolved,
      anomaliesDetected,
      details,
    };
  }

  /**
   * Real-time evaluation triggered immediately upon a product's stock mutation
   */
  static async evaluateProduct(productId: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        batches: { where: { quantity: { gt: 0 } } },
        alerts: { where: { status: "OPEN" } },
      },
    });

    if (!product) return;

    // Check Out of Stock
    const existingOutOfStock = product.alerts.find((a) => a.alertType === "OUT_OF_STOCK");
    if (product.currentQuantity <= 0) {
      if (!existingOutOfStock) {
        await prisma.alert.create({
          data: {
            productId: product.id,
            alertType: "OUT_OF_STOCK",
            severity: "CRITICAL",
            status: "OPEN",
            message: `Item [${product.name}] is OUT OF STOCK.`,
            recommendedAction: `Issue emergency replenishment order immediately.`,
          },
        });
      }
    } else if (existingOutOfStock) {
      await prisma.alert.update({
        where: { id: existingOutOfStock.id },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
          message: `${existingOutOfStock.message} [AUTO-RESOLVED: Replenished to ${product.currentQuantity}]`,
        },
      });
    }

    // Check Low Stock
    const existingLowStock = product.alerts.find((a) => a.alertType === "LOW_STOCK");
    if (product.currentQuantity > 0 && product.currentQuantity <= product.minStockLevel) {
      if (!existingLowStock) {
        await prisma.alert.create({
          data: {
            productId: product.id,
            alertType: "LOW_STOCK",
            severity: "HIGH",
            status: "OPEN",
            message: `Item [${product.name}] is low on stock (${product.currentQuantity} ${product.unit} remaining).`,
            recommendedAction: `Reorder ${product.reorderQuantity} ${product.unit} to meet target stock.`,
          },
        });
      }
    } else if (existingLowStock && product.currentQuantity > product.minStockLevel) {
      await prisma.alert.update({
        where: { id: existingLowStock.id },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
          message: `${existingLowStock.message} [AUTO-RESOLVED: Current stock (${product.currentQuantity}) is healthy]`,
        },
      });
    }
  }
}
