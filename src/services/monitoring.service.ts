import prisma from "@/lib/prisma";
import { AlertType, AlertSeverity, AlertStatus } from "@prisma/client";

export interface MonitoringConfig {
  expiryWarningDays: number;
  anomalyDropPercentage: number;
}

export const DEFAULT_MONITORING_CONFIG: MonitoringConfig = {
  expiryWarningDays: 7,
  anomalyDropPercentage: 40,
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
 * Continuous Inventory Monitoring Service
 * Evaluates stock thresholds, expiry timelines, and statistical/rule anomalies.
 * Designed for serverless and background worker invocation.
 */
export class MonitoringService {
  /**
   * Run full system evaluation
   */
  static async evaluateAll(config: MonitoringConfig = DEFAULT_MONITORING_CONFIG): Promise<MonitoringRunResult> {
    const details: string[] = [];
    let alertsCreated = 0;
    let alertsResolved = 0;
    let anomaliesDetected = 0;

    const now = new Date();
    const expiryThresholdDate = new Date();
    expiryThresholdDate.setDate(now.getDate() + config.expiryWarningDays);

    // 1. Fetch active products with their batches and recent movements
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      include: {
        batches: {
          where: {
            quantity: { gt: 0 },
            status: "ACTIVE",
          },
        },
        stockMovements: {
          take: 5,
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
      // A. OUT OF STOCK CHECK
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
              message: `Product [${product.name}] is completely OUT OF STOCK at ${product.marketLocation}, ${product.district}.`,
              detailsJson: JSON.stringify({
                currentQuantity: product.currentQuantity,
                minStockLevel: product.minStockLevel,
                reorderQuantity: product.reorderQuantity,
                district: product.district,
                marketLocation: product.marketLocation,
              }),
            },
          });
          alertsCreated++;
          details.push(`Created OUT_OF_STOCK alert for ${product.name}`);
        }
      } else if (existingOutOfStockAlert) {
        // Stock has been replenished, resolve existing out of stock alert
        await prisma.alert.update({
          where: { id: existingOutOfStockAlert.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            message: `${existingOutOfStockAlert.message} [AUTO-RESOLVED: Stock replenished to ${product.currentQuantity} ${product.unit}]`,
          },
        });
        alertsResolved++;
        details.push(`Auto-resolved OUT_OF_STOCK alert for ${product.name}`);
      }

      // ----------------------------------------------------
      // B. LOW STOCK CHECK (Only if > 0 and <= minStockLevel)
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
              message: `Product [${product.name}] has fallen below threshold (${product.currentQuantity} ${product.unit} remaining, Min: ${product.minStockLevel}).`,
              detailsJson: JSON.stringify({
                currentQuantity: product.currentQuantity,
                minStockLevel: product.minStockLevel,
                reorderQuantity: product.reorderQuantity,
                district: product.district,
                marketLocation: product.marketLocation,
              }),
            },
          });
          alertsCreated++;
          details.push(`Created LOW_STOCK alert for ${product.name}`);
        }
      } else if (existingLowStockAlert && product.currentQuantity > product.minStockLevel) {
        // Condition no longer holds
        await prisma.alert.update({
          where: { id: existingLowStockAlert.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
            message: `${existingLowStockAlert.message} [AUTO-RESOLVED: Stock above minimum (${product.currentQuantity} ${product.unit})]`,
          },
        });
        alertsResolved++;
        details.push(`Auto-resolved LOW_STOCK alert for ${product.name}`);
      }

      // ----------------------------------------------------
      // C. BATCH-LEVEL EXPIRY CHECKS
      // ----------------------------------------------------
      for (const batch of product.batches) {
        if (!batch.expiryDate) continue;

        const isExpired = batch.expiryDate < now;
        const isExpiringSoon = !isExpired && batch.expiryDate <= expiryThresholdDate;

        const existingBatchAlert = openAlerts.find((a) => a.batchId === batch.id);

        if (isExpired) {
          if (!existingBatchAlert || existingBatchAlert.alertType !== "EXPIRED") {
            // Update batch status to EXPIRED
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
                message: `Batch [${batch.batchNumber}] of ${product.name} expired on ${batch.expiryDate.toISOString().split("T")[0]}. Quantity at risk: ${batch.quantity} ${product.unit}.`,
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
                message: `Batch [${batch.batchNumber}] of ${product.name} expires in ${daysLeft} days (${batch.expiryDate.toISOString().split("T")[0]}). Stock: ${batch.quantity} ${product.unit}.`,
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
      // D. RULE-BASED INVENTORY ANOMALY DETECTION
      // ----------------------------------------------------
      // Rule 1: Sudden large single-movement reduction (> 40% of previous stock without sale)
      // Rule 2: Repeated rapid manual adjustments (>= 3 manual adjustments within recent movements)
      const manualAdjustments = product.stockMovements.filter((m) => m.movementType === "ADJUSTMENT");
      const existingAnomalyAlert = openAlerts.find((a) => a.alertType === "ANOMALY_REVIEW");

      if (manualAdjustments.length >= 3 && !existingAnomalyAlert) {
        await prisma.alert.create({
          data: {
            productId: product.id,
            alertType: "ANOMALY_REVIEW",
            severity: "HIGH",
            status: "OPEN",
            message: `Frequent manual inventory adjustments detected for [${product.name}] (${manualAdjustments.length} in recent history). Recommended for supervisor audit.`,
            detailsJson: JSON.stringify({
              adjustmentsCount: manualAdjustments.length,
              recentMovementIds: manualAdjustments.map((m) => m.id),
            }),
          },
        });
        alertsCreated++;
        anomaliesDetected++;
        details.push(`Detected ANOMALY: Frequent adjustments on ${product.name}`);
      }

      // Check sudden large reduction without a recorded sale
      const latestMovement = product.stockMovements[0];
      if (
        latestMovement &&
        latestMovement.movementType === "OUT" &&
        latestMovement.previousQuantity > 20 &&
        latestMovement.quantity >= latestMovement.previousQuantity * (config.anomalyDropPercentage / 100) &&
        !existingAnomalyAlert
      ) {
        await prisma.alert.create({
          data: {
            productId: product.id,
            alertType: "ANOMALY_REVIEW",
            severity: "MEDIUM",
            status: "OPEN",
            message: `Sudden sharp quantity deduction of ${latestMovement.quantity} ${product.unit} (${Math.round((latestMovement.quantity / latestMovement.previousQuantity) * 100)}% of stock) on [${product.name}].`,
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
   * Evaluates a single product immediately following a stock mutation
   */
  static async evaluateProduct(productId: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        batches: {
          where: { quantity: { gt: 0 }, status: "ACTIVE" },
        },
        alerts: { where: { status: "OPEN" } },
      },
    });

    if (!product) return;

    // Check OUT_OF_STOCK
    const existingOutOfStock = product.alerts.find((a) => a.alertType === "OUT_OF_STOCK");
    if (product.currentQuantity <= 0) {
      if (!existingOutOfStock) {
        await prisma.alert.create({
          data: {
            productId: product.id,
            alertType: "OUT_OF_STOCK",
            severity: "CRITICAL",
            status: "OPEN",
            message: `Product [${product.name}] is OUT OF STOCK.`,
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

    // Check LOW_STOCK
    const existingLowStock = product.alerts.find((a) => a.alertType === "LOW_STOCK");
    if (product.currentQuantity > 0 && product.currentQuantity <= product.minStockLevel) {
      if (!existingLowStock) {
        await prisma.alert.create({
          data: {
            productId: product.id,
            alertType: "LOW_STOCK",
            severity: "HIGH",
            status: "OPEN",
            message: `Product [${product.name}] is low on stock (${product.currentQuantity} ${product.unit}).`,
          },
        });
      }
    } else if (existingLowStock && product.currentQuantity > product.minStockLevel) {
      await prisma.alert.update({
        where: { id: existingLowStock.id },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
          message: `${existingLowStock.message} [AUTO-RESOLVED: Stock is ${product.currentQuantity}]`,
        },
      });
    }
  }
}
