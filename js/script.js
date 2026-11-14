/**
 * Roastery Coffee - Main Frontend Controller
 * Coordinates product rendering, live search, filtering, sorting, quick view modal,
 * toasts, mobile navigation, newsletter, and contact form interactions.
 */

// Filter & Sort State
let currentCategory = 'all';
let currentSearchQuery = '';
let currentSort = 'featured';
let quickViewSelectedQty = 1;
let currentQuickViewProductId = null;

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Cart and Wishlist
  if (typeof initCart === 'function') initCart();
  if (typeof initWishlist === 'function') initWishlist();
  if (typeof initCheckout === 'function') initCheckout();

  // Initial Product Render
  renderProducts();

  // Setup Event Listeners
  setupNavbar();
  setupThemeToggle();
  setupFilterAndSort();
  setupQuickView();
  setupCategoryCards();
  setupBackToTop();
  setupNewsletter();
  setupContactForm();
});

/**
 * RENDER PRODUCTS GRID
 */
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const countDisplay = document.getElementById('productCountDisplay');
  const emptyState = document.getElementById('productsEmptyState');

  if (!grid) return;

  // 1. Filter
  let filtered = PRODUCTS.filter(product => {
    // Category filter
    const matchesCategory = currentCategory === 'all' || product.category === currentCategory;

    // Search filter
    const query = currentSearchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      product.name.toLowerCase().includes(query) ||
      product.categoryLabel.toLowerCase().includes(query) ||
      product.roastLevel.toLowerCase().includes(query) ||
      product.shortDesc.toLowerCase().includes(query) ||
      product.tastingNotes.some(note => note.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  // 2. Sort
  filtered = sortProductsList(filtered, currentSort);

  // Update counts
  if (countDisplay) {
    countDisplay.textContent = `Showing ${filtered.length} of ${PRODUCTS.length} coffees`;
  }

  // Handle empty state
  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  // Render product cards
  let html = '';
  filtered.forEach(product => {
    const isWishlisted = typeof isInWishlist === 'function' ? isInWishlist(product.id) : false;

    // Generate stars
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 !== 0;
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHtml += `<svg class="star-icon filled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      } else if (i === fullStars && hasHalfStar) {
        starsHtml += `<svg class="star-icon filled" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      } else {
        starsHtml += `<svg class="star-icon empty" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
      }
    }

    html += `
      <div class="product-card" data-id="${product.id}">
        <div class="product-img-wrapper">
          <img src="${product.image}" alt="${product.name}" 
               onerror="this.onerror=null; this.src='${product.fallbackImage}';" 
               loading="lazy" />
          
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}

          <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" 
                  data-wishlist-btn 
                  data-product-id="${product.id}"
                  onclick="handleWishlistClick(${product.id}, this)"
                  aria-label="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}"
                  title="${isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}">
            <svg class="heart-icon ${isWishlisted ? 'heart-filled' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>

          <button class="quick-view-btn" onclick="openQuickView(${product.id})" aria-label="Quick View ${product.name}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Quick View
          </button>
        </div>

        <div class="product-details">
          <div class="product-meta-row">
            <span class="product-roast-pill">${product.roastLevel}</span>
            <div class="product-rating-box">
              <span class="rating-stars">${starsHtml}</span>
              <span class="rating-number">${product.rating}</span>
            </div>
          </div>

          <h3 class="product-title" onclick="openQuickView(${product.id})">${product.name}</h3>
          <p class="product-short-desc">${product.shortDesc}</p>

          <div class="product-tasting-tags">
            ${product.tastingNotes.slice(0, 2).map(n => `<span class="taste-tag">${n}</span>`).join('')}
          </div>

          <div class="product-card-footer">
            <div class="product-price-box">
              <span class="current-price">₹${product.price}</span>
              ${product.originalPrice ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
            </div>

            <button class="btn btn-primary add-to-cart-btn" onclick="handleAddToCartClick(${product.id})" aria-label="Add ${product.name} to Cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    `;
  });

  grid.innerHTML = html;
}

// Sorting logic
function sortProductsList(list, sortType) {
  const copied = [...list];
  switch (sortType) {
    case 'price-low-high':
      return copied.sort((a, b) => a.price - b.price);
    case 'price-high-low':
      return copied.sort((a, b) => b.price - a.price);
    case 'highest-rated':
      return copied.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case 'newest':
      return copied.sort((a, b) => new Date(b.date) - new Date(a.date));
    case 'featured':
    default:
      // Bestsellers first, then rating
      return copied.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || b.rating - a.rating);
  }
}

/**
 * SETUP SEARCH, FILTER & SORTING
 */
function setupFilterAndSort() {
  // Category Pill Buttons
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.getAttribute('data-category');
      renderProducts();
    });
  });

  // Search Input
  const searchInput = document.getElementById('productSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = currentSearchQuery.length > 0 ? 'flex' : 'none';
      }
      renderProducts();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        currentSearchQuery = '';
        searchClearBtn.style.display = 'none';
        searchInput.focus();
        renderProducts();
      }
    });
  }

  // Header quick search bar / toggle
  const headerSearchBtn = document.getElementById('headerSearchBtn');
  if (headerSearchBtn) {
    headerSearchBtn.addEventListener('click', () => {
      const shopSection = document.getElementById('shop');
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          if (searchInput) searchInput.focus();
        }, 500);
      }
    });
  }

  // Sort Select Dropdown
  const sortSelect = document.getElementById('productSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  // Clear All Filters Button (in empty state or toolbar)
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', resetAllFilters);
  }

  const emptyStateResetBtn = document.getElementById('emptyStateResetBtn');
  if (emptyStateResetBtn) {
    emptyStateResetBtn.addEventListener('click', resetAllFilters);
  }
}

