(() => {
  document.getElementById('nxt-hero-vial-polish')?.remove();
  if (document.getElementById('nxt-hero-clinical-polish-v3')) return;

  const style = document.createElement('style');
  style.id = 'nxt-hero-clinical-polish-v3';
  style.textContent = `
    body {
      background:
        radial-gradient(ellipse at 14% 6%, rgba(101, 194, 214, .10), transparent 34rem),
        radial-gradient(ellipse at 88% 14%, rgba(117, 151, 220, .09), transparent 38rem),
        linear-gradient(180deg, #071018 0%, #08141a 38%, #070e15 72%, #050b11 100%) !important;
    }

    body::before {
      background:
        linear-gradient(rgba(139, 205, 219, .025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 205, 219, .025) 1px, transparent 1px),
        radial-gradient(circle, rgba(185, 226, 235, .12) 0 1px, transparent 1.4px) !important;
      background-size: 72px 72px, 72px 72px, 72px 72px !important;
      opacity: .56 !important;
    }

    nav#mainNav {
      background: rgba(5, 14, 20, .88) !important;
      border-bottom-color: rgba(119, 199, 216, .16) !important;
    }

    nav .nav-cta {
      color: #06131a !important;
      background: linear-gradient(135deg, #d8f7fb, #83d7e5 55%, #76b8da) !important;
      border-color: rgba(216, 247, 251, .64) !important;
      box-shadow: 0 10px 30px rgba(83, 174, 198, .20) !important;
    }

    .hero {
      align-items: flex-start !important;
      background-blend-mode: normal, color, normal !important;
      background:
        linear-gradient(90deg, rgba(5, 15, 22, .96) 0%, rgba(6, 18, 24, .88) 37%, rgba(7, 22, 28, .55) 59%, rgba(10, 28, 32, .13) 84%, rgba(12, 32, 34, .04) 100%),
        linear-gradient(180deg, rgba(191, 235, 244, .22), rgba(70, 157, 180, .13) 52%, rgba(38, 95, 115, .10)),
        radial-gradient(ellipse at 19% 44%, rgba(104, 183, 202, .16), transparent 30rem),
        url('/assets/research-lab-hero-exact-labels.webp') center center / cover no-repeat !important;
    }

    .hero::before {
      background: radial-gradient(circle, rgba(115, 195, 213, .14), rgba(97, 145, 191, .05) 44%, transparent 70%) !important;
      filter: blur(8px) !important;
    }

    .hero::after {
      border-color: rgba(146, 216, 229, .13) !important;
      box-shadow: inset 0 0 115px rgba(112, 190, 207, .025), 0 24px 70px rgba(0, 0, 0, .24) !important;
    }

    .hero .hero-content {
      width: min(760px, 100%) !important;
      max-width: 760px !important;
      margin: 0 !important;
      text-align: left !important;
    }

    .hero .hero-badge {
      margin: 0 0 24px !important;
      color: #dff6fa !important;
      background: rgba(12, 28, 37, .76) !important;
      border-color: rgba(132, 206, 221, .30) !important;
      box-shadow: 0 12px 36px rgba(0, 0, 0, .27), inset 0 1px rgba(255, 255, 255, .05) !important;
    }

    .hero .hero-badge-dot {
      background: #82d7e5 !important;
      box-shadow: 0 0 0 5px rgba(130, 215, 229, .10), 0 0 14px rgba(130, 215, 229, .55) !important;
    }

    .hero h1 {
      max-width: 730px !important;
      margin: 0 0 25px !important;
      font-size: clamp(3.4rem, 6.7vw, 6.2rem) !important;
      line-height: .91 !important;
    }

    .hero h1 .silver {
      margin-top: 6px !important;
      background: linear-gradient(105deg, #eefcff 0%, #9bdce8 43%, #78b9db 72%, #a8b8f2 100%) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      filter: drop-shadow(0 0 24px rgba(113, 190, 211, .17)) !important;
    }

    .hero p {
      max-width: 620px !important;
      margin: 0 0 28px !important;
      padding: 0 !important;
      color: #c2d0d5 !important;
      text-align: left !important;
    }

    .hero .hero-buttons {
      justify-content: flex-start !important;
      margin: 0 !important;
    }

    .hero .btn-primary {
      color: #06131a !important;
      background: linear-gradient(135deg, #d8f7fb, #88d9e6 52%, #79b9da) !important;
      border-color: rgba(216, 247, 251, .62) !important;
      box-shadow: 0 14px 36px rgba(76, 162, 188, .22), inset 0 1px rgba(255, 255, 255, .48) !important;
    }

    .hero .btn-primary:hover {
      box-shadow: 0 18px 44px rgba(76, 162, 188, .29), 0 0 22px rgba(132, 215, 229, .13) !important;
    }

    .hero .hero-ai-cta {
      border-color: rgba(135, 205, 220, .28) !important;
      background: linear-gradient(135deg, rgba(14, 31, 41, .95), rgba(8, 18, 27, .97)) !important;
    }

    .hero .hero-ai-cta::before,
    .hero .hero-ai-cta::after,
    .hero .crypto-assurance b,
    .hero .crypto-assurance a {
      color: #8bd6e4 !important;
    }

    .hero .crypto-assurance {
      max-width: 650px !important;
      justify-content: flex-start !important;
      margin: 20px 0 0 !important;
      color: #aebfc5 !important;
      text-align: left !important;
    }

    .trust-bar {
      border-color: rgba(129, 201, 216, .17) !important;
      background: linear-gradient(145deg, rgba(13, 29, 38, .96), rgba(8, 18, 27, .97)) !important;
      box-shadow: 0 24px 65px rgba(0, 0, 0, .34), inset 0 1px rgba(255, 255, 255, .04) !important;
    }

    .trust-item {
      border-color: rgba(131, 204, 219, .10) !important;
    }

    .trust-item .num {
      color: #84d3e1 !important;
      text-shadow: 0 0 18px rgba(119, 195, 211, .18) !important;
    }

    .ai-chat-toggle {
      color: #06131a !important;
      background: linear-gradient(135deg, #d7f5fa, #84d4e2 54%, #78b7d8) !important;
      border-color: rgba(214, 246, 250, .58) !important;
      box-shadow: 0 16px 42px rgba(73, 154, 179, .22) !important;
    }

    @media (min-width: 769px) and (max-width: 1050px) {
      .hero .hero-content {
        width: min(58vw, 650px) !important;
      }

      .hero h1 {
        font-size: clamp(3.2rem, 7vw, 5rem) !important;
      }

      .hero p {
        font-size: 1rem !important;
      }
    }

    @media (max-width: 768px) {
      body::before {
        background-size: 52px 52px, 52px 52px, 52px 52px !important;
        opacity: .38 !important;
      }

      .hero {
        min-height: 760px !important;
        padding: 104px 17px 220px !important;
        align-items: flex-start !important;
        background:
          linear-gradient(180deg, rgba(6, 17, 24, .86) 0%, rgba(7, 20, 27, .72) 53%, rgba(8, 24, 29, .14) 100%),
          linear-gradient(90deg, rgba(5, 16, 23, .94) 0%, rgba(8, 22, 28, .61) 58%, rgba(12, 31, 34, .10) 100%),
          url('/assets/research-lab-hero-exact-labels.webp') 72% bottom / cover no-repeat !important;
      }

      .hero .hero-content {
        width: 100% !important;
        max-width: 100% !important;
      }

      .hero .hero-badge {
        margin-bottom: 18px !important;
      }

      .hero h1 {
        max-width: 100% !important;
        margin-bottom: 20px !important;
        font-size: clamp(2.8rem, 14.5vw, 4rem) !important;
        letter-spacing: -1.5px !important;
      }

      .hero p {
        max-width: 34rem !important;
        margin-bottom: 23px !important;
        padding: 0 !important;
        font-size: .93rem !important;
        line-height: 1.56 !important;
      }

      .hero .hero-buttons {
        width: min(100%, 350px) !important;
        margin: 0 !important;
      }

      .hero .crypto-assurance {
        max-width: 350px !important;
        margin-top: 16px !important;
      }

      .trust-bar {
        margin-top: -30px !important;
      }
    }

    @media (max-width: 380px) {
      .hero {
        min-height: 735px !important;
        padding-inline: 15px !important;
        padding-bottom: 205px !important;
      }

      .hero h1 {
        font-size: 2.85rem !important;
      }
    }
  `;

  document.head.appendChild(style);
})();
