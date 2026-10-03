/**
 * Smart Inventory Continuous Monitoring System (SICMS)
 * Pure Client-Side Store using Browser LocalStorage
 * Zero external servers, zero API keys, instant deployment.
 */

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  unitPrice: number;
  supplierId: string;
  supplierName: string;
  location: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string; // YYYY-MM-DD
  receivedDate: string;
  status: "ACTIVE" | "EXPIRED" | "DEPLETED";
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: "IN" | "OUT" | "ADJUST" | "SALE";
  quantity: number;
  previousQty: number;
  newQty: number;
  reason: string;
  reference?: string;
  batchNumber?: string;
  date: string;
}

export interface Alert {
  id: string;
  type: "LOW_STOCK" | "OUT_OF_STOCK" | "EXPIRED_BATCH" | "NEAR_EXPIRY" | "UNUSUAL_MOVEMENT";
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  message: string;
  reason: string;
  productId?: string;
  productName?: string;
  sku?: string;
  batchNumber?: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  leadTimeDays: number;
  categories: string[];
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: "PENDING" | "RECEIVED" | "CANCELLED";
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  date: string;
  paymentMethod: "CASH" | "CARD" | "INVOICE" | "UPI";
}

// Storage Keys
const STORAGE_KEYS = {
  PRODUCTS: "sicms_products",
  BATCHES: "sicms_batches",
  MOVEMENTS: "sicms_movements",
  ALERTS: "sicms_alerts",
  SUPPLIERS: "sicms_suppliers",
  PURCHASE_ORDERS: "sicms_purchase_orders",
  SALES: "sicms_sales",
  INITIALIZED: "sicms_initialized_v2",
};