function resetAllFilters() {
  currentCategory = 'all';
  currentSearchQuery = '';
  currentSort = 'featured';

  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(p => {
    p.classList.toggle('active', p.getAttribute('data-category') === 'all');
  });

  const searchInput = document.getElementById('productSearchInput');
  if (searchInput) searchInput.value = '';

  const searchClearBtn = document.getElementById('searchClearBtn');
  if (searchClearBtn) searchClearBtn.style.display = 'none';

  const sortSelect = document.getElementById('productSortSelect');
  if (sortSelect) sortSelect.value = 'featured';

  renderProducts();
}

/**
 * SETUP SHOPPING CATEGORIES CARDS
 */
function setupCategoryCards() {
  const catCards = document.querySelectorAll('.category-card');
  catCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const category = card.getAttribute('data-category');
      if (!category) return;

      // Update filter pill
      currentCategory = category;
      const filterPills = document.querySelectorAll('.filter-pill');
      filterPills.forEach(p => {
        p.classList.toggle('active', p.getAttribute('data-category') === category);
      });

      renderProducts();

      // Scroll to shop section
      const shopSection = document.getElementById('shop');
      if (shopSection) {
        shopSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * BUTTON ACTION HANDLERS
 */
function handleAddToCartClick(productId) {
  if (typeof addToCart === 'function') {
    addToCart(productId, 1, "Whole Beans", true);
  }
}

function handleWishlistClick(productId, btn) {
  if (typeof toggleWishlist === 'function') {
    const isAdded = toggleWishlist(productId, true);
    btn.classList.toggle('active', isAdded);
    const svg = btn.querySelector('.heart-icon');
    if (svg) {
      svg.classList.toggle('heart-filled', isAdded);
    }
  }
}

/**
 * PRODUCT QUICK VIEW MODAL
 */
function setupQuickView() {
  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('quickViewModalBackdrop');
  const closeBtn = document.getElementById('quickViewCloseBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeQuickView);
  if (backdrop) backdrop.addEventListener('click', closeQuickView);

  // Quick view stepper
  const qtyMinus = document.getElementById('qvQtyMinus');
  const qtyPlus = document.getElementById('qvQtyPlus');
  const qtyVal = document.getElementById('qvQtyValue');

  if (qtyMinus && qtyPlus && qtyVal) {
    qtyMinus.addEventListener('click', () => {
      if (quickViewSelectedQty > 1) {
        quickViewSelectedQty--;
        qtyVal.textContent = quickViewSelectedQty;
      }
    });

    qtyPlus.addEventListener('click', () => {
      quickViewSelectedQty++;
      qtyVal.textContent = quickViewSelectedQty;
    });
  }

  // Quick View Add to Cart
  const qvAddToCartBtn = document.getElementById('qvAddToCartBtn');
  if (qvAddToCartBtn) {
    qvAddToCartBtn.addEventListener('click', () => {
      if (!currentQuickViewProductId) return;
      const grindSelect = document.getElementById('qvGrindSelect');
      const grind = grindSelect ? grindSelect.value : 'Whole Beans';

      if (typeof addToCart === 'function') {
        addToCart(currentQuickViewProductId, quickViewSelectedQty, grind, true);
      }
      closeQuickView();
    });
  }

  // Quick View Wishlist
  const qvWishlistBtn = document.getElementById('qvWishlistBtn');
  if (qvWishlistBtn) {
    qvWishlistBtn.addEventListener('click', () => {
      if (!currentQuickViewProductId) return;
      if (typeof toggleWishlist === 'function') {
        const isAdded = toggleWishlist(currentQuickViewProductId, true);
        qvWishlistBtn.classList.toggle('active', isAdded);
        const svg = qvWishlistBtn.querySelector('.heart-icon');
        if (svg) svg.classList.toggle('heart-filled', isAdded);
        // Also update card in grid
        renderProducts();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeQuickView();
    }
  });
}

function openQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  currentQuickViewProductId = product.id;
  quickViewSelectedQty = 1;

  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('quickViewModalBackdrop');

  // Populate data
  document.getElementById('qvProductImg').src = product.image;
  document.getElementById('qvProductImg').onerror = function() {
    this.onerror = null;
    this.src = product.fallbackImage;
  };
  document.getElementById('qvProductBadge').textContent = product.badge || product.categoryLabel;
  document.getElementById('qvProductTitle').textContent = product.name;
  document.getElementById('qvProductPrice').textContent = `₹${product.price}`;
  
  const origPriceEl = document.getElementById('qvProductOrigPrice');
  if (origPriceEl) {
    if (product.originalPrice) {
      origPriceEl.textContent = `₹${product.originalPrice}`;
      origPriceEl.style.display = 'inline';
    } else {
      origPriceEl.style.display = 'none';
    }
  }

  document.getElementById('qvProductRatingNum').textContent = product.rating;
  document.getElementById('qvProductReviewsCount').textContent = `(${product.reviews} reviews)`;
  document.getElementById('qvProductRoast').textContent = product.roastLevel;
  document.getElementById('qvProductOrigin').textContent = product.origin;
  document.getElementById('qvProductProcess').textContent = product.process;
  document.getElementById('qvProductDesc').textContent = product.fullDesc;

  // Roast meter dots (1-5)
  const roastMeterContainer = document.getElementById('qvRoastMeter');
  if (roastMeterContainer) {
    let dotsHtml = '';
    for (let i = 1; i <= 5; i++) {
      dotsHtml += `<span class="roast-dot ${i <= product.roastMeter ? 'filled' : ''}"></span>`;
    }
    roastMeterContainer.innerHTML = dotsHtml;
  }

  // Tasting notes pills
  const notesContainer = document.getElementById('qvTastingNotes');
  if (notesContainer) {
    notesContainer.innerHTML = product.tastingNotes
      .map(note => `<span class="tasting-pill">${note}</span>`)
      .join('');
  }

  // Reset quantity stepper
  const qtyVal = document.getElementById('qvQtyValue');
  if (qtyVal) qtyVal.textContent = '1';

  // Sync wishlist button state
  const qvWishlistBtn = document.getElementById('qvWishlistBtn');
  if (qvWishlistBtn) {
    const isSaved = typeof isInWishlist === 'function' ? isInWishlist(product.id) : false;
    qvWishlistBtn.classList.toggle('active', isSaved);
    const svg = qvWishlistBtn.querySelector('.heart-icon');
    if (svg) svg.classList.toggle('heart-filled', isSaved);
  }

  if (modal && backdrop) {
    modal.classList.add('active');
    backdrop.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('quickViewModalBackdrop');
  if (modal && backdrop) {
    modal.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

/**
 * NAVBAR & MOBILE MENU
 */
function setupNavbar() {
  const navbar = document.querySelector('.navbar-roastery');
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileMenu = document.getElementById('mobileNavMenu');
  const mobileBackdrop = document.getElementById('mobileNavBackdrop');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  // Sticky shadow effect on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar?.classList.add('navbar-scrolled');
    } else {
      navbar?.classList.remove('navbar-scrolled');
    }
  });

  // Mobile menu open / close
  if (mobileToggle && mobileMenu && mobileBackdrop) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('active');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileBackdrop.addEventListener('click', closeMobileMenu);
  }

  function openMobileMenu() {
    mobileMenu?.classList.add('active');
    mobileBackdrop?.classList.add('active');
    mobileToggle?.classList.add('is-active');
    document.body.classList.add('drawer-open');
  }

  function closeMobileMenu() {
    mobileMenu?.classList.remove('active');
    mobileBackdrop?.classList.remove('active');
    mobileToggle?.classList.remove('is-active');
    document.body.classList.remove('drawer-open');
  }

  // Smooth scroll and auto-close menu
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        closeMobileMenu();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const navHeight = navbar ? navbar.offsetHeight : 80;
          const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/**
 * BACK TO TOP BUTTON
 */
function setupBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * TOAST NOTIFICATION SYSTEM
 */
function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `roastery-toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'info') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-content">
      ${iconSvg}
      <span class="toast-message">${message}</span>
    </div>
    <button class="toast-close-btn" aria-label="Close Notification">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Close handlers
  const closeBtn = toast.querySelector('.toast-close-btn');
  closeBtn.addEventListener('click', () => dismissToast(toast));

  const autoDismiss = setTimeout(() => {
    dismissToast(toast);
  }, duration);

  function dismissToast(el) {
    clearTimeout(autoDismiss);
    el.classList.remove('show');
    el.classList.add('hide');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }
}

/**
 * NEWSLETTER SUBSCRIPTION FORM
 */
function setupNewsletter() {
  const form = document.getElementById('newsletterForm');
  const input = document.getElementById('newsletterEmail');
  const messageBox = document.getElementById('newsletterFeedback');

  if (!form || !input) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      if (messageBox) {
        messageBox.className = 'newsletter-feedback error';
        messageBox.textContent = 'Please enter a valid email address.';
        messageBox.style.display = 'block';
      }
      showToast('Please provide a valid email address.', 'warning');
      return;
    }

    // Success simulation
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Subscribing...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      input.value = '';

      if (messageBox) {
        messageBox.className = 'newsletter-feedback success';
        messageBox.innerHTML = `☕ <strong>Welcome to the Club!</strong> Thank you for subscribing. (Demo confirmation)`;
        messageBox.style.display = 'block';
      }

      showToast('Thank you for subscribing to Roastery Coffee updates! (Demo)', 'success');
    }, 700);
  });
}

/**
 * CONTACT FORM
 */
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.contactName.value.trim();
    const email = form.contactEmail.value.trim();
    const subject = form.contactSubject.value.trim();
    const message = form.contactMessage.value.trim();

    let isValid = true;

    if (name.length < 2) {
      showContactError('contactName', 'Please enter your name');
      isValid = false;
    } else {
      clearContactError('contactName');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showContactError('contactEmail', 'Please enter a valid email address');
      isValid = false;
    } else {
      clearContactError('contactEmail');
    }

    if (subject.length < 3) {
      showContactError('contactSubject', 'Please enter a subject');
      isValid = false;
    } else {
      clearContactError('contactSubject');
    }

    if (message.length < 10) {
      showContactError('contactMessage', 'Please provide a message with at least 10 characters');
      isValid = false;
    } else {
      clearContactError('contactMessage');
    }

    if (!isValid) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending Message...';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.reset();

      const successBox = document.getElementById('contactSuccessAlert');
      if (successBox) {
        successBox.style.display = 'block';
        setTimeout(() => {
          successBox.style.display = 'none';
        }, 6000);
      }

      showToast('Message sent! Our coffee specialists will get back to you soon. (Demo)', 'success');
    }, 800);
  });
}

function showContactError(fieldName, msg) {
  const input = document.getElementById(fieldName);
  const err = document.getElementById(`${fieldName}Error`);
  if (input) input.classList.add('is-invalid');
  if (err) {
    err.textContent = msg;
    err.style.display = 'block';
  }
}

function clearContactError(fieldName) {
  const input = document.getElementById(fieldName);
  const err = document.getElementById(`${fieldName}Error`);
  if (input) input.classList.remove('is-invalid');
  if (err) {
    err.textContent = '';
    err.style.display = 'none';
  }
}

/**
 * THEME TOGGLE (LIGHT / DARK THEME)
 * Remembers user selection with localStorage persistence.
 * Defaults to Light Theme for new visitors.
 */
const THEME_STORAGE_KEY = 'roastery_theme';

function setupThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const mobileToggleBtn = document.getElementById('mobileThemeToggleBtn');

  // Sync initial UI state with the active theme set on <html>
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  updateThemeUI(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }

  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Add smooth transition class
  document.documentElement.classList.add('theme-transitioning');

  // Apply new theme attribute
  document.documentElement.setAttribute('data-theme', newTheme);

  // Persist to localStorage
  try {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  } catch (e) {
    console.warn('Could not save theme preference to localStorage', e);
  }

  // Update UI icons & labels
  updateThemeUI(newTheme);

  // Remove transition class after animation finishes
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 380);

  // Toast notification feedback
  if (typeof showToast === 'function') {
    if (newTheme === 'dark') {
      showToast('Switched to Dark Theme 🌙', 'info', 2200);
    } else {
      showToast('Switched to Light Theme ☀️', 'info', 2200);
    }
  }
}

function updateThemeUI(theme) {
  const toggleBtn = document.getElementById('themeToggleBtn');
  const mobileToggleBtn = document.getElementById('mobileThemeToggleBtn');

  if (toggleBtn) {
    if (theme === 'dark') {
      toggleBtn.setAttribute('title', 'Switch to Light Theme');
      toggleBtn.setAttribute('aria-label', 'Switch to Light Theme');
    } else {
      toggleBtn.setAttribute('title', 'Switch to Dark Theme');
      toggleBtn.setAttribute('aria-label', 'Switch to Dark Theme');
    }
  }

  if (mobileToggleBtn) {
    const textEl = mobileToggleBtn.querySelector('.mobile-theme-text');
    if (textEl) {
      textEl.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
  }
}

