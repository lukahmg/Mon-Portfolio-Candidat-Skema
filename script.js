document.addEventListener('DOMContentLoaded', () => {
  // --- MULTILINGUAL ENGINE (FR / EN / ES) WITH HIGH-TECH FLUID TRANSITIONS ---
  const langButtons = document.querySelectorAll('.lang-btn');
  const langSweepBar = document.getElementById('langSweepBar');
  const langHudPill = document.getElementById('langHudPill');
  const langHudFlag = document.getElementById('langHudFlag');
  const langHudLabel = document.getElementById('langHudLabel');
  let isLangTransitioning = false;
  let hudTimeout = null;

  const LANG_META = {
    fr: { label: 'Français (FR)' },
    en: { label: 'English (EN)' },
    es: { label: 'Español (ES)' }
  };

  function showLangHud(lang) {
    if (!langHudPill) return;
    const meta = LANG_META[lang] || { label: lang.toUpperCase() };
    if (langHudLabel) langHudLabel.textContent = meta.label;

    langHudPill.classList.remove('is-visible');
    void langHudPill.offsetWidth; // trigger reflow
    langHudPill.classList.add('is-visible');

    if (hudTimeout) clearTimeout(hudTimeout);
    hudTimeout = setTimeout(() => {
      langHudPill.classList.remove('is-visible');
    }, 1100);
  }

  function triggerLaserSweep() {
    if (!langSweepBar) return;
    langSweepBar.classList.remove('sweeping');
    void langSweepBar.offsetWidth; // trigger reflow
    langSweepBar.classList.add('sweeping');
  }

  function applyTranslations(lang) {
    if (!window.PORTFOLIO_TRANSLATIONS || !window.PORTFOLIO_TRANSLATIONS[lang]) {
      console.warn('Portfolio translations not available for language:', lang);
      return;
    }
    const dict = window.PORTFOLIO_TRANSLATIONS[lang];
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('luka_portfolio_lang', lang);
    } catch (e) {
      console.warn('localStorage not accessible:', e);
    }

    if (dict['page.title']) {
      document.title = dict['page.title'];
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict['page.desc']) {
      metaDesc.setAttribute('content', dict['page.desc']);
    }

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        if (/<[a-z][\s\S]*>/i.test(dict[key])) {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key] !== undefined) {
        el.setAttribute('title', dict[key]);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    langButtons.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }

  function setLanguage(targetLang, clickedBtn = null) {
    if (!window.PORTFOLIO_TRANSLATIONS || !window.PORTFOLIO_TRANSLATIONS[targetLang]) return;
    const currentLang = document.documentElement.lang || 'fr';

    // If already active language, trigger tactile pulse & confirm HUD
    if (currentLang === targetLang) {
      if (clickedBtn) {
        clickedBtn.classList.remove('lang-btn-pulse');
        void clickedBtn.offsetWidth;
        clickedBtn.classList.add('lang-btn-pulse');
      }
      showLangHud(targetLang);
      return;
    }

    if (isLangTransitioning) return;
    isLangTransitioning = true;

    // 1. Tactile feedback on button and switchers
    if (clickedBtn) {
      clickedBtn.classList.remove('lang-btn-pulse');
      void clickedBtn.offsetWidth;
      clickedBtn.classList.add('lang-btn-pulse');
    }
    const switchers = document.querySelectorAll('.lang-switcher');
    switchers.forEach(s => s.classList.add('is-switching'));

    // 2. Cinematic visual effects: laser sweep & floating HUD pill
    triggerLaserSweep();
    showLangHud(targetLang);

    // 3. Select translatable view containers for micro-blur & fade
    const transitionTargets = document.querySelectorAll(
      '#intro .linktree-dashboard-container, .modern-section.active-view, .modern-header .brand-text-group, .modern-header .nav-links-wrapper, .modern-header .header-contact-btn, .mobile-nav-pane'
    );

    transitionTargets.forEach(el => {
      el.classList.add('lang-target', 'lang-phase-out');
      el.classList.remove('lang-phase-in');
    });

    // 4. Midpoint: Update all texts while elements are blurred & softened (120ms)
    setTimeout(() => {
      applyTranslations(targetLang);

      transitionTargets.forEach(el => {
        el.classList.remove('lang-phase-out');
        el.classList.add('lang-phase-in');
      });

      // 5. Completion & cleanup (after spring reveal 240ms)
      setTimeout(() => {
        transitionTargets.forEach(el => {
          el.classList.remove('lang-phase-in', 'lang-target');
        });
        switchers.forEach(s => s.classList.remove('is-switching'));
        isLangTransitioning = false;
      }, 240);
    }, 120);
  }

  langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const lang = btn.getAttribute('data-lang');
      if (lang) setLanguage(lang, btn);
    });
  });

  // Initialize language from localStorage or default to 'fr'
  let savedLang = 'fr';
  try {
    savedLang = localStorage.getItem('luka_portfolio_lang') || 'fr';
  } catch (e) {}
  if (savedLang && savedLang !== 'fr') {
    applyTranslations(savedLang);
  }
  window.setPortfolioLanguage = setLanguage;

  // --- SPA VIEW SWITCHER ROUTER (120HZ ULTRA-FLUID APP-LIKE MOTION) ---
  const navLinks = document.querySelectorAll('.nav-item-link');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  const sections = document.querySelectorAll('.modern-section');

  let switchTimeout = null;

  function switchActiveView(targetId) {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;

    const currentActive = document.querySelector('.modern-section.active-view');
    if (currentActive === targetSection && !currentActive.classList.contains('is-leaving')) {
      return;
    }

    // Instant update of navigation markers for reactive tactile feel
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
    });

    mobileNavItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === `#${targetId}`);
    });

    if (typeof updateBackgroundTheme === 'function') {
      updateBackgroundTheme(targetId);
    }

    const stickyBtn = document.getElementById('btnShortlistFloating');
    const header = document.querySelector('.modern-header');
    if (targetId === 'intro') {
      if (stickyBtn) stickyBtn.style.display = 'none';
      if (header) header.classList.add('header-hidden');
      document.body.classList.add('on-intro');
    } else {
      if (stickyBtn) stickyBtn.style.display = 'flex';
      if (header) header.classList.remove('header-hidden');
      document.body.classList.remove('on-intro');
    }

    if (switchTimeout) {
      clearTimeout(switchTimeout);
      switchTimeout = null;
    }

    if (currentActive && currentActive !== targetSection) {
      currentActive.classList.add('is-leaving');
      switchTimeout = setTimeout(() => {
        sections.forEach(sec => sec.classList.remove('active-view', 'is-leaving'));
        targetSection.classList.add('active-view');
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (typeof window.triggerMobileRender === 'function') {
          window.triggerMobileRender();
        }
      }, 150);
    } else {
      sections.forEach(sec => sec.classList.remove('active-view', 'is-leaving'));
      targetSection.classList.add('active-view');
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (typeof window.triggerMobileRender === 'function') {
        window.triggerMobileRender();
      }
    }
  }

  // --- ANTI-TOUCH-TO-SEARCH & SELECTION SHIELD ---
  // Completely eliminates unwanted Android/browser popups ("Recherche Google" / text copy bubbles)
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const anchor = selection.anchorNode;
      const parent = anchor?.nodeType === 1 ? anchor : anchor?.parentElement;
      if (!parent?.closest('.selectable-copy')) {
        selection.removeAllRanges();
      }
    }
  });

  document.addEventListener('touchend', (e) => {
    if (!e.target.closest('.selectable-copy')) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        sel.removeAllRanges();
      }
    }
  }, { passive: true });

  // --- DISCREET CARD SPOTLIGHT INTERACTION (LINEAR / APPLE STYLE) ---
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let lastMoveTime = 0;
    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastMoveTime < 14) return; // ~70-120fps sync throttle
      lastMoveTime = now;

      const card = e.target.closest('.vivid-card, .linktree-link-card, .orbit-node');
      if (card) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--spot-x', `${x}px`);
        card.style.setProperty('--spot-y', `${y}px`);
      }
    }, { passive: true });
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
    document.body.classList.add('shortlist-open');
  }

  function closeShortlist() {
    if (shortlistDrawer) shortlistDrawer.classList.remove('open');
    document.body.classList.remove('shortlist-open');
  }

  if (btnShortlist) {
    btnShortlist.addEventListener('click', (e) => {
      e.stopPropagation();
      openShortlist();
    });
  }
  if (btnShortlistFloating) {
    // Initial state: hide redundant floating button and navbar on intro landing page
    const initialActive = document.querySelector('.modern-section.active-view');
    const header = document.querySelector('.modern-header');
    if (initialActive && initialActive.id === 'intro') {
      btnShortlistFloating.style.display = 'none';
      if (header) header.classList.add('header-hidden');
      document.body.classList.add('on-intro');
    }

    btnShortlistFloating.addEventListener('click', (e) => {
      e.stopPropagation();
      openShortlist();
    });
  }
  if (shortlistClose) {
    shortlistClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeShortlist();
    });
  }
  if (btnMobileContact) {
    btnMobileContact.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileNav();
      openShortlist();
    });
  }

  const linktreeContactBtn = document.getElementById('linktreeContactBtn');
  if (linktreeContactBtn) {
    linktreeContactBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openShortlist();
    });
  }

  const heroCvBtn = document.getElementById('heroCvBtn');
  if (heroCvBtn) {
    heroCvBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openShortlist();
    });
  }

  // Close shortlist drawer when clicking outside
  document.addEventListener('click', (e) => {
    if (shortlistDrawer && shortlistDrawer.classList.contains('open')) {
      const isInsideDrawer = shortlistDrawer.contains(e.target);
      const isModal = e.target.closest('#modalOverlay');
      if (!isInsideDrawer && !isModal) {
        closeShortlist();
      }
    }
  });

  // Close shortlist drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (shortlistDrawer && shortlistDrawer.classList.contains('open')) {
        closeShortlist();
      }
    }
  });

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

  const modalSpinner = document.getElementById('modalSpinner');
  const modalFallback = document.getElementById('modalFallback');
  const modalFallbackLink = document.getElementById('modalFallbackLink');

  const fallbackMap = {
    'assets/cv_luka_fr_hd.png': 'assets/cv_luka_fr.png',
    'assets/cv_luka_uk_hd.png': 'assets/cv_luka_en.png',
    'assets/cv_luka_usa_hd.png': 'assets/cv_luka_en.png',
    'assets/cv_luka_es_hd.png': 'assets/cv_luka_es.png'
  };

  const pdfMap = {
    'assets/cv_luka_fr_hd.png': 'assets/CV_Luka_XIONG_SKEMA.pdf',
    'assets/cv_luka_uk_hd.png': 'assets/CV_Luka_XIONG_UK.pdf',
    'assets/cv_luka_usa_hd.png': 'assets/CV_Luka_XIONG_USA.pdf',
    'assets/cv_luka_es_hd.png': 'assets/CV_Luka_XIONG_ES.pdf',
    'assets/lvmh_cert_1_hd.png': 'assets/certificat_lvmh_creation_operations.pdf',
    'assets/lvmh_cert_2_hd.png': 'assets/certificat_lvmh_creation_retail.pdf',
    'assets/lvmh_cert_3_hd.png': 'assets/certificat_lvmh_operations_retail.pdf',
    'assets/certificat_clos_pajot_hd.jpg': 'assets/certificat_participation_clos_pajot.pdf'
  };

  function showModalImage(imgSrc) {
    if (!modalOverlay || !modalImage || !imgSrc) return;

    if (modalSpinner) modalSpinner.style.display = 'flex';
    if (modalFallback) modalFallback.style.display = 'none';
    modalImage.style.display = 'block';
    modalImage.style.opacity = '0';
    resetModalImage(false);
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    let attemptedFallback = false;

    modalImage.onload = () => {
      if (modalSpinner) modalSpinner.style.display = 'none';
      modalImage.style.opacity = '1';
    };

    modalImage.onerror = () => {
      if (!attemptedFallback && fallbackMap[imgSrc]) {
        attemptedFallback = true;
        modalImage.src = fallbackMap[imgSrc];
      } else {
        if (modalSpinner) modalSpinner.style.display = 'none';
        modalImage.style.display = 'none';
        if (modalFallback && modalFallbackLink) {
          modalFallbackLink.href = pdfMap[imgSrc] || imgSrc;
          modalFallback.style.display = 'block';
        }
      }
    };

    modalImage.src = imgSrc;
  }

  document.querySelectorAll('.image-box img, .clickable-proof img, .clickable-proof').forEach(item => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetElement = e.target.closest('.clickable-proof, .image-box img');
      const targetItem = targetElement || item;
      const imgSrc = targetItem.dataset?.img || (targetItem.tagName === 'IMG' ? targetItem.src : targetItem.querySelector('img')?.src);
      if (imgSrc) {
        showModalImage(imgSrc);
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
      if (typeof window.triggerMobileRender === 'function') {
        window.triggerMobileRender();
      }
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

    const isMobile = window.innerWidth <= 768 || ('ontouchstart' in window);
    let transitionFrames = 30;

    // Discreet micro-tilt with mouse (subtle 3D elegance - desktop only)
    if (!isMobile) {
      window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / width) * 2 - 1;
        mouseY = (e.clientY / height) * 2 - 1;
        targetTiltX = -mouseY * 2.5;
        targetTiltY = mouseX * 2.5;
      }, { passive: true });
    }

    function renderFrame() {
      // Smooth color and camera interpolation
      const lerpSpeed = isMobile ? 0.15 : 0.04;
      currentTheme.primaryColor[0] = lerp(currentTheme.primaryColor[0], targetTheme.primaryColor[0], lerpSpeed);
      currentTheme.primaryColor[1] = lerp(currentTheme.primaryColor[1], targetTheme.primaryColor[1], lerpSpeed);
      currentTheme.primaryColor[2] = lerp(currentTheme.primaryColor[2], targetTheme.primaryColor[2], lerpSpeed);

      currentTheme.secondaryColor[0] = lerp(currentTheme.secondaryColor[0], targetTheme.secondaryColor[0], lerpSpeed);
      currentTheme.secondaryColor[1] = lerp(currentTheme.secondaryColor[1], targetTheme.secondaryColor[1], lerpSpeed);
      currentTheme.secondaryColor[2] = lerp(currentTheme.secondaryColor[2], targetTheme.secondaryColor[2], lerpSpeed);

      if (!isMobile) {
        camCurrentX = lerp(camCurrentX, targetTheme.camTargetX + mouseX * 15, 0.03);
        camCurrentY = lerp(camCurrentY, targetTheme.camTargetY + mouseY * 15, 0.03);

        currentTiltX = lerp(currentTiltX, targetTiltX, 0.06);
        currentTiltY = lerp(currentTiltY, targetTiltY, 0.06);

        if (skemaOrbitSystem) {
          skemaOrbitSystem.style.transform = `translate(-50%, -50%) perspective(1000px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`;
        }
      }

      ctx.clearRect(0, 0, width, height);

      const pR = Math.round(currentTheme.primaryColor[0]);
      const pG = Math.round(currentTheme.primaryColor[1]);
      const pB = Math.round(currentTheme.primaryColor[2]);

      const sR = Math.round(currentTheme.secondaryColor[0]);
      const sG = Math.round(currentTheme.secondaryColor[1]);
      const sB = Math.round(currentTheme.secondaryColor[2]);

      // Soft, discreet executive ambient glow
      const centerX = width / 2 + (isMobile ? 0 : camCurrentX);
      const centerY = height / 2 + (isMobile ? 0 : camCurrentY);
      const gradient = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, Math.max(width, height) * 0.65);
      gradient.addColorStop(0, `rgba(${pR}, ${pG}, ${pB}, 0.06)`);
      gradient.addColorStop(0.5, `rgba(${sR}, ${sG}, ${sB}, 0.02)`);
      gradient.addColorStop(1, 'rgba(11, 15, 25, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render discreet stardust specks on desktop
      if (!isMobile) {
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
    }

    let isLoopRunning = false;
    let animFrameId = null;

    function animateBackground() {
      if (document.hidden) {
        isLoopRunning = false;
        return;
      }

      if (isMobile) {
        if (transitionFrames > 0) {
          renderFrame();
          transitionFrames--;
          animFrameId = requestAnimationFrame(animateBackground);
        } else {
          isLoopRunning = false;
        }
      } else {
        renderFrame();
        animFrameId = requestAnimationFrame(animateBackground);
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (animFrameId) cancelAnimationFrame(animFrameId);
        isLoopRunning = false;
      } else {
        if (!isLoopRunning) {
          isLoopRunning = true;
          animFrameId = requestAnimationFrame(animateBackground);
        }
      }
    });

    function triggerMobileRender() {
      transitionFrames = 30;
      if (!isLoopRunning) {
        isLoopRunning = true;
        animateBackground();
      }
    }
    window.triggerMobileRender = triggerMobileRender;

    isLoopRunning = true;
    animateBackground();
  }
});