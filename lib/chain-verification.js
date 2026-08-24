const { ASSETS, requiredConfirmations } = require('./direct-payment');

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const DEFAULT_BITCOIN_APIS = ['https://mempool.space/api', 'https://blockstream.info/api'];
const DEFAULT_ETHEREUM_RPCS = [
  'https://ethereum-rpc.publicnode.com',
  'https://eth.drpc.org',
  'https://rpc.mevblocker.io',
];
const DEFAULT_ETHEREUM_LOG_RPCS = [
  'https://eth.blockscout.com/api/eth-rpc',
  ...DEFAULT_ETHEREUM_RPCS,
];
const RETRYABLE_PROVIDER_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
const PROVIDER_ATTEMPTS = 3;
const MINIMUM_ACCEPTED_PERCENT = 90n;

function providerErrorIsRetryable(error) {
  if (RETRYABLE_PROVIDER_STATUSES.has(Number(error && error.status))) return true;
  return /abort|fetch|network|socket|timeout/i.test(String(error && (error.name || error.message)));
}

async function withProviderRetry(operation) {
  let lastError;
  for (let attempt = 0; attempt < PROVIDER_ATTEMPTS; attempt += 1) {
    try { return await operation(); }
    catch (error) {
      lastError = error;
      if (!providerErrorIsRetryable(error) || attempt === PROVIDER_ATTEMPTS - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150 * (2 ** attempt)));
    }
  }
  throw lastError;
}

async function fetchJson(url, options = {}) {
  return withProviderRetry(async () => {
    const response = await fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(12_000) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(`Blockchain service returned HTTP ${response.status}.`);
      error.status = response.status;
      throw error;
    }
    return data;
  });
}

async function fetchText(url) {
  return withProviderRetry(async () => {
    const response = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!response.ok) {
      const error = new Error(`Blockchain service returned HTTP ${response.status}.`);
      error.status = response.status;
      throw error;
    }
    return response.text();
  });
}

function uniqueUrls(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).replace(/\/$/, '')))];
}

function bitcoinApiUrls() {
  return uniqueUrls([
    process.env.BITCOIN_API_URL,
    process.env.BITCOIN_BACKUP_API_URL,
    ...DEFAULT_BITCOIN_APIS,
  ]).slice(0, 2);
}

function ethereumRpcUrls() {
  return uniqueUrls([
    process.env.ETHEREUM_RPC_URL,
    process.env.ETHEREUM_BACKUP_RPC_URL,
    ...DEFAULT_ETHEREUM_RPCS,
  ]).slice(0, 5);
}

function ethereumLogRpcUrls() {
  return uniqueUrls([
    process.env.ETHEREUM_LOGS_RPC_URL,
    process.env.ETHEREUM_BACKUP_RPC_URL,
    process.env.ETHEREUM_RPC_URL,
    ...DEFAULT_ETHEREUM_LOG_RPCS,
  ]).slice(0, 6);
}

function compareAmount(received, expected) {
  const actual = BigInt(received);
  const required = BigInt(expected);
  const minimumAccepted = (required * MINIMUM_ACCEPTED_PERCENT + 99n) / 100n;
  const base = {
    receivedUnits: actual.toString(),
    expectedUnits: required.toString(),
    minimumAcceptedUnits: minimumAccepted.toString(),
    reviewRequired: false,
  };
  if (actual * 100n < required * MINIMUM_ACCEPTED_PERCENT) {
    return {
      ...base,
      ok: false,
      status: 'underpaid',
      amountPolicy: 'underpayment_manual_review',
      reviewRequired: true,
    };
  }
  if (actual < required) {
    return {
      ...base,
      ok: true,
      status: 'amount_accepted',
      amountPolicy: 'underpayment_within_10_percent',
    };
  }
  if (actual > required) {
    return {
      ...base,
      ok: true,
      status: 'amount_accepted',
      amountPolicy: 'overpayment_accepted',
    };
  }
  return { ...base, ok: true, status: 'amount_confirmed', amountPolicy: 'exact' };
}

function bitcoinReceivedUnits(tx, address = ASSETS.BTC.address) {
  return (tx && tx.vout || []).reduce((sum, output) => {
    return output.scriptpubkey_address === address ? sum + BigInt(output.value || 0) : sum;
  }, 0n);
}

