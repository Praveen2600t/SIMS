import { z } from "zod";

export const ProductSchema = z.object({
  productCode: z.string().min(2, "Product code is required"),
  name: z.string().min(2, "Product name is required"),
  categoryId: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required"),
  unit: z.enum(["kg", "g", "litre", "ml", "packet", "piece", "box", "dozen"]),
  purchasePrice: z.number().nonnegative("Purchase price must be positive"),
  sellingPrice: z.number().nonnegative("Selling price must be positive"),
  currentQuantity: z.number().min(0, "Quantity cannot be negative").default(0),
  minStockLevel: z.number().min(0, "Minimum stock must be non-negative").default(10),
  reorderQuantity: z.number().min(0, "Reorder quantity must be non-negative").default(50),
  storageType: z.enum(["ROOM_TEMP", "COLD_STORAGE", "FROZEN", "DRY_VENTILATED"]).default("ROOM_TEMP"),
  district: z.string().min(2, "District is required"),
  marketLocation: z.string().min(2, "Market location is required"),
  supplierId: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  dataSource: z.string().default("TAMIL_NADU_DEMO_DATA"),
  isSampleData: z.boolean().default(true),
});

export const ProductUpdateSchema = ProductSchema.partial();

export const ProductQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  district: z.string().optional(),
  marketLocation: z.string().optional(),
  supplierId: z.string().optional(),
  stockStatus: z.enum(["ALL", "NORMAL", "LOW_STOCK", "OUT_OF_STOCK"]).optional(),
  expiryStatus: z.enum(["ALL", "EXPIRING_SOON", "EXPIRED", "VALID"]).optional(),
  sortBy: z.enum(["name", "currentQuantity", "purchasePrice", "sellingPrice", "createdAt", "district"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ProductQueryParams = z.infer<typeof ProductQuerySchema>;
