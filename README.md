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
| `api/verify-direct-payment.js` | Bitcoin/Ethereum transaction and confirmation verification |
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
- `ETHEREUM_RPC_URL`: optional Ethereum Mainnet JSON-RPC endpoint. A public
  Mainnet endpoint is used when this is not configured.
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or the equivalent
  `UPSTASH_REDIS_REST_*` names): strongly recommended in production for a
  durable ledger that prevents one transaction from being assigned to two
  different orders.

The server recalculates totals from `products-data-original.js`; browser prices
are never trusted. Signed quotes are also bound to the normalized customer,
cart, fulfillment method, exact amount, and expiration time. BTC is checked
through the public mempool.space API. ETH and ERC-20 USDT are checked through
Ethereum JSON-RPC. Network/RPC services can be temporarily unavailable even
though funds remain in the receiving wallet.

Run the automated chain-verification tests with `npm test` before deployment.
