(() => {
  if (document.getElementById('payment-guide')) return;

  const style = document.createElement('style');
  style.textContent = `
    #payment-guide{position:relative;z-index:2;padding:76px 40px 84px;max-width:1220px;margin:0 auto}
    .pg-wrap{border:1px solid rgba(255,255,255,.10);border-radius:22px;overflow:hidden;background:radial-gradient(circle at 10% 0,rgba(38,161,123,.12),transparent 32%),radial-gradient(circle at 92% 6%,rgba(56,189,248,.10),transparent 28%),linear-gradient(180deg,#10151b,#090c11);box-shadow:0 28px 80px rgba(0,0,0,.34)}
    .pg-head{padding:34px 34px 26px;border-bottom:1px solid rgba(255,255,255,.08);text-align:center}
    .pg-kicker{display:inline-flex;align-items:center;gap:8px;padding:6px 11px;border-radius:999px;background:rgba(38,161,123,.10);border:1px solid rgba(38,161,123,.28);color:#86efac;font-size:10px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase}
    .pg-head h2{margin:12px 0 8px;font-family:'Space Grotesk',sans-serif;font-size:34px;line-height:1.1;color:#fff}
    .pg-head p{max-width:760px;margin:0 auto;color:#a5adba;font-size:13px;line-height:1.65}
    .pg-highlight{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:18px 24px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.015)}
    .pg-pill{display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;border-radius:10px;font-size:10px;font-weight:850;letter-spacing:.25px;text-align:center}
    .pg-pill.green{background:rgba(38,161,123,.10);border:1px solid rgba(38,161,123,.25);color:#a7f3d0}
    .pg-pill.blue{background:rgba(56,189,248,.09);border:1px solid rgba(56,189,248,.22);color:#bae6fd}
    .pg-pill.amber{background:rgba(247,147,26,.09);border:1px solid rgba(247,147,26,.22);color:#fed7aa}
    .pg-body{display:grid;grid-template-columns:1.2fr .8fr;gap:18px;padding:24px}
    .pg-card{border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(13,17,23,.88);padding:21px}
    .pg-card h3{margin:0 0 5px;font-size:13px;color:#fff;letter-spacing:.4px}
    .pg-card .sub{margin:0 0 16px;color:#7f8998;font-size:10px;line-height:1.5}
    .pg-steps{display:grid;gap:10px}
    .pg-step{display:grid;grid-template-columns:32px 1fr;gap:11px;align-items:flex-start;padding:12px;border:1px solid rgba(255,255,255,.07);border-radius:11px;background:#111720}
    .pg-num{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#26a17b,#0f766e);font-size:10px;font-weight:900;color:#fff}
    .pg-step strong{display:block;color:#fff;font-size:11px;margin-bottom:3px}.pg-step span{display:block;color:#a4adba;font-size:10px;line-height:1.55}
    .pg-warn{margin-top:12px;padding:12px 13px;border-radius:10px;border:1px solid rgba(248,113,113,.20);background:rgba(127,29,29,.10);color:#fecaca;font-size:9px;line-height:1.55}
    .pg-side{display:grid;gap:12px}
    .pg-assurance{padding:17px;border-radius:13px;border:1px solid rgba(255,255,255,.08);background:#10151c}
    .pg-assurance .icon{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;margin-bottom:10px;font-size:18px}.pg-assurance h4{margin:0 0 5px;color:#fff;font-size:12px}.pg-assurance p{margin:0;color:#98a2b0;font-size:9.5px;line-height:1.55}
    .pg-assurance.track .icon{background:rgba(56,189,248,.13);color:#7dd3fc}.pg-assurance.quality .icon{background:rgba(38,161,123,.14);color:#86efac}.pg-assurance.delivery .icon{background:rgba(247,147,26,.12);color:#fdba74}
    .pg-bottom{padding:0 24px 24px}.pg-bottom-note{padding:14px 16px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:#0d1218;color:#8f99a7;font-size:9px;line-height:1.6;text-align:center}.pg-bottom-note strong{color:#d9e1ea}
    nav ul li a[href="#payment-guide"]{color:#86efac}
    @media(max-width:900px){#payment-guide{padding:58px 16px 64px}.pg-body{grid-template-columns:1fr}.pg-highlight{grid-template-columns:1fr}.pg-head{padding:28px 18px 22px}.pg-head h2{font-size:27px}.pg-body{padding:16px}.pg-bottom{padding:0 16px 16px}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'payment-guide';
  section.innerHTML = `
    <div class="pg-wrap">
      <div class="pg-head">
        <div class="pg-kicker">✓ Payment & Delivery Guide</div>
        <h2>How to Pay Correctly & Receive Your Order</h2>
        <p>Follow these steps exactly. Your checkout creates the payment amount, coin, network and receiving address for your order so you do not have to calculate anything yourself.</p>
      </div>
      <div class="pg-highlight">
        <div class="pg-pill green">₮ USDT Recommended</div>
        <div class="pg-pill blue"> Apple Pay / Card via MoonPay</div>
        <div class="pg-pill amber">Tracking Target: Within 48 Hours</div>
      </div>
      <div class="pg-body">
        <div class="pg-card">
          <h3>Simple Payment Instructions</h3>
          <p class="sub">Use the payment screen generated for your specific order. Never send from an old screenshot or an address from a different order.</p>
          <div class="pg-steps">
            <div class="pg-step"><div class="pg-num">1</div><div><strong>Finish your cart and checkout information</strong><span>Confirm your products, quantities, shipping information and final order total before choosing payment.</span></div></div>
            <div class="pg-step"><div class="pg-num">2</div><div><strong>Choose your payment route</strong><span>USDT is recommended. You can also use BTC, ETH or LTC. If you need to buy crypto first, choose MoonPay for Apple Pay or an eligible debit/credit card. Verification may be required by the provider.</span></div></div>
            <div class="pg-step"><div class="pg-num">3</div><div><strong>Use the exact coin and network shown</strong><span>Network matters. If checkout shows USDT on TRC20, send USDT on TRC20 only. Do not substitute ERC20, BEP20 or another network unless checkout specifically displays it.</span></div></div>
            <div class="pg-step"><div class="pg-num">4</div><div><strong>Send the exact crypto amount</strong><span>Copy the payment amount and receiving address directly from checkout, or use the QR code. Double-check the first and last characters of the address before sending.</span></div></div>
            <div class="pg-step"><div class="pg-num">5</div><div><strong>Keep checkout open while payment confirms</strong><span>The site watches the payment status automatically. Once the blockchain and payment processor confirm it, your order can move into fulfillment.</span></div></div>
            <div class="pg-step"><div class="pg-num">6</div><div><strong>Watch for tracking</strong><span>Our fulfillment target is to issue tracking within 48 hours after confirmed payment. Carrier movement and delivery times begin after the package is accepted by the carrier.</span></div></div>
          </div>
          <div class="pg-warn"><strong>Important:</strong> Cryptocurrency transfers are generally irreversible. Sending the wrong coin, wrong network, wrong address, or an incorrect amount can delay or prevent crediting the order. Always use the details shown on your live checkout.</div>
        </div>
        <div class="pg-side">
          <div class="pg-assurance track"><div class="icon">⌁</div><h4>Fast Fulfillment</h4><p>Confirmed orders are prioritized for processing, with a target of tracking being issued within 48 hours after confirmed payment.</p></div>
          <div class="pg-assurance quality"><div class="icon">✓</div><h4>Quality Assurance</h4><p>We stand behind the quality of properly fulfilled orders. If an item arrives with a verifiable fulfillment or quality issue, contact support promptly so the order can be reviewed and made right when eligible.</p></div>
          <div class="pg-assurance delivery"><div class="icon">▣</div><h4>Delivery Protection</h4><p>If carrier tracking confirms an eligible shipment was lost or damaged in transit, contact support for review and resolution. Accurate shipping information is required for protection.</p></div>
        </div>
      </div>
      <div class="pg-bottom"><div class="pg-bottom-note"><strong>Best practice:</strong> Use USDT when available for the easiest dollar-value comparison, and always follow the exact network displayed by checkout. MoonPay, Swaps, Cash App, Coinbase and wallet providers are third parties and may apply their own availability, fees, verification and transaction rules.</div></div>
    </div>`;

  const trust = document.querySelector('.trust-bar');
  if (trust) trust.insertAdjacentElement('afterend', section);
  else document.body.insertBefore(section, document.body.firstChild);

  const navList = document.querySelector('#mainNav ul');
  if (navList && !navList.querySelector('a[href="#payment-guide"]')) {
    const li = document.createElement('li');
    li.innerHTML = '<a href="#payment-guide">Payment Guide</a>';
    const orderLi = [...navList.children].find(x => x.textContent.trim() === 'Order');
    if (orderLi) navList.insertBefore(li, orderLi); else navList.prepend(li);
  }
})();
