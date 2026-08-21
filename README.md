# NXT LVL

Static single-page catalog site — "NXT LVL | Premium Research Compounds".

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The entire site — markup, CSS, and app JS in one file |
| `products-data.js` | Product catalog (names, descriptions, categories, pricing) |
| `nxt-lvl-qr.png` | QR code image (1024×1024) |
| `direct-wallet-checkout.js` | BTC, ETH, and ERC-20 USDT direct-wallet checkout UI |
| `api/create-direct-payment-quote.js` | Trusted cart calculation, live quote, signed order token, and QR code |
| `api/find-direct-payment.js` | Automatic BTC and ERC-20 USDT payment discovery |
| `api/verify-direct-payment.js` | Mature-chain verification and fulfillment release |
| `lib/payment-ledger.js` | Atomic Redis locks, quote reservations, and permanent payment claims |
| `lib/checkout-localization.js` | Geo/locale currency display and region-aware wallet-funding guidance |
| `package.json` | Runtime dependencies for QR generation and Ethereum address handling |

## Running it locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Editing the catalog

All products live in `products-data.js`. Categories are defined at the bottom of
that file (`all`, `freeze-dried`, `capsules`, `injectables`). Add or edit a
product object and reload — nothing needs to be recompiled.

## Contact / ordering

Orders route to WhatsApp at `+1 754-290-7210`, linked from `index.html`. Update
the `wa.me/17542907210` links there to change the destination number.

## Deploying

Hosted on Vercel. Current URLs:

- Public: 
https://nxtlvl-research.com
- Preview URLs under
https://nxt-lvl-seven.vercel.app & `*-parker-4210s-projects.vercel.app` are SSO-protected and
  only load for members of that Vercel account.

Deploy from this folder with:

```bash
npx vercel --prod
```

## Direct-wallet checkout configuration

Payments are sent directly to the configured public receiving addresses. The
application never receives or stores wallet private keys. The checkout requires:

- `CRYPTO_QUOTE_SECRET`: a long random value used only to sign temporary quotes.
- `RESEND_API_KEY`: sends checkout-lead and blockchain-confirmed order emails.
- `ORDER_EMAIL_FROM`: optional verified sender address for Resend.
- `ETHEREUM_RPC_URL`: optional dedicated Ethereum Mainnet JSON-RPC endpoint.
- `ETHEREUM_BACKUP_RPC_URL`: optional independent backup Mainnet endpoint.
- `BITCOIN_API_URL` and `BITCOIN_BACKUP_API_URL`: optional Esplora-compatible
  endpoints. The defaults are mempool.space and Blockstream.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or the equivalent
  `UPSTASH_REDIS_REST_*` names): required. Checkout fails closed without the
  durable ledger.

The server recalculates totals from `products-data-original.js`; browser prices
are never trusted. Signed quotes are also bound to the normalized customer,
cart, fulfillment method, exact amount, and expiration time. Exact quote
amounts are reserved atomically so active orders cannot share a fingerprint.
BTC requires six canonical confirmations agreed by two independent providers.
ETH and ERC-20 USDT require 64-block depth, finalized canonical inclusion, and
agreement from two independent RPC providers. BTC and ERC-20 USDT are
discovered automatically by exact amount. The customer UI uses held-request
long polling to show Bitcoin mempool detection or an ERC-20 transfer in the
latest Ethereum block quickly, but order fulfillment never runs until the
confirmation rules above pass. ETH browser-wallet payments fill the hash
automatically; manual paste remains as a fallback for every asset.

Once a transaction hash is bound to its signed order, the amount policy accepts
all overpayments and any payment at or above exactly 90% of the invoice amount.
Those payments follow the normal confirmation rules and auto-complete without
an amount warning. A payment below 90% is not flagged until it has reached the
same safe confirmation/finality depth; it is then durably bound to that order
and sent to manual review. Automatic address discovery remains exact-match only
because the receiving addresses are shared and the fractional quote amount is
the safe order identifier. Customers who intentionally send a different amount
must supply the transaction hash (browser-wallet payments do this automatically).

Bitcoin QR codes and wallet buttons use BIP-21 to prefill the receiving address
and exact BTC amount. ETH and USDT use EIP-681-style wallet links. Customer
country metadata from Vercel and browser locale preferences are used for an
approximate local-currency display; the signed order and exact crypto amount
remain USD-denominated. The regional Apple Pay/card/bank wording is informational
guidance for compatible third-party wallet apps only. NXT LVL does not process
cards or use a hosted fiat-payment provider.

The checkout also offers an optional "Buy crypto" funding button that embeds the
legitimate `https://www.swaps.app/` public buy flow in an in-page right-side
drawer while the NXT LVL checkout remains open. A clearly labeled separate-tab
fallback remains available if the third-party frame cannot load. The verified
public parameters prefill the selected asset and put the requested crypto amount
in Swaps' receive field.
Swaps does not document a public
wallet-address parameter, so the checkout copies the signed quote's receiving
address for the customer to paste and verify. The Swaps flow is not treated as
payment confirmation; fulfillment still requires the normal on-chain checks.
The funding card is written for first-time crypto buyers with four numbered
steps, automatic address copying, a visible copy-again control, network-specific
USDT guidance, and a clear return-to-checkout instruction.

Copy controls provide visible success feedback. The cart persists in the
browser, and an active quote can be resumed after an accidental refresh in the
same tab. Network/RPC services can be temporarily unavailable even though funds
remain in the receiving wallet.

Run the automated chain-verification tests with `npm test` before deployment.
