import { getResendClient, FROM_EMAIL } from "@/lib/resend/client";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface SendOrderCancellationOptions {
  to: string;
  orderNumber: string;
  items: OrderItem[];
  totalPrice: number;
  refundAmount: number;
  isFullRefund: boolean;
  siteTitle: string;
  displayName?: string | null;
}

export async function sendOrderCancellation(opts: SendOrderCancellationOptions) {
  const headerName = opts.displayName ?? opts.siteTitle;
  const fromField = opts.displayName ? `${opts.displayName} <${FROM_EMAIL}>` : FROM_EMAIL;
  const heading = opts.isFullRefund ? "Order Cancelled" : "Partial Refund Issued";

  const itemRows = opts.items
    .map(
      (i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0">${i.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:center">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#111827;padding:24px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:20px">${headerName}</h1>
    </div>
    <div style="padding:32px 24px">
      <h2 style="margin:0 0 8px;font-size:18px;color:#111827">${heading}</h2>
      <p style="color:#6b7280;margin:0 0 24px;font-size:14px">Order #${opts.orderNumber}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px">
        <thead>
          <tr style="border-bottom:2px solid #e5e7eb">
            <th style="text-align:left;padding-bottom:8px;color:#6b7280;font-weight:500">Item</th>
            <th style="text-align:center;padding-bottom:8px;color:#6b7280;font-weight:500">Qty</th>
            <th style="text-align:right;padding-bottom:8px;color:#6b7280;font-weight:500">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="border-top:1px solid #e5e7eb;padding-top:16px;font-size:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px">
          <span style="color:#6b7280">Order total</span>
          <span>$${opts.totalPrice.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-weight:600;font-size:15px;margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb">
          <span>${opts.isFullRefund ? "Refunded" : "Refunded (partial)"}</span>
          <span>$${opts.refundAmount.toFixed(2)}</span>
        </div>
      </div>

      <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;text-align:center">
        Refunds typically appear on your original payment method within 5–10 business days.
      </p>
    </div>
  </div>
</body>
</html>`;

  return getResendClient().emails.send({
    from: fromField,
    to: opts.to,
    subject: opts.isFullRefund ? `Order Cancelled – #${opts.orderNumber}` : `Refund Issued – #${opts.orderNumber}`,
    html,
  });
}
