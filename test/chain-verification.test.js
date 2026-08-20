const test = require('node:test');
const assert = require('node:assert/strict');

const { verifyOnChain } = require('../lib/chain-verification');

test('retries a temporary Ethereum provider response before failing closed', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  const txid = `0x${'0'.repeat(64)}`;

  global.fetch = async (url, options = {}) => {
    const target = String(url);
    const request = JSON.parse(options.body);
    calls.push({ target, method: request.method });

    const firstPublicNodeChainCheck = target.includes('publicnode.com')
      && request.method === 'eth_chainId'
      && calls.filter((call) => call.target.includes('publicnode.com') && call.method === 'eth_chainId').length === 1;
    if (firstPublicNodeChainCheck) {
      return { ok: false, status: 408, json: async () => ({}) };
    }

    let result = null;
    if (request.method === 'eth_chainId') result = '0x1';
    if (request.method === 'eth_getBlockByNumber') {
      result = { number: '0x100', hash: `0x${'a'.repeat(64)}` };
    }
    return { ok: true, status: 200, json: async () => ({ jsonrpc: '2.0', id: request.id, result }) };
  };

  try {
    const result = await verifyOnChain(txid, { asset: 'ETH' });
    assert.equal(result.ok, false);
    assert.equal(result.status, 'not_found');
    assert.equal(calls.filter((call) => call.target.includes('publicnode.com') && call.method === 'eth_chainId').length, 2);
  } finally {
    global.fetch = originalFetch;
  }
});
