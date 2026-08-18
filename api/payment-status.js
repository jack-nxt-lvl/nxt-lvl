module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const paymentId = String(req.query.payment_id || '').trim();
  if (!paymentId || !/^\d+$/.test(paymentId)) {
    return res.status(400).json({ error: 'Valid payment_id is required' });
  }

  try {
    const response = await fetch(`https://api.nowpayments.io/v1/payment/${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({
      payment_id: data.payment_id,
      payment_status: data.payment_status,
      pay_address: data.pay_address,
      pay_amount: data.pay_amount,
      pay_currency: data.pay_currency,
      price_amount: data.price_amount,
      price_currency: data.price_currency,
      actually_paid: data.actually_paid,
      outcome_amount: data.outcome_amount,
      outcome_currency: data.outcome_currency,
      updated_at: data.updated_at,
      created_at: data.created_at
    });
  } catch (error) {
    console.error('NOWPayments status error:', error);
    return res.status(500).json({ error: 'Unable to check payment status' });
  }
};
