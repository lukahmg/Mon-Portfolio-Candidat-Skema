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
    if (typeof updateBackgroundTheme === 'function') {
      updateBackgroundTheme(targetId);
    }
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

  // ==========================================================================
  // ==========================================================================
  // ELEGANT EXECUTIVE SKEMA ORBITAL SYSTEM & DISCREET AMBIENT BACKGROUND
  // ==========================================================================
  const bgCanvas = document.getElementById('bgCanvas');
  const skemaOrbitSystem = document.getElementById('skemaOrbitSystem');

  // Executive SKEMA & Theme Color Profiles (Discreet, refined, academic excellence)
  const sectionThemes = {
    intro: {
      primaryColor: [185, 28, 28],    // SKEMA Carmine Red
      secondaryColor: [30, 41, 59],   // Executive Slate
      speed: 0.45,
      camTargetX: 0,
      camTargetY: 0
    },
    hero: {
      primaryColor: [185, 28, 28],    // SKEMA Carmine Red
      secondaryColor: [15, 23, 42],   // Deep Midnight Slate
      speed: 0.5,
      camTargetX: 0,
      camTargetY: -20
    },
    etape1: {
      primaryColor: [212, 175, 55],   // LVMH Champagne Gold
      secondaryColor: [30, 41, 59],   // Deep Slate
      speed: 0.4,
      camTargetX: -60,
      camTargetY: -30
    },
    etape2: {
      primaryColor: [16, 185, 129],   // Déméter Eco Emerald
      secondaryColor: [15, 23, 42],   // Forest Slate
      speed: 0.4,
      camTargetX: 60,
      camTargetY: -30
    },
    etape3: {
      primaryColor: [59, 130, 246],   // Reseller Executive Cobalt
      secondaryColor: [15, 23, 42],   // Deep Slate
      speed: 0.5,
      camTargetX: -60,
      camTargetY: 30
    },
    etape4: {
      primaryColor: [185, 28, 28],    // SKEMA Carmine Red
      secondaryColor: [30, 41, 59],   // Midnight Slate
      speed: 0.45,
      camTargetX: 60,
      camTargetY: 30
    }
  };

  let currentTheme = {
    primaryColor: [185, 28, 28],
    secondaryColor: [30, 41, 59],
    speed: 0.45,
    camTargetX: 0,
    camTargetY: 0
  };
  let targetTheme = { ...sectionThemes.intro };

  let camCurrentX = 0;
  let camCurrentY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  function updateBackgroundTheme(targetId) {
    if (sectionThemes[targetId]) {
      targetTheme = sectionThemes[targetId];
    }
  }
  window.updateBackgroundTheme = updateBackgroundTheme;

  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    let width = (bgCanvas.width = window.innerWidth);
    let height = (bgCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = bgCanvas.width = window.innerWidth;
      height = bgCanvas.height = window.innerHeight;
    });

    // Discreet ambient stardust particles
    const particles = [];
    const maxParticles = 32;
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.2 + 0.8,
        alpha: Math.random() * 0.25 + 0.1
      });
    }

    // Helper: Linear interpolation
    function lerp(start, end, amt) {
      return start + (end - start) * amt;
    }

    // Discreet micro-tilt with mouse (subtle 3D elegance)
    window.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / width) * 2 - 1;
      mouseY = (e.clientY / height) * 2 - 1;
      targetTiltX = -mouseY * 2.5; // Subtle tilt in degrees
      targetTiltY = mouseX * 2.5;
    });

    function animateBackground() {
      requestAnimationFrame(animateBackground);

      // Smooth color and camera interpolation
      currentTheme.primaryColor[0] = lerp(currentTheme.primaryColor[0], targetTheme.primaryColor[0], 0.04);
      currentTheme.primaryColor[1] = lerp(currentTheme.primaryColor[1], targetTheme.primaryColor[1], 0.04);
      currentTheme.primaryColor[2] = lerp(currentTheme.primaryColor[2], targetTheme.primaryColor[2], 0.04);

      currentTheme.secondaryColor[0] = lerp(currentTheme.secondaryColor[0], targetTheme.secondaryColor[0], 0.04);
      currentTheme.secondaryColor[1] = lerp(currentTheme.secondaryColor[1], targetTheme.secondaryColor[1], 0.04);
      currentTheme.secondaryColor[2] = lerp(currentTheme.secondaryColor[2], targetTheme.secondaryColor[2], 0.04);

      camCurrentX = lerp(camCurrentX, targetTheme.camTargetX + mouseX * 15, 0.03);
      camCurrentY = lerp(camCurrentY, targetTheme.camTargetY + mouseY * 15, 0.03);

      currentTiltX = lerp(currentTiltX, targetTiltX, 0.06);
      currentTiltY = lerp(currentTiltY, targetTiltY, 0.06);

      // Apply subtle micro-tilt to SKEMA Orbital System in Hero
      if (skemaOrbitSystem) {
        skemaOrbitSystem.style.transform = `translate(-50%, -50%) perspective(1000px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
      }

      ctx.clearRect(0, 0, width, height);

      const pR = Math.round(currentTheme.primaryColor[0]);
      const pG = Math.round(currentTheme.primaryColor[1]);
      const pB = Math.round(currentTheme.primaryColor[2]);

      const sR = Math.round(currentTheme.secondaryColor[0]);
      const sG = Math.round(currentTheme.secondaryColor[1]);
      const sB = Math.round(currentTheme.secondaryColor[2]);

      // Soft, discreet executive ambient glow
      const centerX = width / 2 + camCurrentX;
      const centerY = height / 2 + camCurrentY;
      const gradient = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, Math.max(width, height) * 0.65);
      gradient.addColorStop(0, `rgba(${pR}, ${pG}, ${pB}, 0.06)`);
      gradient.addColorStop(0.5, `rgba(${sR}, ${sG}, ${sB}, 0.02)`);
      gradient.addColorStop(1, 'rgba(11, 15, 25, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render discreet stardust specks
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * targetTheme.speed;
        p.y += p.vy * targetTheme.speed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const drawX = p.x + camCurrentX * 0.2;
        const drawY = p.y + camCurrentY * 0.2;

        ctx.beginPath();
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      }
    }

    animateBackground();
  }
});