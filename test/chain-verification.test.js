const test = require('node:test');
const assert = require('node:assert/strict');

const { findOnChainPayment, verifyOnChain } = require('../lib/chain-verification');

test('retries a temporary Ethereum provider response before failing closed', async () => {
  const originalFetch = global.fetch;
  const calls = [];
  const txid = `0x${'0'.repeat(64)}`;

  global.fetch = async (url, options = {}) => {
    const target = String(url);
    const request = JSON.parse(options.body);
    calls.push({ target, method: request.method, params: request.params });

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

test('fails over to a second Ethereum log provider for USDT discovery', async () => {
  const originalFetch = global.fetch;
  const originalLogsRpc = process.env.ETHEREUM_LOGS_RPC_URL;
  const originalBackupRpc = process.env.ETHEREUM_BACKUP_RPC_URL;
  process.env.ETHEREUM_LOGS_RPC_URL = 'https://logs-primary.example.test';
  process.env.ETHEREUM_BACKUP_RPC_URL = 'https://logs-backup.example.test';
  const calls = [];

  global.fetch = async (url, options = {}) => {
    const target = String(url);
    const request = JSON.parse(options.body);
    calls.push({ target, method: request.method, params: request.params });
    if (target === process.env.ETHEREUM_LOGS_RPC_URL) {
      return { ok: false, status: 403, json: async () => ({ error: { message: 'Archive access denied' } }) };
    }

    let result = null;
    if (request.method === 'eth_chainId') result = '0x1';
    if (request.method === 'eth_getBlockByNumber') {
      result = { number: '0x100', hash: `0x${'a'.repeat(64)}` };
    }
    if (request.method === 'eth_getLogs') result = [];
    return { ok: true, status: 200, json: async () => ({ jsonrpc: '2.0', id: request.id, result }) };
  };

  try {
    const result = await findOnChainPayment({
      asset: 'USDT', amountUnits: '65000123', createdAt: Date.now(),
    });
    assert.equal(result.found, false);
    assert.equal(result.status, 'not_found');
    assert.ok(calls.some((call) => call.target === process.env.ETHEREUM_LOGS_RPC_URL));
    assert.ok(calls.some((call) => call.target === process.env.ETHEREUM_BACKUP_RPC_URL && call.method === 'eth_getLogs'));
    assert.ok(calls.some((call) => call.target === process.env.ETHEREUM_BACKUP_RPC_URL
      && call.method === 'eth_getBlockByNumber' && call.params[0] === 'latest'));
    assert.equal(calls.some((call) => call.target === process.env.ETHEREUM_BACKUP_RPC_URL
      && call.method === 'eth_getBlockByNumber' && call.params[0] === 'finalized'), false);
  } finally {
    global.fetch = originalFetch;
    if (originalLogsRpc === undefined) delete process.env.ETHEREUM_LOGS_RPC_URL;
    else process.env.ETHEREUM_LOGS_RPC_URL = originalLogsRpc;
    if (originalBackupRpc === undefined) delete process.env.ETHEREUM_BACKUP_RPC_URL;
    else process.env.ETHEREUM_BACKUP_RPC_URL = originalBackupRpc;
  }
});