// Realistic Initial Sample Data
export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-01",
    name: "Apex Micro Electronics",
    contactPerson: "Arjun Verma",
    email: "orders@apexmicro.com",
    phone: "+91 98401 23456",
    address: "Tech Park Phase II, Bengaluru",
    leadTimeDays: 4,
    categories: ["Electronics", "Semiconductors"],
  },
  {
    id: "sup-02",
    name: "Medisurge Bio-Pharma Ltd",
    contactPerson: "Dr. Sunita Rao",
    email: "supply@medisurge.com",
    phone: "+91 98402 34567",
    address: "Bio-Valley Industrial Estate, Hyderabad",
    leadTimeDays: 3,
    categories: ["Pharmaceuticals", "Healthcare"],
  },
  {
    id: "sup-03",
    name: "Falcon Packaging Industries",
    contactPerson: "Vikram Sethi",
    email: "sales@falconpack.in",
    phone: "+91 98403 45678",
    address: "SIPCOT Industrial Complex, Sriperumbudur",
    leadTimeDays: 2,
    categories: ["Packaging", "Logistics Materials"],
  },
  {
    id: "sup-04",
    name: "National Chemical & Polymers",
    contactPerson: "Kavita Menon",
    email: "orders@nationalpolymers.in",
    phone: "+91 98404 56789",
    address: "Chemical Zone, Vadodara",
    leadTimeDays: 7,
    categories: ["Raw Materials", "Polymers"],
  },
  {
    id: "sup-05",
    name: "Summit Office Supplies",
    contactPerson: "Rahul Nair",
    email: "care@summitoffices.com",
    phone: "+91 98405 67890",
    address: "Commerce Centre, Chennai",
    leadTimeDays: 1,
    categories: ["Office Supplies", "Stationery"],
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-01",
    name: "ESP32-WROOM-32D Microcontroller Module",
    sku: "SKU-ELEC-001",
    category: "Electronics",
    quantity: 145,
    unit: "pcs",
    minStock: 50,
    unitPrice: 280,
    supplierId: "sup-01",
    supplierName: "Apex Micro Electronics",
    location: "Aisle A - Rack 03",
    description: "Dual-core 240MHz Wi-Fi and Bluetooth IoT MCU module.",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "prod-02",
    name: "STM32F401 Development Board",
    sku: "SKU-ELEC-002",
    category: "Electronics",
    quantity: 12,
    unit: "pcs",
    minStock: 25,
    unitPrice: 650,
    supplierId: "sup-01",
    supplierName: "Apex Micro Electronics",
    location: "Aisle A - Rack 04",
    description: "ARM Cortex-M4 84MHz microcontroller dev board.",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-10-02T12:00:00Z",
  },
  {
    id: "prod-03",
    name: "Lithium Polymer Battery 3.7V 2500mAh",
    sku: "SKU-ELEC-003",
    category: "Electronics",
    quantity: 0,
    unit: "pcs",
    minStock: 30,
    unitPrice: 340,
    supplierId: "sup-01",
    supplierName: "Apex Micro Electronics",
    location: "Aisle A - Flameproof Vault",
    description: "Rechargeable LiPo battery with PCM circuit protection.",
    createdAt: "2026-09-02T09:00:00Z",
    updatedAt: "2026-10-03T08:30:00Z",
  },
  {
    id: "prod-04",
    name: "Amoxicillin Trihydrate Capsules 500mg",
    sku: "SKU-PHARM-001",
    category: "Pharmaceuticals",
    quantity: 28,
    unit: "box",
    minStock: 40,
    unitPrice: 220,
    supplierId: "sup-02",
    supplierName: "Medisurge Bio-Pharma Ltd",
    location: "Cold Vault 1 (15-25°C)",
    description: "Broad-spectrum antibacterial medication box of 100 caps.",
    createdAt: "2026-09-05T10:00:00Z",
    updatedAt: "2026-10-02T14:00:00Z",
  },
  {
    id: "prod-05",
    name: "Sterile Normal Saline 0.9% IV Infusion 500ml",
    sku: "SKU-PHARM-002",
    category: "Pharmaceuticals",
    quantity: 180,
    unit: "bottle",
    minStock: 60,
    unitPrice: 48,
    supplierId: "sup-02",
    supplierName: "Medisurge Bio-Pharma Ltd",
    location: "Medical Storage Zone B",
    description: "Sterile intravenous fluid solution in flexi-bottle.",
    createdAt: "2026-09-05T10:30:00Z",
    updatedAt: "2026-10-01T11:00:00Z",
  },
  {
    id: "prod-06",
    name: "Paracetamol 650mg Antipyretic Tablets",
    sku: "SKU-PHARM-003",
    category: "Pharmaceuticals",
    quantity: 95,
    unit: "strip",
    minStock: 50,
    unitPrice: 32,
    supplierId: "sup-02",
    supplierName: "Medisurge Bio-Pharma Ltd",
    location: "Medical Storage Zone B",
    description: "Pain relief and antipyretic tablets 15/strip.",
    createdAt: "2026-09-06T11:00:00Z",
    updatedAt: "2026-10-01T15:00:00Z",
  },
  {
    id: "prod-07",
    name: "Corrugated Shipping Boxes 12x10x8 inch",
    sku: "SKU-PACK-001",
    category: "Packaging",
    quantity: 420,
    unit: "pack",
    minStock: 100,
    unitPrice: 85,
    supplierId: "sup-03",
    supplierName: "Falcon Packaging Industries",
    location: "Bulk Warehouse Bay 1",
    description: "Heavy-duty 3-ply corrugated dispatch carton bundle of 10.",
    createdAt: "2026-09-08T09:00:00Z",
    updatedAt: "2026-10-01T16:00:00Z",
  },
  {
    id: "prod-08",
    name: "Industrial Bubble Cushioning Roll 50m",
    sku: "SKU-PACK-002",
    category: "Packaging",
    quantity: 18,
    unit: "roll",
    minStock: 20,
    unitPrice: 420,
    supplierId: "sup-03",
    supplierName: "Falcon Packaging Industries",
    location: "Bulk Warehouse Bay 2",
    description: "Anti-static protective air cushion packaging wrap.",
    createdAt: "2026-09-08T09:30:00Z",
    updatedAt: "2026-10-02T10:00:00Z",
  },
  {
    id: "prod-09",
    name: "Polypropylene Injection Grade Resin 25kg",
    sku: "SKU-POLY-001",
    category: "Raw Materials",
    quantity: 65,
    unit: "bag",
    minStock: 30,
    unitPrice: 2850,
    supplierId: "sup-04",
    supplierName: "National Chemical & Polymers",
    location: "Silo Floor Zone D",
    description: "Homopolymer polypropylene granules for molding.",
    createdAt: "2026-09-10T14:00:00Z",
    updatedAt: "2026-10-02T17:00:00Z",
  },
  {
    id: "prod-10",
    name: "Thermal Transfer Barcode Ribbon Wax/Resin",
    sku: "SKU-OFF-001",
    category: "Office Supplies",
    quantity: 8,
    unit: "roll",
    minStock: 15,
    unitPrice: 380,
    supplierId: "sup-05",
    supplierName: "Summit Office Supplies",
    location: "Dispatch Desk Cabinet",
    description: "110mm x 300m premium black barcode print ribbon.",
    createdAt: "2026-09-12T11:00:00Z",
    updatedAt: "2026-10-03T09:00:00Z",
  },
];

