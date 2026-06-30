export interface ShippingProtectionSettings {
  insurance_min_subtotal?: number | null;
  signature_min_subtotal?: number | null;
}

export interface ShippingProtection {
  insuranceRequired: boolean;
  signatureRequired: boolean;
}

/** A threshold of 0 means the protection is disabled. */
export function resolveShippingProtection(
  subtotal: number,
  settings: ShippingProtectionSettings | null,
): ShippingProtection {
  const insuranceMin = Number(settings?.insurance_min_subtotal ?? 0);
  const signatureMin = Number(settings?.signature_min_subtotal ?? 0);
  return {
    insuranceRequired: insuranceMin > 0 && subtotal >= insuranceMin,
    signatureRequired: signatureMin > 0 && subtotal >= signatureMin,
  };
}
