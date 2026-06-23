import { z } from "zod";

const bannerSchema = z.object({
  text: z.string(),
  link: z.string().nullable().optional(),
  bg_color: z.string().default("#000000"),
});

const navItemSchema = z.object({
  label: z.string(),
  link: z.string(),
});

const footerLinkSchema = z.object({
  label: z.string(),
  link: z.string(),
});

const socialSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

export const siteSettingsSchema = z.object({
  site_title: z.string().min(1, "Site title is required"),
  meta_title: z.string().max(60).nullable().optional(),
  meta_description: z.string().max(160).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  favicon_url: z.string().url().nullable().optional(),
  tax_mode: z.enum(["stripe", "flat_rate", "none"]),
  tax_flat_rate: z.number().min(0).max(1).nullable().optional(),
  homepage_config: z.object({
    hero_heading: z.string(),
    hero_subtext: z.string(),
    hero_image_url: z.string().url().nullable().optional(),
    hero_cta_text: z.string(),
    hero_cta_link: z.string(),
    featured_product_ids: z.array(z.string().uuid()),
    featured_category_ids: z.array(z.string().uuid()),
    banners: z.array(bannerSchema),
  }),
  nav_config: z.object({
    items: z.array(navItemSchema),
  }),
  footer_config: z.object({
    links: z.array(footerLinkSchema),
    social: z.array(socialSchema),
    copyright_text: z.string(),
  }),
  contact_info: z.object({
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
  }),
  store_address: z.object({
    name: z.string().min(1, "Store name is required"),
    street1: z.string().min(1, "Street address is required"),
    street2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().length(2, "Use 2-letter state code"),
    zip: z.string().min(5, "ZIP code is required"),
    country: z.string().default("US"),
    phone: z.string().optional(),
  }),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
