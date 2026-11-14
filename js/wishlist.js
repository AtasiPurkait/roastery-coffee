/**
 * Roastery Coffee - Wishlist Engine
 * Manages wishlist state, localStorage persistence, heart icon sync, and wishlist drawer UI.
 */

const WISHLIST_STORAGE_KEY = 'roastery_wishlist_data';

let wishlist = [];

// Initialize Wishlist
function initWishlist() {
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (saved) {
      wishlist = JSON.parse(saved);
      // Filter out any invalid product IDs
      wishlist = wishlist.filter(id => getProductById(id) !== null);
    }
  } catch (e) {
    console.error("Failed to load wishlist from storage", e);
    wishlist = [];
  }
  updateWishlistBadges();
  updateHeartIcons();
  renderWishlistDrawer();
}

// Save Wishlist
function saveWishlist() {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  } catch (e) {
    console.error("Failed to save wishlist to storage", e);
  }
  updateWishlistBadges();
  updateHeartIcons();
  renderWishlistDrawer();
  window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { wishlist } }));
}

// Check if item is in wishlist
function isInWishlist(productId) {
  const numericId = parseInt(productId, 10);
  return wishlist.includes(numericId);
}

// Toggle Wishlist Status
function toggleWishlist(productId, showNotification = true) {
  const numericId = parseInt(productId, 10);
  const product = getProductById(numericId);
  if (!product) return;

  const index = wishlist.indexOf(numericId);
  let isAdded = false;

  if (index > -1) {
    wishlist.splice(index, 1);
    isAdded = false;
    if (showNotification && typeof showToast === 'function') {
      showToast(`Removed <strong>${product.name}</strong> from wishlist`, 'info');
    }
  } else {
    wishlist.push(numericId);
    isAdded = true;
    if (showNotification && typeof showToast === 'function') {
      showToast(`Added <strong>${product.name}</strong> to your wishlist!`, 'success');
    }
  }

  saveWishlist();
  return isAdded;
}

// Remove specifically
function removeFromWishlist(productId) {
  const numericId = parseInt(productId, 10);
  const product = getProductById(numericId);
  const index = wishlist.indexOf(numericId);
  if (index > -1) {
    wishlist.splice(index, 1);
    saveWishlist();
    if (typeof showToast === 'function' && product) {
      showToast(`Removed <strong>${product.name}</strong> from wishlist`, 'info');
    }
  }
}

// Move item from wishlist to cart
function moveWishlistToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  // Add to cart
  if (typeof addToCart === 'function') {
    addToCart(productId, 1, "Whole Beans", false);
  }

  // Remove from wishlist
  removeFromWishlist(productId);

  if (typeof showToast === 'function') {
    showToast(`Moved <strong>${product.name}</strong> to your shopping cart!`, 'success');
  }
}

// Update badges on navbar
function updateWishlistBadges() {
  const count = wishlist.length;
  const badges = document.querySelectorAll('.wishlist-badge-count');
  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  });
}

// Update all heart icons in DOM
function updateHeartIcons() {
  const heartBtns = document.querySelectorAll('[data-wishlist-btn]');
  heartBtns.forEach(btn => {
    const id = parseInt(btn.getAttribute('data-product-id'), 10);
    if (isInWishlist(id)) {
      btn.classList.add('active');
      btn.setAttribute('aria-label', 'Remove from Wishlist');
      const svg = btn.querySelector('svg');
      if (svg) svg.classList.add('heart-filled');
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-label', 'Add to Wishlist');
      const svg = btn.querySelector('svg');
      if (svg) svg.classList.remove('heart-filled');
    }
  });
}

// Render Wishlist Drawer
function renderWishlistDrawer() {
  const listContainer = document.getElementById('wishlistItemsList');
  const countEl = document.getElementById('wishlistDrawerCount');
  const emptyStateEl = document.getElementById('wishlistEmptyState');
  const footerEl = document.getElementById('wishlistDrawerFooter');

  if (!listContainer) return;

  const count = wishlist.length;
  if (countEl) countEl.textContent = `(${count})`;

  if (count === 0) {
    listContainer.innerHTML = '';
    if (emptyStateEl) emptyStateEl.style.display = 'flex';
    if (footerEl) footerEl.style.display = 'none';
    return;
  }

  if (emptyStateEl) emptyStateEl.style.display = 'none';
  if (footerEl) footerEl.style.display = 'block';

  let html = '';
  wishlist.forEach(id => {
    const product = getProductById(id);
    if (!product) return;

    html += `
      <div class="wishlist-item-card" data-id="${product.id}">
        <div class="wishlist-item-img-wrap">
          <img src="${product.image}" alt="${product.name}" 
               onerror="this.onerror=null; this.src='${product.fallbackImage}';" 
               loading="lazy" />
        </div>
        <div class="wishlist-item-info">
          <div class="wishlist-item-header">
            <h4 class="wishlist-item-title">${product.name}</h4>
            <button class="wishlist-item-remove-btn" onclick="removeFromWishlist(${product.id})" title="Remove from Wishlist" aria-label="Remove ${product.name}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="wishlist-item-roast">${product.roastLevel} • ${product.categoryLabel}</div>
          <div class="wishlist-item-price">₹${product.price} <span class="wishlist-item-orig-price">₹${product.originalPrice}</span></div>
          <div class="wishlist-item-actions">
            <button class="btn btn-sm btn-primary move-to-cart-btn" onclick="moveWishlistToCart(${product.id})">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              Move to Cart
            </button>
          </div>
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;
}

// Wishlist Drawer Controls
function openWishlistDrawer() {
  const drawer = document.getElementById('wishlistDrawer');
  const backdrop = document.getElementById('wishlistDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.classList.add('drawer-open');
    renderWishlistDrawer();
  }
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('wishlistDrawer');
  const backdrop = document.getElementById('wishlistDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}

// Global escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeWishlistDrawer();
  }
});
