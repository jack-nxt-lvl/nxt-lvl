# Mercury ACH checkout

This integration adds **Pay by bank (ACH)** to the existing checkout when its
server readiness check passes. It uses Mercury's hosted invoice experience;
the customer links a bank through Plaid and explicitly authorizes the debit on
Mercury. It does not use a separately contracted Plaid Transfer account, accept
bank credentials on the storefront, or move money when an invoice is created.

## Current activation state

The code is disabled by default. No Mercury credentials, destination account,
ACH entitlement, product acceptance, outbound IP configuration, or external
payment completion were verified during implementation. Local tests use mocked
provider responses and cannot substitute for a Mercury sandbox/integration test.

The existing purchaser-review requirement is retained. Every ACH order requires
an active private approval bound to its buyer, materials, quantities, amount,
and fulfillment. The implementation does not generate approvals or claim that
a research-use checkbox establishes lawful supply or processor acceptance.

## Configuration

Set secret values directly in the hosting provider's secret settings. Do not
send tokens in chat, commit them, place them in client code, or expose them in
public environment variables.

| Variable | Required value or purpose |
| --- | --- |
| `MERCURY_ENV` | `production` in Vercel Production; `sandbox` in Preview/Development |
| `MERCURY_API_TOKEN` | Server token with the least customer/invoice read/write permissions needed, restricted to approved outbound IPs |
| `MERCURY_DESTINATION_ACCOUNT_ID` | UUID of the intended Mercury checking or savings account |
| `MERCURY_ACH_SIGNING_SECRET` | Independently generated random secret, at least 32 characters, used for private status receipts |
| `MERCURY_ACH_ENABLED` | `true` only after account eligibility, routing, and integration verification |
| `MERCURY_RESEARCH_APPROVED` | `true` only after the provider has accepted the actual business and catalog |
| `RESEARCH_COMMERCE_ENABLED` | Existing business/purchaser review gate; must be `true` |
| Ledger credentials | Existing Redis REST credentials; required for order intent, locks, rate limits, and recovery |

Mercury documents invoice ACH debit for eligible Pro/Plus accounts. Confirm
**Accept ACH Debit** in Mercury Invoicing. An existing linked Plaid account is
not confirmation of this entitlement. Review the current account pricing and
terms directly before changing plans; no paid plan or hosting upgrade is made
by this implementation.

Mercury requires IP allowlisting for write-capable API tokens. Configure stable,
restricted egress for the invoice API functions and add those addresses to the
token's allowlist. Do not assume standard Vercel outbound IPs are stable, and do
not open the allowlist to the whole internet. No infrastructure is purchased or
configured automatically.

## Payment and recovery behavior

1. The server recalculates prices, discounts, and fulfillment using the trusted
   catalog and verifies the existing independent purchaser approval.
2. A durable order intent and lock are saved before Mercury mutations. Each
   approved order keeps the same unique `invoiceNumber` across retries.
3. The server finds/creates the Mercury customer and creates an ACH-only USD
   invoice. It uses virtual payment instructions, accurate line-item names,
   and `sendEmailOption: "DontSend"`; no invoice email or text is sent.
4. The returned invoice's customer, destination, amount, currency, line items,
   ID, and status must match the reviewed order. A lost create response is
   recovered by finding the same invoice number and reading its full record.
5. The buyer opens the strictly validated `https://app.mercury.com/pay/{slug}`
   link and authorizes payment there. A link click or bank connection is never
   treated as payment completion.
6. **Check payment status** authenticates with a signed receipt in the
   Authorization header. The server reads and validates the invoice directly
   from Mercury. It maps `Unpaid` to pending, `Processing` to processing,
   `Paid` to paid, and `Cancelled` to cancelled.

The browser retains a receipt in session storage so the order can be reopened
and rechecked. Saved browser status is not trusted. Receipts expire after 90
days; operator records remain in the server ledger. A signing-secret rotation
invalidates older receipts, so arrange support recovery before rotation.

Turning off `MERCURY_ACH_ENABLED` stops new invoices while existing receipts can
still be checked if the original environment, token, signing secret and ledger
remain available. Changing the settlement account does not rewrite old invoices.

## Reconciliation and practical limits

Mercury says invoice ACH debits typically post in 1–5 business days. This code
performs on-demand status checks; it does not add a background reconciliation
job, transaction webhook, refund API, automatic dispatch, or new customer emails.
Operators must monitor/reconcile invoices in Mercury if a buyer closes checkout.
Mercury's `Paid` status can also reflect manual updates or other payment rails;
it is not proof that an ACH debit is irrevocable. Independently review incoming
funds, returns, the purchaser record, destination, tax, and fulfillment before
dispatch. Existing ordering terms still apply.

Customer/invoice recovery follows documented cursors and fails closed if a lookup
is malformed, exceeds five pages of 1,000 records, or runs out of time. It never
changes the invoice number to work around a provider error. Contact support for
an unmatched or manually changed invoice before attempting another payment.

## Verification before activation

Run the automated tests and build. Then use separately issued Mercury sandbox
credentials to verify customer creation, invoice creation, exact line-item and
amount handling, retries after an uncertain response, and invoice status reads.
The sandbox API is `https://api-sandbox.mercury.com/api/v1`; production credentials
must not be used there. This implementation deliberately hides the customer UI
in sandbox: the sandbox hosted payer URL and complete Plaid settlement simulation
have not been verified. Do not substitute an assumed sandbox payment hostname.

After the account and restricted server connection are ready, verify the actual
hosted flow using the provider's approved testing procedure. Only then enable the
production flags and confirm the option appears at checkout. This repository's
tests never authorize an actual debit.

## Official references

- [Mercury invoicing API](https://docs.mercury.com/docs/invoicing)
- [Customer ACH and Plaid flow](https://support.mercury.com/hc/en-us/articles/34132274076564-Pay-an-invoice-or-payment-link-with-ACH-debit)
- [Create invoice](https://docs.mercury.com/reference/createinvoice)
- [List invoices and payment URL](https://docs.mercury.com/reference/listinvoices)
- [Read an invoice](https://docs.mercury.com/reference/getinvoice)
- [API token security and allowed IPs](https://docs.mercury.com/docs/api-token-security-policies)
- [Mercury sandbox](https://docs.mercury.com/docs/using-mercury-sandbox)
