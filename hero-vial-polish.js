(() => {
  if (document.getElementById('nxt-hero-vial-polish')) return;

  const style = document.createElement('style');
  style.id = 'nxt-hero-vial-polish';
  style.textContent = `
    .hero {
      align-items: flex-start !important;
    }

    .hero .hero-content {
      width: min(760px, 100%) !important;
      max-width: 760px !important;
      margin: 0 !important;
      text-align: left !important;
    }

    .hero .hero-badge {
      margin: 0 0 24px !important;
      color: #d9ffea !important;
      background: rgba(4, 18, 11, .78) !important;
      border-color: rgba(85, 245, 138, .32) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, .34), inset 0 1px rgba(255, 255, 255, .04) !important;
    }

    .hero h1 {
      max-width: 730px !important;
      margin: 0 0 25px !important;
      font-size: clamp(3.4rem, 6.7vw, 6.2rem) !important;
      line-height: .91 !important;
    }

    .hero h1 .silver {
      margin-top: 6px !important;
      background: linear-gradient(105deg, #c8ff75 0%, #55f58a 46%, #14d98b 78%, #70e6ff 100%) !important;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      filter: drop-shadow(0 0 28px rgba(85, 245, 138, .22)) !important;
    }

    .hero p {
      max-width: 620px !important;
      margin: 0 0 28px !important;
      padding: 0 !important;
      color: #b9c9bf !important;
      text-align: left !important;
    }

    .hero .hero-buttons {
      justify-content: flex-start !important;
      margin: 0 !important;
    }

    .hero .btn-primary {
      color: #031008 !important;
      background: linear-gradient(135deg, #c8ff75, #55f58a 48%, #14d98b) !important;
      border-color: rgba(210, 255, 192, .56) !important;
      box-shadow: 0 14px 38px rgba(20, 217, 139, .24), inset 0 1px rgba(255, 255, 255, .4) !important;
    }

    .hero .btn-primary:hover {
      box-shadow: 0 18px 46px rgba(20, 217, 139, .32), 0 0 24px rgba(85, 245, 138, .16) !important;
    }

    .hero .hero-ai-cta {
      border-color: rgba(85, 245, 138, .3) !important;
      background: linear-gradient(135deg, rgba(7, 22, 14, .96), rgba(3, 11, 7, .98)) !important;
    }

    .hero .hero-ai-cta::before,
    .hero .hero-ai-cta::after {
      color: #55f58a !important;
    }

    .hero .crypto-assurance {
      max-width: 650px !important;
      justify-content: flex-start !important;
      margin: 20px 0 0 !important;
      text-align: left !important;
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
      .hero {
        min-height: 760px !important;
        padding: 104px 17px 220px !important;
        align-items: flex-start !important;
        background:
          linear-gradient(180deg, rgba(2, 8, 6, .86) 0%, rgba(2, 8, 6, .75) 53%, rgba(2, 8, 6, .22) 100%),
          linear-gradient(90deg, rgba(2, 7, 6, .96) 0%, rgba(2, 8, 7, .68) 58%, rgba(2, 8, 8, .18) 100%),
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
