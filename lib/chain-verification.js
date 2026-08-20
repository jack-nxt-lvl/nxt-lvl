const { ASSETS } = require('./direct-payment');

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Blockchain service returned HTTP ${response.status}.`);
    error.status = response.status;
    throw error;
  }
  return data;
}

function compareAmount(received, expected) {
  const actual = BigInt(received);
  const required = BigInt(expected);
  if (actual < required) return { ok: false, status: 'underpaid', receivedUnits: actual.toString() };
  if (actual > required) return { ok: false, status: 'overpaid', receivedUnits: actual.toString() };
  return { ok: true, status: 'amount_confirmed', receivedUnits: actual.toString() };
}

function inspectBitcoinTransaction(tx, tipHeight, quote) {
  const address = ASSETS.BTC.address;
  const received = (tx.vout || []).reduce((sum, output) => {
    return output.scriptpubkey_address === address ? sum + BigInt(output.value || 0) : sum;
  }, 0n);
  const amount = compareAmount(received, quote.amountUnits);
  if (!amount.ok) return { ...amount, confirmations: 0 };

  const confirmed = Boolean(tx.status && tx.status.confirmed);
  const confirmations = confirmed && Number.isFinite(Number(tipHeight)) && tx.status.block_height
    ? Math.max(1, Number(tipHeight) - Number(tx.status.block_height) + 1)
    : 0;
  if (confirmed && tx.status.block_time && Number(tx.status.block_time) * 1000 < Number(quote.createdAt) - 10 * 60 * 1000) {
    return { ok: false, status: 'transaction_before_quote', confirmations };
  }
  return {
    ok: confirmations >= Number(quote.confirmations),
    status: confirmations >= Number(quote.confirmations) ? 'paid' : 'confirming',
    confirmations,
    requiredConfirmations: Number(quote.confirmations),
    receivedUnits: received.toString(),
  };
}

function inspectEthereumTransaction(tx, receipt, block, currentBlockHex, quote) {
  if (!tx || !receipt) return { ok: false, status: 'not_found', confirmations: 0 };
  if (String(receipt.status).toLowerCase() !== '0x1') return { ok: false, status: 'failed', confirmations: 0 };

  let received = 0n;
  if (quote.asset === 'ETH') {
    if (String(tx.to || '').toLowerCase() !== ASSETS.ETH.address.toLowerCase()) {
      return { ok: false, status: 'wrong_address', confirmations: 0 };
    }
    received = BigInt(tx.value || '0x0');
  } else {
    const targetTopic = `0x${ASSETS.USDT.address.toLowerCase().slice(2).padStart(64, '0')}`;
    for (const log of receipt.logs || []) {
      const topics = (log.topics || []).map((topic) => String(topic).toLowerCase());
      if (String(log.address || '').toLowerCase() !== ASSETS.USDT.contract.toLowerCase()) continue;
      if (topics[0] !== TRANSFER_TOPIC || topics[2] !== targetTopic) continue;
      received += BigInt(log.data || '0x0');
    }
  }

  const amount = compareAmount(received, quote.amountUnits);
  if (!amount.ok) return { ...amount, confirmations: 0 };

  const receiptBlock = Number(BigInt(receipt.blockNumber || '0x0'));
  const currentBlock = Number(BigInt(currentBlockHex || '0x0'));
  const confirmations = receiptBlock && currentBlock >= receiptBlock ? currentBlock - receiptBlock + 1 : 0;
  if (block && block.timestamp && Number(BigInt(block.timestamp)) * 1000 < Number(quote.createdAt) - 10 * 60 * 1000) {
    return { ok: false, status: 'transaction_before_quote', confirmations };
  }
  return {
    ok: confirmations >= Number(quote.confirmations),
    status: confirmations >= Number(quote.confirmations) ? 'paid' : 'confirming',
    confirmations,
    requiredConfirmations: Number(quote.confirmations),
    receivedUnits: received.toString(),
  };
}

async function verifyBitcoin(txid, quote) {
  let tx;
  try { tx = await fetchJson(`https://mempool.space/api/tx/${txid}`); }
  catch (error) {
    if (error.status === 404) return { ok: false, status: 'not_found', confirmations: 0 };
    throw error;
  }
  let tipHeight = 0;
  if (tx.status && tx.status.confirmed) {
    const response = await fetch('https://mempool.space/api/blocks/tip/height');
    if (!response.ok) throw new Error('Unable to read the current Bitcoin block height.');
    tipHeight = Number(await response.text());
  }
  return inspectBitcoinTransaction(tx, tipHeight, quote);
}

async function rpc(method, params) {
  const url = process.env.ETHEREUM_RPC_URL || 'https://ethereum-rpc.publicnode.com';
  const response = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (response.error) throw new Error(response.error.message || 'Ethereum RPC request failed.');
  return response.result;
}

async function verifyEthereum(txid, quote) {
  const chainId = await rpc('eth_chainId', []);
  if (String(chainId).toLowerCase() !== '0x1') throw new Error('The configured Ethereum RPC is not on Ethereum Mainnet.');
  const [tx, receipt, currentBlock] = await Promise.all([
    rpc('eth_getTransactionByHash', [txid]),
    rpc('eth_getTransactionReceipt', [txid]),
    rpc('eth_blockNumber', []),
  ]);
  if (!tx || !receipt) return { ok: false, status: 'not_found', confirmations: 0 };
  const block = await rpc('eth_getBlockByNumber', [receipt.blockNumber, false]);
  return inspectEthereumTransaction(tx, receipt, block, currentBlock, quote);
}

async function verifyOnChain(txid, quote) {
  return quote.asset === 'BTC' ? verifyBitcoin(txid, quote) : verifyEthereum(txid, quote);
}

module.exports = {
  TRANSFER_TOPIC,
  compareAmount,
  inspectBitcoinTransaction,
  inspectEthereumTransaction,
  verifyOnChain,
};
