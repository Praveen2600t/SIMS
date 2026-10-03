import fs from "fs";
import path from "path";

export interface GenericProductTemplate {
  name: string;
  category: string;
  subcategory: string;
  unit: string;
  storageType: string;
  storageLocation: string;
  typicalPurchasePrice: number;
  typicalSellingPrice: number;
  hasExpiry: boolean;
  shelfLifeDays?: number;
}

export const GENERIC_WAREHOUSES = [
  "Central Distribution Center - Zone A",
  "Central Distribution Center - Zone B",
  "High-Density Warehouse - Racks 01-10",
  "Cold Storage Vault 01 (2-8°C)",
  "Cold Storage Vault 02 (-20°C Deep Freeze)",
  "Flammable & Hazmat Storage Bay",
  "Logistics Depot North - Bay 4",
  "East Coast Warehouse - Fast-Pick Shelf C",
  "Cleanroom & Bio-Storage Area",
  "General Bulk Storage Facility",
];

export const GENERIC_SUPPLIERS = [
  { code: "SUP-IND-01", name: "Apex Global Industrial Technologies", sector: "Industrial & Materials" },
  { code: "SUP-MED-02", name: "BioHealth Pharma Laboratories", sector: "Healthcare & Pharmaceuticals" },
  { code: "SUP-ELE-03", name: "OmniComponents Semiconductor Corp", sector: "Electronics" },
  { code: "SUP-CHM-04", name: "Vanguard Specialty Chemical Logistics", sector: "Chemicals & Reagents" },
  { code: "SUP-HRD-05", name: "Precision Hardware & Fasteners Group", sector: "Hardware & Tools" },
  { code: "SUP-PKG-06", name: "National Packaging & Container Depot", sector: "Packaging & Logistics" },
  { code: "SUP-FMC-07", name: "Unified Consumer Goods & FMCG Inc", sector: "Consumer Products" },
  { code: "SUP-AUT-08", name: "Atlas Automotive Systems & Fluids", sector: "Automotive Parts" },
  { code: "SUP-LAB-09", name: "Horizon Scientific & Laboratory Supplies", sector: "Laboratory" },
  { code: "SUP-OFC-10", name: "Matrix Enterprise Office Supplies", sector: "Office & Facilities" },
];

