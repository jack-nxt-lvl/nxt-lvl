function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || "Unable to send email");
  return data;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { customer, items, amount, fulfillment, shipping } = req.body || {};
    if (!customer || !customer.email || !customer.name) {
      return res.status(400).json({ error: "Customer name and email are required" });
    }

    const orderItems = Array.isArray(items) ? items : [];
    const itemRows = orderItems.map((item) => {
      const qty = Number(item.qty || 0);
      const price = Number(item.price || 0);
      const lineTotal = qty * price;
      return `<tr><td style="padding:8px;border-bottom:1px solid #ddd;">${escapeHtml(item.name)}${item.label ? `<br><small>${escapeHtml(item.label)}</small>` : ""}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:center;">${qty}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">$${lineTotal.toFixed(2)}</td></tr>`;
    }).join("");

    const mode = String(fulfillment || customer.fulfillment || "shipping").toLowerCase() === "pickup" ? "pickup" : "shipping";
    const delivery = mode === "pickup"
      ? "LOCAL PICKUP"
      : `${escapeHtml(customer.address)}${customer.unit ? `, ${escapeHtml(customer.unit)}` : ""}<br>${escapeHtml(customer.city)}, ${escapeHtml(customer.state)} ${escapeHtml(customer.zip)}`;
    const total = Number(amount || 0).toFixed(2);
    const shippingAmount = Number(shipping || 0).toFixed(2);

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
        <p style="margin-top:18px;color:#666;font-size:12px;">This is a checkout lead notification. Payment is completed separately through Transak.</p>
      </div>`;

    await sendEmail({
      to: "payment@nxtlvl-research.com",
      subject: `CHECKOUT LEAD — ${customer.name} — $${total} — ${mode === "pickup" ? "PICKUP" : "SHIP"}`,
      html,
    });

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error("Checkout lead email error:", error);
    return res.status(500).json({ error: "Unable to send checkout lead email" });
  }
};
