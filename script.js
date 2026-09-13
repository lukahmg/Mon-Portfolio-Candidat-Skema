document.addEventListener('DOMContentLoaded', () => {
  // --- SPA VIEW SWITCHER ROUTER ---
  const navLinks = document.querySelectorAll('.nav-item-link');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
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

    mobileNavItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${targetId}`) {
        item.classList.add('active');
      }
    });

    sections.forEach(sec => {
      sec.classList.remove('active-view');
    });

    targetSection.classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // --- MOBILE NAVIGATION 3-BAR TOGGLE & POPUP SHEET ---
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileNavPopover = document.getElementById('mobileNavPopover');
  const mobileNavClose = document.getElementById('mobileNavClose');
  const mobileNavBackdrop = document.getElementById('mobileNavBackdrop');
  const btnMobileContact = document.getElementById('btnMobileContact');

  function openMobileNav() {
    if (mobileNavPopover) mobileNavPopover.classList.add('open');
    if (mobileNavToggle) mobileNavToggle.classList.add('open');
  }

  function closeMobileNav() {
    if (mobileNavPopover) mobileNavPopover.classList.remove('open');
    if (mobileNavToggle) mobileNavToggle.classList.remove('open');
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (mobileNavPopover && mobileNavPopover.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMobileNav);
  if (mobileNavBackdrop) mobileNavBackdrop.addEventListener('click', closeMobileNav);

  // Handle all internal navigation links (navbar, hub orbit nodes, back buttons, mobile items)
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      const targetId = anchor.getAttribute('href').substring(1);
      if (document.getElementById(targetId)) {
        e.preventDefault();
        closeMobileNav();
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
  if (btnMobileContact) {
    btnMobileContact.addEventListener('click', () => {
      closeMobileNav();
      openShortlist();
    });
  }

  const linktreeContactBtn = document.getElementById('linktreeContactBtn');
  if (linktreeContactBtn) {
    linktreeContactBtn.addEventListener('click', openShortlist);
  }

  // --- PURE BLURRED LIGHTBOX MODAL WITH TOUCH PINCH-TO-ZOOM ---
  const modalOverlay = document.getElementById('modalOverlay');
  const modalImageContainer = document.getElementById('modalImageContainer');
  const modalImage = document.getElementById('modalImage');
  const modalClose = document.getElementById('modalClose');

  let currentScale = 1;
  let currentTransX = 0;
  let currentTransY = 0;
  let initialPinchDistance = 0;
  let startScale = 1;
  let startTouchX = 0;
  let startTouchY = 0;
  let startTransX = 0;
  let startTransY = 0;
  let isPinching = false;
  let isDragging = false;
  let lastTapTime = 0;

  function applyImageTransform(smooth = false) {
    if (!modalImage) return;
    modalImage.style.transition = smooth ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    modalImage.style.transform = `translate3d(${currentTransX}px, ${currentTransY}px, 0) scale(${currentScale})`;
  }

  function resetModalImage(smooth = false) {
    currentScale = 1;
    currentTransX = 0;
    currentTransY = 0;
    applyImageTransform(smooth);
  }

  document.querySelectorAll('.image-box img, .clickable-proof img, .clickable-proof').forEach(item => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', (e) => {
      const img = item.tagName === 'IMG' ? item : item.querySelector('img');
      if (img && modalOverlay && modalImage) {
        modalImage.src = img.src;
        resetModalImage(false);
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
      resetModalImage(false);
    }
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay || e.target === modalImageContainer) {
        if (currentScale > 1.15) {
          resetModalImage(true);
        } else {
          closeModal();
        }
      }
    });
  }

  // Touch Gestures: Pinch to Zoom, Pan, and Double-Tap
  if (modalImageContainer) {
    modalImageContainer.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        isPinching = true;
        isDragging = false;
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        startScale = currentScale;
        e.preventDefault();
      } else if (e.touches.length === 1) {
        isPinching = false;
        const now = Date.now();
        if (now - lastTapTime < 300) {
          // Double-tap toggle
          if (currentScale > 1.2) {
            resetModalImage(true);
          } else {
            currentScale = 2.5;
            currentTransX = 0;
            currentTransY = 0;
            applyImageTransform(true);
          }
          lastTapTime = 0;
          e.preventDefault();
          return;
        }
        lastTapTime = now;

        if (currentScale > 1.05) {
          isDragging = true;
          startTouchX = e.touches[0].clientX;
          startTouchY = e.touches[0].clientY;
          startTransX = currentTransX;
          startTransY = currentTransY;
          e.preventDefault();
        }
      }
    }, { passive: false });

    modalImageContainer.addEventListener('touchmove', (e) => {
      if (isPinching && e.touches.length === 2) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (initialPinchDistance > 0) {
          currentScale = Math.min(Math.max(startScale * (currentDist / initialPinchDistance), 1), 4.5);
          applyImageTransform(false);
        }
        e.preventDefault();
      } else if (isDragging && e.touches.length === 1 && currentScale > 1.05) {
        const deltaX = e.touches[0].clientX - startTouchX;
        const deltaY = e.touches[0].clientY - startTouchY;
        const maxOffset = (currentScale - 1) * 220;
        currentTransX = Math.min(Math.max(startTransX + deltaX, -maxOffset), maxOffset);
        currentTransY = Math.min(Math.max(startTransY + deltaY, -maxOffset), maxOffset);
        applyImageTransform(false);
        e.preventDefault();
      }
    }, { passive: false });

    modalImageContainer.addEventListener('touchend', (e) => {
      if (e.touches.length < 2) {
        isPinching = false;
      }
      if (e.touches.length === 0) {
        isDragging = false;
        if (currentScale < 1.05) {
          resetModalImage(true);
        }
      }
    });

    modalImageContainer.addEventListener('touchcancel', () => {
      isPinching = false;
      isDragging = false;
      if (currentScale < 1.05) {
        resetModalImage(true);
      }
    });
  }

  // Keyboard close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeMobileNav();
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