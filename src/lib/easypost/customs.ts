export type CustomsItemInput = {
  description: string;
  quantity: number;
  weightOz: number;
  unitValueUsd: number;
  originCountry: string;
};

export function buildCustomsInfo(items: CustomsItemInput[], signer: string) {
  return {
    eel_pfc: "NOEEI 30.37(a)",
    customs_signer: signer,
    certify: true,
    contents_type: "merchandise" as const,
    customs_items: items.map((item) => ({
      description: item.description.slice(0, 255),
      quantity: item.quantity,
      weight: parseFloat((item.weightOz * item.quantity).toFixed(2)),
      value: parseFloat((item.unitValueUsd * item.quantity).toFixed(2)),
      origin_country: item.originCountry,
    })),
  };
}
