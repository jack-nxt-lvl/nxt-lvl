const crypto = require("crypto");

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
      if (Array.isArray(obj)) {
        return obj.map(sortObject);
      }

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

    const sortedBody = sortObject(req.body);

    const expectedSignature = crypto
      .createHmac("sha512", ipnSecret)
      .update(JSON.stringify(sortedBody))
      .digest("hex");

    const valid =
      signature.length === expectedSignature.length &&
      crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      );

    if (!valid) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const payment = req.body;

    console.log("NOWPayments IPN:", {
      payment_id: payment.payment_id,
      payment_status: payment.payment_status,
      order_id: payment.order_id,
    });

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("NOWPayments webhook error:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
};
