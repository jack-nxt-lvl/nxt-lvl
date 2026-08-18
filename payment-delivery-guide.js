(() => {
  if (document.getElementById('payment-guide')) return;

  const style = document.createElement('style');
  style.textContent = `
    #payment-guide{position:relative;z-index:2;padding:72px 34px 88px;max-width:1220px;margin:0 auto}
    .pg-wrap{border:1px solid rgba(167,139,250,.22);border-radius:26px;overflow:hidden;background:radial-gradient(circle at 10% 0,rgba(124,58,237,.18),transparent 34%),radial-gradient(circle at 92% 8%,rgba(56,189,248,.08),transparent 28%),linear-gradient(180deg,#11141c,#090b10);box-shadow:0 30px 90px rgba(0,0,0,.42),0 0 0 1px rgba(255,255,255,.025) inset}
    .pg-head{padding:38px 34px 28px;text-align:center;border-bottom:1px solid rgba(255,255,255,.08)}
    .pg-kicker{display:inline-flex;padding:7px 13px;border-radius:999px;background:rgba(124,58,237,.14);border:1px solid rgba(167,139,250,.30);color:#d8ccff;font-size:11px;font-weight:900;letter-spacing:1.35px;text-transform:uppercase}
    .pg-head h2{margin:14px 0 9px;font-family:'Space Grotesk',sans-serif;font-size:38px;line-height:1.08;color:#fff}.pg-head p{max-width:780px;margin:0 auto;color:#b5bdca;font-size:14px;line-height:1.65}
    .pg-options{padding:20px 24px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.015)}
    .pg-options-title{text-align:center;color:#fff;font-size:12px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}
    .pg-option-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.pg-option{min-height:56px;padding:11px 10px;border:1px solid rgba(167,139,250,.18);border-radius:12px;background:linear-gradient(145deg,rgba(124,58,237,.08),rgba(255,255,255,.018));display:flex;flex-direction:column;justify-content:center;text-align:center}.pg-option strong{color:#f3efff;font-size:12px}.pg-option span{color:#9fa8b7;font-size:10px;margin-top:3px}
    .pg-reassure{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:16px 24px;border-bottom:1px solid rgba(255,255,255,.07)}.pg-badge{padding:11px 12px;border-radius:10px;text-align:center;font-size:10.5px;font-weight:800;color:#c9d1dc;background:#101720;border:1px solid rgba(255,255,255,.07)}.pg-badge strong{color:#fff}
    .pg-main{display:grid;grid-template-columns:1.12fr .88fr;gap:18px;padding:24px}.pg-card{border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(15,20,27,.95);padding:22px}.pg-card h3{margin:0 0 6px;color:#fff;font-size:17px}.pg-sub{margin:0 0 17px;color:#939dab;font-size:12px;line-height:1.55}
    .pg-route{display:grid;gap:11px}.pg-step{display:grid;grid-template-columns:39px 1fr;gap:12px;align-items:flex-start;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.075);background:#121821}.pg-num{width:37px;height:37px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#9b6cff,#6d28d9);box-shadow:0 6px 18px rgba(124,58,237,.25);color:#fff;font-size:12px;font-weight:900}.pg-step strong{display:block;color:#fff;font-size:13px;margin-bottom:4px}.pg-step span{display:block;color:#b1b9c5;font-size:11.5px;line-height:1.55}
    .pg-side{display:grid;gap:12px}.pg-choice{padding:18px;border-radius:14px;border:1px solid rgba(255,255,255,.085);background:linear-gradient(145deg,#111720,#0e131a)}.pg-choice .tag{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:9px;font-weight:900;letter-spacing:.8px;text-transform:uppercase;margin-bottom:9px;background:rgba(124,58,237,.13);color:#d8ccff}.pg-choice h4{margin:0 0 6px;color:#fff;font-size:13px}.pg-choice p{margin:0;color:#a7b0bd;font-size:11px;line-height:1.6}
    .pg-rule{margin-top:13px;padding:14px 15px;border-radius:11px;border:1px solid rgba(251,191,36,.22);background:rgba(120,53,15,.10);color:#fde6b0;font-size:11px;line-height:1.6}.pg-rule strong{color:#fff}
    .pg-footer{padding:0 24px 24px}.pg-note{padding:16px 18px;border-radius:12px;border:1px solid rgba(38,161,123,.20);background:linear-gradient(145deg,rgba(38,161,123,.075),#0c1117);color:#aeb8c4;font-size:11px;line-height:1.65;text-align:center}.pg-note strong{color:#dfffee}
    nav ul li a[href="#payment-guide"]{color:#86efac}
    @media(max-width:900px){#payment-guide{padding:56px 14px 66px}.pg-option-grid{grid-template-columns:repeat(2,1fr)}.pg-reassure,.pg-main{grid-template-columns:1fr}.pg-head{padding:29px 18px 23px}.pg-head h2{font-size:29px}.pg-main{padding:16px}.pg-options,.pg-reassure{padding-left:16px;padding-right:16px}.pg-footer{padding:0 16px 16px}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.id = 'payment-guide';
  section.innerHTML = `
    <div class="pg-wrap">
      <div class="pg-head"><div class="pg-kicker">✓ Secure Payment Guide</div><h2>Choose the Payment Option That Works for You</h2><p>Checkout walks you through the process and shows the payment details for your order. Choose the option you are most comfortable with and carefully follow the information displayed on screen.</p></div>

      <div class="pg-options"><div class="pg-options-title">Available Payment Options</div><div class="pg-option-grid">
        <div class="pg-option"><strong>Bitcoin (BTC)</strong><span>Wallet, Coinbase or Cash App</span></div>
        <div class="pg-option"><strong>Ethereum (ETH)</strong><span>Compatible crypto wallet</span></div>
        <div class="pg-option"><strong>Litecoin (LTC)</strong><span>Compatible crypto wallet</span></div>
        <div class="pg-option"><strong>Tether (USDT)</strong><span>TRC20 when shown at checkout</span></div>
        <div class="pg-option"><strong>Apple Pay</strong><span>Buy crypto through MoonPay when available</span></div>
        <div class="pg-option"><strong>Debit / Credit Card</strong><span>Buy crypto through MoonPay when eligible</span></div>
        <div class="pg-option"><strong>Cash App</strong><span>Send Bitcoin from Cash App</span></div>
        <div class="pg-option"><strong>Coinbase / Private Wallet</strong><span>Send supported crypto you already own</span></div>
      </div></div>

      <div class="pg-reassure"><div class="pg-badge"><strong>Clear checkout details</strong><br>Coin, network, amount and address are shown for you.</div><div class="pg-badge"><strong>No crypto yet? That is okay.</strong><br>MoonPay can provide purchase options when available.</div><div class="pg-badge"><strong>Order updates</strong><br>Confirmed payments move into fulfillment and tracking preparation.</div></div>

      <div class="pg-main">
        <div class="pg-card"><h3>Four Simple Steps</h3><p class="pg-sub">You do not need to calculate the payment details yourself. Use the information on your current checkout screen.</p><div class="pg-route">
          <div class="pg-step"><div class="pg-num">1</div><div><strong>Finish your order</strong><span>Add your products, review the quantities, enter your shipping information and continue to payment.</span></div></div>
          <div class="pg-step"><div class="pg-num">2</div><div><strong>Choose your preferred payment option</strong><span>Select BTC, ETH, LTC or USDT when offered. If you need to purchase crypto first, use an available MoonPay Apple Pay or card option. Bitcoin can also be sent from Cash App.</span></div></div>
          <div class="pg-step"><div class="pg-num">3</div><div><strong>Follow the checkout details</strong><span>Checkout displays the coin, network, payment amount and receiving address. Review these details before sending your transaction.</span></div></div>
          <div class="pg-step"><div class="pg-num">4</div><div><strong>Send payment and keep the checkout available</strong><span>After sending, return to checkout while the transaction is confirmed. Blockchain confirmation times can vary.</span></div></div>
        </div><div class="pg-rule"><strong>Important:</strong> The coin and network must match what checkout displays. Cryptocurrency transactions are generally irreversible, so review the receiving address and network carefully before sending.</div></div>

        <div class="pg-side">
          <div class="pg-choice"><div class="tag">Buying crypto for the first time?</div><h4>Apple Pay or card through MoonPay</h4><p>If available for your location and transaction, MoonPay can let you purchase the selected cryptocurrency using Apple Pay or an eligible debit/credit card. The provider may require identity verification.</p></div>
          <div class="pg-choice"><div class="tag">Already own crypto?</div><h4>Use the wallet you are comfortable with</h4><p>Send supported crypto from Coinbase or another compatible private wallet. For Bitcoin, Cash App may also be used. Checkout provides the receiving information.</p></div>
          <div class="pg-choice"><div class="tag">After you pay</div><h4>Your order moves to fulfillment after confirmation</h4><p>Once payment is successfully confirmed, the order can move into processing. The current fulfillment target is for tracking to be issued within 48 hours after confirmed payment.</p></div>
          <div class="pg-choice"><div class="tag">Need reassurance?</div><h4>Take your time before sending</h4><p>There is no need to rush through the payment screen. Compare the coin, network and receiving address with checkout before approving the transfer in your payment app.</p></div>
        </div>
      </div>

      <div class="pg-footer"><div class="pg-note"><strong>Payment provider note:</strong> MoonPay, Cash App, Coinbase and wallet providers are independent third parties. Their availability, fees, limits, processing times and verification requirements may vary. Your checkout remains the source of truth for the cryptocurrency, network, amount and receiving address for the order.</div></div>
    </div>`;

  const trust = document.querySelector('.trust-bar');
  if (trust) trust.insertAdjacentElement('afterend', section); else document.body.insertBefore(section, document.body.firstChild);
  const navList = document.querySelector('#mainNav ul');
  if (navList && !navList.querySelector('a[href="#payment-guide"]')) { const li=document.createElement('li'); li.innerHTML='<a href="#payment-guide">Payment Guide</a>'; const orderLi=[...navList.children].find(x=>x.textContent.trim()==='Order'); if(orderLi) navList.insertBefore(li,orderLi); else navList.prepend(li); }
})();
