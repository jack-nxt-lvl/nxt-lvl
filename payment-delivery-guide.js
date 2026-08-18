(() => {
  if (document.getElementById('payment-guide')) return;

  const style = document.createElement('style');
  style.textContent = `
    #payment-guide{position:relative;z-index:2;padding:72px 40px 82px;max-width:1180px;margin:0 auto}
    .pg-wrap{border:1px solid rgba(255,255,255,.10);border-radius:22px;overflow:hidden;background:radial-gradient(circle at 12% 0,rgba(124,58,237,.13),transparent 32%),linear-gradient(180deg,#10131a,#090b10);box-shadow:0 28px 80px rgba(0,0,0,.34)}
    .pg-head{padding:34px 30px 24px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08)}
    .pg-kicker{display:inline-flex;align-items:center;gap:8px;padding:6px 11px;border-radius:999px;background:rgba(124,58,237,.11);border:1px solid rgba(167,139,250,.25);color:#c4b5fd;font-size:10px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase}
    .pg-head h2{margin:12px 0 8px;font-family:'Space Grotesk',sans-serif;font-size:34px;line-height:1.08;color:#fff}
    .pg-head p{max-width:720px;margin:0 auto;color:#a6adba;font-size:13px;line-height:1.6}
    .pg-quick{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.014)}
    .pg-chip{min-height:48px;border-radius:11px;display:flex;align-items:center;justify-content:center;gap:8px;text-align:center;font-size:10px;font-weight:850;padding:10px 12px}
    .pg-chip.best{background:rgba(38,161,123,.11);border:1px solid rgba(38,161,123,.28);color:#a7f3d0}
    .pg-chip.buy{background:rgba(56,189,248,.09);border:1px solid rgba(56,189,248,.23);color:#bae6fd}
    .pg-chip.track{background:rgba(247,147,26,.09);border:1px solid rgba(247,147,26,.22);color:#fed7aa}
    .pg-main{display:grid;grid-template-columns:1fr .78fr;gap:16px;padding:22px}
    .pg-card{border:1px solid rgba(255,255,255,.08);border-radius:15px;background:#0f141b;padding:20px}
    .pg-card h3{margin:0 0 6px;color:#fff;font-size:14px}.pg-sub{margin:0 0 15px;color:#808999;font-size:10px;line-height:1.5}
    .pg-route{display:grid;gap:10px}
    .pg-step{display:grid;grid-template-columns:36px 1fr;gap:11px;align-items:flex-start;padding:13px;border-radius:11px;border:1px solid rgba(255,255,255,.07);background:#121821}
    .pg-num{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;font-size:11px;font-weight:900}
    .pg-step strong{display:block;color:#fff;font-size:11px;margin-bottom:3px}.pg-step span{display:block;color:#a9b0bc;font-size:10px;line-height:1.5}
    .pg-first{border-color:rgba(38,161,123,.24);background:linear-gradient(145deg,rgba(38,161,123,.08),#111820)}
    .pg-side{display:grid;gap:11px}
    .pg-choice{padding:16px;border-radius:13px;border:1px solid rgba(255,255,255,.08);background:#10151c}
    .pg-choice .tag{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:8px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;margin-bottom:8px}.pg-choice h4{margin:0 0 5px;color:#fff;font-size:12px}.pg-choice p{margin:0;color:#98a2b0;font-size:9.5px;line-height:1.55}
    .pg-choice.rec .tag{background:rgba(38,161,123,.11);color:#a7f3d0}.pg-choice.new .tag{background:rgba(56,189,248,.10);color:#bae6fd}.pg-choice.have .tag{background:rgba(167,139,250,.11);color:#ddd6fe}
    .pg-rule{margin-top:12px;padding:13px 14px;border-radius:11px;border:1px solid rgba(248,113,113,.20);background:rgba(127,29,29,.10);color:#fecaca;font-size:9.5px;line-height:1.55}
    .pg-rule strong{color:#fff}
    .pg-footer{padding:0 22px 22px}.pg-note{padding:14px 16px;border-radius:11px;border:1px solid rgba(255,255,255,.08);background:#0c1117;color:#8f99a7;font-size:9px;line-height:1.6;text-align:center}.pg-note strong{color:#dbe2ea}
    nav ul li a[href="#payment-guide"]{color:#86efac}
    @media(max-width:900px){#payment-guide{padding:56px 16px 64px}.pg-main{grid-template-columns:1fr}.pg-quick{grid-template-columns:1fr}.pg-head h2{font-size:27px}.pg-head{padding:27px 18px 21px}.pg-main{padding:16px}.pg-footer{padding:0 16px 16px}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'payment-guide';
  section.innerHTML = `
    <div class="pg-wrap">
      <div class="pg-head">
        <div class="pg-kicker">✓ Easy Payment Guide</div>
        <h2>How to Pay in 4 Simple Steps</h2>
        <p>You do not need to calculate anything. Checkout shows the coin, amount, network and payment address for your order.</p>
      </div>

      <div class="pg-quick">
        <div class="pg-chip best">₮ Easiest option: USDT</div>
        <div class="pg-chip buy"> Need crypto? Use MoonPay with Apple Pay or card</div>
        <div class="pg-chip track">Tracking target: within 48 hours after confirmed payment</div>
      </div>

      <div class="pg-main">
        <div class="pg-card">
          <h3>Just Follow These Steps</h3>
          <p class="pg-sub">Use the payment information shown on your current checkout screen.</p>
          <div class="pg-route">
            <div class="pg-step pg-first"><div class="pg-num">1</div><div><strong>Finish your order</strong><span>Add your products, enter your shipping information, then press Continue to Payment.</span></div></div>
            <div class="pg-step"><div class="pg-num">2</div><div><strong>Choose how you want to pay</strong><span>Have crypto already? Use your wallet, Coinbase or Cash App for Bitcoin. Need crypto first? Use MoonPay with Apple Pay or an eligible debit/credit card.</span></div></div>
            <div class="pg-step"><div class="pg-num">3</div><div><strong>Copy the exact payment details</strong><span>Checkout gives you the exact coin, network, amount and receiving address. Copy those details exactly as shown.</span></div></div>
            <div class="pg-step"><div class="pg-num">4</div><div><strong>Send payment and keep checkout open</strong><span>Send the crypto, then return to this checkout page. Payment status can update after the blockchain and payment provider confirm the transaction.</span></div></div>
          </div>
          <div class="pg-rule"><strong>Most important rule:</strong> Send the same coin on the same network shown at checkout. For example, if checkout says USDT (TRC20), send USDT on TRC20 only.</div>
        </div>

        <div class="pg-side">
          <div class="pg-choice rec"><div class="tag">Recommended</div><h4>Use USDT if available</h4><p>USDT is usually the easiest option to compare with your dollar order total. Always use the exact network shown by checkout.</p></div>
          <div class="pg-choice new"><div class="tag">New to crypto?</div><h4>Buy with Apple Pay or card</h4><p>Choose MoonPay from checkout, buy the selected crypto using an available Apple Pay, debit or credit card option, then send it to the checkout address.</p></div>
          <div class="pg-choice have"><div class="tag">Already have crypto?</div><h4>Use your existing app</h4><p>You can send from your private wallet, Coinbase, or Cash App for Bitcoin. Copy the exact amount and payment address from checkout.</p></div>
        </div>
      </div>

      <div class="pg-footer"><div class="pg-note"><strong>After payment:</strong> Confirmed orders move into fulfillment. The current target is for tracking to be issued within 48 hours after payment confirmation. MoonPay, Cash App, Coinbase and other wallet providers are third parties and may apply their own fees, limits, availability or verification requirements.</div></div>
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
