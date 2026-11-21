const test = require('node:test');
const assert = require('node:assert/strict');
const { webcrypto } = require('node:crypto');
const {
  RECEIPT_KEY, ATTEMPT_KEY, safeInvoiceUrl, normalizeReceipt, createClient, attach,
} = require('../mercury-ach-checkout');

const invoice = {
  orderId: 'NXT-ACH-ABC123', totalCents: 6700, status: 'pending',
  invoiceUrl: 'https://app.mercury.com/pay/invoice-slug_123',
  receiptToken: 'receipt_token_123456789012345678901234567890',
};
const details = {
  items: [{ key: 'bpc157-10::0', productId: 'bpc157-10', pricingIndex: 0, qty: 1 }],
  fulfillment: 'shipping', customer: { name: 'Lab Buyer', email: 'buyer@example.com' },
  researchApprovalCode: 'a'.repeat(64),
  researchConsent: { attestation: true, policyVersion: '2026-10-17-final-sale' },
};
function storage() {
  const data = new Map();
  return { data, getItem: key => data.get(key), setItem: (key, value) => data.set(key, value), removeItem: key => data.delete(key) };
}
const response = data => ({ ok: true, json: async () => data });

test('ACH invoice links allow only the exact Mercury payment origin and one safe slug', () => {
  assert.equal(safeInvoiceUrl(invoice.invoiceUrl), invoice.invoiceUrl);
  for (const url of [
    'https://app.mercury.com.evil.test/pay/abc', 'https://app.mercury.com@evil.test/pay/abc',
    'http://app.mercury.com/pay/abc', 'https://app.mercury.com:8443/pay/abc',
    'https://app.mercury.com/pay/abc?redirect=https://evil.test', 'https://app.mercury.com/pay/abc#other',
    'https://app.mercury.com/pay/abc/../settings', 'https://app.mercury.com/pay/%2fsettings',
    'https://user:pass@app.mercury.com/pay/abc', 'javascript:alert(1)', '/pay/abc',
  ]) assert.throws(() => safeInvoiceUrl(url), /could not be verified/);
});

test('ACH receipts reject unrecognized status and changes to an existing order', () => {
  assert.equal(normalizeReceipt(invoice).status, 'pending');
  assert.equal(normalizeReceipt({ ...invoice, status: 'processing' }, invoice).status, 'processing');
  assert.throws(() => normalizeReceipt({ ...invoice, status: 'bank_connected' }), /could not be verified/);
  assert.throws(() => normalizeReceipt({ ...invoice, totalCents: invoice.totalCents + 1 }, invoice), /does not match/);
  assert.throws(() => normalizeReceipt({ ...invoice, orderId: 'OTHER' }, invoice), /does not match/);
  assert.throws(() => normalizeReceipt({ ...invoice, invoiceUrl: 'https://app.mercury.com/pay/other' }, invoice), /does not match/);
  assert.throws(() => normalizeReceipt({ ...invoice, totalCents: 67.1 }), /could not be verified/);
});

test('an uncertain create response reuses the same request ID after reload and never stores the approval code', async () => {
  const saved = storage();
  const requests = [];
  const first = createClient({ storage: saved, crypto: webcrypto, fetch: async (_url, options) => {
    requests.push(JSON.parse(options.body)); throw new TypeError('Network interrupted');
  } });
  await assert.rejects(first.create(details), /Network interrupted/);
  const retry = createClient({ storage: saved, crypto: webcrypto, fetch: async (_url, options) => {
    requests.push(JSON.parse(options.body)); return response(invoice);
  } });
  await retry.create(details);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].requestId, requests[1].requestId);
  assert.equal(requests[1].researchApprovalCode, details.researchApprovalCode);
  assert.ok(saved.getItem(ATTEMPT_KEY));
  assert.doesNotMatch(saved.getItem(ATTEMPT_KEY), /buyer@example|Lab Buyer/);
  for (const value of saved.data.values()) assert.ok(!value.includes(details.researchApprovalCode));
});