export const INITIAL_BATCHES: Batch[] = [
  {
    id: "bat-01",
    productId: "prod-04",
    batchNumber: "LOT-AMX-2026-01",
    quantity: 18,
    expiryDate: "2026-10-25", // Expiring soon! (~22 days)
    receivedDate: "2026-08-10",
    status: "ACTIVE",
  },
  {
    id: "bat-02",
    productId: "prod-04",
    batchNumber: "LOT-AMX-2026-02",
    quantity: 10,
    expiryDate: "2027-04-15",
    receivedDate: "2026-09-15",
    status: "ACTIVE",
  },
  {
    id: "bat-03",
    productId: "prod-05",
    batchNumber: "LOT-IVS-2026-09",
    quantity: 180,
    expiryDate: "2027-08-30",
    receivedDate: "2026-09-20",
    status: "ACTIVE",
  },
  {
    id: "bat-04",
    productId: "prod-06",
    batchNumber: "LOT-PCT-2025-88",
    quantity: 15,
    expiryDate: "2026-09-15", // Already EXPIRED!
    receivedDate: "2025-09-15",
    status: "EXPIRED",
  },
  {
    id: "bat-05",
    productId: "prod-06",
    batchNumber: "LOT-PCT-2026-01",
    quantity: 80,
    expiryDate: "2027-06-30",
    receivedDate: "2026-08-01",
    status: "ACTIVE",
  },
];

