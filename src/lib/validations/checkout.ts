import { z } from "zod";

export const shippingAddressSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "Use 2-letter state code"),
  zip: z.string().min(5, "ZIP code is required"),
  country: z.string().default("US"),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
