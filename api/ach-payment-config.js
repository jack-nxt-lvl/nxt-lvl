const { capabilities } = require('../lib/mercury-ach');
const { json } = require('../lib/direct-payment');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed.' });
  }
  return json(res, 200, await capabilities());
};
