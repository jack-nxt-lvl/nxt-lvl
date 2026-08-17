# NXT LVL

Static single-page catalog site — "NXT LVL | Premium Research Compounds".

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The entire site — markup, CSS, and app JS in one file |
| `products-data.js` | Product catalog (names, descriptions, categories, pricing) |
| `nxt-lvl-qr.png` | QR code image (1024×1024) |
| `package.json` | Only dependency is `qrcode`, used to generate the QR image |

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

## External dependencies

Google Fonts (Inter, Orbitron) loaded via CDN. No backend, no API keys, no
environment variables.
