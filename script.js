document.addEventListener('DOMContentLoaded', () => {
  // --- SPA VIEW SWITCHER ROUTER ---
  const navLinks = document.querySelectorAll('.nav-item-link');
  const sections = document.querySelectorAll('.modern-section');

  function switchActiveView(targetId) {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${targetId}`) {
        link.classList.add('active');
      }
    });

    sections.forEach(sec => {
      sec.classList.remove('active-view');
    });

    targetSection.classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // Handle all internal navigation links (navbar, hub orbit nodes, back buttons)
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const targetId = anchor.getAttribute('href').substring(1);
      if (document.getElementById(targetId)) {
        e.preventDefault();
        switchActiveView(targetId);
      }
    }
  });

  // --- CONTACT SHORTLIST DRAWER ---
  const btnShortlist = document.getElementById('btnShortlist');
  const btnShortlistFloating = document.getElementById('btnShortlistFloating');
  const shortlistDrawer = document.getElementById('shortlistDrawer');
  const shortlistClose = document.getElementById('shortlistClose');

  function openShortlist() {
    if (shortlistDrawer) shortlistDrawer.classList.add('open');
  }

  function closeShortlist() {
    if (shortlistDrawer) shortlistDrawer.classList.remove('open');
  }

  if (btnShortlist) btnShortlist.addEventListener('click', openShortlist);
  if (btnShortlistFloating) btnShortlistFloating.addEventListener('click', openShortlist);
  if (shortlistClose) shortlistClose.addEventListener('click', closeShortlist);

  // --- LIGHTBOX IMAGE MODAL ---
  const modalOverlay = document.getElementById('modalOverlay');
  const modalImage = document.getElementById('modalImage');
  const modalClose = document.getElementById('modalClose');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomResetBtn = document.getElementById('zoomResetBtn');

  let currentZoom = 1;

  function updateZoom() {
    if (modalImage) {
      modalImage.style.transform = `scale(${currentZoom})`;
    }
  }

  document.querySelectorAll('.image-box img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      if (modalOverlay && modalImage) {
        modalImage.src = img.src;
        currentZoom = 1;
        updateZoom();
        modalOverlay.classList.add('active');
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      if (modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active');
    });
  }

  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', () => {
      currentZoom = Math.min(currentZoom + 0.25, 3);
      updateZoom();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', () => {
      currentZoom = Math.max(currentZoom - 0.25, 0.5);
      updateZoom();
    });
  }

  if (zoomResetBtn) {
    zoomResetBtn.addEventListener('click', () => {
      currentZoom = 1;
      updateZoom();
    });
  }

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modalOverlay) modalOverlay.classList.remove('active');
      if (shortlistDrawer) shortlistDrawer.classList.remove('open');
    }
  });

  // --- LVMH TAB CONTROLS ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(btn.getAttribute('data-tab'));
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // --- REUSABLE SECTION SUB-TABS (Ex: Étape 2 Déméter) ---
  const sectionTabBtns = document.querySelectorAll('.section-tab-btn');
  sectionTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.modern-section') || btn.parentElement.parentElement;
      const peerBtns = container.querySelectorAll('.section-tab-btn');
      const peerPanes = container.querySelectorAll('.section-tab-pane');

      peerBtns.forEach(b => b.classList.remove('active'));
      peerPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // --- SIMULATEUR RENTABILITÉ RESELL (Étape 3) ---
  const inputBuy = document.getElementById('inputBuy');
  const sliderBuy = document.getElementById('sliderBuy');
  const inputSell = document.getElementById('inputSell');
  const sliderSell = document.getElementById('sliderSell');
  const resProfit = document.getElementById('resProfit');
  const resMargin = document.getElementById('resMargin');
  const resRoi = document.getElementById('resRoi');

  function calculateProfit() {
    if (!inputBuy || !inputSell) return;

    const buyVal = parseFloat(inputBuy.value) || 0;
    const sellVal = parseFloat(inputSell.value) || 0;

    const profit = sellVal - buyVal;
    const margin = sellVal > 0 ? Math.round((profit / sellVal) * 100) : 0;
    const roi = buyVal > 0 ? Math.round((profit / buyVal) * 100) : 0;

    if (resProfit) resProfit.textContent = (profit >= 0 ? '+' : '') + profit + ' €';
    if (resMargin) resMargin.textContent = margin + '%';
    if (resRoi) resRoi.textContent = (roi >= 0 ? '+' : '') + roi + '%';
  }

  if (sliderBuy && inputBuy) {
    sliderBuy.addEventListener('input', () => {
      inputBuy.value = sliderBuy.value;
      calculateProfit();
    });
    inputBuy.addEventListener('input', () => {
      sliderBuy.value = inputBuy.value;
      calculateProfit();
    });
  }

  if (sliderSell && inputSell) {
    sliderSell.addEventListener('input', () => {
      inputSell.value = sliderSell.value;
      calculateProfit();
    });
    inputSell.addEventListener('input', () => {
      sliderSell.value = inputSell.value;
      calculateProfit();
    });
  }

  calculateProfit();
});