export const GENERIC_PRODUCT_TEMPLATES: GenericProductTemplate[] = [
  // 1. Electronics & Components
  { name: "Microcontroller Board ESP32-WROOM-32D", category: "Electronics", subcategory: "Embedded Systems", unit: "units", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone A", typicalPurchasePrice: 280, typicalSellingPrice: 420, hasExpiry: false },
  { name: "Precision Op-Amp IC Dual Low-Noise (Pack of 10)", category: "Electronics", subcategory: "Semiconductors", unit: "pack", storageType: "STANDARD", storageLocation: "High-Density Warehouse - Racks 01-10", typicalPurchasePrice: 150, typicalSellingPrice: 230, hasExpiry: false },
  { name: "Lithium Polymer Battery 3.7V 2500mAh", category: "Electronics", subcategory: "Energy Storage", unit: "units", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone B", typicalPurchasePrice: 320, typicalSellingPrice: 480, hasExpiry: true, shelfLifeDays: 730 },
  { name: "Surface Mount Capacitor 100uF 50V (Reel of 1000)", category: "Electronics", subcategory: "Passives", unit: "roll", storageType: "STANDARD", storageLocation: "High-Density Warehouse - Racks 01-10", typicalPurchasePrice: 850, typicalSellingPrice: 1200, hasExpiry: false },
  { name: "OLED Display Module 0.96-inch I2C Interface", category: "Electronics", subcategory: "Displays", unit: "units", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone A", typicalPurchasePrice: 180, typicalSellingPrice: 275, hasExpiry: false },
  { name: "Industrial Switching Power Supply 24V 10A", category: "Electronics", subcategory: "Power Systems", unit: "units", storageType: "STANDARD", storageLocation: "Logistics Depot North - Bay 4", typicalPurchasePrice: 1450, typicalSellingPrice: 1950, hasExpiry: false },

  // 2. Pharmaceuticals & Healthcare
  { name: "Amoxicillin Trihydrate Capsules 500mg (Box of 100)", category: "Pharmaceuticals", subcategory: "Antibiotics", unit: "box", storageType: "STANDARD", storageLocation: "Cleanroom & Bio-Storage Area", typicalPurchasePrice: 380, typicalSellingPrice: 560, hasExpiry: true, shelfLifeDays: 730 },
  { name: "Sterile Normal Saline 0.9% IV Infusion 500ml", category: "Pharmaceuticals", subcategory: "IV Solutions", unit: "bottle", storageType: "STANDARD", storageLocation: "Cleanroom & Bio-Storage Area", typicalPurchasePrice: 45, typicalSellingPrice: 80, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Temperature-Sensitive Hepatitis B Vaccine 10-Dose Vial", category: "Pharmaceuticals", subcategory: "Biologics", unit: "vial", storageType: "COLD_STORAGE", storageLocation: "Cold Storage Vault 01 (2-8°C)", typicalPurchasePrice: 850, typicalSellingPrice: 1250, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Nitrile Examination Gloves Powder-Free (Box of 100)", category: "Pharmaceuticals", subcategory: "Medical Consumables", unit: "box", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 220, typicalSellingPrice: 340, hasExpiry: true, shelfLifeDays: 1095 },
  { name: "Insulin Glargine Injectable Pen 100 units/ml", category: "Pharmaceuticals", subcategory: "Biologics", unit: "units", storageType: "COLD_STORAGE", storageLocation: "Cold Storage Vault 01 (2-8°C)", typicalPurchasePrice: 620, typicalSellingPrice: 890, hasExpiry: true, shelfLifeDays: 150 },
  { name: "Digital Non-Contact Clinical Thermometer", category: "Pharmaceuticals", subcategory: "Medical Devices", unit: "units", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone A", typicalPurchasePrice: 750, typicalSellingPrice: 1100, hasExpiry: false },

  // 3. Industrial Raw Materials
  { name: "Cold Rolled Steel Coil Sheet 1.2mm x 1250mm", category: "Industrial Raw Materials", subcategory: "Metals", unit: "meters", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 180, typicalSellingPrice: 250, hasExpiry: false },
  { name: "High-Conductivity Copper Rod 10mm Diameter", category: "Industrial Raw Materials", subcategory: "Metals", unit: "kg", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 680, typicalSellingPrice: 820, hasExpiry: false },
  { name: "Polypropylene Resin Granules Injection Grade (25kg Bag)", category: "Industrial Raw Materials", subcategory: "Polymers", unit: "box", storageType: "STANDARD", storageLocation: "Logistics Depot North - Bay 4", typicalPurchasePrice: 2400, typicalSellingPrice: 2950, hasExpiry: false },
  { name: "Structural Carbon Steel Square Tubing 50x50mm", category: "Industrial Raw Materials", subcategory: "Metals", unit: "meters", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 320, typicalSellingPrice: 440, hasExpiry: false },
  { name: "Silicone Rubber Sheet High Temperature 3mm", category: "Industrial Raw Materials", subcategory: "Elastomers", unit: "roll", storageType: "STANDARD", storageLocation: "East Coast Warehouse - Fast-Pick Shelf C", typicalPurchasePrice: 1250, typicalSellingPrice: 1750, hasExpiry: false },

  // 4. Consumer Packaged Goods / FMCG
  { name: "Antibacterial Surface Disinfectant Spray 500ml", category: "Consumer Goods", subcategory: "Cleaning", unit: "bottle", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone B", typicalPurchasePrice: 110, typicalSellingPrice: 175, hasExpiry: true, shelfLifeDays: 730 },
  { name: "Commercial Heavy-Duty Laundry Detergent 10kg", category: "Consumer Goods", subcategory: "Cleaning", unit: "box", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 650, typicalSellingPrice: 890, hasExpiry: true, shelfLifeDays: 540 },
  { name: "Purified Distilled Water 20L Carboy Bottle", category: "Consumer Goods", subcategory: "Water Supplies", unit: "units", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone B", typicalPurchasePrice: 40, typicalSellingPrice: 85, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Moisturizing Skin Lotion Pump Dispenser 400ml", category: "Consumer Goods", subcategory: "Personal Care", unit: "units", storageType: "STANDARD", storageLocation: "East Coast Warehouse - Fast-Pick Shelf C", typicalPurchasePrice: 135, typicalSellingPrice: 220, hasExpiry: true, shelfLifeDays: 365 },

  // 5. Food Ingredients & Perishables
  { name: "Organic Whole Milk Powder 25kg Bulk Bag", category: "Food & Perishables", subcategory: "Dairy Ingredients", unit: "box", storageType: "STANDARD", storageLocation: "Logistics Depot North - Bay 4", typicalPurchasePrice: 4800, typicalSellingPrice: 5900, hasExpiry: true, shelfLifeDays: 270 },
  { name: "Refined Pure Cane Sugar Crystals 50kg Bag", category: "Food & Perishables", subcategory: "Sweeteners", unit: "box", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 1950, typicalSellingPrice: 2350, hasExpiry: false },
  { name: "Pasteurized Liquid Egg Whites 1L Carton", category: "Food & Perishables", subcategory: "Egg Products", unit: "carton", storageType: "COLD_STORAGE", storageLocation: "Cold Storage Vault 01 (2-8°C)", typicalPurchasePrice: 140, typicalSellingPrice: 210, hasExpiry: true, shelfLifeDays: 21 },
  { name: "Frozen Fruit Puree Concentrate - Strawberry 5kg", category: "Food & Perishables", subcategory: "Frozen Ingredients", unit: "tub", storageType: "COLD_STORAGE", storageLocation: "Cold Storage Vault 02 (-20°C Deep Freeze)", typicalPurchasePrice: 850, typicalSellingPrice: 1200, hasExpiry: true, shelfLifeDays: 180 },
  { name: "Premium Durum Semolina Flour 25kg Bag", category: "Food & Perishables", subcategory: "Flours", unit: "box", storageType: "STANDARD", storageLocation: "High-Density Warehouse - Racks 01-10", typicalPurchasePrice: 1100, typicalSellingPrice: 1450, hasExpiry: true, shelfLifeDays: 180 },

  // 6. Automotive & Mechanical Parts
  { name: "Ceramic Disc Brake Pads Front Set (Universal Fit)", category: "Automotive Parts", subcategory: "Braking", unit: "set", storageType: "STANDARD", storageLocation: "East Coast Warehouse - Fast-Pick Shelf C", typicalPurchasePrice: 1200, typicalSellingPrice: 1850, hasExpiry: false },
  { name: "Full Synthetic Motor Engine Oil 5W-30 (5L Canister)", category: "Automotive Parts", subcategory: "Fluids & Lubricants", unit: "bottle", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone B", typicalPurchasePrice: 1450, typicalSellingPrice: 2100, hasExpiry: true, shelfLifeDays: 1825 },
  { name: "Heavy Duty Spin-On Oil Filter Element", category: "Automotive Parts", subcategory: "Filters", unit: "units", storageType: "STANDARD", storageLocation: "High-Density Warehouse - Racks 01-10", typicalPurchasePrice: 220, typicalSellingPrice: 380, hasExpiry: false },
  { name: "Iridium Spark Plugs Set of 4 High-Ignition", category: "Automotive Parts", subcategory: "Ignition", unit: "set", storageType: "STANDARD", storageLocation: "East Coast Warehouse - Fast-Pick Shelf C", typicalPurchasePrice: 890, typicalSellingPrice: 1350, hasExpiry: false },
  { name: "Automotive Coolant Antifreeze Premix 50/50 4L", category: "Automotive Parts", subcategory: "Fluids & Lubricants", unit: "bottle", storageType: "STANDARD", storageLocation: "Flammable & Hazmat Storage Bay", typicalPurchasePrice: 380, typicalSellingPrice: 580, hasExpiry: true, shelfLifeDays: 1095 },

  // 7. Laboratory & Chemical Supplies
  { name: "Analytical Grade Isopropyl Alcohol 99.8% 5L Bottle", category: "Laboratory Chemicals", subcategory: "Solvents", unit: "bottle", storageType: "HAZMAT", storageLocation: "Flammable & Hazmat Storage Bay", typicalPurchasePrice: 650, typicalSellingPrice: 980, hasExpiry: true, shelfLifeDays: 730 },
  { name: "Phosphate Buffered Saline (PBS) Solution 10X 1L", category: "Laboratory Chemicals", subcategory: "Buffers", unit: "bottle", storageType: "STANDARD", storageLocation: "Cleanroom & Bio-Storage Area", typicalPurchasePrice: 420, typicalSellingPrice: 650, hasExpiry: true, shelfLifeDays: 365 },
  { name: "Borosilicate Glass Erlenmeyer Flask 500ml", category: "Laboratory Chemicals", subcategory: "Glassware", unit: "units", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone A", typicalPurchasePrice: 160, typicalSellingPrice: 260, hasExpiry: false },
  { name: "Sodium Hydroxide Pellets ACS Grade 500g Jar", category: "Laboratory Chemicals", subcategory: "Reagents", unit: "bottle", storageType: "HAZMAT", storageLocation: "Flammable & Hazmat Storage Bay", typicalPurchasePrice: 210, typicalSellingPrice: 340, hasExpiry: false },
  { name: "Universal pH Indicator Test Strips (Pack of 100)", category: "Laboratory Chemicals", subcategory: "Testing", unit: "pack", storageType: "STANDARD", storageLocation: "Cleanroom & Bio-Storage Area", typicalPurchasePrice: 90, typicalSellingPrice: 150, hasExpiry: true, shelfLifeDays: 730 },

  // 8. Packaging & Logistics Supplies
  { name: "Double-Wall Corrugated Shipping Boxes 18x12x10 (Bundle of 25)", category: "Packaging Supplies", subcategory: "Boxes", unit: "pack", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 450, typicalSellingPrice: 680, hasExpiry: false },
  { name: "Industrial Pallet Stretch Film Roll 500mm x 300m", category: "Packaging Supplies", subcategory: "Films", unit: "roll", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 320, typicalSellingPrice: 490, hasExpiry: false },
  { name: "Direct Thermal Shipping Barcode Labels 4x6 (Roll of 1000)", category: "Packaging Supplies", subcategory: "Labels", unit: "roll", storageType: "STANDARD", storageLocation: "Logistics Depot North - Bay 4", typicalPurchasePrice: 280, typicalSellingPrice: 420, hasExpiry: true, shelfLifeDays: 730 },
  { name: "Air Cushion Bubble Wrap Roll 100m Length", category: "Packaging Supplies", subcategory: "Cushioning", unit: "roll", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 390, typicalSellingPrice: 580, hasExpiry: false },

  // 9. Hardware & Tools
  { name: "High-Speed Steel Drill Bit Set (1-13mm 25 Pcs)", category: "Hardware & Tools", subcategory: "Cutting Tools", unit: "set", storageType: "STANDARD", storageLocation: "East Coast Warehouse - Fast-Pick Shelf C", typicalPurchasePrice: 780, typicalSellingPrice: 1150, hasExpiry: false },
  { name: "Stainless Steel Hex Socket Cap Screws M6x20 (Box of 500)", category: "Hardware & Tools", subcategory: "Fasteners", unit: "box", storageType: "STANDARD", storageLocation: "High-Density Warehouse - Racks 01-10", typicalPurchasePrice: 340, typicalSellingPrice: 520, hasExpiry: false },
  { name: "Heavy Duty Ratchet Tie-Down Cargo Straps 5T (Pack of 4)", category: "Hardware & Tools", subcategory: "Cargo Control", unit: "set", storageType: "STANDARD", storageLocation: "Logistics Depot North - Bay 4", typicalPurchasePrice: 650, typicalSellingPrice: 950, hasExpiry: false },
  { name: "Digital Vernier Caliper Stainless Steel 150mm", category: "Hardware & Tools", subcategory: "Metrology", unit: "units", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone A", typicalPurchasePrice: 850, typicalSellingPrice: 1250, hasExpiry: false },

  // 10. Office & Enterprise Supplies
  { name: "Laser Jet Black Toner Cartridge High Yield (Universal)", category: "Office Supplies", subcategory: "Printing", unit: "cartridge", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone A", typicalPurchasePrice: 1400, typicalSellingPrice: 2100, hasExpiry: true, shelfLifeDays: 730 },
  { name: "Multipurpose White Copy Paper A4 80GSM (Box of 5 Reams)", category: "Office Supplies", subcategory: "Paper", unit: "box", storageType: "STANDARD", storageLocation: "General Bulk Storage Facility", typicalPurchasePrice: 1050, typicalSellingPrice: 1450, hasExpiry: false },
  { name: "Wireless Barcode Scanner Handheld 2D QR Bluetooth", category: "Office Supplies", subcategory: "Logistics Hardware", unit: "units", storageType: "STANDARD", storageLocation: "Central Distribution Center - Zone A", typicalPurchasePrice: 1850, typicalSellingPrice: 2600, hasExpiry: false },
  { name: "Ergonomic Anti-Fatigue Floor Mat for Warehouse Workstations", category: "Office Supplies", subcategory: "Ergonomics", unit: "units", storageType: "STANDARD", storageLocation: "Logistics Depot North - Bay 4", typicalPurchasePrice: 950, typicalSellingPrice: 1400, hasExpiry: false },
];

/**
 * Generates structured, generic inventory records
 */
export function generateGenericDataset(count: number = 200) {
  const records = [];
  const baseCount = GENERIC_PRODUCT_TEMPLATES.length;

  for (let i = 0; i < count; i++) {
    const template = GENERIC_PRODUCT_TEMPLATES[i % baseCount];
    const warehouse = GENERIC_WAREHOUSES[(i * 3 + 1) % GENERIC_WAREHOUSES.length];
    const supplier = GENERIC_SUPPLIERS[(i * 2 + 3) % GENERIC_SUPPLIERS.length];

    const iteration = Math.floor(i / baseCount);
    const suffix = iteration > 0 ? ` (Rev-${iteration + 1})` : "";
    const codeNumber = String(i + 1).padStart(4, "0");
    const productCode = `SKU-${codeNumber}`;

    const priceVariance = 0.9 + ((i * 7) % 21) / 100;
    const purchasePrice = Math.round(template.typicalPurchasePrice * priceVariance);
    const sellingPrice = Math.round(template.typicalSellingPrice * priceVariance);

    const minStockLevel = template.unit === "box" || template.unit === "roll" ? 10 : 25;
    const maxStockLevel = minStockLevel * 6;
    const reorderQuantity = minStockLevel * 3;

    // Quantity profiles: normal, low-stock, and out-of-stock
    let currentQuantity: number;
    if (i % 24 === 0) {
      currentQuantity = 0; // OUT OF STOCK
    } else if (i % 11 === 0) {
      currentQuantity = Math.max(2, Math.floor(minStockLevel * 0.7)); // LOW STOCK
    } else {
      currentQuantity = minStockLevel * 2 + ((i * 19) % 220);
    }

    let manufactureDate = "";
    let expiryDate = "";
    const today = new Date();

    if (template.hasExpiry) {
      const shelfDays = template.shelfLifeDays || 180;
      const mfg = new Date(today);

      if (i % 18 === 0) {
        // EXPIRED test case
        mfg.setDate(today.getDate() - shelfDays - 5);
        const exp = new Date(mfg);
        exp.setDate(mfg.getDate() + shelfDays);
        manufactureDate = mfg.toISOString().split("T")[0];
        expiryDate = exp.toISOString().split("T")[0];
      } else if (i % 14 === 0) {
        // EXPIRING SOON test case (within 5-10 days)
        mfg.setDate(today.getDate() - shelfDays + 8);
        const exp = new Date(today);
        exp.setDate(today.getDate() + 8);
        manufactureDate = mfg.toISOString().split("T")[0];
        expiryDate = exp.toISOString().split("T")[0];
      } else {
        // Normal valid shelf life
        mfg.setDate(today.getDate() - Math.floor(shelfDays * 0.25));
        const exp = new Date(mfg);
        exp.setDate(mfg.getDate() + shelfDays);
        manufactureDate = mfg.toISOString().split("T")[0];
        expiryDate = exp.toISOString().split("T")[0];
      }
    }

    const batchNumber = `LOT-${new Date().getFullYear()}-${String((i % 60) + 1).padStart(3, "0")}`;

    records.push({
      product_id: productCode,
      product_name: `${template.name}${suffix}`,
      category: template.category,
      subcategory: template.subcategory,
      product_code: productCode,
      unit: template.unit,
      storage_location: warehouse,
      supplier_id: supplier.code,
      supplier_name: supplier.name,
      purchase_price: purchasePrice,
      selling_price: sellingPrice,
      current_quantity: currentQuantity,
      minimum_stock_level: minStockLevel,
      maximum_stock_level: maxStockLevel,
      reorder_quantity: reorderQuantity,
      batch_number: batchNumber,
      manufacture_date: manufactureDate,
      expiry_date: expiryDate,
      storage_type: template.storageType,
      last_updated: new Date().toISOString(),
      data_source: "SMART_INVENTORY_GENERAL_DATA_V1",
      is_sample_data: "true",
    });
  }

  return records;
}

// CLI Execution
if (require.main === module || process.argv[1]?.includes("generate-dataset")) {
  const args = process.argv.slice(2);
  const countArg = args.find((a) => a.startsWith("--count="));
  const recordCount = countArg ? parseInt(countArg.split("=")[1], 10) : 200;

  console.log(`Generating ${recordCount} generic inventory records...`);
  const records = generateGenericDataset(recordCount);

  const publicDir = path.join(process.cwd(), "public", "data");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const headers = Object.keys(records[0]);
  const csvLines = [
    headers.join(","),
    ...records.map((r) =>
      headers
        .map((h) => {
          const val = String((r as Record<string, unknown>)[h] ?? "");
          return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
        })
        .join(",")
    ),
  ];

  const filePath = path.join(publicDir, "general_inventory_sample_200.csv");
  fs.writeFileSync(filePath, csvLines.join("\n"), "utf-8");
  console.log(`Successfully generated ${records.length} records to ${filePath}`);
}
