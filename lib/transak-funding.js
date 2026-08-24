'use strict';

const NETWORK_BY_ASSET = Object.freeze({
  BTC: 'bitcoin',
  ETH: 'ethereum',
  USDT: 'ethereum',
});

function requiredText(value, label, maxLength = 240) {
  const normalized = String(value || '').trim();
  if (!normalized || normalized.length > maxLength) throw new Error(`${label} is invalid.`);
  return normalized;
}

function normalizeAmount(value) {
  const normalized = requiredText(value, 'Crypto receive amount', 40);
  if (!/^\d+(?:\.\d{1,18})?$/.test(normalized) || Number(normalized) <= 0) {
    throw new Error('Crypto receive amount is invalid.');
  }
  return normalized;
}

function buildWidgetParams({ apiKey, referrerDomain, quote }) {
  const asset = requiredText(quote && quote.asset, 'Crypto asset', 10).toUpperCase();
  const network = NETWORK_BY_ASSET[asset];
  if (!network) throw new Error('Unsupported Transak funding asset.');

  const amount = normalizeAmount(quote && quote.amountDisplay);
  const address = requiredText(quote && quote.address, 'Receiving wallet address', 180);
  const orderId = requiredText(quote && quote.orderId, 'Order ID', 100);

  return {
    apiKey: requiredText(apiKey, 'Transak API key', 300),
    referrerDomain: requiredText(referrerDomain, 'Transak referrer domain', 180),
    productsAvailed: 'BUY',
    fiatCurrency: 'USD',
    cryptoCurrencyCode: asset,
    network,
    // Transak calculates the card charge from the crypto receive target. Do not
    // send fiatAmount/defaultFiatAmount here: those fields make provider fees
    // reduce the crypto delivered and can leave the invoice underpaid.
    defaultCryptoAmount: Number(amount),
    walletAddress: address,
    disableWalletAddressForm: true,
    partnerOrderId: orderId,
    exchangeScreenTitle: 'Complete your purchase',
    themeColor: '7C3AED',
    colorMode: 'DARK',
  };
}

module.exports = {
  NETWORK_BY_ASSET,
  buildWidgetParams,
  normalizeAmount,
};
