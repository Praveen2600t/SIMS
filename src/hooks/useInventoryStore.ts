import { useState, useEffect } from "react";
import { inventoryStore, runContinuousMonitoring } from "../lib/inventoryStore";

export function useInventory() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Ensure store is initialized on mount
    inventoryStore.init();
    runContinuousMonitoring();

    const handleUpdate = () => {
      setTick((t) => t + 1);
    };

    window.addEventListener("sicms_store_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("sicms_store_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    products: inventoryStore.getProducts(),
    batches: inventoryStore.getBatches(),
    movements: inventoryStore.getMovements(),
    alerts: inventoryStore.getAlerts(),
    suppliers: inventoryStore.getSuppliers(),
    purchaseOrders: inventoryStore.getPurchaseOrders(),
    sales: inventoryStore.getSales(),
    metrics: inventoryStore.getMetrics(),
    // Actions
    saveProduct: inventoryStore.saveProduct,
    deleteProduct: inventoryStore.deleteProduct,
    stockIn: inventoryStore.stockIn,
    stockOut: inventoryStore.stockOut,
    adjustStock: inventoryStore.adjustStock,
    addBatch: inventoryStore.addBatch,
    recordSale: inventoryStore.recordSale,
    saveSupplier: inventoryStore.saveSupplier,
    deleteSupplier: inventoryStore.deleteSupplier,
    createPurchaseOrder: inventoryStore.createPurchaseOrder,
    receivePurchaseOrder: inventoryStore.receivePurchaseOrder,
    acknowledgeAlert: inventoryStore.acknowledgeAlert,
    resolveAlert: inventoryStore.resolveAlert,
    clearResolvedAlerts: inventoryStore.clearResolvedAlerts,
    resetToSampleData: inventoryStore.resetToSampleData,
    runMonitoring: runContinuousMonitoring,
  };
}
