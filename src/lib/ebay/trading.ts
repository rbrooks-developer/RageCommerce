import { XMLParser } from "fast-xml-parser";
import type { EbayConfig } from "@/types";

const TRADING_URL         = "https://api.ebay.com/ws/api.dll";
const COMPATIBILITY_LEVEL = "1155";

export interface TradingItem {
  listingId:      string;
  title:          string;
  price:          number;
  inventory:      number;
  description:    string | null;
  images:         string[];
  ebayCategoryId: string;
  brand:          string | null;
  weightOz:       number;
  lengthIn:       number;
  widthIn:        number;
  heightIn:       number;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseItem(raw: any): TradingItem | null {
  const listingId = String(raw.ItemID ?? "").trim();
  const title     = String(raw.Title ?? "").trim();
  if (!listingId || !title) return null;

  // Price: StartPrice is the fixed price for FixedPriceItem listings
  const price = parseFloat(String(raw.StartPrice ?? 0));
  if (price <= 0) return null;

  // Remaining inventory
  const totalQty = parseInt(String(raw.Quantity ?? 0), 10);
  const soldQty  = parseInt(String(raw.QuantitySold ?? 0), 10);
  const inventory = Math.max(0, totalQty - soldQty);

  // Description — HTML stripped to plain text
  const rawDesc   = String(raw.Description ?? "");
  const description = rawDesc ? stripHtml(rawDesc) : null;

  // Images — always an array thanks to XMLParser isArray config
  const pics: string[] = raw.PictureDetails?.PictureURL ?? [];
  const images = pics.filter(Boolean);

  // eBay primary category
  const ebayCategoryId = String(raw.PrimaryCategory?.CategoryID ?? "").trim();

  // Brand from ItemSpecifics
  const nameValueList: { Name: string; Value: string }[] =
    raw.ItemSpecifics?.NameValueList ?? [];
  const brandEntry = nameValueList.find(
    (nv) => String(nv.Name).toLowerCase() === "brand"
  );
  const brand = brandEntry?.Value ? String(brandEntry.Value).trim() : null;

  // Weight: WeightMajor = lbs, WeightMinor = oz
  const weightLbs = parseFloat(String(raw.ShippingPackageDetails?.WeightMajor ?? 0));
  const weightOzPart = parseFloat(String(raw.ShippingPackageDetails?.WeightMinor ?? 0));
  const weightOz  = Math.round(weightLbs * 16 + weightOzPart);

  // Dimensions in inches
  const lengthIn = parseFloat(String(raw.ShippingPackageDetails?.PackageLength ?? 0)) || 0;
  const widthIn  = parseFloat(String(raw.ShippingPackageDetails?.PackageWidth  ?? 0)) || 0;
  const heightIn = parseFloat(String(raw.ShippingPackageDetails?.PackageDepth  ?? 0)) || 0;

  return {
    listingId, title, price, inventory, description, images,
    ebayCategoryId, brand, weightOz, lengthIn, widthIn, heightIn,
  };
}

async function fetchPage(
  config: EbayConfig,
  page: number,
  endTimeFrom: string,
  endTimeTo: string,
): Promise<{ items: TradingItem[]; hasMore: boolean }> {
  const body = `<?xml version="1.0" encoding="utf-8"?>
<GetSellerListRequest xmlns="urn:ebay:apis:eBLBaseComponents">
  <RequesterCredentials>
    <eBayAuthToken>${config.access_token}</eBayAuthToken>
  </RequesterCredentials>
  <ErrorLanguage>en_US</ErrorLanguage>
  <WarningLevel>High</WarningLevel>
  <DetailLevel>ReturnAll</DetailLevel>
  <IncludeSelector>ItemSpecifics</IncludeSelector>
  <EndTimeFrom>${endTimeFrom}</EndTimeFrom>
  <EndTimeTo>${endTimeTo}</EndTimeTo>
  <ListingType>FixedPriceItem</ListingType>
  <Pagination>
    <EntriesPerPage>200</EntriesPerPage>
    <PageNumber>${page}</PageNumber>
  </Pagination>
</GetSellerListRequest>`;

  const res = await fetch(TRADING_URL, {
    method: "POST",
    headers: {
      "X-EBAY-API-SITEID":              "0",
      "X-EBAY-API-COMPATIBILITY-LEVEL": COMPATIBILITY_LEVEL,
      "X-EBAY-API-CALL-NAME":           "GetSellerList",
      "X-EBAY-API-APP-NAME":            config.app_id,
      "Content-Type":                   "text/xml",
    },
    body,
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) throw new Error(`Trading API HTTP ${res.status}`);

  const xml = await res.text();

  const parser = new XMLParser({
    isArray: (name) => ["Item", "PictureURL", "NameValueList"].includes(name),
    ignoreAttributes:     false,
    attributeNamePrefix:  "_",
    parseTagValue:        true,
    parseAttributeValue:  true,
  });

  const doc      = parser.parse(xml);
  const response = doc.GetSellerListResponse;

  if (!response) throw new Error("Unexpected Trading API response structure");

  const ack = String(response.Ack ?? "");
  if (ack === "Failure") {
    const errs = Array.isArray(response.Errors) ? response.Errors : [response.Errors];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error(errs.map((e: any) => e?.LongMessage ?? e?.ShortMessage).join("; "));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawItems: any[] = response.ItemArray?.Item ?? [];
  const items = rawItems.map(parseItem).filter((x): x is TradingItem => x !== null);

  const hasMore =
    response.HasMoreItems === true ||
    String(response.HasMoreItems).toLowerCase() === "true";

  return { items, hasMore };
}

/** Fetches every active Fixed Price listing via the Trading API (paginated). */
export async function fetchAllActiveListings(config: EbayConfig): Promise<TradingItem[]> {
  if (!config.access_token) throw new Error("No eBay access token — connect your account first");

  const now         = new Date();
  const endTimeFrom = now.toISOString();
  const endTimeTo   = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString();

  const all: TradingItem[] = [];
  let page = 1;

  while (true) {
    const { items, hasMore } = await fetchPage(config, page, endTimeFrom, endTimeTo);
    all.push(...items);
    if (!hasMore || page >= 50) break; // 50 × 200 = 10,000 items safety cap
    page++;
  }

  return all;
}
