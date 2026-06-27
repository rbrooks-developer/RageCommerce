import { getResendClient, FROM_EMAIL } from "@/lib/resend/client";

interface SendOfferCounteredOptions {
  to: string;
  productName: string;
  originalPrice: number;
  counterPrice: number;
  displayName: string;
  appUrl: string;
}

export async function sendOfferCountered(opts: SendOfferCounteredOptions) {
  const fromField = `${opts.displayName} <${FROM_EMAIL}>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#111827;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:20px">${opts.displayName}</h1>
    </div>
    <div style="padding:32px 24px">
      <h2 style="margin:0 0 8px;font-size:18px;color:#111827">Counter Offer Received</h2>
      <p style="color:#6b7280;margin:0 0 24px;font-size:14px">We've reviewed your offer on <strong>${opts.productName}</strong>.</p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px">
        <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:14px">
          <span style="color:#6b7280">Your offer</span>
          <span style="text-decoration:line-through;color:#9ca3af">$${opts.originalPrice.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:600">
          <span style="color:#111827">Counter offer</span>
          <span style="color:#111827">$${opts.counterPrice.toFixed(2)}</span>
        </div>
      </div>

      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">
        You can accept this counter offer, decline it, or send back your own counter price — all from your My Offers page.
      </p>

      <div style="text-align:center">
        <a href="${opts.appUrl}/account#offers"
           style="display:inline-block;background:#111827;color:#fff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600">
          View My Offers
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

  return getResendClient().emails.send({
    from: fromField,
    to: opts.to,
    subject: `Counter offer on ${opts.productName} – ${opts.displayName}`,
    html,
  });
}
