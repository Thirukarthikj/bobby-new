/**
 * Product Category Showcase & Filtering
 * Inspired by MTC Polymers layout & navigation
 * Designed for Bobby Packaging
 */

(function () {
  'use strict';

  function initProductShowcase() {
    const showcaseSection = document.querySelector('.mtc-showcase-section');
    if (!showcaseSection) return;

    const categoryCards = document.querySelectorAll('.mtc-pgroup[data-category]');
    const productItems = document.querySelectorAll('.p1[data-category]');
    const filterBar = document.getElementById('mtc-filter-bar');
    const filterBadge = document.getElementById('mtc-filter-badge');
    const resetBtn = document.getElementById('mtc-filter-reset');

    // Only apply on-page filtering if product items are present (e.g., on product.html)
    const isProductPage = productItems.length > 0;

    function applyFilter(categorySlug, shouldScroll) {
      if (!isProductPage) return;

      if (!categorySlug || categorySlug === 'all') {
        // Show all products
        productItems.forEach(item => {
          item.classList.remove('mtc-hidden');
          item.classList.add('mtc-visible');
        });

        categoryCards.forEach(card => card.classList.remove('active'));

        if (filterBar) {
          filterBar.style.display = 'none';
        }

        // Update URL without reloading
        const url = new URL(window.location);
        url.searchParams.delete('category');
        history.replaceState(null, '', url.pathname);
        return;
      }

      // Filter to specific category
      let matchedItem = null;
      let matchedCard = null;

      productItems.forEach(item => {
        if (item.getAttribute('data-category') === categorySlug) {
          item.classList.remove('mtc-hidden');
          item.classList.add('mtc-visible');
          matchedItem = item;
        } else {
          item.classList.remove('mtc-visible');
          item.classList.add('mtc-hidden');
        }
      });

      categoryCards.forEach(card => {
        if (card.getAttribute('data-category') === categorySlug) {
          card.classList.add('active');
          matchedCard = card;
        } else {
          card.classList.remove('active');
        }
      });

      // Update Filter Bar
      if (filterBar && matchedCard) {
        const titleText = matchedCard.querySelector('.mtc-pdesc h3')
          ? matchedCard.querySelector('.mtc-pdesc h3').textContent.replace(/\s+/g, ' ').trim()
          : categorySlug.toUpperCase();

        if (filterBadge) {
          filterBadge.textContent = titleText;
        }
        filterBar.style.display = 'flex';
      }

      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('category', categorySlug);
      history.replaceState(null, '', url.toString());

      // Scroll smoothly to matching product or filter bar if requested
      if (shouldScroll && matchedItem) {
        setTimeout(() => {
          const targetEl = filterBar || matchedItem;
          if (targetEl && typeof targetEl.scrollIntoView === 'function') {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (targetEl) {
            const navOffset = 110;
            const elementPosition = targetEl.getBoundingClientRect().top;
            const offsetPosition = elementPosition + (window.pageYOffset || document.documentElement.scrollTop) - navOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 80);
      }
    }

    // Attach click listeners to category cards on product.html
    if (isProductPage) {
      categoryCards.forEach(card => {
        card.addEventListener('click', function (e) {
          e.preventDefault();
          const categorySlug = this.getAttribute('data-category');
          applyFilter(categorySlug, true);
        });
      });

      if (resetBtn) {
        resetBtn.addEventListener('click', function (e) {
          e.preventDefault();
          applyFilter('all', false);

          // Scroll back to top of showcase section
          if (showcaseSection && typeof showcaseSection.scrollIntoView === 'function') {
            showcaseSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            const navOffset = 110;
            const offsetPosition = showcaseSection.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop) - navOffset;
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        });
      }

      // Check initial URL parameters on load
      const urlParams = new URLSearchParams(window.location.search);
      const initialCat = urlParams.get('category');
      const hashCat = window.location.hash ? window.location.hash.replace('#cat-', '').replace('#', '') : null;

      const targetCategory = initialCat || hashCat;
      if (targetCategory) {
        applyFilter(targetCategory, true);
      }
    }
  }

  /**
   * Industry Tabbed Showcase Interactive Logic
   * FOOD | SNACKS | GARMENTS | AGRO & INDUSTRIAL | SPECIALTY
   */
  function initIndustryTabs() {
    const industrySection = document.querySelector('.mtc-industry-section');
    if (!industrySection) return;

    const tabBtns = industrySection.querySelectorAll('.mtc-ind-tab-btn');
    const tabPanels = industrySection.querySelectorAll('.mtc-ind-panel');

    // Setup slider for each panel
    const sliders = [];

    tabPanels.forEach(panel => {
      const images = panel.querySelectorAll('.mtc-slider-img');
      const dots = panel.querySelectorAll('.mtc-slider-dot');
      if (images.length === 0) return;

      let currentIndex = 0;
      let intervalId = null;

      function goToSlide(index) {
        currentIndex = (index + images.length) % images.length;
        images.forEach((img, i) => {
          img.classList.toggle('active', i === currentIndex);
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }

      function startAutoPlay() {
        if (images.length <= 1) return;
        stopAutoPlay();
        intervalId = setInterval(() => {
          goToSlide(currentIndex + 1);
        }, 3200);
      }

      function stopAutoPlay() {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
          goToSlide(i);
          startAutoPlay();
        });
      });

      const visualContainer = panel.querySelector('.mtc-ind-visual');
      if (visualContainer) {
        visualContainer.addEventListener('mouseenter', stopAutoPlay);
        visualContainer.addEventListener('mouseleave', startAutoPlay);
      }

      sliders.push({
        panelId: panel.id,
        goToSlide,
        startAutoPlay,
        stopAutoPlay
      });
    });

    // Tab button click handling
    tabBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');

        tabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        tabPanels.forEach(p => {
          if (p.id === targetId) {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });

        // Start autoplay on the newly active slider, stop others
        sliders.forEach(slider => {
          if (slider.panelId === targetId) {
            slider.goToSlide(0);
            slider.startAutoPlay();
          } else {
            slider.stopAutoPlay();
          }
        });
      });
    });

    // Start slider on the initial active panel
    const initialActivePanel = industrySection.querySelector('.mtc-ind-panel.active');
    if (initialActivePanel) {
      const activeSlider = sliders.find(s => s.panelId === initialActivePanel.id);
      if (activeSlider) {
        activeSlider.startAutoPlay();
      }
    }
  }

  /**
   * Pouch Variant Switcher (Interactive Snack & Sweet Pouches)
   */
  function initPouchVariantSwitcher() {
    const thumbBtns = document.querySelectorAll('.pouch-thumb-btn');
    const mainImg = document.getElementById('snack-pouch-main-img');
    const desc1 = document.getElementById('snack-pouch-desc1');
    const desc2 = document.getElementById('snack-pouch-desc2');
    const waBtn = document.getElementById('snack-pouch-whatsapp');

    if (!thumbBtns.length || !mainImg) return;

    thumbBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        thumbBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const newImg = this.getAttribute('data-img');
        const title = this.getAttribute('data-title');
        const d1 = this.getAttribute('data-desc1');
        const d2 = this.getAttribute('data-desc2');

        // Smooth image transition
        mainImg.style.opacity = '0';
        mainImg.style.transform = 'scale(0.96)';

        setTimeout(() => {
          mainImg.src = newImg;
          mainImg.alt = title;
          mainImg.style.opacity = '1';
          mainImg.style.transform = 'scale(1)';
        }, 150);

        if (d1 && desc1) desc1.textContent = d1;
        if (d2 && desc2) desc2.textContent = d2;
        if (waBtn && title) {
          waBtn.href = `https://wa.me/+918754002737?text=I'm%20interested%20in%20your%20${encodeURIComponent(title)}%20Product`;
        }
      });
    });
  }

  function init() {
    initProductShowcase();
    initIndustryTabs();
    initPouchVariantSwitcher();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
