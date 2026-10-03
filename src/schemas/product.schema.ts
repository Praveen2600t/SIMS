import { z } from "zod";

export const ProductSchema = z.object({
  productCode: z.string().min(2, "Product code is required"),
  name: z.string().min(2, "Product name is required"),
  categoryId: z.string().min(1, "Category is required"),
  subcategory: z.string().min(1, "Subcategory is required").default("General"),
  unit: z.string().min(1, "Unit of measure is required").default("units"),
  purchasePrice: z.number().nonnegative("Purchase price must be positive"),
  sellingPrice: z.number().nonnegative("Selling price must be positive"),
  currentQuantity: z.number().min(0, "Quantity cannot be negative").default(0),
  minStockLevel: z.number().min(0, "Minimum stock must be non-negative").default(10),
  reorderQuantity: z.number().min(0, "Reorder quantity must be non-negative").default(50),
  storageType: z.string().default("ROOM_TEMP"),
  storageLocation: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  marketLocation: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  dataSource: z.string().default("SICMS_GENERAL_INVENTORY"),
  isSampleData: z.boolean().default(false),
});

export const ProductUpdateSchema = ProductSchema.partial();

export const ProductQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(200).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  storageLocation: z.string().optional(),
  district: z.string().optional(),
  marketLocation: z.string().optional(),
  supplierId: z.string().optional(),
  stockStatus: z.enum(["ALL", "NORMAL", "LOW_STOCK", "OUT_OF_STOCK"]).optional(),
  expiryStatus: z.enum(["ALL", "EXPIRING_SOON", "EXPIRED", "VALID"]).optional(),
  sortBy: z.enum(["name", "currentQuantity", "purchasePrice", "sellingPrice", "createdAt", "storageLocation"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
export type ProductQueryParams = z.infer<typeof ProductQuerySchema>;