test('status checks send receipt tokens only in the bearer header and bind results to the existing invoice', async () => {
  const saved = storage();
  let next = { ...invoice, status: 'paid' };
  const client = createClient({ storage: saved, crypto: webcrypto, fetch: async (url, options) => {
    assert.equal(url, '/api/ach-payment-status');
    assert.ok(!url.includes(invoice.receiptToken));
    assert.equal(options.headers.Authorization, 'Bearer ' + invoice.receiptToken);
    assert.equal(options.cache, 'no-store');
    return response(next);
  } });
  assert.equal((await client.status(invoice)).status, 'paid');
  next = { ...invoice, orderId: 'OTHER', status: 'paid' };
  await assert.rejects(client.status(invoice), /does not match/);
  assert.equal(client.readReceipt().orderId, invoice.orderId);
});

// The small DOM stub exercises the payment-state transitions without a browser or real account.
function documentStub() {
  const document = { activeElement: null };
  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.attributes = {}; this.textContent = ''; this.hidden = false; this.disabled = false; }
    appendChild(child) { child.parent = this; this.children.push(child); return child; }
    append(...children) { children.forEach(child => this.appendChild(child)); }
    setAttribute(key, value) { this.attributes[key] = value; }
    addEventListener() {}
    focus() { document.activeElement = this; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
    querySelectorAll(selector) {
      const tags = selector.split(','); const found = [];
      for (const child of this.children) {
        if (tags.includes(child.tagName)) found.push(child);
        found.push(...child.querySelectorAll(selector));
      }
      return found;
    }
  }
  document.createElement = tag => new Element(tag);
  document.head = document.createElement('head'); document.body = document.createElement('body');
  return document;
}

test('restoring a cached paid receipt never shows paid or a payment link until the server verifies it', async () => {
  const saved = storage(); saved.setItem(RECEIPT_KEY, JSON.stringify({ ...invoice, status: 'paid' }));
  const document = documentStub(); let resolveStatus;
  const api = attach({ document, sessionStorage: saved, crypto: webcrypto,
    fetch: () => new Promise(resolve => { resolveStatus = resolve; }),
  });
  assert.equal(api.resume(), true);
  const heading = document.body.querySelectorAll('h2')[0];
  const pay = document.body.querySelectorAll('a')[0];
  assert.equal(heading.textContent, 'Check your saved bank payment');
  assert.equal(pay.hidden, true);
  resolveStatus(response({ ...invoice, status: 'processing' }));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(heading.textContent, 'Bank payment processing');
  assert.equal(pay.hidden, true);
  const texts = document.body.querySelectorAll('p').map(node => node.textContent).join(' ');
  assert.match(texts, /Do not pay this order again/);
  assert.doesNotMatch(texts, /confirms that this invoice is paid/);
});

test('creating an invoice leaves the cart untouched and shows pending, not payment success', async () => {
  const document = documentStub(); const saved = storage();
  const cart = [{ id: 'existing-cart-item' }];
  const api = attach({ document, sessionStorage: saved, crypto: webcrypto, cart,
    fetch: async (url) => { assert.equal(url, '/api/create-ach-payment'); return response(invoice); },
  });
  await api.start(details);
  assert.equal(document.body.querySelectorAll('h2')[0].textContent, 'Bank payment ready');
  const pay = document.body.querySelectorAll('a')[0];
  assert.equal(pay.href, invoice.invoiceUrl);
  assert.equal(pay.hidden, false);
  assert.equal(pay.rel, 'noopener noreferrer');
  assert.equal(pay.referrerPolicy, 'no-referrer');
  pay.onclick();
  assert.equal(pay.hidden, true);
  assert.equal(document.body.querySelectorAll('h2')[0].textContent, 'Bank payment ready');
  assert.match(document.body.querySelectorAll('p').map(node => node.textContent).join(' '), /then check its status here/);
  assert.deepEqual(cart, [{ id: 'existing-cart-item' }]);
});
