const { escapeHtml, sendEmail } = require('../lib/email');
const { applyCors, cleanCustomer, json, normalizeOrder } = require('../lib/direct-payment');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
    return res.status(204).end();
  }
  if (req.method !== "POST") {
    return json(res, 405, { error: 'Method not allowed.' });
  }
  if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });

  try {
    const order = normalizeOrder(req.body && req.body.items, req.body && req.body.fulfillment);
    const customer = cleanCustomer(req.body && req.body.customer, order.mode);
    const itemRows = order.normalizedItems.map((item) => {
      return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(item.name)}<br><small>${escapeHtml(item.label)}</small></td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${(item.lineCents / 100).toFixed(2)}</td></tr>`;
    }).join("");

    const mode = order.mode;
    const delivery = mode === "pickup"
      ? "LOCAL PICKUP"
      : `${escapeHtml(customer.address)}${customer.unit ? `, ${escapeHtml(customer.unit)}` : ""}<br>${escapeHtml(customer.city)}, ${escapeHtml(customer.state)} ${escapeHtml(customer.zip)}`;
    const total = (order.totalCents / 100).toFixed(2);
    const shippingAmount = (order.shippingCents / 100).toFixed(2);

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:680px;margin:auto;color:#111;">
        <h2>Checkout started — payment not yet completed</h2>
        <p>A customer submitted their checkout information but payment has not yet been confirmed.</p>
        <p><strong>Fulfillment:</strong> ${mode === "pickup" ? "Local Pickup" : "Shipping"}<br>
        <strong>Shipping fee:</strong> $${shippingAmount}<br>
        <strong>Cart total:</strong> $${total}</p>
        <h3>Customer</h3>
        <p>${escapeHtml(customer.name)}<br>${escapeHtml(customer.email)}<br>${escapeHtml(customer.phone)}</p>
        <h3>${mode === "pickup" ? "Pickup" : "Shipping address"}</h3>
        <p>${delivery}</p>
        <h3>Products in cart</h3>
        <table style="width:100%;border-collapse:collapse;"><thead><tr><th style="text-align:left;padding:8px;border-bottom:2px solid #111;">Product</th><th style="padding:8px;border-bottom:2px solid #111;">Qty</th><th style="text-align:right;padding:8px;border-bottom:2px solid #111;">Total</th></tr></thead><tbody>${itemRows}</tbody></table>
        <p style="margin-top:18px;color:#666;font-size:12px;">This is a checkout lead notification. Do not fulfill the order until a separate blockchain-verified PAYMENT CONFIRMED email arrives.</p>
      </div>`;

    await sendEmail({
      to: "payment@nxtlvl-research.com",
      subject: `CHECKOUT LEAD — ${customer.name} — $${total} — ${mode === "pickup" ? "PICKUP" : "SHIP"}`,
      html,
    });

    return json(res, 200, { sent: true });
  } catch (error) {
    console.error("Checkout lead email error:", error);
    return json(res, 500, { error: "Unable to send checkout lead email" });
  }
};