export const INITIAL_MOVEMENTS: StockMovement[] = [
  {
    id: "mov-01",
    productId: "prod-01",
    productName: "ESP32-WROOM-32D Microcontroller Module",
    sku: "SKU-ELEC-001",
    type: "IN",
    quantity: 100,
    previousQty: 45,
    newQty: 145,
    reason: "Restock PO Received (PO-2026-101)",
    reference: "PO-2026-101",
    date: "2026-10-01T10:00:00Z",
  },
  {
    id: "mov-02",
    productId: "prod-02",
    productName: "STM32F401 Development Board",
    sku: "SKU-ELEC-002",
    type: "OUT",
    quantity: 18,
    previousQty: 30,
    newQty: 12,
    reason: "Customer Dispatch Invoice INV-8492",
    reference: "INV-8492",
    date: "2026-10-02T11:30:00Z",
  },
  {
    id: "mov-03",
    productId: "prod-03",
    productName: "Lithium Polymer Battery 3.7V 2500mAh",
    sku: "SKU-ELEC-003",
    type: "OUT",
    quantity: 35,
    previousQty: 35,
    newQty: 0,
    reason: "Bulk Production Issue (Order #4910)",
    reference: "PROD-4910",
    date: "2026-10-03T08:30:00Z",
  },
  {
    id: "mov-04",
    productId: "prod-07",
    productName: "Corrugated Shipping Boxes 12x10x8 inch",
    sku: "SKU-PACK-001",
    type: "IN",
    quantity: 200,
    previousQty: 220,
    newQty: 420,
    reason: "Supplier Delivery PO-2026-098",
    reference: "PO-2026-098",
    date: "2026-10-01T15:00:00Z",
  },
  {
    id: "mov-05",
    productId: "prod-10",
    productName: "Thermal Transfer Barcode Ribbon Wax/Resin",
    sku: "SKU-OFF-001",
    type: "OUT",
    quantity: 7,
    previousQty: 15,
    newQty: 8,
    reason: "Store Room Issue for Packaging Station",
    reference: "INTERNAL-REQ-33",
    date: "2026-10-03T09:00:00Z",
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: "sale-01",
    invoiceNumber: "INV-8492",
    customerName: "RoboTech Automation Labs",
    items: [
      {
        productId: "prod-02",
        productName: "STM32F401 Development Board",
        sku: "SKU-ELEC-002",
        quantity: 18,
        unitPrice: 650,
        totalPrice: 11700,
      },
    ],
    totalAmount: 11700,
    date: "2026-10-02T11:30:00Z",
    paymentMethod: "INVOICE",
  },
  {
    id: "sale-02",
    invoiceNumber: "INV-8491",
    customerName: "Metro Diagnostics Centre",
    items: [
      {
        productId: "prod-05",
        productName: "Sterile Normal Saline 0.9% IV Infusion 500ml",
        sku: "SKU-PHARM-002",
        quantity: 40,
        unitPrice: 48,
        totalPrice: 1920,
      },
      {
        productId: "prod-06",
        productName: "Paracetamol 650mg Antipyretic Tablets",
        sku: "SKU-PHARM-003",
        quantity: 25,
        unitPrice: 32,
        totalPrice: 800,
      },
    ],
    totalAmount: 2720,
    date: "2026-10-01T14:15:00Z",
    paymentMethod: "UPI",
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "po-101",
    poNumber: "PO-2026-101",
    supplierId: "sup-01",
    supplierName: "Apex Micro Electronics",
    items: [
      {
        productId: "prod-01",
        productName: "ESP32-WROOM-32D Microcontroller Module",
        sku: "SKU-ELEC-001",
        quantity: 100,
        unitPrice: 280,
      },
    ],
    totalAmount: 28000,
    status: "RECEIVED",
    orderDate: "2026-09-25",
    expectedDate: "2026-09-29",
    receivedDate: "2026-10-01",
    notes: "Order fulfilled and inspected.",
  },
  {
    id: "po-102",
    poNumber: "PO-2026-102",
    supplierId: "sup-01",
    supplierName: "Apex Micro Electronics",
    items: [
      {
        productId: "prod-03",
        productName: "Lithium Polymer Battery 3.7V 2500mAh",
        sku: "SKU-ELEC-003",
        quantity: 50,
        unitPrice: 340,
      },
    ],
    totalAmount: 17000,
    status: "PENDING",
    orderDate: "2026-10-03",
    expectedDate: "2026-10-07",
    notes: "Urgent reorder due to zero stock.",
  },
];

// Helper to safely read from localStorage
function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultValue;
  }
}

// Helper to write to localStorage
function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Dispatch custom event for reactive cross-component state
    window.dispatchEvent(new Event("sicms_store_updated"));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Ensure Initial Seed
export function initializeStore(forceReset = false): void {
  if (forceReset || !localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(INITIAL_BATCHES));
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(INITIAL_MOVEMENTS));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.PURCHASE_ORDERS, JSON.stringify(INITIAL_PURCHASE_ORDERS));
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, "true");

    // Run initial monitoring to populate alerts
    runContinuousMonitoring();
    window.dispatchEvent(new Event("sicms_store_updated"));
  }
}

// ==================== STORE GETTERS & MUTATORS ====================

