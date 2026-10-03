import { z } from "zod";

export const StockInSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  batchNumber: z.string().min(1, "Batch number is required"),
  manufactureDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  purchasePrice: z.number().nonnegative().optional(),
  supplierId: z.string().optional().nullable(),
  locationId: z.string().optional().nullable(),
  reason: z.string().min(2, "Reason is required").default("Stock Receipt"),
  referenceType: z.string().optional().default("PURCHASE_RECEIPT"),
  referenceId: z.string().optional(),
});

export const StockOutSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  batchId: z.string().optional().nullable(),
  quantity: z.number().positive("Quantity must be greater than 0"),
  movementType: z.enum(["OUT", "SALE", "DAMAGE", "RETURN", "EXPIRED"]).default("OUT"),
  reason: z.string().min(2, "Reason is required"),
  referenceType: z.string().optional().default("MANUAL_DISPATCH"),
  referenceId: z.string().optional(),
});

export const StockAdjustmentSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  batchId: z.string().optional().nullable(),
  newQuantity: z.number().min(0, "New quantity cannot be negative"),
  reason: z.string().min(3, "Audit explanation is required"),
});

export type StockInInput = z.infer<typeof StockInSchema>;
export type StockOutInput = z.infer<typeof StockOutSchema>;
export type StockAdjustmentInput = z.infer<typeof StockAdjustmentSchema>;