function bitcoinSignalsRbf(tx) {
  return (tx && tx.vin || []).some((input) => Number(input.sequence) < 0xfffffffe);
}

function findBitcoinCandidate(transactions, quote) {
  return (Array.isArray(transactions) ? transactions : []).find((tx) => {
    return tx && tx.txid && bitcoinReceivedUnits(tx) === BigInt(quote.amountUnits);
  }) || null;
}

function findUsdtLogCandidate(logs, quote) {
  const targetTopic = `0x${ASSETS.USDT.address.toLowerCase().slice(2).padStart(64, '0')}`;
  return (Array.isArray(logs) ? logs : []).find((log) => {
    const topics = (log && log.topics || []).map((topic) => String(topic).toLowerCase());
    return !log.removed
      && String(log.address || '').toLowerCase() === ASSETS.USDT.contract.toLowerCase()
      && topics[0] === TRANSFER_TOPIC
      && topics[2] === targetTopic
      && BigInt(log.data || '0x0') === BigInt(quote.amountUnits)
      && /^(?:0x)?[a-fA-F0-9]{64}$/.test(String(log.transactionHash || ''));
  }) || null;
}

function inspectBitcoinTransaction(tx, tipHeight, quote, canonicalBlockHash) {
  const received = bitcoinReceivedUnits(tx, ASSETS.BTC.address);
  const amount = compareAmount(received, quote.amountUnits);
  const minimum = requiredConfirmations('BTC');
  const replaceable = bitcoinSignalsRbf(tx);

  const confirmed = Boolean(tx && tx.status && tx.status.confirmed);
  const blockHeight = Number(tx && tx.status && tx.status.block_height || 0);
  const confirmations = confirmed && Number.isFinite(Number(tipHeight)) && blockHeight
    ? Math.max(1, Number(tipHeight) - blockHeight + 1)
    : 0;

  if (!confirmed) {
    return {
      ...amount,
      ok: false,
      status: 'confirming',
      confirmations: 0,
      requiredConfirmations: minimum,
      replaceable,
      amountReviewPending: amount.reviewRequired,
    };
  }

  if (tx.status.block_time && Number(tx.status.block_time) * 1000 < Number(quote.createdAt) - 10 * 60 * 1000) {
    return { ok: false, status: 'transaction_before_quote', confirmations, requiredConfirmations: minimum };
  }

  const observedHash = String(tx.status.block_hash || '').toLowerCase();
  const canonicalHash = String(canonicalBlockHash || '').trim().toLowerCase();
  if (canonicalHash && (!observedHash || canonicalHash !== observedHash)) {
    return { ok: false, status: 'reorged', confirmations: 0, requiredConfirmations: minimum };
  }

  const canonicalVerified = Boolean(canonicalHash && observedHash && canonicalHash === observedHash);
  const mature = canonicalVerified && confirmations >= minimum;
  if (!mature) {
    return {
      ...amount,
      ok: false,
      status: 'confirming',
      confirmations,
      requiredConfirmations: minimum,
      replaceable,
      canonicalVerified,
      blockHash: observedHash || null,
      blockNumber: blockHeight || null,
      amountReviewPending: amount.reviewRequired,
    };
  }
  if (!amount.ok) {
    return {
      ...amount,
      ok: false,
      status: 'underpaid',
      confirmations,
      requiredConfirmations: minimum,
      replaceable,
      canonicalVerified,
      blockHash: observedHash || null,
      blockNumber: blockHeight || null,
    };
  }
  return {
    ...amount,
    ok: mature,
    status: 'paid',
    confirmations,
    requiredConfirmations: minimum,
    replaceable,
    canonicalVerified,
    blockHash: observedHash || null,
    blockNumber: blockHeight || null,
  };
}

