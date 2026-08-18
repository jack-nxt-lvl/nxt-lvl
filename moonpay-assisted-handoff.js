(() => {
  if (window.__nxtMoonpayAssistedLoaded) return;
  window.__nxtMoonpayAssistedLoaded = true;

  const STORE_KEY = 'nxtMoonpayPayment';
  const MAP = {
    btc: { label: 'Bitcoin', url: 'https://www.moonpay.com/buy/btc' },
    eth: { label: 'Ethereum', url: 'https://www.moonpay.com/buy/eth' },
    usdttrc20: { label: 'Tether (USDT)', url: 'https://www.moonpay.com/buy/usdt' }
  };

  const css = document.createElement('style');
  css.textContent = `
    .nxt-moon-assist{position:fixed;inset:0;z-index:1000004;background:rgba(0,0,0,.88);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-moon-assist-card{width:min(620px,94vw);max-height:92vh;overflow:auto;padding:26px;border-radius:20px;border:1px solid rgba(167,139,250,.34);background:radial-gradient(circle at 100% 0%,rgba(124,58,237,.18),transparent 32%),linear-gradient(155deg,#12121b,#090910);box-shadow:0 34px 100px rgba(0,0,0,.76);color:#fff}
    .nxt-moon-assist-kicker{font-size:10px;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;color:#c4b5fd}.nxt-moon-assist-card h2{margin:7px 0 7px;font-size:27px;line-height:1.1}.nxt-moon-assist-card p{margin:0 0 14px;color:#adb5c2;font-size:11px;line-height:1.55}
    .nxt-moon-assist-summary{padding:15px;border:1px solid rgba(167,139,250,.22);border-radius:13px;background:#11111a;margin:13px 0}.nxt-moon-assist-row{display:flex;justify-content:space-between;gap:14px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:11px}.nxt-moon-assist-row:last-child{border-bottom:0}.nxt-moon-assist-row span{color:#9090a1}.nxt-moon-assist-row b{color:#fff;text-align:right;word-break:break-all}
    .nxt-moon-assist-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:13px 0}.nxt-moon-assist-step{padding:11px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:rgba(255,255,255,.025);font-size:9.5px;line-height:1.45;color:#a8afbc}.nxt-moon-assist-step b{display:block;color:#c4b5fd;margin-bottom:3px}
    .nxt-moon-assist-note{padding:11px 12px;border:1px solid rgba(59,130,246,.22);border-radius:10px;background:rgba(37,99,235,.08);color:#bfdbfe;font-size:10px;line-height:1.5;margin-bottom:12px}
    .nxt-moon-assist-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.nxt-moon-assist-actions button{min-height:46px;border-radius:10px;font-weight:850;cursor:pointer}.nxt-moon-open{border:0;background:linear-gradient(100deg,#2563eb,#7c3aed,#9333ea);color:#fff}.nxt-moon-copy{border:1px solid rgba(255,255,255,.10);background:#242431;color:#ddd}.nxt-moon-close{width:100%;min-height:44px;margin-top:8px;border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#191922;color:#aaa;font-weight:800;cursor:pointer}
    @media(max-width:650px){.nxt-moon-assist-steps,.nxt-moon-assist-actions{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);

  function details(){
    const d = window.nxtCheckoutDetails || {};
    const total = Number(d.total || 0);
    return { total, customer: d.customer || {}, fulfillment: d.fulfillment || '', shipping: Number(d.shipping || 0) };
  }

  function moonCodeFromHref(href){
    const h = String(href || '').toLowerCase();
    if (h.includes('/buy/btc')) return 'btc';
    if (h.includes('/buy/eth')) return 'eth';
    if (h.includes('/buy/usdt')) return 'usdttrc20';
    return '';
  }

  function save(payload){
    try { sessionStorage.setItem(STORE_KEY, JSON.stringify(payload)); } catch (_) {}
  }
  function load(){
    try { return JSON.parse(sessionStorage.getItem(STORE_KEY) || 'null'); } catch (_) { return null; }
  }

  async function copy(text){
    try { if (navigator.clipboard) { await navigator.clipboard.writeText(String(text || '')); return true; } } catch (_) {}
    return false;
  }

  function overlayFor(payload){
    document.querySelector('.nxt-moon-assist')?.remove();
    const o = document.createElement('div');
    o.className = 'nxt-moon-assist';
    const cfg = MAP[payload.payCurrency] || { label: payload.payCurrency.toUpperCase(), url: '#' };
    o.innerHTML = `<div class="nxt-moon-assist-card">
      <div class="nxt-moon-assist-kicker">Payment details saved</div>
      <h2>Your ${cfg.label} payment is ready</h2>
      <p>We saved this order in your browser so you can open MoonPay and come back without losing the payment details.</p>
      <div class="nxt-moon-assist-summary">
        <div class="nxt-moon-assist-row"><span>Order total</span><b>$${Number(payload.orderTotal).toFixed(2)}</b></div>
        <div class="nxt-moon-assist-row"><span>Exact crypto needed</span><b>${payload.payAmount} ${String(payload.payCurrency).toUpperCase()}</b></div>
        <div class="nxt-moon-assist-row"><span>Receiving address</span><b>${payload.payAddress}</b></div>
        <div class="nxt-moon-assist-row"><span>Payment ID</span><b>${payload.paymentId || ''}</b></div>
      </div>
      <div class="nxt-moon-assist-note">The receiving address is copied automatically when possible. In MoonPay, choose the same coin and make sure the purchased crypto is delivered to this exact address. MoonPay fees can affect how much you spend in dollars, so use the exact crypto amount above as the target amount to receive.</div>
      <div class="nxt-moon-assist-steps">
        <div class="nxt-moon-assist-step"><b>1. Open MoonPay</b>Buy the same coin using Apple Pay or an eligible card.</div>
        <div class="nxt-moon-assist-step"><b>2. Use saved destination</b>Paste the copied receiving address when MoonPay asks where to send the crypto.</div>
        <div class="nxt-moon-assist-step"><b>3. Return here</b>Your payment ID stays saved and checkout can continue checking confirmation.</div>
      </div>
      <div class="nxt-moon-assist-actions"><button type="button" class="nxt-moon-open">Open MoonPay →</button><button type="button" class="nxt-moon-copy">Copy Address Again</button></div>
      <button type="button" class="nxt-moon-close">Keep Checkout Open</button>
    </div>`;
    document.body.appendChild(o);
    o.querySelector('.nxt-moon-open').onclick = async () => { await copy(payload.payAddress); window.open(cfg.url, '_blank', 'noopener,noreferrer'); };
    o.querySelector('.nxt-moon-copy').onclick = async e => { const ok = await copy(payload.payAddress); e.currentTarget.textContent = ok ? 'Address Copied ✓' : 'Select address above to copy'; };
    o.querySelector('.nxt-moon-close').onclick = () => o.remove();
    return o;
  }

  async function prepare(payCurrency){
    const d = details();
    if (!d.total) { alert('Unable to read the order total. Please return to checkout and try again.'); return; }
    const cfg = MAP[payCurrency];
    if (!cfg) return;

    const loading = document.createElement('div');
    loading.className = 'nxt-moon-assist';
    loading.innerHTML = '<div class="nxt-moon-assist-card" style="text-align:center"><h2>Preparing secure payment…</h2><p>Creating the exact crypto amount and receiving address for this order.</p></div>';
    document.body.appendChild(loading);
    try {
      const res = await fetch('/api/create-nowpayment', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ amount:d.total, payCurrency, orderId:'NXT-'+Date.now(), description:'NXT LVL Research order' }) });
      let data = {}; try { data = await res.json(); } catch (_) {}
      loading.remove();
      if (!res.ok || !data.pay_address || !data.pay_amount) { alert(data.message || data.error || 'Unable to prepare payment. Please try again.'); return; }
      const payload = {
        savedAt: Date.now(), payCurrency, orderTotal: d.total,
        payAmount: data.pay_amount, payAddress: data.pay_address,
        paymentId: data.payment_id || '', customer: d.customer,
        fulfillment: d.fulfillment, shipping: d.shipping
      };
      save(payload);
      await copy(payload.payAddress);
      overlayFor(payload);
    } catch (err) {
      loading.remove();
      console.error('MoonPay assisted handoff:', err);
      alert('Unable to prepare the MoonPay handoff. Please try again.');
    }
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('a.nxt-pay-row[href*="moonpay.com/buy/"]');
    if (!link) return;
    const code = moonCodeFromHref(link.href);
    if (!code) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
    prepare(code);
  }, true);

  window.addEventListener('focus', () => {
    const p = load();
    if (p && Date.now() - Number(p.savedAt || 0) < 60 * 60 * 1000 && !document.querySelector('.nxt-moon-assist')) overlayFor(p);
  });
})();
