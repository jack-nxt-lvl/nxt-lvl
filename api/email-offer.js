const {applyCors, json, normalizeOrder} = require('../lib/direct-payment');
const {signup, priceForEmail, OfferError, limit, requestIp} = require('../lib/email-offer');
module.exports = async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if (!applyCors(req,res)) return json(res,403,{error:'Origin not allowed.'});
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res,405,{error:'Method not allowed.'});
  const body = req.body || {};
  try {
    if (JSON.stringify(body).length > 16000) throw new OfferError('Request too large.',413);
    if (body.action === 'signup') {
      await signup(req,body);
      return json(res,200,{message:'We sent your personal code. Check your spam folder if you don’t see it, then enter the code with this email address at checkout.'});
    }
    if (body.action !== 'apply' || !body.code) throw new OfferError('Enter the code from your email.');
    await limit('apply:'+requestIp(req),80,3600);
    let order;
    try { order = normalizeOrder(body.items,body.fulfillment); }
    catch (_) { throw new OfferError('Refresh your cart and try again.'); }
    const priced = await priceForEmail(order,body.email,body.code);
    return json(res,200,{discountCents:priced.discountCents,discountedSubtotalCents:priced.discountedSubtotalCents,shippingCents:priced.shippingCents,totalCents:priced.totalCents});
  } catch (err) {
    if (err instanceof OfferError) return json(res,err.httpStatus,{error:err.message});
    console.error('Email offer unavailable',{name:err.name});
    return json(res,503,{error:'The email offer is temporarily unavailable. Please try again.'});
  }
};
