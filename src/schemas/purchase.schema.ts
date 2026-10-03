import { z } from "zod";

export const PurchaseOrderItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitCost: z.number().nonnegative("Unit cost must be non-negative"),
});

export const CreatePurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  expectedDeliveryDate: z.string().optional().nullable(),
  notes: z.string().optional(),
  items: z.array(PurchaseOrderItemSchema).min(1, "At least one item is required"),
});

export const ReceivePurchaseOrderSchema = z.object({
  receivedItems: z.array(
    z.object({
      orderItemId: z.string().min(1),
      productId: z.string().min(1),
      quantityReceived: z.number().nonnegative(),
      batchNumber: z.string().min(1, "Batch number required"),
      expiryDate: z.string().optional().nullable(),
    })
  ).min(1),
  locationId: z.string().optional().nullable(),
});

export type PurchaseOrderItemInput = z.infer<typeof PurchaseOrderItemSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderSchema>;
export type ReceivePurchaseOrderInput = z.infer<typeof ReceivePurchaseOrderSchema>;
