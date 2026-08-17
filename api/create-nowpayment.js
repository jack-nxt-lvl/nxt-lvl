module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, payCurrency, orderId, description } = req.body;

    if (!amount || !payCurrency || !orderId) {
      return res.status(400).json({
        error: "amount, payCurrency, and orderId are required",
      });
    }

    const response = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: Number(amount),
        price_currency: "usd",
        pay_currency: payCurrency.toLowerCase(),
        order_id: String(orderId),
        order_description: description || `Order ${orderId}`,
        ipn_callback_url:
          "https://www.nxtlvl-research.com/api/nowpayments-webhook",
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
