// Private operator tool. Excluded from deployment. Never run approval without independent evidence.
const fs = require('node:fs');
const crypto = require('node:crypto');
const { redisCommand } = require('../lib/payment-ledger');
const { PREFIX, POLICY_VERSION, RECORD_TTL, hash, key, readApplication } = require('../lib/research-access');
const { cleanCustomer, customerDigest, normalizeOrder, randomOrderId } = require('../lib/direct-payment');

async function main() {
  const [action, reference, evidenceFile, outputFile] = process.argv.slice(2);
  if (!['inspect', 'approve', 'reject', 'revoke'].includes(action) || !reference) throw new Error('Usage: research-review.cjs inspect|approve|reject|revoke RR-reference [private-evidence.json] [private-code.txt]');
  const record = await readApplication(reference);
  if (!record) throw new Error('Request not found or retention period expired.');
  if (action === 'inspect') { process.stdout.write(JSON.stringify(record, null, 2) + '\n'); return; }
  if (action !== 'approve') {
    record.status = action === 'reject' ? 'rejected' : 'revoked';
    record.updatedAt = Date.now();
    await redisCommand(['SET', key(reference), JSON.stringify(record), 'EX', String(RECORD_TTL)]);
    console.log('Request ' + record.status + '.'); return;
  }
  if (process.env.RESEARCH_COMMERCE_ENABLED !== 'true') throw new Error('Complete business policies and operational review before enabling payments.');
  if (record.status !== 'pending') throw new Error('Only a pending request can be approved. Use a new request for changed details.');
  if (!evidenceFile || !outputFile) throw new Error('Provide an evidence file and a NEW private output path for the approval code.');
  const evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));
  for (const field of ['reviewer', 'organizationEvidence', 'purchaserAuthorization', 'intendedUseEvidence', 'addressVerification', 'productEligibility', 'batchDocumentation', 'fulfillmentTerms', 'refundTerms', 'taxReview']) {
    if (typeof evidence[field] !== 'string' || evidence[field].trim().length < 15) throw new Error('Document independent review: ' + field);
  }
  const order = normalizeOrder(record.items, record.fulfillment);
  const customer = cleanCustomer(record.customer, 'shipping');
  if (order.itemDigest !== record.itemDigest || order.totalCents !== record.totalCents || customerDigest(customer) !== record.customerDigest) throw new Error('Request changed; obtain a new request.');
  const code = crypto.randomBytes(32).toString('hex');
  // Reserve a private local file before persisting. No code is logged or emailed automatically.
  const fd = fs.openSync(outputFile, 'wx', 0o600);
  try {
    record.status = 'approved'; record.review = evidence; record.approvedAt = Date.now();
    record.expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    record.policyVersion = POLICY_VERSION; record.orderId = randomOrderId();
    await redisCommand(['SET', key(reference), JSON.stringify(record), 'EX', String(RECORD_TTL)]);
    await redisCommand(['SET', PREFIX + 'code:' + hash(code), reference, 'EX', String(7 * 24 * 60 * 60)]);
    fs.writeFileSync(fd, `Request: ${reference}\nApproval code: ${code}\nExpires: ${new Date(record.expiresAt).toISOString()}\nBound to the exact reviewed buyer, address, materials, quantities and fulfillment. Send only to the independently verified purchaser.\n`);
  } finally { fs.closeSync(fd); }
  console.log('Approval recorded. Private code saved to the specified file.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
