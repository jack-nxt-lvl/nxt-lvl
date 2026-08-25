(() => {
  document.getElementById('nxt-hero-vial-polish')?.remove();
  document.getElementById('nxt-hero-clinical-polish-v3')?.remove();
  document.getElementById('nxt-hero-clinical-polish-v4')?.remove();
  if (document.getElementById('nxt-hero-neon-lab-v5')) return;

  const style = document.createElement('style');
  style.id = 'nxt-hero-neon-lab-v5';
  style.textContent = `
    body {
      background:
        radial-gradient(ellipse at 14% 6%, rgba(76, 255, 164, .11), transparent 34rem),
        radial-gradient(ellipse at 88% 14%, rgba(71, 210, 255, .08), transparent 38rem),
        linear-gradient(180deg, #020706 0%, #04100d 38%, #050b0d 72%, #020605 100%) !important;
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
      color: #031008 !important;
      background: linear-gradient(135deg, #c8ff75, #55f58a 55%, #14d98b) !important;
      border-color: rgba(200, 255, 117, .64) !important;
      box-shadow: 0 10px 30px rgba(83, 174, 198, .20) !important;
    }

    .hero {
      align-items: flex-start !important;
      background:
        linear-gradient(90deg, rgba(2, 7, 6, .95) 0%, rgba(3, 10, 8, .87) 36%, rgba(4, 14, 11, .46) 58%, rgba(3, 11, 9, .10) 82%, rgba(2, 8, 7, .03) 100%),
        linear-gradient(180deg, rgba(200, 255, 117, .08), transparent 48%, rgba(20, 217, 139, .05)),
        radial-gradient(ellipse at 19% 44%, rgba(85, 245, 138, .16), transparent 30rem),
        url('/assets/research-lab-hero-neon-clinical-v2.webp') center center / cover no-repeat !important;
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
      color: #eafff1 !important;
      background: rgba(12, 28, 37, .76) !important;
      border-color: rgba(100, 255, 158, .30) !important;
      box-shadow: 0 12px 36px rgba(0, 0, 0, .27), inset 0 1px rgba(255, 255, 255, .05) !important;
    }

    .hero .hero-badge-dot {
      background: #55f58a !important;
      box-shadow: 0 0 0 5px rgba(85, 245, 138, .10), 0 0 14px rgba(85, 245, 138, .55) !important;
    }

    .hero h1 {
      max-width: 730px !important;
      margin: 0 0 25px !important;
      font-size: clamp(3.4rem, 6.7vw, 6.2rem) !important;
      line-height: .91 !important;
    }

    .hero h1 .silver {
      margin-top: 6px !important;
      background: linear-gradient(105deg, #c8ff75 0%, #55f58a 43%, #14d98b 72%, #b8a8ff 100%) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      filter: drop-shadow(0 0 24px rgba(85, 245, 138, .17)) !important;
    }

    .hero p {
      max-width: 620px !important;
      margin: 0 0 28px !important;
      padding: 0 !important;
      color: #c0cdc5 !important;
      text-align: left !important;
    }

    .hero .hero-buttons {
      justify-content: flex-start !important;
      margin: 0 !important;
    }

    .hero .btn-primary {
      color: #031008 !important;
      background: linear-gradient(135deg, #c8ff75, #55f58a 52%, #14d98b) !important;
      border-color: rgba(200, 255, 117, .62) !important;
      box-shadow: 0 14px 36px rgba(20, 217, 139, .22), inset 0 1px rgba(255, 255, 255, .48) !important;
    }

    .hero .btn-primary:hover {
      box-shadow: 0 18px 44px rgba(20, 217, 139, .29), 0 0 22px rgba(85, 245, 138, .13) !important;
    }

    .hero .hero-ai-cta {
      border-color: rgba(100, 255, 158, .28) !important;
      background: linear-gradient(135deg, rgba(14, 31, 41, .95), rgba(8, 18, 27, .97)) !important;
    }

    .hero .hero-ai-cta::before,
    .hero .hero-ai-cta::after,
    .hero .crypto-assurance b,
    .hero .crypto-assurance a {
      color: #55f58a !important;
    }

    .hero .crypto-assurance {
      max-width: 650px !important;
      justify-content: flex-start !important;
      margin: 20px 0 0 !important;
      color: #b7c8bd !important;
      text-align: left !important;
    }

    .trust-bar {
      border-color: rgba(100, 255, 158, .17) !important;
      background: linear-gradient(145deg, rgba(13, 29, 38, .96), rgba(8, 18, 27, .97)) !important;
      box-shadow: 0 24px 65px rgba(0, 0, 0, .34), inset 0 1px rgba(255, 255, 255, .04) !important;
    }

    .trust-item {
      border-color: rgba(100, 255, 158, .10) !important;
    }

    .trust-item .num {
      color: #55f58a !important;
      text-shadow: 0 0 18px rgba(85, 245, 138, .18) !important;
    }

    .ai-chat-toggle {
      color: #031008 !important;
      background: linear-gradient(135deg, #c8ff75, #55f58a 54%, #14d98b) !important;
      border-color: rgba(200, 255, 117, .58) !important;
      box-shadow: 0 16px 42px rgba(20, 217, 139, .22) !important;
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
          url('/assets/research-lab-hero-neon-clinical-v2.webp') 72% bottom / cover no-repeat !important;
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

  document.body.appendChild(style);
})();
