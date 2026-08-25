(() => {
  if (window.__nxtDirectWalletCheckoutLoaded) return;
  window.__nxtDirectWalletCheckoutLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    .nxt-wallet-overlay,.nxt-wallet-chooser,.nxt-wallet-loading{position:fixed;inset:0;z-index:1000015;background:rgba(2,2,7,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    .nxt-wallet-card{width:min(540px,96vw);max-height:96vh;overflow:auto;border:1px solid rgba(167,139,250,.30);border-radius:22px;background:radial-gradient(circle at 100% 0,rgba(124,58,237,.20),transparent 36%),linear-gradient(155deg,#14141e,#09090f 70%);box-shadow:0 38px 120px rgba(0,0,0,.82);color:#fff}.nxt-wallet-card button:focus-visible,.nxt-wallet-card a:focus-visible,.nxt-wallet-resume button:focus-visible{outline:3px solid rgba(125,211,252,.48);outline-offset:2px}
    .nxt-wallet-pad{padding:26px}.nxt-wallet-kicker{font-size:9px;font-weight:900;letter-spacing:1.7px;text-transform:uppercase;color:#a78bfa}.nxt-wallet-card h2{margin:6px 0 7px;font-size:27px;line-height:1.12}.nxt-wallet-card p{margin:0;color:#a1a1b2;font-size:11px;line-height:1.55}
    .nxt-wallet-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:17px 0}.nxt-wallet-trust div{padding:9px 7px;border:1px solid rgba(255,255,255,.07);border-radius:10px;background:rgba(255,255,255,.025);text-align:center;color:#b9bdc8;font-size:8.5px;line-height:1.35}.nxt-wallet-trust b{display:block;color:#fff;font-size:9px;margin-bottom:2px}
    .nxt-wallet-funding-intro{margin:15px 0;padding:14px;border:1px solid rgba(96,165,250,.36);border-radius:14px;background:linear-gradient(135deg,rgba(37,99,235,.15),rgba(124,58,237,.12));box-shadow:inset 0 1px rgba(255,255,255,.04)}.nxt-wallet-funding-intro-head{display:flex;align-items:flex-start;gap:10px;margin-bottom:11px}.nxt-wallet-funding-intro-icon{width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;border-radius:11px;background:linear-gradient(135deg,#2563eb,#7c3aed);font-size:18px;box-shadow:0 8px 20px rgba(37,99,235,.25)}.nxt-wallet-funding-intro strong{display:block;color:#fff;font-size:13px;line-height:1.25}.nxt-wallet-funding-intro-head span:last-child{display:block;margin-top:3px;color:#b9c6d8;font-size:9px;line-height:1.45}.nxt-wallet-funding-intro ol{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin:0;padding:0;list-style:none;counter-reset:nxtFunding}.nxt-wallet-funding-intro li{position:relative;min-height:42px;padding:9px 9px 9px 34px;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(3,7,18,.28);color:#e5efff;font-size:9px;font-weight:750;line-height:1.42;counter-increment:nxtFunding}.nxt-wallet-funding-intro li:before{content:counter(nxtFunding);position:absolute;left:8px;top:9px;width:18px;height:18px;display:grid;place-items:center;border-radius:50%;background:#2563eb;color:#fff;font-size:8px;font-weight:950}.nxt-wallet-funding-intro-note{display:block;margin-top:9px;color:#93a4ba;font-size:8px;line-height:1.45}.nxt-wallet-funding-more{display:flex;min-height:34px;align-items:center;justify-content:center;margin-top:9px;border:1px solid rgba(125,211,252,.18);border-radius:8px;background:rgba(14,165,233,.07);color:#c8edff;text-decoration:none;font-size:8px;font-weight:850}.nxt-wallet-funding-more:hover{border-color:rgba(125,211,252,.34);background:rgba(14,165,233,.12)}
    .nxt-wallet-coins{display:grid;gap:10px}.nxt-wallet-coin{position:relative;width:100%;display:flex;align-items:center;gap:13px;padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:linear-gradient(145deg,#1a1a24,#12121a);color:#fff;text-align:left;cursor:pointer;transition:.18s}.nxt-wallet-coin:hover{transform:translateY(-1px);border-color:#8b5cf6;background:rgba(124,58,237,.12)}.nxt-wallet-icon{width:44px;height:44px;flex:0 0 44px;border-radius:50%;display:grid;place-items:center;font-size:19px;font-weight:900}.nxt-wallet-icon.btc{background:#f7931a}.nxt-wallet-icon.eth{background:#627eea}.nxt-wallet-icon.usdt{background:#26a17b}.nxt-wallet-coin strong{display:block;font-size:13px}.nxt-wallet-coin small{display:block;margin-top:2px;color:#9ca3af;font-size:9px}.nxt-wallet-arrow{margin-left:auto;color:#c4b5fd;font-size:20px}.nxt-wallet-badge{position:absolute;right:38px;top:11px;padding:3px 6px;border-radius:999px;border:1px solid rgba(52,211,153,.25);background:rgba(16,185,129,.08);color:#6ee7b7;font-size:7px;font-weight:900;letter-spacing:.5px}
    .nxt-pay-paths{display:grid;gap:10px;margin:18px 0 0}.nxt-pay-path{position:relative;width:100%;display:flex;align-items:center;gap:13px;min-height:82px;padding:15px;border:1px solid rgba(255,255,255,.10);border-radius:15px;background:#171721;color:#fff;text-align:left;cursor:pointer;transition:transform .18s,border-color .18s,background .18s}.nxt-pay-path:hover{transform:translateY(-1px);border-color:rgba(125,211,252,.42)}.nxt-pay-path.card{border-color:rgba(96,165,250,.42);background:linear-gradient(125deg,rgba(37,99,235,.22),rgba(124,58,237,.16));box-shadow:0 14px 34px rgba(37,99,235,.14)}.nxt-pay-path-icon{width:46px;height:46px;flex:0 0 46px;display:grid;place-items:center;border-radius:13px;background:linear-gradient(135deg,#2563eb,#7c3aed);font-size:21px}.nxt-pay-path.wallet .nxt-pay-path-icon{background:linear-gradient(135deg,#059669,#047857)}.nxt-pay-path-copy{min-width:0}.nxt-pay-path-copy strong{display:block;font-size:14px;line-height:1.25}.nxt-pay-path-copy small{display:block;margin-top:4px;color:#abb7ca;font-size:9px;line-height:1.45}.nxt-pay-path-tag{position:absolute;right:13px;top:11px;padding:4px 7px;border-radius:999px;background:rgba(59,130,246,.20);color:#bfdbfe;font-size:6.5px;font-weight:950;letter-spacing:.55px;text-transform:uppercase}.nxt-pay-path-arrow{margin-left:auto;color:#c9d7eb;font-size:20px}.nxt-existing-coins{display:none;margin-top:10px;padding:12px;border:1px solid rgba(52,211,153,.20);border-radius:14px;background:rgba(16,185,129,.045)}.nxt-existing-coins.show{display:block}.nxt-existing-coins>strong{display:block;margin:1px 2px 9px;color:#d9fff0;font-size:10px}.nxt-easy-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:13px}.nxt-easy-trust span{padding:9px 7px;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(255,255,255,.025);color:#aeb8c8;text-align:center;font-size:8px;line-height:1.4}.nxt-easy-trust b{display:block;color:#fff;font-size:8.5px;margin-bottom:2px}
    .nxt-wallet-cancel{width:100%;margin-top:13px;min-height:44px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:#20202a;color:#aaa;font-weight:800;cursor:pointer}.nxt-wallet-note{margin-top:12px!important;text-align:center;font-size:9px!important;color:#777b88!important}
    .nxt-wallet-loading{z-index:1000017}.nxt-wallet-loadbox{width:min(420px,92vw);padding:30px;border-radius:20px;border:1px solid rgba(167,139,250,.25);background:#111118;color:#fff;text-align:center;box-shadow:0 30px 90px rgba(0,0,0,.7)}.nxt-wallet-spin{width:44px;height:44px;margin:0 auto 15px;border-radius:50%;border:3px solid rgba(255,255,255,.12);border-top-color:#a78bfa;animation:nxtWalletSpin .75s linear infinite}@keyframes nxtWalletSpin{to{transform:rotate(360deg)}}.nxt-wallet-loadbox h3{margin:0 0 6px}.nxt-wallet-loadbox p{color:#9ca3af;font-size:10px;margin:0}
    .nxt-wallet-pay{width:min(860px,97vw)}.nxt-wallet-head{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.09);background:linear-gradient(100deg,#171722,#0f0f17)}.nxt-wallet-head-main{display:flex;align-items:center;gap:12px;min-width:0}.nxt-wallet-headcoin{width:42px;height:42px;flex:0 0 42px;display:grid;place-items:center;border-radius:50%;color:#fff;font-size:20px;font-weight:950;box-shadow:0 8px 24px rgba(0,0,0,.28)}.nxt-wallet-pay[data-asset="BTC"] .nxt-wallet-headcoin{background:linear-gradient(145deg,#ffab37,#f7931a)}.nxt-wallet-pay[data-asset="ETH"] .nxt-wallet-headcoin{background:linear-gradient(145deg,#7f95ff,#5369d8)}.nxt-wallet-pay[data-asset="USDT"] .nxt-wallet-headcoin{background:linear-gradient(145deg,#37bd96,#1e8f6f)}.nxt-wallet-head-copy{min-width:0}.nxt-wallet-head-copy strong{display:block;font-size:16px;line-height:1.25}.nxt-wallet-head-copy span{display:block;color:#a4a7b3;font-size:10px;margin-top:4px;overflow-wrap:anywhere}.nxt-wallet-head-actions{display:flex;align-items:center;gap:9px}.nxt-wallet-secure{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid rgba(52,211,153,.18);border-radius:999px;background:rgba(16,185,129,.07);color:#a7f3d0;font-size:8px;font-weight:900;white-space:nowrap}.nxt-wallet-secure:before{content:'';width:6px;height:6px;border-radius:50%;background:#34d399;box-shadow:0 0 0 4px rgba(52,211,153,.10)}.nxt-wallet-close{width:40px;height:40px;flex:0 0 40px;border:1px solid rgba(255,255,255,.11);border-radius:11px;background:#242430;color:#fff;font-size:21px;cursor:pointer;transition:background .18s,transform .18s}.nxt-wallet-close:hover{background:#30303d;transform:translateY(-1px)}.nxt-wallet-body{padding:21px;display:grid;grid-template-columns:268px 1fr;gap:21px}.nxt-wallet-qr{background:#fff;border-radius:17px;padding:13px;align-self:start;text-align:center;box-shadow:0 18px 42px rgba(0,0,0,.24)}.nxt-wallet-qr img{display:block;width:100%;height:auto}.nxt-wallet-qr small{display:block;color:#4f5260;font-size:9px;font-weight:900;margin-top:8px;letter-spacing:.25px}.nxt-wallet-order{display:grid;gap:12px}.nxt-wallet-summary{display:flex;justify-content:space-between;gap:12px;padding:11px 13px;border:1px solid rgba(255,255,255,.085);border-radius:11px;background:rgba(255,255,255,.028);font-size:11px;color:#b1b1bb}.nxt-wallet-summary b{color:#fff}.nxt-wallet-field{padding:14px;border:1px solid rgba(255,255,255,.095);border-radius:12px;background:#15151e}.nxt-wallet-label{font-size:9px;font-weight:900;letter-spacing:1px;text-transform:uppercase;color:#9a9baa;margin-bottom:8px}.nxt-wallet-copyline{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:center}.nxt-wallet-value{min-width:0;color:#fff;font:800 14px ui-monospace,SFMono-Regular,Menlo,monospace;overflow-wrap:anywhere}.nxt-wallet-value.amount{font-size:21px;color:#d0c2ff}.nxt-wallet-copy{border:1px solid rgba(167,139,250,.30);border-radius:9px;background:rgba(124,58,237,.13);color:#e1d8ff;font-size:10px;font-weight:850;padding:10px;cursor:pointer;transition:.18s}.nxt-wallet-copy:hover{border-color:rgba(167,139,250,.48);background:rgba(124,58,237,.19)}.nxt-wallet-copy.copied{border-color:rgba(52,211,153,.55);background:rgba(16,185,129,.16);color:#86efac}
    .nxt-wallet-local{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;border:1px solid rgba(167,139,250,.16);border-radius:10px;background:rgba(124,58,237,.055);font-size:9px;color:#a9a9b8}.nxt-wallet-local b{display:block;color:#fff;font-size:11px}.nxt-wallet-local span:last-child{text-align:right;color:#c4b5fd;font-weight:850}
    .nxt-wallet-next{display:flex;align-items:center;gap:11px;padding:13px;border:1px solid rgba(96,165,250,.34);border-radius:12px;background:linear-gradient(120deg,rgba(37,99,235,.15),rgba(124,58,237,.10));color:#d9ebff}.nxt-wallet-next-icon{width:34px;height:34px;flex:0 0 34px;display:grid;place-items:center;border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);font-size:16px}.nxt-wallet-next strong{display:block;color:#fff;font-size:11px}.nxt-wallet-next span{display:block;margin-top:3px;color:#aabbd0;font-size:8.5px;line-height:1.4}.nxt-wallet-pay[data-intent="buy"] .nxt-wallet-body{grid-template-columns:1fr;max-width:700px;margin:0 auto}.nxt-wallet-pay[data-intent="buy"] .nxt-wallet-qr{display:none}.nxt-wallet-pay[data-intent="buy"] .nxt-wallet-actions{grid-template-columns:1.55fr 1fr}.nxt-wallet-pay[data-intent="buy"] .nxt-wallet-actions .buy{order:-2}.nxt-wallet-pay[data-intent="buy"] .nxt-wallet-actions .primary{order:-1;background:#222f2b;border:1px solid rgba(52,211,153,.23);box-shadow:none}.nxt-wallet-pay[data-intent="buy"] .nxt-wallet-actions .tool{display:none}
    .nxt-wallet-buy-help{padding:0 11px;border:1px solid rgba(96,165,250,.18);border-radius:10px;background:rgba(37,99,235,.035)}.nxt-wallet-buy-help summary{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:40px;color:#b9c7d8;font-size:9px;font-weight:850;cursor:pointer;list-style:none}.nxt-wallet-buy-help summary::-webkit-details-marker{display:none}.nxt-wallet-buy-help summary:after{content:'+';color:#8bdcff;font-size:16px}.nxt-wallet-buy-help[open] summary:after{content:'−'}.nxt-wallet-buy-help-content{padding:0 0 11px}.nxt-wallet-buy-steps{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin:0 0 10px}.nxt-wallet-buy-step{min-width:0;padding:9px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(3,7,18,.28);color:#e1efff;font-size:9px;font-weight:850;line-height:1.35}.nxt-wallet-buy-step b{width:20px;height:20px;display:grid;place-items:center;margin-bottom:5px;border-radius:50%;background:#2563eb;color:#fff;font-size:8px}.nxt-wallet-buy-step small{display:block;margin-top:4px;color:#94a0b4;font-size:8px;font-weight:600;line-height:1.4}.nxt-wallet-buy-tools{display:grid;grid-template-columns:1fr auto;gap:9px;align-items:center;margin-top:8px;padding:9px 10px;border:1px solid rgba(255,255,255,.08);border-radius:9px;background:rgba(3,7,18,.24)}.nxt-wallet-buy-tools span{color:#b0bacb;font-size:8px;line-height:1.45}.nxt-wallet-buy-tools b{display:block;color:#e0f2fe;font-size:9px}.nxt-wallet-buy-copy{min-height:36px;padding:0 11px;border:1px solid rgba(125,211,252,.30);border-radius:8px;background:rgba(14,165,233,.12);color:#d5f2ff;font:850 9px Inter,sans-serif;cursor:pointer}.nxt-wallet-buy-copy.copied{border-color:rgba(52,211,153,.5);background:rgba(16,185,129,.15);color:#86efac}.nxt-wallet-buy-note{display:block;margin-top:8px;color:#9aa6b8;font-size:8px;line-height:1.5;text-align:center}.nxt-wallet-buy-note b{display:inline;color:#c9efff}.nxt-wallet-buy-status{display:none;margin-top:9px;padding:10px 11px;border-radius:9px;background:rgba(16,185,129,.11);color:#b5f7d8;font-size:10px;font-weight:700;line-height:1.5}.nxt-wallet-buy-status.show{display:block}.nxt-wallet-buy-status.bad{background:rgba(239,68,68,.10);color:#ffd1d1}.nxt-wallet-buy-fallback{display:flex;margin-top:8px;min-height:42px;align-items:center;justify-content:center;border:1px solid rgba(248,113,113,.30);border-radius:9px;background:rgba(127,29,29,.16);color:#fecaca;text-decoration:none;font-size:10px;font-weight:900}.nxt-wallet-buy-fallback[hidden]{display:none}.nxt-wallet-existing{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#9295a3;font-size:9px}.nxt-wallet-existing b{color:#d0d1d9;font-size:10px}
    .nxt-swaps-layer{position:fixed;inset:0;z-index:1000040;pointer-events:none;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.nxt-swaps-layer.open{pointer-events:auto}.nxt-swaps-backdrop{position:absolute;inset:0;border:0;background:rgba(2,2,7,.68);opacity:0;transition:opacity .22s ease}.nxt-swaps-layer.open .nxt-swaps-backdrop{opacity:1}.nxt-swaps-drawer{position:absolute;inset:0 0 0 auto;width:min(570px,96vw);display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;overflow:hidden;border-left:1px solid rgba(125,211,252,.24);background:#0c0c13;color:#fff;box-shadow:-28px 0 90px rgba(0,0,0,.72);transform:translateX(102%);transition:transform .24s ease}.nxt-swaps-layer.open .nxt-swaps-drawer{transform:translateX(0)}.nxt-swaps-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 16px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(115deg,#151725,#101018)}.nxt-swaps-brand{display:flex;align-items:center;gap:11px;min-width:0}.nxt-swaps-brand-icon{width:40px;height:40px;flex:0 0 40px;display:grid;place-items:center;border-radius:12px;background:linear-gradient(135deg,#2563eb,#7c3aed);font-size:19px;box-shadow:0 8px 22px rgba(37,99,235,.24)}.nxt-swaps-brand strong{display:block;font-size:14px;line-height:1.25}.nxt-swaps-brand span{display:block;margin-top:3px;color:#aab4c4;font-size:9px}.nxt-swaps-close{width:42px;height:42px;flex:0 0 42px;border:1px solid rgba(255,255,255,.11);border-radius:11px;background:#242430;color:#fff;font-size:22px;cursor:pointer}.nxt-swaps-guide{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(135deg,rgba(37,99,235,.10),rgba(124,58,237,.08))}.nxt-swaps-guide-title{display:flex;justify-content:space-between;gap:10px;color:#dff4ff;font-size:10px;font-weight:900}.nxt-swaps-guide-title span:last-child{color:#8bdcff}.nxt-swaps-guide ol{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:9px 0 0;padding:0;list-style:none;counter-reset:nxtSwaps}.nxt-swaps-guide li{position:relative;padding:8px 7px 8px 28px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(3,7,18,.26);color:#c8d3e2;font-size:8px;line-height:1.4;counter-increment:nxtSwaps}.nxt-swaps-guide li:before{content:counter(nxtSwaps);position:absolute;left:7px;top:8px;width:15px;height:15px;display:grid;place-items:center;border-radius:50%;background:#2563eb;color:#fff;font-size:7px;font-weight:950}.nxt-swaps-frame-wrap{position:relative;min-height:0;background:#fff}.nxt-swaps-frame{display:block;width:100%;height:100%;border:0;background:#fff}.nxt-swaps-loading{position:absolute;inset:0;z-index:1;display:grid;place-items:center;background:#11121a;color:#d9e8ff;font-size:11px;font-weight:850;transition:opacity .2s}.nxt-swaps-loading.hidden{opacity:0;pointer-events:none}.nxt-swaps-footer{display:flex;align-items:center;justify-content:space-between;gap:11px;padding:10px 13px;border-top:1px solid rgba(255,255,255,.08);background:#111119}.nxt-swaps-footer span{color:#9da7b7;font-size:8px;line-height:1.45}.nxt-swaps-footer a{flex:0 0 auto;color:#c6eaff;font-size:8px;font-weight:850;text-decoration:none}.nxt-swaps-close:focus-visible,.nxt-swaps-footer a:focus-visible{outline:3px solid rgba(125,211,252,.45);outline-offset:2px}
    .nxt-swaps-launch-pane{min-height:0;overflow:auto;display:grid;align-content:center;justify-items:center;padding:26px 22px;text-align:center;background:radial-gradient(circle at 50% 0,rgba(37,99,235,.17),transparent 46%),#0c0c13}.nxt-swaps-launch-icon{width:66px;height:66px;display:grid;place-items:center;border:1px solid rgba(125,211,252,.28);border-radius:20px;background:linear-gradient(135deg,rgba(37,99,235,.24),rgba(124,58,237,.22));font-size:29px;box-shadow:0 18px 40px rgba(37,99,235,.16)}.nxt-swaps-launch-pane h3{margin:16px 0 7px;font-size:20px}.nxt-swaps-launch-pane>p{max-width:430px;margin:0;color:#aeb9c9;font-size:10px;line-height:1.6}.nxt-swaps-launch-facts{width:100%;display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:18px 0 14px}.nxt-swaps-launch-facts span{padding:10px 7px;border:1px solid rgba(255,255,255,.075);border-radius:9px;background:rgba(255,255,255,.025);color:#cbd8e8;font-size:8px;line-height:1.4}.nxt-swaps-launch-facts b{display:block;color:#fff;font-size:9px;margin-bottom:3px}.nxt-swaps-launch-main{width:100%;min-height:54px;border:0;border-radius:12px;background:linear-gradient(100deg,#2563eb,#0ea5e9 52%,#7c3aed);color:#fff;font:900 12px Inter,sans-serif;cursor:pointer;box-shadow:0 14px 32px rgba(37,99,235,.25)}.nxt-swaps-launch-status{display:none;width:100%;margin-top:10px;padding:10px;border-radius:9px;background:rgba(16,185,129,.10);color:#b9f7dc;font-size:9px;line-height:1.5}.nxt-swaps-launch-status.show{display:block}.nxt-swaps-launch-status.bad{background:rgba(239,68,68,.10);color:#ffd0d0}.nxt-swaps-launch-fallback{display:flex;width:100%;min-height:42px;margin-top:9px;align-items:center;justify-content:center;border:1px solid rgba(248,113,113,.28);border-radius:9px;background:rgba(127,29,29,.15);color:#fecaca;text-decoration:none;font-size:9px;font-weight:900}.nxt-swaps-launch-fallback[hidden]{display:none}.nxt-swaps-launch-main:focus-visible,.nxt-swaps-launch-fallback:focus-visible{outline:3px solid rgba(125,211,252,.45);outline-offset:2px}
    .nxt-wallet-existing{gap:12px;padding:11px 12px;border:1px solid rgba(52,211,153,.18);border-radius:11px;background:rgba(16,185,129,.055)}.nxt-wallet-existing div{min-width:0}.nxt-wallet-existing b{display:block;color:#e8fff5;font-size:11px}.nxt-wallet-existing span{display:block;margin-top:3px;color:#9caaa5;font-size:8.5px;line-height:1.45}.nxt-wallet-existing em{flex:0 0 auto;padding:4px 7px;border-radius:999px;background:rgba(16,185,129,.12);color:#9cf2cc;font-size:7px;font-weight:900;font-style:normal;letter-spacing:.45px;text-transform:uppercase}
    .nxt-wallet-usdt-buy{padding:14px;border:1px solid rgba(96,165,250,.42);border-radius:14px;background:radial-gradient(circle at 100% 0,rgba(124,58,237,.24),transparent 46%),linear-gradient(135deg,rgba(37,99,235,.20),rgba(14,165,233,.10));box-shadow:0 14px 34px rgba(37,99,235,.13),inset 0 1px rgba(255,255,255,.05)}.nxt-wallet-usdt-buy-head{display:flex;align-items:center;gap:10px;margin-bottom:11px}.nxt-wallet-usdt-buy-icon{width:38px;height:38px;flex:0 0 38px;display:grid;place-items:center;border-radius:11px;background:linear-gradient(145deg,#37bd96,#1e8f6f);color:#fff;font-size:18px;font-weight:950;box-shadow:0 8px 20px rgba(30,143,111,.25)}.nxt-wallet-usdt-buy-copy{min-width:0;flex:1}.nxt-wallet-usdt-buy-copy b{display:block;color:#fff;font-size:13px;line-height:1.25}.nxt-wallet-usdt-buy-copy span{display:block;margin-top:3px;color:#bed4e8;font-size:8.5px;line-height:1.45}.nxt-wallet-usdt-buy-badge{flex:0 0 auto;padding:4px 7px;border-radius:999px;border:1px solid rgba(125,211,252,.22);background:rgba(14,165,233,.10);color:#bfeaff;font-size:6.5px;font-weight:950;font-style:normal;letter-spacing:.5px;text-transform:uppercase}.nxt-wallet-usdt-buy-main{min-height:54px;display:flex;align-items:center;justify-content:center;padding:10px 13px;border:0;border-radius:11px;background:linear-gradient(100deg,#2563eb,#0ea5e9 52%,#7c3aed);box-shadow:0 12px 28px rgba(37,99,235,.24);color:#fff;text-align:center;text-decoration:none;font:900 11.5px/1.35 Inter,sans-serif;transition:transform .18s,filter .18s}.nxt-wallet-usdt-buy-main:hover{transform:translateY(-1px);filter:brightness(1.06)}.nxt-wallet-usdt-buy-main[aria-disabled="true"]{opacity:.45;cursor:not-allowed;pointer-events:none}.nxt-wallet-usdt-buy-meta{display:grid;grid-template-columns:repeat(2,1fr);gap:7px;margin-top:9px}.nxt-wallet-usdt-buy-meta span{padding:8px 9px;border:1px solid rgba(255,255,255,.07);border-radius:8px;background:rgba(3,7,18,.25);color:#aebed0;font-size:7.5px;line-height:1.4}.nxt-wallet-usdt-buy-meta b{display:block;margin-bottom:2px;color:#e8f7ff;font-size:8px}
    .nxt-wallet-apps{padding:0 11px;border:1px solid rgba(167,139,250,.14);border-radius:10px;background:rgba(124,58,237,.035)}.nxt-wallet-apps>summary{display:flex;min-height:40px;align-items:center;justify-content:space-between;gap:10px;color:#cfc7e5;font-size:8.5px;font-weight:850;cursor:pointer;list-style:none}.nxt-wallet-apps>summary::-webkit-details-marker{display:none}.nxt-wallet-apps>summary:after{content:'+';color:#bca8ff;font-size:16px}.nxt-wallet-apps[open]>summary:after{content:'−'}.nxt-wallet-apps-content{padding:0 0 10px}.nxt-wallet-apps-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:9px}.nxt-wallet-apps-head span{display:block;color:#9497a6;font-size:8px;line-height:1.4}.nxt-wallet-apps-head em{flex:0 0 auto;padding:4px 7px;border-radius:999px;background:rgba(16,185,129,.10);color:#9cf2cc;font-size:7px;font-weight:900;font-style:normal;text-transform:uppercase}.nxt-wallet-apps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.nxt-wallet-app-link{min-width:0;min-height:42px;display:flex;align-items:center;gap:7px;padding:7px 8px;border:1px solid rgba(255,255,255,.075);border-radius:9px;background:rgba(255,255,255,.025);color:#e9e8f0;text-decoration:none;font-size:8px;font-weight:850;line-height:1.25}.nxt-wallet-app-link i{width:23px;height:23px;flex:0 0 23px;display:grid;place-items:center;border-radius:7px;background:linear-gradient(145deg,#6d28d9,#2563eb);color:#fff;font-size:8px;font-weight:950;font-style:normal}.nxt-wallet-app-link:hover{border-color:rgba(167,139,250,.32);background:rgba(124,58,237,.09)}.nxt-wallet-apps-guide{display:flex;min-height:32px;align-items:center;justify-content:center;margin-top:7px;color:#c9bfff;text-decoration:none;font-size:8px;font-weight:850}.nxt-wallet-app-link:focus-visible,.nxt-wallet-apps-guide:focus-visible{outline:3px solid rgba(167,139,250,.42);outline-offset:2px}
    .nxt-wallet-progress{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.nxt-wallet-step{padding:8px 5px;border:1px solid rgba(255,255,255,.075);border-radius:8px;background:rgba(255,255,255,.026);color:#717486;text-align:center;font-size:8px;font-weight:850;letter-spacing:.2px}.nxt-wallet-step.active{border-color:rgba(167,139,250,.38);background:rgba(124,58,237,.13);color:#e5deff}.nxt-wallet-step.complete{border-color:rgba(52,211,153,.30);background:rgba(16,185,129,.10);color:#94f0c7}
    .nxt-wallet-warning{padding:11px 12px;border:1px solid rgba(251,191,36,.28);border-radius:10px;background:rgba(245,158,11,.075);color:#ffe7a6;font-size:10px;line-height:1.5}.nxt-wallet-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.nxt-wallet-actions a,.nxt-wallet-actions button{min-height:42px;border-radius:10px;border:1px solid rgba(255,255,255,.105);display:flex;align-items:center;justify-content:center;text-align:center;text-decoration:none;background:#242432;color:#fff;font:850 9.5px Inter,sans-serif;cursor:pointer;padding:9px;transition:transform .18s,background .18s}.nxt-wallet-actions a:hover,.nxt-wallet-actions button:hover{transform:translateY(-1px);background:#2d2d3d}.nxt-wallet-actions .primary,.nxt-wallet-actions .buy{min-height:58px;border:0;color:#fff;font-size:11px;line-height:1.35}.nxt-wallet-actions .primary{background:linear-gradient(100deg,#059669,#10b981 55%,#047857);box-shadow:0 12px 27px rgba(5,150,105,.20)}.nxt-wallet-actions .buy{background:linear-gradient(100deg,#2563eb,#0ea5e9 52%,#7c3aed);box-shadow:0 12px 27px rgba(37,99,235,.22)}.nxt-wallet-actions [hidden]{display:none}.nxt-wallet-actions [disabled],.nxt-wallet-actions [aria-disabled="true"]{opacity:.45;cursor:not-allowed;pointer-events:none}
    .nxt-wallet-verify{padding:0 12px;border:1px solid rgba(52,211,153,.14);border-radius:10px;background:rgba(16,185,129,.035)}.nxt-wallet-verify>summary{display:flex;min-height:40px;align-items:center;justify-content:space-between;gap:10px;color:#a9c8bb;font-size:8.5px;font-weight:850;cursor:pointer;list-style:none}.nxt-wallet-verify>summary::-webkit-details-marker{display:none}.nxt-wallet-verify>summary:after{content:'+';color:#6ee7b7;font-size:16px}.nxt-wallet-verify[open]>summary:after{content:'−'}.nxt-wallet-verify-content{padding:0 0 12px}.nxt-wallet-verify label{display:block;color:#d1fae5;font-size:9px;font-weight:850;margin-bottom:7px}.nxt-wallet-verifyrow{display:grid;grid-template-columns:1fr auto;gap:8px}.nxt-wallet-verify input{min-width:0;height:43px;border:1px solid rgba(255,255,255,.1);border-radius:9px;background:#0d0d14;color:#fff;padding:0 11px;font:10px ui-monospace,SFMono-Regular,Menlo,monospace}.nxt-wallet-verify button{border:0;border-radius:9px;background:#059669;color:#fff;font-size:9px;font-weight:900;padding:0 13px;cursor:pointer}.nxt-wallet-status{display:none;margin-top:9px;padding:9px 10px;border-radius:8px;background:rgba(255,255,255,.04);color:#c7c7d1;font-size:9.5px;line-height:1.45}.nxt-wallet-status.show{display:block}.nxt-wallet-status.good{display:block;color:#a7f3d0;background:rgba(16,185,129,.09)}.nxt-wallet-status.bad{color:#fecaca;background:rgba(239,68,68,.08)}.nxt-wallet-fine{font-size:8.5px!important;color:#747487!important;text-align:center}.nxt-wallet-success{padding:32px;text-align:center}.nxt-wallet-success .check{width:64px;height:64px;margin:0 auto 16px;border-radius:50%;display:grid;place-items:center;background:rgba(16,185,129,.15);border:1px solid rgba(52,211,153,.35);color:#6ee7b7;font-size:30px}.nxt-wallet-success h2{margin-bottom:8px}.nxt-wallet-success a{display:inline-flex;margin-top:16px;color:#c4b5fd;font-size:10px}.nxt-wallet-success button{display:block;margin:18px auto 0;min-width:180px;min-height:44px;border:0;border-radius:10px;background:linear-gradient(100deg,#7c3aed,#6d28d9);color:#fff;font-weight:850;cursor:pointer}.nxt-wallet-resume{position:fixed;right:18px;bottom:18px;z-index:1000008;display:flex;align-items:center;gap:10px;max-width:min(420px,calc(100vw - 36px));padding:12px 14px;border:1px solid rgba(167,139,250,.35);border-radius:13px;background:#171722;color:#fff;box-shadow:0 16px 50px rgba(0,0,0,.55);font:800 10px Inter,sans-serif}.nxt-wallet-resume button{border:0;border-radius:8px;background:#7c3aed;color:#fff;padding:9px 12px;font-weight:850;cursor:pointer}.nxt-wallet-resume .dismiss{background:transparent;color:#9ca3af;padding:5px}
    @media(max-width:700px){.nxt-wallet-pad{padding:22px 16px}.nxt-wallet-card h2{font-size:23px}.nxt-wallet-trust{grid-template-columns:1fr}.nxt-easy-trust{grid-template-columns:1fr}.nxt-easy-trust span{display:flex;align-items:center;justify-content:center;gap:5px;padding:7px}.nxt-easy-trust b{display:inline;margin:0}.nxt-pay-path{min-height:86px;padding:14px 12px}.nxt-pay-path-tag{position:static;align-self:flex-start;margin-left:auto;white-space:nowrap}.nxt-existing-coins{padding:9px}.nxt-wallet-funding-intro ol{grid-template-columns:1fr}.nxt-wallet-pay{height:96vh}.nxt-wallet-head{padding:14px}.nxt-wallet-headcoin{width:38px;height:38px;flex-basis:38px}.nxt-wallet-secure{display:none}.nxt-wallet-head-copy strong{font-size:14px}.nxt-wallet-body{grid-template-columns:1fr;padding:16px}.nxt-wallet-qr{width:210px;margin:auto}.nxt-wallet-pay[data-asset="USDT"] .nxt-wallet-order{display:contents}.nxt-wallet-pay[data-asset="USDT"] .nxt-wallet-body{row-gap:12px}.nxt-wallet-pay[data-asset="USDT"] .nxt-wallet-usdt-buy{order:-1}.nxt-wallet-pay[data-intent="buy"] .nxt-wallet-actions{grid-template-columns:1fr}.nxt-wallet-next{align-items:flex-start}.nxt-wallet-buy-head{align-items:flex-start}.nxt-wallet-buy-badge{font-size:7px}.nxt-wallet-buy-confidence{display:grid;grid-template-columns:1fr}.nxt-wallet-buy-steps{grid-template-columns:1fr}.nxt-wallet-buy-step{display:grid;grid-template-columns:24px 1fr;align-items:center;gap:8px}.nxt-wallet-buy-step b{margin:0}.nxt-wallet-buy-step small{grid-column:2}.nxt-wallet-buy-tools{grid-template-columns:1fr}.nxt-wallet-buy-copy{min-height:42px}.nxt-wallet-usdt-buy-head{align-items:flex-start}.nxt-wallet-usdt-buy-badge{display:none}.nxt-wallet-usdt-buy-meta{grid-template-columns:1fr}.nxt-wallet-apps-grid{grid-template-columns:repeat(2,1fr)}.nxt-wallet-app-link{min-height:46px}.nxt-wallet-actions{grid-template-columns:1fr}.nxt-wallet-verifyrow{grid-template-columns:1fr}.nxt-wallet-verify button{min-height:42px}.nxt-swaps-drawer{width:100vw}.nxt-swaps-guide ol{grid-template-columns:1fr}.nxt-swaps-guide li{min-height:34px}.nxt-swaps-launch-facts{grid-template-columns:1fr}.nxt-swaps-footer{align-items:flex-start}}
    @media(prefers-reduced-motion:reduce){.nxt-wallet-buy-main,.nxt-wallet-buy-main:before,.nxt-wallet-close,.nxt-wallet-actions a,.nxt-wallet-actions button,.nxt-swaps-backdrop,.nxt-swaps-drawer{transition:none!important}}
  `;
  document.head.appendChild(style);

  let working = false;
  let activeOverlay = null;
  let activePoll = null;
  let activeDetectionPoll = null;
  let activeDetectionDelay = null;
  let activeDetectionController = null;
  let activeTimer = null;
  let activeContext = null;
  let detectionWorking = false;
  const ACTIVE_PAYMENT_KEY = 'nxtActiveDirectPaymentV3';
  const QUOTE_RECOVERY_MS = 2 * 60 * 60 * 1000;

  try { sessionStorage.removeItem('nxtActiveDirectPaymentV2'); } catch (_) {}

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }

  function mobileWalletShortcuts(asset) {
    const shortcuts = {
      BTC: [
        ['Coinbase', 'C', 'https://www.coinbase.com/mobile'],
        ['Cash App', '$', 'https://cash.app/bitcoin'],
        ['Robinhood', 'R', 'https://robinhood.com/us/en/support/articles/crypto-transfers/'],
        ['Crypto.com', 'C', 'https://crypto.com/us/app'],
        ['Kraken', 'K', 'https://www.kraken.com/features/cryptocurrency-apps'],
        ['Exodus', 'E', 'https://www.exodus.com/download'],
      ],
      ETH: [
        ['Coinbase', 'C', 'https://www.coinbase.com/mobile'],
        ['Robinhood', 'R', 'https://robinhood.com/us/en/support/articles/crypto-transfers/'],
        ['Crypto.com', 'C', 'https://crypto.com/us/app'],
        ['Kraken', 'K', 'https://www.kraken.com/features/cryptocurrency-apps'],
        ['MetaMask', 'M', 'https://metamask.io/download/'],
        ['Trust Wallet', 'T', 'https://trustwallet.com/'],
      ],
      USDT: [
        ['Coinbase', 'C', 'https://www.coinbase.com/mobile'],
        ['Crypto.com', 'C', 'https://crypto.com/us/app'],
        ['Kraken', 'K', 'https://www.kraken.com/features/cryptocurrency-apps'],
        ['MetaMask', 'M', 'https://metamask.io/download/'],
        ['Trust Wallet', 'T', 'https://trustwallet.com/'],
        ['Exodus', 'E', 'https://www.exodus.com/download'],
      ],
    };
    return shortcuts[String(asset || '').toUpperCase()] || [];
  }

  function cartItems() {
    try { return typeof cart !== 'undefined' && Array.isArray(cart) ? cart : (Array.isArray(window.cart) ? window.cart : []); }
    catch (_) { return []; }
  }

  function checkoutDetails() { return window.nxtCheckoutDetails || {}; }

  function currentPaymentContext() {
    return activeContext || { details: checkoutDetails(), items: cartItems() };
  }

  function saveActivePayment(quote, context, txid) {
    try {
      sessionStorage.setItem(ACTIVE_PAYMENT_KEY, JSON.stringify({
        quote,
        context,
        txid: String(txid || ''),
        savedAt: Date.now(),
      }));
    } catch (_) {}
  }

  function readActivePayment() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(ACTIVE_PAYMENT_KEY) || 'null');
      if (!saved || !saved.quote || !saved.context || Date.now() > Number(saved.quote.expiresAt) + QUOTE_RECOVERY_MS) {
        sessionStorage.removeItem(ACTIVE_PAYMENT_KEY);
        return null;
      }
      return saved;
    } catch (_) { return null; }
  }

  function clearActivePayment() {
    try { sessionStorage.removeItem(ACTIVE_PAYMENT_KEY); } catch (_) {}
    document.querySelector('.nxt-wallet-resume')?.remove();
  }

  function stopTimers() {
    if (activePoll) clearInterval(activePoll);
    if (activeDetectionPoll) clearTimeout(activeDetectionPoll);
    if (activeDetectionDelay) clearTimeout(activeDetectionDelay);
    if (activeDetectionController) activeDetectionController.abort();
    if (activeTimer) clearInterval(activeTimer);
    activePoll = null;
    activeDetectionPoll = null;
    activeDetectionDelay = null;
    activeDetectionController = null;
    activeTimer = null;
    detectionWorking = false;
  }

  function closeActive() {
    stopTimers();
    if (activeOverlay) activeOverlay.remove();
    activeOverlay = null;
  }

  function showResumePrompt() {
    document.querySelector('.nxt-wallet-resume')?.remove();
    const saved = readActivePayment();
    if (!saved || activeOverlay) return;
    const node = document.createElement('div');
    node.className = 'nxt-wallet-resume';
    node.innerHTML = `<span>Payment in progress · ${escapeHtml(saved.quote.orderId)}</span><button type="button" data-resume>Resume</button><button type="button" class="dismiss" aria-label="Dismiss">×</button>`;
    node.querySelector('[data-resume]').onclick = () => {
      const current = readActivePayment();
      if (!current) return node.remove();
      activeContext = current.context;
      window.nxtCheckoutDetails = current.context.details;
      renderPayment(current.quote, current.context, current.txid);
    };
    node.querySelector('.dismiss').onclick = () => node.remove();
    document.body.appendChild(node);
  }

  function showLoading(show, asset) {
    document.querySelector('.nxt-wallet-loading')?.remove();
    if (!show) return;
    const node = document.createElement('div');
    node.className = 'nxt-wallet-loading';
    node.innerHTML = `<div class="nxt-wallet-loadbox"><div class="nxt-wallet-spin"></div><h3>Creating direct-wallet payment</h3><p>Locking the exact ${escapeHtml(asset || 'crypto')} amount and generating its QR code…</p></div>`;
    document.body.appendChild(node);
  }

  function showError(message) {
    showLoading(false);
    closeActive();
    const node = document.createElement('div');
    node.className = 'nxt-wallet-overlay';
    node.innerHTML = `<div class="nxt-wallet-card"><div class="nxt-wallet-pad" style="text-align:center"><h2>Checkout couldn’t continue</h2><p>${escapeHtml(message || 'Please try again.')}</p><button type="button" class="nxt-wallet-cancel">Close</button></div></div>`;
    node.querySelector('button').onclick = () => node.remove();
    node.addEventListener('click', (event) => { if (event.target === node) node.remove(); });
    document.body.appendChild(node);
  }

  function chooseAsset() {
    return new Promise((resolve) => {
      const node = document.createElement('div');
      node.className = 'nxt-wallet-chooser';
      node.innerHTML = `<div class="nxt-wallet-card"><div class="nxt-wallet-pad">
        <div class="nxt-wallet-kicker">Simple secure payment</div>
        <h2>How would you like to pay?</h2>
        <p>Choose what you have right now. If you are new to crypto, use the first option—we will choose USDT and prepare the exact amount for you.</p>
        <div class="nxt-pay-paths">
          <button class="nxt-pay-path card" type="button" data-pay-path="buy"><span class="nxt-pay-path-icon">🏦</span><span class="nxt-pay-path-copy"><strong>Buy USDT with ACH Bank Transfer</strong><small>No crypto experience needed. Swaps opens with ACH selected and a fee reserve included.</small></span><span class="nxt-pay-path-tag">Recommended</span><span class="nxt-pay-path-arrow">›</span></button>
          <button class="nxt-pay-path wallet" type="button" data-reveal-assets aria-expanded="false"><span class="nxt-pay-path-icon">◈</span><span class="nxt-pay-path-copy"><strong>I already have crypto</strong><small>Pay directly from a wallet using BTC, ETH, or USDT.</small></span><span class="nxt-pay-path-arrow">›</span></button>
        </div>
        <div class="nxt-existing-coins" data-existing-coins>
          <strong>Which crypto is already in your wallet?</strong>
          <div class="nxt-wallet-coins"><button class="nxt-wallet-coin" data-asset="BTC"><span class="nxt-wallet-icon btc">₿</span><span><strong>Bitcoin (BTC)</strong><small>Bitcoin Mainnet only</small></span><span class="nxt-wallet-arrow">›</span></button><button class="nxt-wallet-coin" data-asset="ETH"><span class="nxt-wallet-icon eth">Ξ</span><span><strong>Ethereum (ETH)</strong><small>Ethereum Mainnet only</small></span><span class="nxt-wallet-arrow">›</span></button><button class="nxt-wallet-coin" data-asset="USDT"><span class="nxt-wallet-icon usdt">₮</span><span><strong>Tether (USDT)</strong><small>Ethereum Mainnet · ERC-20 only</small></span><span class="nxt-wallet-arrow">›</span></button></div>
        </div>
        <div class="nxt-easy-trust"><span><b>✓ Exact amount</b>Prepared for the order</span><span><b>✓ Address help</b>Ready to copy</span><span><b>✓ Verification</b>Built into checkout</span></div>
        <button class="nxt-wallet-cancel" type="button">Back</button>
        <p class="nxt-wallet-note">Use the ACH bank-transfer route in Swaps. Do not switch to Card or Apple Pay. Always confirm “You receive” covers the exact order amount before paying.</p>
      </div></div>`;
      let finished = false;
      const done = (asset) => { if (finished) return; finished = true; node.remove(); resolve(asset); };
      node.querySelector('[data-pay-path="buy"]').onclick = () => done({ asset: 'USDT', intent: 'buy' });
      const reveal = node.querySelector('[data-reveal-assets]');
      const coins = node.querySelector('[data-existing-coins]');
      reveal.onclick = () => {
        const show = !coins.classList.contains('show');
        coins.classList.toggle('show', show);
        reveal.setAttribute('aria-expanded', String(show));
        reveal.querySelector('.nxt-pay-path-arrow').textContent = show ? '⌄' : '›';
        if (show) coins.querySelector('[data-asset]')?.focus();
      };
      node.querySelectorAll('[data-asset]').forEach((button) => { button.onclick = () => done({ asset: button.dataset.asset, intent: 'wallet' }); });
      node.querySelector('.nxt-wallet-cancel').onclick = () => done(null);
      node.addEventListener('click', (event) => { if (event.target === node) done(null); });
      document.body.appendChild(node);
    });
  }

  async function createQuote(asset, context) {
    const details = context.details;
    const response = await fetch('/api/create-direct-payment-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        asset,
        fulfillment: details.fulfillment,
        customer: details.customer,
        items: context.items,
        locale: (navigator.languages && navigator.languages[0]) || navigator.language || 'en-US',
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const missing = Array.isArray(data.missing) && data.missing.length ? ` Missing setup: ${data.missing.join(', ')}.` : '';
      throw new Error((data.error || 'Unable to create a direct payment quote.') + missing);
    }
    return data;
  }

  async function notifyCheckoutLead(quote, context) {
    const details = context.details;
    await fetch('/api/checkout-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteToken: quote.quoteToken,
        customer: details.customer,
        fulfillment: details.fulfillment,
        items: context.items,
      }),
    });
  }

  function copyText(text, button) {
    const finish = () => {
      if (!button) return;
      const original = button.textContent;
      button.textContent = 'Copied! ✓';
      button.classList.add('copied');
      setTimeout(() => { button.textContent = original; button.classList.remove('copied'); }, 1700);
    };
    const fallback = () => {
      const area = document.createElement('textarea');
      area.value = text; area.style.position = 'fixed'; area.style.opacity = '0'; document.body.appendChild(area); area.select();
      try { document.execCommand('copy'); } catch (_) {}
      area.remove(); finish();
    };
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(finish).catch(fallback);
    }
    fallback(); return Promise.resolve();
  }

  function setSwapsStatus(node, message, bad = false) {
    node.className = `nxt-wallet-buy-status show${bad ? ' bad' : ''}`;
    node.textContent = message;
  }

  function openBufferedSwapsFunding(quote, context, link, status, event) {
    if (Date.now() > Number(quote.expiresAt)) {
      event?.preventDefault();
      setSwapsStatus(status, 'This quote expired. Create a new quote before buying crypto by bank transfer.', true);
      return;
    }
    if (!link.href || link.getAttribute('href') === '#') {
      event?.preventDefault();
      setSwapsStatus(status, 'The fee-buffered funding link could not load. Refresh and try again.', true);
      return;
    }
    saveActivePayment(quote, context, '');
    const fundingUsd = link.dataset.fundingUsd || '';
    const network = quote.asset === 'USDT' ? 'Ethereum ERC-20' : quote.network;
    link.textContent = 'Swaps ACH opened — fee reserve included ↗';
    setSwapsStatus(status, `Swaps is opening with ACH selected and a $${fundingUsd} bank-transfer target for this $${quote.totalUsd} invoice. Keep ACH selected—do not switch to Card or Apple Pay. Before paying, make sure “You receive” is at least ${quote.amount} ${quote.asset} on ${network}. After it sends, return here and paste the transaction ID.`);
  }

  function setStatus(node, message, type) {
    node.className = `nxt-wallet-status show${type ? ` ${type}` : ''}`;
    node.textContent = message;
  }

  function setPaymentStage(stage) {
    if (!activeOverlay) return;
    const stages = ['awaiting', 'detected', 'confirming', 'confirmed'];
    const current = Math.max(0, stages.indexOf(stage));
    activeOverlay.querySelectorAll('[data-payment-stage]').forEach((node, index) => {
      node.classList.toggle('complete', index < current || stage === 'confirmed');
      node.classList.toggle('active', index === current && stage !== 'confirmed');
    });
  }

  function ethereumTransferData(address, amountUnits) {
    const target = String(address).toLowerCase().replace(/^0x/, '').padStart(64, '0');
    const amount = BigInt(amountUnits).toString(16).padStart(64, '0');
    return `0xa9059cbb${target}${amount}`;
  }

  async function payWithBrowserWallet(quote, input, status) {
    if (!window.ethereum) throw new Error('No compatible browser wallet was detected. Use the QR code or copy the payment details.');
    setStatus(status, 'Connecting to your wallet…');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const from = accounts && accounts[0];
    if (!from) throw new Error('The wallet did not provide an account.');
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (String(chainId).toLowerCase() !== '0x1') {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] });
    }
    const tx = quote.asset === 'ETH'
      ? { from, to: quote.address, value: `0x${BigInt(quote.amountUnits).toString(16)}` }
      : { from, to: '0xdAC17F958D2ee523a2206206994597C13D831ec7', value: '0x0', data: ethereumTransferData(quote.address, quote.amountUnits) };
    setStatus(status, 'Review the exact amount and Ethereum Mainnet network in your wallet.');
    const txid = await window.ethereum.request({ method: 'eth_sendTransaction', params: [tx] });
    input.value = txid;
    return txid;
  }

  async function verifyPayment(quote, txid, status, button, context) {
    const details = context.details;
    if (!txid) return setStatus(status, 'Paste the transaction ID shown by your wallet.', 'bad');
    saveActivePayment(quote, context, txid);
    button.disabled = true;
    setStatus(status, 'Checking the blockchain…');
    try {
      const response = await fetch('/api/verify-direct-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteToken: quote.quoteToken,
          txid,
          fulfillment: details.fulfillment,
          customer: details.customer,
          items: context.items,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 202) {
        if (data.status === 'manual_review') {
          setPaymentStage('detected');
          setStatus(status, data.message || 'Payment received and sent for manual review.', 'bad');
          return 'review';
        }
        setPaymentStage(['confirming', 'provider_disagreement', 'reorged'].includes(data.status) ? 'confirming' : 'awaiting');
        setStatus(status, data.message || 'Payment found and waiting for confirmations.');
        return 'pending';
      }
      if (!response.ok || data.status !== 'paid') throw new Error(data.error || data.message || 'Payment could not be verified.');
      setPaymentStage('confirmed');
      showSuccess(data);
      return 'paid';
    } catch (error) {
      setStatus(status, error.message || 'Unable to verify payment.', 'bad');
      return 'error';
    } finally {
      button.disabled = false;
    }
  }

  function clearCartAfterPayment() {
    try {
      if (typeof cart !== 'undefined' && Array.isArray(cart)) cart.splice(0, cart.length);
      if (Array.isArray(window.cart)) window.cart.splice(0, window.cart.length);
      if (typeof renderCart === 'function') renderCart();
    } catch (_) {}
  }

  function showSuccess(data) {
    stopTimers();
    if (!activeOverlay) return;
    clearActivePayment();
    clearCartAfterPayment();
    window.dispatchEvent(new CustomEvent('nxt:payment-confirmed', { detail: { orderId: data.orderId } }));
    const emailMessage = data.confirmationEmailSent === false
      ? 'The payment is confirmed; the email receipt may be delayed.'
      : 'A confirmation email has been sent.';
    activeOverlay.innerHTML = `<div class="nxt-wallet-card"><div class="nxt-wallet-success"><div class="check">✓</div><div class="nxt-wallet-kicker">Blockchain verified</div><h2>Payment confirmed</h2><p>Order <b>${escapeHtml(data.orderId)}</b> has been paid. ${emailMessage}</p><a href="${escapeHtml(data.transactionUrl)}" target="_blank" rel="noopener noreferrer">View confirmed transaction ↗</a><button type="button">Close</button></div></div>`;
    activeOverlay.querySelector('button').onclick = closeActive;
  }

  function renderPayment(quote, context = currentPaymentContext(), initialTxid = '') {
    showLoading(false);
    closeActive();
    document.querySelector('.nxt-wallet-resume')?.remove();
    activeContext = context;
    window.nxtCheckoutDetails = context.details;
    saveActivePayment(quote, context, initialTxid);

    const buyingFirst = context.paymentIntent === 'buy';
    const automaticDetection = !buyingFirst && (quote.asset === 'BTC' || quote.asset === 'USDT');
    const networkWarning = quote.asset === 'USDT'
      ? 'For USDT, select Ethereum ERC‑20—not Tron, BNB Chain, Base, or another network.'
      : '';
    const networkRestriction = /\bonly\b/i.test(quote.network)
      ? `${quote.network}.`
      : `${quote.network} only.`;
    const txidLabel = buyingFirst
      ? 'After Swaps sends the crypto, paste its transaction ID here'
      : (automaticDetection
        ? 'Automatic detection is on — transaction ID is optional'
        : 'Transaction ID (filled automatically with a browser wallet)');
    const localization = quote.localization || {};
    const localTotal = localization.approximate
      ? `≈ ${localization.formattedTotal || `$${quote.totalUsd}`} ${localization.currency || ''}`
      : `${localization.usdFormattedTotal || `$${quote.totalUsd}`} USD`;
    const localCaption = localization.approximate ? `Based on $${quote.totalUsd} USD` : 'Order total';
    const funding = {
      title: 'Use the ACH bank-transfer route in Swaps.',
      detail: 'NXT LVL opens Swaps with ACH selected and starts the transfer target above the invoice to leave room for provider and network fees. Do not switch to Card or Apple Pay.',
    };
    const fundingReturnStep = buyingFirst ? 'Return and paste the transaction ID' : (automaticDetection ? 'Keep this checkout open' : 'Return and verify payment');
    const fundingReturnDetail = buyingFirst
      ? 'A fee-buffered purchase may send slightly more than the invoice fingerprint, so paste the provider transaction ID below'
      : (automaticDetection ? 'NXT LVL watches for the exact incoming payment' : 'Paste the transaction ID into the box below');
    const fundingNetworkStep = quote.asset === 'USDT' ? 'Confirm ERC-20 receive amount' : `Confirm ${quote.asset} receive amount`;
    const fundingNetworkDetail = quote.asset === 'USDT'
      ? `Do not pay unless “You receive” is at least ${quote.amount} USDT on Ethereum ERC-20`
      : `Do not pay unless “You receive” is at least ${quote.amount} ${quote.asset} on ${quote.network}`;
    const assetName = quote.asset === 'BTC' ? 'Bitcoin' : (quote.asset === 'ETH' ? 'Ethereum' : 'Tether');
    const assetIcon = quote.asset === 'BTC' ? '₿' : (quote.asset === 'ETH' ? 'Ξ' : '₮');
    const qrLabel = quote.uriStandard === 'BIP-21' ? 'BIP‑21 · SCAN WITH YOUR WALLET' : 'SCAN WITH YOUR WALLET';
    const walletShortcutMarkup = mobileWalletShortcuts(quote.asset).map(([name, mark, href]) => `<a class="nxt-wallet-app-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"><i>${escapeHtml(mark)}</i><span>${escapeHtml(name)}</span></a>`).join('');
    let swapsUrl = '#';
    let swapsFundingUsd = '';
    try {
      swapsFundingUsd = window.NxtSwapsFunding?.fundingAmountForInvoice(quote.totalUsd) || '';
      swapsUrl = window.NxtSwapsFunding?.buildCheckoutUrl({ asset: quote.asset, invoiceUsd: quote.totalUsd }) || '#';
    } catch (_) {}
    const overlay = document.createElement('div');
    overlay.className = 'nxt-wallet-overlay';
    overlay.innerHTML = `<div class="nxt-wallet-card nxt-wallet-pay" data-asset="${escapeHtml(quote.asset)}" data-intent="${buyingFirst ? 'buy' : 'wallet'}" role="dialog" aria-modal="true" aria-label="Direct ${escapeHtml(quote.asset)} payment">
      <div class="nxt-wallet-head"><div class="nxt-wallet-head-main"><div class="nxt-wallet-headcoin" aria-hidden="true">${escapeHtml(assetIcon)}</div><div class="nxt-wallet-head-copy"><strong>${buyingFirst ? `Buy ${escapeHtml(assetName)} for this order` : `Pay directly with ${escapeHtml(assetName)}`}</strong><span>${escapeHtml(quote.network)} · Order ${escapeHtml(quote.orderId)}</span></div></div><div class="nxt-wallet-head-actions"><span class="nxt-wallet-secure">Secure checkout</span><button type="button" class="nxt-wallet-close" aria-label="Close checkout">×</button></div></div>
      <div class="nxt-wallet-body">
        <div class="nxt-wallet-qr"><img src="${escapeHtml(quote.qrDataUrl)}" alt="${escapeHtml(quote.asset)} payment QR code"><small>${escapeHtml(qrLabel)}</small></div>
        <div class="nxt-wallet-order">
          <div class="nxt-wallet-summary"><span>Order total <b>$${escapeHtml(quote.totalUsd)} USD</b></span><span id="nxtWalletTimer">Quote expires in 15:00</span></div>
          <div class="nxt-wallet-local"><span><b>${escapeHtml(localTotal)}</b>${escapeHtml(localCaption)}</span><span>Crypto amount stays exact</span></div>
          ${buyingFirst ? `<div class="nxt-wallet-next"><span class="nxt-wallet-next-icon">1</span><span><strong>Next: open ACH bank transfer with a fee reserve</strong><span>For this $${escapeHtml(quote.totalUsd)} invoice, Swaps opens with ACH selected and a $${escapeHtml(swapsFundingUsd)} transfer target so fees are less likely to reduce the crypto below the invoice.</span></span></div>` : ''}
          <div class="nxt-wallet-progress"><div class="nxt-wallet-step active" data-payment-stage="awaiting">1 · Awaiting</div><div class="nxt-wallet-step" data-payment-stage="detected">2 · Detected</div><div class="nxt-wallet-step" data-payment-stage="confirming">3 · Confirming</div><div class="nxt-wallet-step" data-payment-stage="confirmed">4 · Confirmed</div></div>
          ${quote.asset === 'USDT' ? `<div class="nxt-wallet-usdt-buy"><div class="nxt-wallet-usdt-buy-head"><span class="nxt-wallet-usdt-buy-icon" aria-hidden="true">₮</span><span class="nxt-wallet-usdt-buy-copy"><b>Don't have crypto? Buy USDT with ACH.</b><span>Use an ACH bank transfer through Swaps, then return to this payment page. Keep ACH selected—not Card or Apple Pay.</span></span><em class="nxt-wallet-usdt-buy-badge">ACH selected</em></div><a class="nxt-wallet-usdt-buy-main" data-buy-crypto href="${escapeHtml(swapsUrl)}" target="_blank" rel="noopener noreferrer" data-funding-usd="${escapeHtml(swapsFundingUsd)}">Buy USDT here with ACH Bank Transfer · $${escapeHtml(swapsFundingUsd)} ↗</a><div class="nxt-wallet-usdt-buy-meta"><span><b>Fee reserve included</b>Opens above the $${escapeHtml(quote.totalUsd)} invoice total.</span><span><b>Ethereum ERC-20 only</b>Confirm “You receive” is at least ${escapeHtml(quote.amount)} USDT.</span></div></div>` : `<div class="nxt-wallet-existing"><div><b>${buyingFirst ? 'Your beginner-friendly bank route is ready' : 'Choose the easiest way for you'}</b><span>${buyingFirst ? 'Continue with ACH bank transfer. If you already have crypto, you can open your wallet instead.' : `Already have ${escapeHtml(quote.asset)}? Wallet payment is fastest. Need it first? Use the ACH bank-transfer option.`}</span></div><em>2 clear choices</em></div>`}
          <div class="nxt-wallet-actions"><a class="primary" data-open-wallet href="${escapeHtml(quote.paymentUri)}">${buyingFirst ? `I already have ${escapeHtml(quote.asset)}` : 'Open my crypto wallet'}</a>${quote.asset === 'USDT' ? '' : `<a class="buy" data-buy-crypto href="${escapeHtml(swapsUrl)}" target="_blank" rel="noopener noreferrer" data-funding-usd="${escapeHtml(swapsFundingUsd)}">${buyingFirst ? `Buy enough with ACH Bank Transfer · $${escapeHtml(swapsFundingUsd)} ↗` : `Buy enough ${escapeHtml(quote.asset)} with ACH Bank Transfer ↗`}</a>`}<button type="button" class="tool" data-browser-pay ${quote.asset === 'BTC' ? 'hidden' : ''}>Use browser wallet</button><button type="button" class="tool" data-copy-all>Copy payment details</button></div>
          <div class="nxt-wallet-field"><div class="nxt-wallet-label">Exact amount</div><div class="nxt-wallet-copyline"><div class="nxt-wallet-value amount">${escapeHtml(quote.amount)} ${escapeHtml(quote.asset)}</div><button type="button" class="nxt-wallet-copy" data-copy-amount>Copy amount</button></div></div>
          <div class="nxt-wallet-field"><div class="nxt-wallet-label">Receiving address</div><div class="nxt-wallet-copyline"><div class="nxt-wallet-value">${escapeHtml(quote.address)}</div><button type="button" class="nxt-wallet-copy" data-copy-address>Copy address</button></div></div>
          <div class="nxt-wallet-warning"><b>${escapeHtml(networkRestriction)}</b> ${buyingFirst ? `Make sure the provider's “You receive” value is at least ${escapeHtml(quote.amount)} ${escapeHtml(quote.asset)}.` : 'Send the exact amount shown.'} ${escapeHtml(networkWarning)}</div>
          <details class="nxt-wallet-apps"><summary>Use Coinbase, Cash App, MetaMask, or another app</summary><div class="nxt-wallet-apps-content"><div class="nxt-wallet-apps-head"><span>Open the app you already use, tap Send or Withdraw, and match the network exactly.</span><em>${escapeHtml(quote.asset)} shortcuts</em></div><div class="nxt-wallet-apps-grid">${walletShortcutMarkup}</div><a class="nxt-wallet-apps-guide" href="/shipping-and-payments.html#existing-wallets" target="_blank" rel="noopener noreferrer">See all common wallet shortcuts + instructions ↗</a></div></details>
          <details class="nxt-wallet-buy-help"><summary>How the ACH bank-transfer option works</summary><div class="nxt-wallet-buy-help-content"><div class="nxt-wallet-buy-steps"><div class="nxt-wallet-buy-step"><b>1</b>Open buffered Swaps ACH checkout<small>A $${escapeHtml(swapsFundingUsd)} transfer target is prefilled above the $${escapeHtml(quote.totalUsd)} invoice</small></div><div class="nxt-wallet-buy-step"><b>2</b>Keep ACH selected<small>Do not switch to the Card or Apple Pay route inside Swaps</small></div><div class="nxt-wallet-buy-step"><b>3</b>${escapeHtml(fundingNetworkStep)}<small>${escapeHtml(fundingNetworkDetail)}</small></div><div class="nxt-wallet-buy-step"><b>4</b>${escapeHtml(fundingReturnStep)}<small>${escapeHtml(fundingReturnDetail)}</small></div></div><div class="nxt-wallet-buy-tools"><span><b>NXT LVL receiving address</b>Copy it, then paste it if Swaps asks where to send the crypto.</span><button type="button" class="nxt-wallet-buy-copy" data-copy-for-swaps>Copy address</button></div><small class="nxt-wallet-buy-note">${escapeHtml(funding.title)} ${escapeHtml(funding.detail)} <b>The reserve is conservative: do not pay if “You receive” is below ${escapeHtml(quote.amount)} ${escapeHtml(quote.asset)}.</b></small></div></details>
          <div class="nxt-wallet-buy-status" data-buy-status role="status" aria-live="polite"></div>
          <div class="nxt-wallet-status" role="status" aria-live="polite"></div>
          <details class="nxt-wallet-verify" ${buyingFirst ? 'open' : ''}><summary>Payment sent but not detected? Verify manually</summary><div class="nxt-wallet-verify-content"><label for="nxtWalletTxid">${escapeHtml(txidLabel)}</label><div class="nxt-wallet-verifyrow"><input id="nxtWalletTxid" autocomplete="off" spellcheck="false" placeholder="Transaction ID / hash"><button type="button" data-verify>Verify payment</button></div></div></details>
          <p class="nxt-wallet-fine">${escapeHtml(quote.note)} Never share your recovery phrase or private key.</p>
        </div>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    const input = overlay.querySelector('#nxtWalletTxid');
    const status = overlay.querySelector('.nxt-wallet-status');
    const verifyButton = overlay.querySelector('[data-verify]');
    const closeButton = overlay.querySelector('.nxt-wallet-close');
    const browserPay = overlay.querySelector('[data-browser-pay]');
    const openWallet = overlay.querySelector('[data-open-wallet]');
    const buyCrypto = overlay.querySelector('[data-buy-crypto]');
    const copyForSwapsButton = overlay.querySelector('[data-copy-for-swaps]');
    const buyStatus = overlay.querySelector('[data-buy-status]');
    const copyAll = overlay.querySelector('[data-copy-all]');
    input.value = initialTxid || '';
    setPaymentStage(initialTxid ? 'detected' : 'awaiting');

    overlay.querySelector('[data-copy-amount]').onclick = (event) => copyText(quote.amount, event.currentTarget);
    overlay.querySelector('[data-copy-address]').onclick = (event) => copyText(quote.address, event.currentTarget);
    buyCrypto.onclick = (event) => openBufferedSwapsFunding(quote, context, buyCrypto, buyStatus, event);
    copyForSwapsButton.onclick = async (event) => {
      await copyText(quote.address, event.currentTarget);
      const network = quote.asset === 'USDT' ? ' Select Ethereum ERC-20 in Swaps.' : '';
      setSwapsStatus(buyStatus, `Address copied. Paste it if Swaps asks where to send the crypto.${network}`);
    };
    copyAll.onclick = (event) => {
      if (Date.now() > Number(quote.expiresAt)) {
        closeActive();
        return start(quote.asset, context);
      }
      return copyText(`${quote.amount} ${quote.asset}\n${quote.network}\n${quote.address}\nOrder ${quote.orderId}`, event.currentTarget);
    };
    const closeAndResume = () => { closeActive(); showResumePrompt(); };
    closeButton.onclick = closeAndResume;
    overlay.addEventListener('click', (event) => { if (event.target === overlay) closeAndResume(); });
    input.addEventListener('input', () => saveActivePayment(quote, context, input.value.trim()));

    const check = async () => {
      const result = await verifyPayment(quote, input.value.trim(), status, verifyButton, context);
      if (result === 'pending' && !activePoll) activePoll = setInterval(check, 12000);
      return result;
    };
    verifyButton.onclick = check;
    input.addEventListener('keydown', (event) => { if (event.key === 'Enter') check(); });

    const detect = async () => {
      if (detectionWorking || !activeOverlay || input.value.trim()) return;
      detectionWorking = true;
      let nextDelay = 500;
      activeDetectionController = new AbortController();
      try {
        const response = await fetch('/api/find-direct-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: activeDetectionController.signal,
          body: JSON.stringify({
            quoteToken: quote.quoteToken,
            fulfillment: context.details.fulfillment,
            customer: context.details.customer,
            items: context.items,
            waitMs: 12000,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.status === 202) {
          nextDelay = Math.max(250, Math.min(2_000, Number(data.retryAfterMs) || 500));
          setPaymentStage('awaiting');
          setStatus(status, data.message || `Watching ${quote.asset} for your exact payment…`);
          return;
        }
        if (response.status === 400 && /quote|authenticate|too old/i.test(String(data.error || ''))) {
          nextDelay = -1;
          clearActivePayment();
          setStatus(status, 'This checkout session expired. Close it and create a new payment quote.', 'bad');
          return;
        }
        if (!response.ok || data.status !== 'found' || !data.txid) {
          setStatus(status, data.error || data.message || 'Automatic detection is unavailable. Paste the transaction ID after sending.');
          return;
        }
        if (activeDetectionPoll) clearTimeout(activeDetectionPoll);
        activeDetectionPoll = null;
        input.value = data.txid;
        saveActivePayment(quote, context, data.txid);
        setPaymentStage('detected');
        setStatus(status, 'Payment detected! Securing blockchain confirmations for your order…', 'good');
        await new Promise((resolve) => setTimeout(resolve, 500));
        await check();
      } catch (error) {
        if (error && error.name === 'AbortError') return;
        setStatus(status, 'Automatic detection paused. Your payment is safe; paste the transaction ID or try Verify payment.');
      } finally {
        activeDetectionController = null;
        detectionWorking = false;
        if (nextDelay >= 0 && activeOverlay && !input.value.trim() && Date.now() < Number(quote.expiresAt)) {
          activeDetectionPoll = setTimeout(detect, nextDelay);
        }
      }
    };

    if (browserPay) browserPay.onclick = async () => {
      try {
        const txid = await payWithBrowserWallet(quote, input, status);
        saveActivePayment(quote, context, txid);
        setPaymentStage('detected');
        setStatus(status, 'Payment submitted! Waiting for the network to detect it…', 'good');
        await check();
      } catch (error) { setStatus(status, error.message || 'Wallet payment could not start.', 'bad'); }
    };

    if (automaticDetection && !initialTxid) {
      setStatus(status, `Automatic detection is on. Send the exact ${quote.asset} amount; this screen will find it for you.`, 'good');
      activeDetectionDelay = setTimeout(() => {
        detect();
      }, 1500);
    } else if (!initialTxid) {
      setStatus(status, buyingFirst
        ? 'After Swaps sends the crypto, paste the transaction ID here so the payment can be verified—even if the fee reserve sends slightly more than the exact amount.'
        : 'Use Pay with browser wallet to fill the transaction ID automatically, or paste it after sending.');
    }
    if (initialTxid) activeDetectionDelay = setTimeout(check, 700);

    const timer = overlay.querySelector('#nxtWalletTimer');
    let expiredHandled = false;
    const updateTimer = () => {
      const remaining = Math.max(0, Number(quote.expiresAt) - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      timer.textContent = remaining ? `Quote expires in ${minutes}:${String(seconds).padStart(2, '0')}` : 'Rate lock ended — verify if already sent';
      if (!remaining && !expiredHandled) {
        expiredHandled = true;
        openWallet.removeAttribute('href');
        openWallet.setAttribute('aria-disabled', 'true');
        openWallet.textContent = 'Quote expired';
        if (browserPay) browserPay.disabled = true;
        buyCrypto.setAttribute('aria-disabled', 'true');
        buyCrypto.removeAttribute('href');
        copyForSwapsButton.disabled = true;
        copyAll.textContent = 'Create new quote';
        if (!input.value.trim()) {
          if (activeDetectionPoll) clearTimeout(activeDetectionPoll);
          if (activeDetectionController) activeDetectionController.abort();
          activeDetectionPoll = null;
          setStatus(status, 'Do not send on an expired quote. Create a new quote, or keep this open only if you already sent the payment.', 'bad');
        }
      }
    };
    updateTimer();
    activeTimer = setInterval(updateTimer, 1000);
  }

  async function start(preferredAsset, suppliedContext) {
    if (working) return;
    const selection = preferredAsset
      ? { asset: preferredAsset, intent: suppliedContext?.paymentIntent || 'wallet' }
      : await chooseAsset();
    if (!selection) return;
    const asset = typeof selection === 'string' ? selection : selection.asset;
    const context = suppliedContext || {
      details: checkoutDetails(),
      items: cartItems().map((item) => ({ ...item })),
    };
    if (!context.paymentIntent) context.paymentIntent = typeof selection === 'string' ? 'wallet' : selection.intent;
    working = true;
    showLoading(true, asset);
    try {
      const quote = await createQuote(asset, context);
      activeContext = context;
      saveActivePayment(quote, context, '');
      notifyCheckoutLead(quote, context).catch(() => {});
      renderPayment(quote, context);
    } catch (error) {
      showError(error.message || 'Unable to create direct-wallet checkout.');
    } finally {
      working = false;
    }
  }

  window.startDirectWalletCheckout = start;
  let restoreCheckoutTimer = null;
  const restoreCheckout = () => {
    if (restoreCheckoutTimer) clearTimeout(restoreCheckoutTimer);
    restoreCheckoutTimer = setTimeout(() => {
      restoreCheckoutTimer = null;
      showResumePrompt();
    }, 400);
  };
  window.addEventListener('pageshow', restoreCheckout);
  window.addEventListener('pagehide', stopTimers);
  restoreCheckout();
})();