export const inventoryStore = {
  // Initialization
  init: initializeStore,

  resetToSampleData: () => {
    initializeStore(true);
  },

  // Products
  getProducts: (): Product[] => {
    return readStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },

  getProductById: (id: string): Product | undefined => {
    return inventoryStore.getProducts().find((p) => p.id === id);
  },

  saveProduct: (product: Omit<Product, "id" | "createdAt" | "updatedAt"> & { id?: string }): Product => {
    const products = inventoryStore.getProducts();
    const now = new Date().toISOString();

    if (product.id) {
      // Update
      const index = products.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        const updated: Product = {
          ...products[index],
          ...product,
          id: product.id,
          updatedAt: now,
        };
        products[index] = updated;
        writeStorage(STORAGE_KEYS.PRODUCTS, products);
        runContinuousMonitoring();
        return updated;
      }
    }

    // Create
    const newProduct: Product = {
      ...product,
      id: "prod-" + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    products.push(newProduct);
    writeStorage(STORAGE_KEYS.PRODUCTS, products);

    // Initial movement
    if (newProduct.quantity > 0) {
      inventoryStore.recordMovement({
        productId: newProduct.id,
        productName: newProduct.name,
        sku: newProduct.sku,
        type: "IN",
        quantity: newProduct.quantity,
        previousQty: 0,
        newQty: newProduct.quantity,
        reason: "Initial Product Creation Stock",
      });
    }

    runContinuousMonitoring();
    return newProduct;
  },

  deleteProduct: (id: string): void => {
    const products = inventoryStore.getProducts().filter((p) => p.id !== id);
    writeStorage(STORAGE_KEYS.PRODUCTS, products);

    // Clean up related batches and alerts
    const batches = inventoryStore.getBatches().filter((b) => b.productId !== id);
    writeStorage(STORAGE_KEYS.BATCHES, batches);

    const alerts = inventoryStore.getAlerts().filter((a) => a.productId !== id);
    writeStorage(STORAGE_KEYS.ALERTS, alerts);

    runContinuousMonitoring();
  },

  // Stock In
  stockIn: (params: {
    productId: string;
    quantity: number;
    reason: string;
    reference?: string;
    batchNumber?: string;
    expiryDate?: string;
  }): void => {
    if (params.quantity <= 0) throw new Error("Quantity must be greater than zero");

    const products = inventoryStore.getProducts();
    const product = products.find((p) => p.id === params.productId);
    if (!product) throw new Error("Product not found");

    const previousQty = product.quantity;
    const newQty = previousQty + params.quantity;
    product.quantity = newQty;
    product.updatedAt = new Date().toISOString();
    writeStorage(STORAGE_KEYS.PRODUCTS, products);

    // If batch provided, register batch
    if (params.batchNumber) {
      const batches = inventoryStore.getBatches();
      batches.push({
        id: "bat-" + Date.now(),
        productId: product.id,
        batchNumber: params.batchNumber,
        quantity: params.quantity,
        expiryDate: params.expiryDate || "",
        receivedDate: new Date().toISOString().split("T")[0],
        status: "ACTIVE",
      });
      writeStorage(STORAGE_KEYS.BATCHES, batches);
    }

    // Record Movement
    inventoryStore.recordMovement({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: "IN",
      quantity: params.quantity,
      previousQty,
      newQty,
      reason: params.reason,
      reference: params.reference,
      batchNumber: params.batchNumber,
    });

    runContinuousMonitoring();
  },

  // Stock Out
  stockOut: (params: {
    productId: string;
    quantity: number;
    reason: string;
    reference?: string;
    batchId?: string;
  }): void => {
    if (params.quantity <= 0) throw new Error("Quantity must be greater than zero");

    const products = inventoryStore.getProducts();
    const product = products.find((p) => p.id === params.productId);
    if (!product) throw new Error("Product not found");

    if (product.quantity < params.quantity) {
      throw new Error(`Insufficient stock. Current available: ${product.quantity} ${product.unit}`);
    }

    const previousQty = product.quantity;
    const newQty = previousQty - params.quantity;
    product.quantity = newQty;
    product.updatedAt = new Date().toISOString();
    writeStorage(STORAGE_KEYS.PRODUCTS, products);

    // If batch specified, deduct from batch
    if (params.batchId) {
      const batches = inventoryStore.getBatches();
      const batch = batches.find((b) => b.id === params.batchId);
      if (batch) {
        batch.quantity = Math.max(0, batch.quantity - params.quantity);
        if (batch.quantity === 0) batch.status = "DEPLETED";
        writeStorage(STORAGE_KEYS.BATCHES, batches);
      }
    }

    // Record Movement
    inventoryStore.recordMovement({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: "OUT",
      quantity: params.quantity,
      previousQty,
      newQty,
      reason: params.reason,
      reference: params.reference,
    });

    runContinuousMonitoring();
  },

  // Stock Adjustment
  adjustStock: (params: { productId: string; newQuantity: number; reason: string }): void => {
    if (params.newQuantity < 0) throw new Error("Stock quantity cannot be negative");

    const products = inventoryStore.getProducts();
    const product = products.find((p) => p.id === params.productId);
    if (!product) throw new Error("Product not found");

    const previousQty = product.quantity;
    const diff = params.newQuantity - previousQty;
    product.quantity = params.newQuantity;
    product.updatedAt = new Date().toISOString();
    writeStorage(STORAGE_KEYS.PRODUCTS, products);

    inventoryStore.recordMovement({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      type: "ADJUST",
      quantity: Math.abs(diff),
      previousQty,
      newQty: params.newQuantity,
      reason: params.reason,
    });

    runContinuousMonitoring();
  },

  // Batches
  getBatches: (): Batch[] => {
    return readStorage<Batch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
  },

  getBatchesByProduct: (productId: string): Batch[] => {
    return inventoryStore.getBatches().filter((b) => b.productId === productId);
  },

  addBatch: (batch: Omit<Batch, "id">): Batch => {
    const batches = inventoryStore.getBatches();
    const newBatch: Batch = {
      ...batch,
      id: "bat-" + Date.now(),
    };
    batches.push(newBatch);
    writeStorage(STORAGE_KEYS.BATCHES, batches);
    runContinuousMonitoring();
    return newBatch;
  },

  // Movements
  getMovements: (): StockMovement[] => {
    return readStorage<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, INITIAL_MOVEMENTS);
  },

  recordMovement: (movement: Omit<StockMovement, "id" | "date">): StockMovement => {
    const movements = inventoryStore.getMovements();
    const newMovement: StockMovement = {
      ...movement,
      id: "mov-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
      date: new Date().toISOString(),
    };
    movements.unshift(newMovement); // newest first
    writeStorage(STORAGE_KEYS.MOVEMENTS, movements);
    return newMovement;
  },

  // Alerts
  getAlerts: (): Alert[] => {
    return readStorage<Alert[]>(STORAGE_KEYS.ALERTS, []);
  },

  acknowledgeAlert: (alertId: string): void => {
    const alerts = inventoryStore.getAlerts();
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = "ACKNOWLEDGED";
      writeStorage(STORAGE_KEYS.ALERTS, alerts);
    }
  },

  resolveAlert: (alertId: string): void => {
    const alerts = inventoryStore.getAlerts();
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = "RESOLVED";
      alert.resolvedAt = new Date().toISOString();
      writeStorage(STORAGE_KEYS.ALERTS, alerts);
    }
  },

  clearResolvedAlerts: (): void => {
    const alerts = inventoryStore.getAlerts().filter((a) => a.status !== "RESOLVED");
    writeStorage(STORAGE_KEYS.ALERTS, alerts);
  },

  // Suppliers
  getSuppliers: (): Supplier[] => {
    return readStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, INITIAL_SUPPLIERS);
  },

  saveSupplier: (supplier: Omit<Supplier, "id"> & { id?: string }): Supplier => {
    const suppliers = inventoryStore.getSuppliers();
    if (supplier.id) {
      const idx = suppliers.findIndex((s) => s.id === supplier.id);
      if (idx !== -1) {
        suppliers[idx] = { ...suppliers[idx], ...supplier, id: supplier.id };
        writeStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
        return suppliers[idx];
      }
    }
    const newSup: Supplier = {
      ...supplier,
      id: "sup-" + Date.now(),
    };
    suppliers.push(newSup);
    writeStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
    return newSup;
  },

  deleteSupplier: (id: string): void => {
    const suppliers = inventoryStore.getSuppliers().filter((s) => s.id !== id);
    writeStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  },

  // Purchase Orders
  getPurchaseOrders: (): PurchaseOrder[] => {
    return readStorage<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, INITIAL_PURCHASE_ORDERS);
  },

  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "poNumber" | "status" | "orderDate">): PurchaseOrder => {
    const orders = inventoryStore.getPurchaseOrders();
    const newPO: PurchaseOrder = {
      ...po,
      id: "po-" + Date.now(),
      poNumber: `PO-${new Date().getFullYear()}-${orders.length + 101}`,
      status: "PENDING",
      orderDate: new Date().toISOString().split("T")[0],
    };
    orders.unshift(newPO);
    writeStorage(STORAGE_KEYS.PURCHASE_ORDERS, orders);
    return newPO;
  },

  receivePurchaseOrder: (poId: string): void => {
    const orders = inventoryStore.getPurchaseOrders();
    const po = orders.find((o) => o.id === poId);
    if (!po || po.status !== "PENDING") throw new Error("Purchase order cannot be received");

    po.status = "RECEIVED";
    po.receivedDate = new Date().toISOString().split("T")[0];
    writeStorage(STORAGE_KEYS.PURCHASE_ORDERS, orders);

    // Auto stock-in each item
    for (const item of po.items) {
      try {
        inventoryStore.stockIn({
          productId: item.productId,
          quantity: item.quantity,
          reason: `PO Received (${po.poNumber})`,
          reference: po.poNumber,
        });
      } catch (e) {
        console.error("Auto stock-in error:", e);
      }
    }
  },

  // Sales
  getSales: (): Sale[] => {
    return readStorage<Sale[]>(STORAGE_KEYS.SALES, INITIAL_SALES);
  },

  recordSale: (saleData: {
    customerName: string;
    items: { productId: string; quantity: number }[];
    paymentMethod: Sale["paymentMethod"];
  }): Sale => {
    const products = inventoryStore.getProducts();
    const saleItems: SaleItem[] = [];
    let grandTotal = 0;

    // Validate quantities first
    for (const item of saleData.items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) throw new Error(`Product ${item.productId} not found`);
      if (prod.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${prod.name}. Available: ${prod.quantity} ${prod.unit}`);
      }
    }

    const invoiceNum = `INV-${Math.floor(1000 + Math.random() * 9000)}`;

    // Deduct stock and assemble items
    for (const item of saleData.items) {
      const prod = products.find((p) => p.id === item.productId)!;
      const totalPrice = prod.unitPrice * item.quantity;
      grandTotal += totalPrice;

      saleItems.push({
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku,
        quantity: item.quantity,
        unitPrice: prod.unitPrice,
        totalPrice,
      });

      // Deduct stock
      inventoryStore.stockOut({
        productId: prod.id,
        quantity: item.quantity,
        reason: `Customer Sale (${invoiceNum}) - ${saleData.customerName}`,
        reference: invoiceNum,
      });
    }

    const newSale: Sale = {
      id: "sale-" + Date.now(),
      invoiceNumber: invoiceNum,
      customerName: saleData.customerName,
      items: saleItems,
      totalAmount: grandTotal,
      date: new Date().toISOString(),
      paymentMethod: saleData.paymentMethod,
    };

    const sales = inventoryStore.getSales();
    sales.unshift(newSale);
    writeStorage(STORAGE_KEYS.SALES, sales);

    return newSale;
  },

  // Metrics Calculation
  getMetrics: () => {
    const products = inventoryStore.getProducts();
    const batches = inventoryStore.getBatches();
    const alerts = inventoryStore.getAlerts().filter((a) => a.status !== "RESOLVED");

    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.quantity, 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + p.quantity * p.unitPrice, 0);

    const outOfStockItems = products.filter((p) => p.quantity === 0);
    const lowStockItems = products.filter((p) => p.quantity > 0 && p.quantity <= p.minStock);

    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const activeBatches = batches.filter((b) => b.quantity > 0);
    const expiredBatches = activeBatches.filter((b) => b.expiryDate && new Date(b.expiryDate) < now);
    const expiringBatches = activeBatches.filter((b) => {
      if (!b.expiryDate) return false;
      const d = new Date(b.expiryDate);
      return d >= now && d <= in30Days;
    });

    return {
      totalProducts,
      totalStock,
      totalInventoryValue,
      outOfStockCount: outOfStockItems.length,
      lowStockCount: lowStockItems.length,
      expiredBatchCount: expiredBatches.length,
      expiringBatchCount: expiringBatches.length,
      activeAlertsCount: alerts.length,
      criticalAlertsCount: alerts.filter((a) => a.severity === "CRITICAL").length,
    };
  },
};

// ==================== CONTINUOUS MONITORING ENGINE ====================

export function runContinuousMonitoring(): Alert[] {
  const products = inventoryStore.getProducts();
  const batches = inventoryStore.getBatches();
  const existingAlerts = inventoryStore.getAlerts();
  const movements = inventoryStore.getMovements();

  const newAlerts: Alert[] = [];
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(now.getDate() + 30);

  // Helper to check if an active alert already exists for a product/batch rule
  const alertExists = (type: Alert["type"], productId?: string, batchNumber?: string) => {
    return existingAlerts.some(
      (a) =>
        a.type === type &&
        a.status !== "RESOLVED" &&
        (!productId || a.productId === productId) &&
        (!batchNumber || a.batchNumber === batchNumber)
    );
  };

  // Rule 1: Out of Stock Check (CRITICAL)
  for (const product of products) {
    if (product.quantity === 0) {
      if (!alertExists("OUT_OF_STOCK", product.id)) {
        newAlerts.push({
          id: "alt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          type: "OUT_OF_STOCK",
          severity: "CRITICAL",
          title: `Out of Stock: ${product.name}`,
          message: `Inventory depleted to 0 ${product.unit}. Immediate purchase order required.`,
          reason: `Current stock reached 0 ${product.unit} (Minimum threshold: ${product.minStock} ${product.unit}).`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        });
      }
    } else if (product.quantity <= product.minStock) {
      // Rule 2: Low Stock Check (WARNING)
      if (!alertExists("LOW_STOCK", product.id)) {
        newAlerts.push({
          id: "alt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          type: "LOW_STOCK",
          severity: "WARNING",
          title: `Low Stock Warning: ${product.name}`,
          message: `Stock level (${product.quantity} ${product.unit}) is at or below minimum threshold (${product.minStock} ${product.unit}).`,
          reason: `Current stock ${product.quantity} <= min threshold ${product.minStock}.`,
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // Rule 3 & 4: Expiry Monitoring on Batches
  for (const batch of batches) {
    if (batch.quantity <= 0 || !batch.expiryDate) continue;
    const expDate = new Date(batch.expiryDate);
    const prod = products.find((p) => p.id === batch.productId);
    const prodName = prod?.name || "Unknown Product";

    if (expDate < now) {
      // Expired Batch (CRITICAL)
      if (!alertExists("EXPIRED_BATCH", batch.productId, batch.batchNumber)) {
        newAlerts.push({
          id: "alt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          type: "EXPIRED_BATCH",
          severity: "CRITICAL",
          title: `Batch Expired: ${batch.batchNumber}`,
          message: `Batch ${batch.batchNumber} of ${prodName} (${batch.quantity} units) expired on ${batch.expiryDate}. Quarantine immediately.`,
          reason: `Expiry date ${batch.expiryDate} is in the past. Stock cannot be sold or dispensed.`,
          productId: batch.productId,
          productName: prodName,
          sku: prod?.sku,
          batchNumber: batch.batchNumber,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        });
      }
    } else if (expDate <= in30Days) {
      // Near Expiry (WARNING)
      const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (!alertExists("NEAR_EXPIRY", batch.productId, batch.batchNumber)) {
        newAlerts.push({
          id: "alt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          type: "NEAR_EXPIRY",
          severity: "WARNING",
          title: `Expiring Soon: ${batch.batchNumber}`,
          message: `Batch ${batch.batchNumber} of ${prodName} has ${batch.quantity} units expiring in ${daysLeft} days (${batch.expiryDate}). Prioritize dispatch.`,
          reason: `Batch reaches expiry within the 30-day surveillance window.`,
          productId: batch.productId,
          productName: prodName,
          sku: prod?.sku,
          batchNumber: batch.batchNumber,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // Rule 5: Unusual High Stock Drop Check (INFO / WARNING)
  // Check if any recent OUT movement in last 24h was > 50% of previous stock
  const recentOuts = movements.slice(0, 10).filter((m) => m.type === "OUT" && m.previousQty > 0);
  for (const m of recentOuts) {
    if (m.quantity >= m.previousQty * 0.5 && m.quantity >= 15) {
      const dropKey = `UNUSUAL_DROP_${m.id}`;
      if (!existingAlerts.some((a) => a.reason.includes(dropKey))) {
        newAlerts.push({
          id: "alt-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
          type: "UNUSUAL_MOVEMENT",
          severity: "INFO",
          title: `Rapid Stock Depletion: ${m.productName}`,
          message: `Single dispatch of ${m.quantity} units reduced previous stock (${m.previousQty}) by >50%. Reason: ${m.reason}`,
          reason: `High velocity stock decrease flagged [${dropKey}].`,
          productId: m.productId,
          productName: m.productName,
          sku: m.sku,
          status: "ACTIVE",
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  if (newAlerts.length > 0) {
    const updatedAlerts = [...newAlerts, ...existingAlerts];
    writeStorage(STORAGE_KEYS.ALERTS, updatedAlerts);
  }

  return inventoryStore.getAlerts();
}
