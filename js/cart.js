/**
 * Roastery Coffee - Shopping Cart Engine
 * Manages cart state, localStorage persistence, real-time pricing calculations, and cart drawer UI.
 */

const CART_STORAGE_KEY = 'roastery_cart_data';
const FREE_SHIPPING_THRESHOLD = 799;
const STANDARD_SHIPPING_FEE = 50;

// Internal Cart State
let cart = [];

// Initialize Cart from localStorage
function initCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    if (saved) {
      cart = JSON.parse(saved);
      // Validate cart items
      cart = cart.filter(item => getProductById(item.id) !== null && item.quantity > 0);
    }
  } catch (e) {
    console.error("Failed to load cart from storage", e);
    cart = [];
  }
  updateCartBadges();
  renderCartDrawer();
}

// Save Cart to localStorage
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to save cart to storage", e);
  }
  updateCartBadges();
  renderCartDrawer();
  // Dispatch custom event for checkout modal or other listeners
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
}

// Get current cart array
function getCart() {
  return [...cart];
}

// Get total count of items
function getCartCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Get Cart Subtotal
function getCartSubtotal() {
  return cart.reduce((total, item) => {
    const product = getProductById(item.id);
    return product ? total + (product.price * item.quantity) : total;
  }, 0);
}

// Get Shipping Fee
function getCartShipping() {
  const subtotal = getCartSubtotal();
  if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return STANDARD_SHIPPING_FEE;
}

// Get Grand Total
function getCartTotal() {
  return getCartSubtotal() + getCartShipping();
}

// Add Product to Cart
function addToCart(productId, quantity = 1, grind = "Whole Beans", showNotification = true) {
  const product = getProductById(productId);
  if (!product) return;

  const existingItemIndex = cart.findIndex(item => item.id === product.id && item.grind === grind);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      quantity: quantity,
      grind: grind
    });
  }

  saveCart();

  if (showNotification && typeof showToast === 'function') {
    showToast(`Added <strong>${product.name}</strong> (${quantity}x) to your cart!`, 'success');
  }

  // Provide haptic/visual bounce on cart icon
  animateCartBadge();
}

// Remove Product from Cart
function removeFromCart(productId, grind = null) {
  const product = getProductById(productId);
  const initialLength = cart.length;

  if (grind) {
    cart = cart.filter(item => !(item.id === productId && item.grind === grind));
  } else {
    cart = cart.filter(item => item.id !== productId);
  }

  if (cart.length < initialLength) {
    saveCart();
    if (typeof showToast === 'function' && product) {
      showToast(`Removed <strong>${product.name}</strong> from cart`, 'info');
    }
  }
}

// Update Item Quantity
function updateQuantity(productId, delta, grind = null) {
  const itemIndex = cart.findIndex(item => item.id === productId && (!grind || item.grind === grind));
  if (itemIndex === -1) return;

  const newQty = cart[itemIndex].quantity + delta;

  if (newQty <= 0) {
    removeFromCart(productId, grind);
  } else {
    cart[itemIndex].quantity = newQty;
    saveCart();
  }
}

// Set Exact Item Quantity
function setQuantity(productId, newQty, grind = null) {
  const itemIndex = cart.findIndex(item => item.id === productId && (!grind || item.grind === grind));
  if (itemIndex === -1) return;

  if (newQty <= 0) {
    removeFromCart(productId, grind);
  } else {
    cart[itemIndex].quantity = parseInt(newQty, 10);
    saveCart();
  }
}

// Clear Entire Cart
function clearCart() {
  cart = [];
  saveCart();
}

// Update Navbar Badges
function updateCartBadges() {
  const count = getCartCount();
  const badges = document.querySelectorAll('.cart-badge-count');
  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('d-none');
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  });
}

// Animate badge bounce
function animateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge-count');
  badges.forEach(badge => {
    badge.classList.remove('badge-pulse');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('badge-pulse');
  });
}

