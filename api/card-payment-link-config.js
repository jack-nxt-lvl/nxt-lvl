const { cardLinkCapabilities } = require('../lib/hosted-card-link');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).setHeader('Allow', 'GET');
    return res.end(JSON.stringify({ error: 'Method not allowed.' }));
  }
  res.status(200);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.end(JSON.stringify(cardLinkCapabilities()));
};
