module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, payCurrency, orderId, customer, items } = req.body;

    if (!amount || !payCurrency || !orderId || !customer || !customer.email) {
      return res.status(400).json({
        error: "amount, payCurrency, orderId, and customer email are required",
      });
    }

    const compactOrder = {
      e: String(customer.email || "").slice(0, 160),
      n: String(customer.name || "").slice(0, 120),
      p: String(customer.phone || "").slice(0, 60),
      a: String(customer.address || "").slice(0, 180),
      u: String(customer.unit || "").slice(0, 80),
      c: String(customer.city || "").slice(0, 100),
      s: String(customer.state || "").slice(0, 60),
      z: String(customer.zip || "").slice(0, 30),
      i: Array.isArray(items)
        ? items.slice(0, 25).map((item) => ({
            n: String(item.name || "").slice(0, 120),
            l: String(item.label || "").slice(0, 100),
            q: Number(item.qty || 0),
            p: Number(item.price || 0),
          }))
        : [],
      t: Number(amount),
    };

    const orderPayload = Buffer.from(JSON.stringify(compactOrder), "utf8").toString("base64url");
    const orderDescription = `NXT1:${orderPayload}`;

    const response = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: Number(amount),
        price_currency: "usd",
        pay_currency: String(payCurrency).toLowerCase(),
        order_id: String(orderId),
        order_description: orderDescription,
        ipn_callback_url: "https://www.nxtlvl-research.com/api/nowpayments-webhook",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("NOWPayments create payment error:", error);
    return res.status(500).json({ error: "Unable to create payment" });
  }
};