function inspectEthereumTransaction(tx, receipt, block, currentBlockHex, quote, finalizedBlockHex) {
  const minimum = requiredConfirmations(quote.asset);
  if (!tx || !receipt) return { ok: false, status: 'not_found', confirmations: 0, requiredConfirmations: minimum };
  if (String(receipt.status).toLowerCase() !== '0x1') {
    return { ok: false, status: 'failed', confirmations: 0, requiredConfirmations: minimum };
  }

  const receiptHash = String(receipt.blockHash || '').toLowerCase();
  const transactionHash = String(tx.blockHash || receiptHash).toLowerCase();
  const canonicalHash = String(block && block.hash || '').toLowerCase();
  if (!receiptHash || !canonicalHash || receiptHash !== canonicalHash || transactionHash !== canonicalHash) {
    return { ok: false, status: 'reorged', confirmations: 0, requiredConfirmations: minimum };
  }

  let received = 0n;
  if (quote.asset === 'ETH') {
    if (String(tx.to || '').toLowerCase() !== ASSETS.ETH.address.toLowerCase()) {
      return { ok: false, status: 'wrong_address', confirmations: 0, requiredConfirmations: minimum };
    }
    received = BigInt(tx.value || '0x0');
  } else {
    const targetTopic = `0x${ASSETS.USDT.address.toLowerCase().slice(2).padStart(64, '0')}`;
    for (const log of receipt.logs || []) {
      const topics = (log.topics || []).map((topic) => String(topic).toLowerCase());
      if (log.removed) continue;
      if (String(log.blockHash || receiptHash).toLowerCase() !== receiptHash) continue;
      if (String(log.address || '').toLowerCase() !== ASSETS.USDT.contract.toLowerCase()) continue;
      if (topics[0] !== TRANSFER_TOPIC || topics[2] !== targetTopic) continue;
      received += BigInt(log.data || '0x0');
    }
  }

  const amount = compareAmount(received, quote.amountUnits);
  const receiptBlock = BigInt(receipt.blockNumber || '0x0');
  const currentBlock = BigInt(currentBlockHex || '0x0');
  const finalizedBlock = BigInt(finalizedBlockHex || '0x0');
  const confirmations = receiptBlock && currentBlock >= receiptBlock
    ? Number(currentBlock - receiptBlock + 1n)
    : 0;
  if (block && block.timestamp && Number(BigInt(block.timestamp)) * 1000 < Number(quote.createdAt) - 10 * 60 * 1000) {
    return { ok: false, status: 'transaction_before_quote', confirmations, requiredConfirmations: minimum };
  }

  const finalized = receiptBlock > 0n && receiptBlock <= finalizedBlock;
  const mature = finalized && confirmations >= minimum;
  if (!mature) {
    return {
      ...amount,
      ok: false,
      status: 'confirming',
      confirmations,
      requiredConfirmations: minimum,
      finalized,
      blockHash: canonicalHash,
      blockNumber: Number(receiptBlock),
      amountReviewPending: amount.reviewRequired,
    };
  }
  if (!amount.ok) {
    return {
      ...amount,
      ok: false,
      status: 'underpaid',
      confirmations,
      requiredConfirmations: minimum,
      finalized,
      blockHash: canonicalHash,
      blockNumber: Number(receiptBlock),
    };
  }
  return {
    ...amount,
    ok: mature,
    status: 'paid',
    confirmations,
    requiredConfirmations: minimum,
    finalized,
    blockHash: canonicalHash,
    blockNumber: Number(receiptBlock),
  };
}

async function verifyBitcoinAtApi(apiUrl, txid, quote) {
  let tx;
  try {
    tx = await fetchJson(`${apiUrl}/tx/${txid}`);
  } catch (error) {
    if (error.status === 404) return { ok: false, status: 'not_found', confirmations: 0, provider: apiUrl };
    throw error;
  }

  if (!tx.status || !tx.status.confirmed) {
    return { ...inspectBitcoinTransaction(tx, 0, quote, null), provider: apiUrl };
  }

  const height = Number(tx.status.block_height || 0);
  if (!height) throw new Error('The Bitcoin provider omitted the confirmed block height.');
  const [tipText, canonicalHash] = await Promise.all([
    fetchText(`${apiUrl}/blocks/tip/height`),
    fetchText(`${apiUrl}/block-height/${height}`),
  ]);
  return { ...inspectBitcoinTransaction(tx, Number(tipText), quote, canonicalHash), provider: apiUrl };
}

