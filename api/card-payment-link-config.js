const cryptoAccess = require('../lib/crypto-checkout-access');
const { cardLinkCapabilities } = require('../lib/hosted-card-link');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).setHeader('Allow', 'GET');
    return res.end(JSON.stringify({ error: 'Method not allowed.' }));
  }
  res.status(200);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  const cryptoAvailable = await cryptoAccess.ready();
  return res.end(JSON.stringify({ ...cardLinkCapabilities(), cryptoAvailable, researchConsentVersion: cryptoAccess.POLICY_VERSION }));
};
