const {applyCors,json} = require('../lib/direct-payment');
const ach = require('../lib/plaid-ach');

async function readRaw(req) {
  if (Buffer.isBuffer(req.body) || typeof req.body === 'string') {
    const b=Buffer.from(req.body);
    if (b.length > 32768) throw ach.fail('Request too large.',413);
    return b;
  }
  const chunks=[];
  let size=0;
  for await (const data of req) {
    const chunk=Buffer.from(data);
    size += chunk.length;
    if (size>32768) throw ach.fail('Request too large.',413);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async function handler(req,res) {
  if (req.method === 'OPTIONS' && applyCors(req,res)) return res.status(204).end();
  if (req.method !== 'POST') return json(res,405,{error:'Use POST.'});
  try {
    const signed = req.headers['plaid-verification'];
    if (!signed && !applyCors(req,res)) return json(res,403,{error:'Origin not allowed.'});
    const raw = await readRaw(req);
    if (signed) {
      if (!ach.configured()) return json(res,503,{error:'Bank payments are not configured.'});
      await ach.verifyWebhook(raw,signed);
    }
    let body;
    try { body=JSON.parse(raw); } catch { return json(res,400,{error:'Invalid JSON.'}); }
    if (signed) {
      if (body.webhook_type==='TRANSFER' && body.webhook_code==='TRANSFER_EVENTS_UPDATE') await ach.syncEvents();
      return json(res,200,{received:true});
    }
    if (body.action === 'start') return json(res,200,await ach.checkout(body));
    if (body.action === 'status' && ach.configured()) return json(res,200,await ach.receiptStatus(body));
    return json(res,400,{error:'Bank payment status is unavailable.'});
  } catch (e) {
    const code=e.httpStatus || 503;
    return json(res,code,{error:code<500 ? e.message : 'Bank payment service is temporarily unavailable. Keep your order number and check again before retrying.'});
  }
};
module.exports.config = {api:{bodyParser:false}};