async function verifyBitcoin(txid, quote) {
  const checks = await Promise.all(bitcoinApiUrls().map((url) => verifyBitcoinAtApi(url, txid, quote)));
  if (checks.every((check) => check.status === 'not_found')) {
    return { ok: false, status: 'not_found', confirmations: 0, requiredConfirmations: requiredConfirmations('BTC') };
  }
  if (checks.some((check) => check.status === 'not_found')) {
    return { ok: false, status: 'provider_disagreement', confirmations: 0, requiredConfirmations: requiredConfirmations('BTC') };
  }

  const first = checks[0];
  const agree = checks.every((check) => (
    check.status === first.status
    && check.receivedUnits === first.receivedUnits
    && check.blockHash === first.blockHash
    && check.blockNumber === first.blockNumber
  ));
  if (!agree) {
    return {
      ok: false,
      status: 'provider_disagreement',
      confirmations: Math.min(...checks.map((check) => Number(check.confirmations || 0))),
      requiredConfirmations: requiredConfirmations('BTC'),
    };
  }
  return first;
}

async function rpcAt(url, method, params) {
  const response = await fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER), method, params }),
  });
  if (response.error) throw new Error(response.error.message || 'Ethereum RPC request failed.');
  return response.result;
}

async function verifyEthereumAtRpc(url, txid, quote) {
  const chainId = await rpcAt(url, 'eth_chainId', []);
  if (String(chainId).toLowerCase() !== '0x1') throw new Error('An Ethereum RPC is not on Ethereum Mainnet.');
  const [tx, receipt, latestBlock, finalizedBlock] = await Promise.all([
    rpcAt(url, 'eth_getTransactionByHash', [txid]),
    rpcAt(url, 'eth_getTransactionReceipt', [txid]),
    rpcAt(url, 'eth_getBlockByNumber', ['latest', false]),
    rpcAt(url, 'eth_getBlockByNumber', ['finalized', false]),
  ]);
  if (!tx || !receipt) {
    return { ok: false, status: 'not_found', confirmations: 0, requiredConfirmations: requiredConfirmations(quote.asset), provider: url };
  }
  if (!latestBlock || !latestBlock.number || !finalizedBlock || !finalizedBlock.number) {
    throw new Error('An Ethereum RPC does not expose finalized blocks.');
  }
  const block = await rpcAt(url, 'eth_getBlockByNumber', [receipt.blockNumber, false]);
  return {
    ...inspectEthereumTransaction(tx, receipt, block, latestBlock.number, quote, finalizedBlock.number),
    provider: url,
  };
}

async function verifyEthereum(txid, quote) {
  const settled = await Promise.allSettled(
    ethereumRpcUrls().map((url) => verifyEthereumAtRpc(url, txid, quote)),
  );
  const checks = settled
    .filter((result) => result.status === 'fulfilled')
    .map((result) => result.value);
  if (checks.length < 2) {
    throw new Error('Ethereum verification requires two healthy independent RPC providers.');
  }
  if (checks.every((check) => check.status === 'not_found')) {
    return { ok: false, status: 'not_found', confirmations: 0, requiredConfirmations: requiredConfirmations(quote.asset) };
  }
  if (checks.some((check) => check.status === 'not_found')) {
    return { ok: false, status: 'provider_disagreement', confirmations: 0, requiredConfirmations: requiredConfirmations(quote.asset) };
  }

  const first = checks[0];
  const samePayment = checks.every((check) => (
    check.receivedUnits === first.receivedUnits
    && check.blockHash === first.blockHash
    && check.blockNumber === first.blockNumber
  ));
  if (!samePayment) {
    return { ok: false, status: 'provider_disagreement', confirmations: 0, requiredConfirmations: requiredConfirmations(quote.asset) };
  }

  const confirmations = Math.min(...checks.map((check) => Number(check.confirmations || 0)));
  const terminalStatuses = checks.filter((check) => !['paid', 'confirming'].includes(check.status));
  if (terminalStatuses.length) {
    const sameTerminalStatus = terminalStatuses.length === checks.length
      && checks.every((check) => check.status === first.status);
    return sameTerminalStatus
      ? { ...first, confirmations }
      : { ok: false, status: 'provider_disagreement', confirmations, requiredConfirmations: requiredConfirmations(quote.asset) };
  }
  const mature = checks.every((check) => check.ok && check.finalized);
  return {
    ...first,
    ok: mature,
    status: mature ? 'paid' : 'confirming',
    confirmations,
  };
}

