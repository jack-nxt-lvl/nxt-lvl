const crypto = require("crypto");

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function decodeOrder(description) {
  if (typeof description !== "string" || !description.startsWith("NXT1:")) return null;
  try {
    return JSON.parse(Buffer.from(description.slice(5), "base64url").toString("utf8"));
  } catch (error) {
    console.error("Unable to decode order details:", error);
    return null;
  }
}

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

  const from = process.env.ORDER_EMAIL_FROM || "NXT LVL Research <payment@nxtlvl-research.com>";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: Array.isArray(to) ? to : [to], subject, html }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || "Unable to send email");
  }
  return data;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (!ipnSecret) {
      return res.status(500).json({ error: "IPN secret not configured" });
    }

    const signature = req.headers["x-nowpayments-sig"];
    if (!signature) {
      return res.status(401).json({ error: "Missing signature" });
    }

    const sortObject = (obj) => {
      if (Array.isArray(obj)) return obj.map(sortObject);
      if (obj !== null && typeof obj === "object") {
        return Object.keys(obj)
          .sort()
          .reduce((result, key) => {
            result[key] = sortObject(obj[key]);
            return result;
          }, {});
      }
      return obj;
    };

    const expectedSignature = crypto
      .createHmac("sha512", ipnSecret)
      .update(JSON.stringify(sortObject(req.body)))
      .digest("hex");

    const valid =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));

    if (!valid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const payment = req.body;
    console.log("NOWPayments IPN:", {
      payment_id: payment.payment_id,
      payment_status: payment.payment_status,
      order_id: payment.order_id,
    });

    // Send receipts only after NOWPayments reports the payment as fully finished.
    if (String(payment.payment_status).toLowerCase() !== "finished") {
      return res.status(200).json({ received: true, email_sent: false });
    }

    const order = decodeOrder(payment.order_description);
    if (!order || !order.e) {
      console.error("Finished payment missing encoded customer/order details", payment.order_id);
      return res.status(200).json({ received: true, email_sent: false, reason: "missing_order_details" });
    }

    const items = Array.isArray(order.i) ? order.i : [];
    const itemRows = items.map((item) => {
      const lineTotal = Number(item.p || 0) * Number(item.q || 0);
      return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(item.n)}${item.l ? `<br><small>${escapeHtml(item.l)}</small>` : ""}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${escapeHtml(item.q)}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${lineTotal.toFixed(2)}</td></tr>`;
    }).join("");

    const shipping = `${escapeHtml(order.a)}${order.u ? `, ${escapeHtml(order.u)}` : ""}<br>${escapeHtml(order.c)}, ${escapeHtml(order.s)} ${escapeHtml(order.z)}`;
    const paidAmount = payment.actually_paid != null ? `${escapeHtml(payment.actually_paid)} ${escapeHtml(payment.pay_currency || "")}` : `${escapeHtml(payment.pay_amount || "")} ${escapeHtml(payment.pay_currency || "")}`;

    const businessHtml = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111;">
        <h2>Payment received — ${escapeHtml(payment.order_id)}</h2>
        <p><strong>Payment ID:</strong> ${escapeHtml(payment.payment_id)}</p>
        <p><strong>Crypto received:</strong> ${paidAmount}</p>
        <p><strong>Order total:</strong> $${Number(order.t || payment.price_amount || 0).toFixed(2)}</p>
        <h3>Customer</h3>
        <p>${escapeHtml(order.n)}<br>${escapeHtml(order.e)}<br>${escapeHtml(order.p)}</p>
        <h3>Shipping address</h3>
        <p>${shipping}</p>
        <h3>Products</h3>
        <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #111;">Product</th><th style="padding:8px;border-bottom:2px solid #111;">Qty</th><th style="text-align:right;padding:8px;border-bottom:2px solid #111;">Total</th></tr></thead><tbody>${itemRows}</tbody></table>
      </div>`;

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111;">
        <h2>We received your payment</h2>
        <p>Hi ${escapeHtml(order.n)},</p>
        <p>Your payment for order <strong>${escapeHtml(payment.order_id)}</strong> has been received successfully.</p>
        <p><strong>Order total:</strong> $${Number(order.t || payment.price_amount || 0).toFixed(2)}<br><strong>Crypto received:</strong> ${paidAmount}</p>
        <h3>Your order</h3>
        <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #111;">Product</th><th style="padding:8px;border-bottom:2px solid #111;">Qty</th><th style="text-align:right;padding:8px;border-bottom:2px solid #111;">Total</th></tr></thead><tbody>${itemRows}</tbody></table>
        <h3>Shipping to</h3><p>${escapeHtml(order.n)}<br>${shipping}</p>
        <p>We will process your order using the information above.</p>
      </div>`;

    await Promise.all([
      sendEmail({
        to: "payment@nxtlvl-research.com",
        subject: `PAID ORDER ${payment.order_id} — ${order.n}`,
        html: businessHtml,
      }),
      sendEmail({
        to: order.e,
        subject: `Payment received — ${payment.order_id}`,
        html: customerHtml,
      }),
    ]);

    return res.status(200).json({ received: true, email_sent: true });
  } catch (error) {
    console.error("NOWPayments webhook error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};
