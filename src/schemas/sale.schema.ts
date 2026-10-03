import { z } from "zod";

export const SaleItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  batchId: z.string().optional().nullable(),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
});

export const CreateSaleSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(["CASH", "UPI", "CARD", "CREDIT"]).default("UPI"),
  locationId: z.string().optional().nullable(),
  items: z.array(SaleItemSchema).min(1, "At least one sale item is required"),
});

export type SaleItemInput = z.infer<typeof SaleItemSchema>;
export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
