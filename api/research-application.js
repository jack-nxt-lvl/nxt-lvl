const { applyCors, cleanCustomer, json, normalizeOrder } = require('../lib/direct-payment');
const { createApplication } = require('../lib/research-access');
const { sendEmail, escapeHtml } = require('../lib/email');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
    return res.status(204).end();
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed.' });
  if (!applyCors(req, res)) return json(res, 403, { error: 'Origin not allowed.' });
  try {
    const body = req.body || {};
    if (JSON.stringify(body).length > 16000) return json(res, 413, { error: 'Request too large.' });
    const order = normalizeOrder(body.items, body.fulfillment);
    const customer = cleanCustomer(body.customer, 'shipping'); // organization address required for pickup, too
    const record = await createApplication({ req, body, order, customer });
    let notified = false;
    try {
      const rows = Object.entries({ Reference: record.reference, Organization: record.research.organization, Website: record.research.website, Role: record.research.role, Purpose: record.research.purpose, Name: customer.name, Email: customer.email, Phone: customer.phone, Address: `${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}` });
      await sendEmail({
        to: process.env.ORDER_NOTIFICATION_EMAIL || 'payment@nxtlvl-research.com',
        subject: `RESEARCH REVIEW REQUIRED — ${record.reference}`,
        html: `<h2>Pending research request — no payment or approval</h2><p>Applicant statements are unverified. Independently verify the organization, authorized purchaser, intended research, delivery arrangements, product eligibility and batch documents before approval. Never approve based only on a checkbox or email domain.</p>${rows.map(([k,v]) => `<p><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</p>`).join('')}<p>Use the private review workflow to inspect the full requested items. No payment link has been issued.</p>`,
        idempotencyKey: 'research-' + record.reference,
      });
      notified = true;
    } catch (_) { console.error('Research review notification unavailable; pending record retained.'); }
    return json(res, 202, { reference: record.reference, status: 'pending', notified, message: notified ? 'Your research request was saved for manual review. This is not approval or an order. No payment was taken.' : 'Your request was saved, but the support notification could not be delivered. Call 754-290-7210 and quote this reference. No payment was taken.' });
  } catch (error) {
    // Do not expose applicant data, ledger details, or environment configuration.
    return json(res, error.httpStatus || 400, { error: error.httpStatus === 503 ? 'Research requests are temporarily unavailable. Please call 754-290-7210. No payment was taken.' : error.message || 'Unable to save the research request.' });
  }
};
