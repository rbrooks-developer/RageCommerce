import { getResendClient, FROM_EMAIL } from "@/lib/resend/client";

interface Options {
  to: string;
  productName: string;
  quantity: number;
  offerPrice: number;
  reason: string | null;
  displayName: string;
}

export async function sendOfferDeclined(opts: Options) {
  const fromField = `${opts.displayName} <${FROM_EMAIL}>`;

  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#111827;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:20px">${opts.displayName}</h1>
    </div>
    <div style="padding:32px 24px">
      <h2 style="margin:0 0 8px;font-size:18px;color:#111827">Offer Declined</h2>
      <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Unfortunately your offer on <strong style="color:#111827">${opts.productName}</strong> (${opts.quantity} × $${opts.offerPrice.toFixed(2)}) was not accepted.</p>
      ${opts.reason ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:14px 16px;margin-bottom:20px">
        <p style="margin:0;font-size:13px;color:#b91c1c;font-weight:500">Reason:</p>
        <p style="margin:6px 0 0;font-size:14px;color:#7f1d1d">${opts.reason}</p>
      </div>` : ""}
      <p style="margin:0;font-size:13px;color:#9ca3af;text-align:center">You're welcome to browse our other products or submit a new offer.</p>
    </div>
  </div>
</body></html>`;

  return getResendClient().emails.send({ from: fromField, to: opts.to, subject: `Offer Update – ${opts.productName}`, html });
}