// Render Cart Drawer HTML
function renderCartDrawer() {
  const cartItemsContainer = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartShippingEl = document.getElementById('cartShipping');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountDrawerEl = document.getElementById('cartDrawerCount');
  const cartFooterEl = document.getElementById('cartDrawerFooter');
  const cartEmptyStateEl = document.getElementById('cartEmptyState');
  const freeShippingBarEl = document.getElementById('freeShippingBar');
  const freeShippingTextEl = document.getElementById('freeShippingText');

  if (!cartItemsContainer) return;

  const count = getCartCount();
  const subtotal = getCartSubtotal();
  const shipping = getCartShipping();
  const total = getCartTotal();

  if (cartCountDrawerEl) {
    cartCountDrawerEl.textContent = `(${count})`;
  }

  // Handle Free Shipping Progress Bar
  if (freeShippingBarEl && freeShippingTextEl) {
    if (subtotal === 0) {
      freeShippingBarEl.style.width = '0%';
      freeShippingTextEl.innerHTML = `Add <strong>₹${FREE_SHIPPING_THRESHOLD}</strong> more for <strong>FREE Express Delivery</strong>!`;
    } else if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      freeShippingBarEl.style.width = '100%';
      freeShippingBarEl.classList.add('unlocked');
      freeShippingTextEl.innerHTML = `🎉 <strong>Congratulations!</strong> You've unlocked <strong>FREE Express Delivery!</strong>`;
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      freeShippingBarEl.style.width = `${progress}%`;
      freeShippingBarEl.classList.remove('unlocked');
      freeShippingTextEl.innerHTML = `Add <strong>₹${remaining}</strong> more to unlock <strong>FREE Express Delivery</strong>!`;
    }
  }

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '';
    if (cartEmptyStateEl) cartEmptyStateEl.style.display = 'flex';
    if (cartFooterEl) cartFooterEl.style.display = 'none';
    return;
  }

  if (cartEmptyStateEl) cartEmptyStateEl.style.display = 'none';
  if (cartFooterEl) cartFooterEl.style.display = 'block';

  // Build item list HTML
  let itemsHTML = '';
  cart.forEach(item => {
    const product = getProductById(item.id);
    if (!product) return;

    const itemTotal = product.price * item.quantity;

    itemsHTML += `
      <div class="cart-item-card" data-id="${product.id}" data-grind="${item.grind}">
        <div class="cart-item-img-wrap">
          <img src="${product.image}" alt="${product.name}" 
               onerror="this.onerror=null; this.src='${product.fallbackImage}';" 
               loading="lazy" />
        </div>
        <div class="cart-item-info">
          <div class="cart-item-header">
            <h4 class="cart-item-title">${product.name}</h4>
            <button class="cart-item-remove-btn" onclick="removeFromCart(${product.id}, '${item.grind}')" title="Remove Item" aria-label="Remove ${product.name}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
          <div class="cart-item-variant">Grind: <span>${item.grind || 'Whole Beans'}</span></div>
          <div class="cart-item-price-row">
            <div class="cart-item-unit-price">₹${product.price} each</div>
            <div class="cart-item-line-total">₹${itemTotal}</div>
          </div>
          <div class="cart-item-controls">
            <div class="quantity-stepper">
              <button class="qty-btn" onclick="updateQuantity(${product.id}, -1, '${item.grind}')" aria-label="Decrease Quantity">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn" onclick="updateQuantity(${product.id}, 1, '${item.grind}')" aria-label="Increase Quantity">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  cartItemsContainer.innerHTML = itemsHTML;

  // Update Summary values
  if (cartSubtotalEl) cartSubtotalEl.textContent = `₹${subtotal}`;
  if (cartShippingEl) {
    if (shipping === 0) {
      cartShippingEl.innerHTML = `<span class="free-shipping-tag">FREE</span>`;
    } else {
      cartShippingEl.textContent = `₹${shipping}`;
    }
  }
  if (cartTotalEl) cartTotalEl.textContent = `₹${total}`;
}

// Drawer Controls
function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.classList.add('drawer-open');
    renderCartDrawer();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}

// Bind Global Escape key to close drawer
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCartDrawer();
  }
});