async function findBitcoinPayment(quote) {
  const apiUrl = bitcoinApiUrls()[0];
  const address = ASSETS.BTC.address;
  const [mempool, confirmed] = await Promise.all([
    fetchJson(`${apiUrl}/address/${address}/txs/mempool`),
    fetchJson(`${apiUrl}/address/${address}/txs/chain`),
  ]);
  const candidates = [...(confirmed || []), ...(mempool || [])].filter((tx) => {
    return tx && tx.txid && bitcoinReceivedUnits(tx) === BigInt(quote.amountUnits);
  });
  if (!candidates.length) return { found: false, status: 'not_found' };

  let tipHeight = 0;
  if (candidates.some((candidate) => candidate.status && candidate.status.confirmed)) {
    tipHeight = Number(await fetchText(`${apiUrl}/blocks/tip/height`));
  }
  for (const candidate of candidates) {
    const verification = inspectBitcoinTransaction(candidate, tipHeight, quote, null);
    if (verification.status === 'confirming' || verification.status === 'paid') {
      return { found: true, txid: candidate.txid, verification };
    }
  }
  return { found: false, status: 'not_found' };
}

async function findUsdtPaymentAtRpc(quote, rpcUrl) {
  const chainId = await rpcAt(rpcUrl, 'eth_chainId', []);
  if (String(chainId).toLowerCase() !== '0x1') throw new Error('The configured Ethereum RPC is not on Ethereum Mainnet.');

  // Discovery is intentionally allowed to see the latest canonical block so the
  // UI can reassure the customer quickly. Fulfillment still goes through
  // verifyEthereum(), which requires finalized, 64-block, two-provider agreement.
  const latestBlock = await rpcAt(rpcUrl, 'eth_getBlockByNumber', ['latest', false]);
  if (!latestBlock || !latestBlock.number) throw new Error('The Ethereum RPC did not return the latest block.');
  const currentBlock = BigInt(latestBlock.number);
  const ageMs = Math.max(0, Date.now() - Number(quote.createdAt));
  const blocksBack = BigInt(Math.min(900, Math.max(80, Math.ceil((ageMs + 15 * 60 * 1000) / 12_000) + 64)));
  const earliest = currentBlock > blocksBack ? currentBlock - blocksBack : 0n;
  const targetTopic = `0x${ASSETS.USDT.address.toLowerCase().slice(2).padStart(64, '0')}`;
  const chunkSize = 250n;

  for (let toBlock = currentBlock; toBlock >= earliest;) {
    const fromBlock = toBlock >= chunkSize && toBlock - chunkSize + 1n > earliest
      ? toBlock - chunkSize + 1n
      : earliest;
    const logs = await rpcAt(rpcUrl, 'eth_getLogs', [{
      fromBlock: `0x${fromBlock.toString(16)}`,
      toBlock: `0x${toBlock.toString(16)}`,
      address: ASSETS.USDT.contract,
      topics: [TRANSFER_TOPIC, null, targetTopic],
    }]);
    for (const log of [...(logs || [])].reverse()) {
      const candidate = findUsdtLogCandidate([log], quote);
      if (!candidate) continue;
      const verification = await verifyEthereum(candidate.transactionHash, quote);
      if (verification.status === 'paid' || verification.status === 'confirming') {
        return { found: true, txid: candidate.transactionHash, verification };
      }
    }
    if (fromBlock === earliest) break;
    toBlock = fromBlock - 1n;
  }
  return { found: false, status: 'not_found' };
}

async function findUsdtPayment(quote) {
  let lastError;
  for (const rpcUrl of ethereumLogRpcUrls()) {
    try { return await findUsdtPaymentAtRpc(quote, rpcUrl); }
    catch (error) { lastError = error; }
  }
  throw lastError || new Error('No Ethereum log provider is configured.');
}

async function findOnChainPayment(quote) {
  if (quote.asset === 'BTC') return findBitcoinPayment(quote);
  if (quote.asset === 'USDT') return findUsdtPayment(quote);
  return { found: false, status: 'txid_required' };
}

async function verifyOnChain(txid, quote) {
  return quote.asset === 'BTC' ? verifyBitcoin(txid, quote) : verifyEthereum(txid, quote);
}

module.exports = {
  MINIMUM_ACCEPTED_PERCENT,
  TRANSFER_TOPIC,
  bitcoinReceivedUnits,
  bitcoinSignalsRbf,
  compareAmount,
  findBitcoinCandidate,
  findOnChainPayment,
  findUsdtLogCandidate,
  inspectBitcoinTransaction,
  inspectEthereumTransaction,
  verifyOnChain,
};
