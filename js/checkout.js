/**
 * Roastery Coffee - Checkout Engine (Frontend Demo)
 * Manages checkout modal, order summary synchronization, form validation, and simulated order placement.
 */

// Initialize Checkout Listeners
function initCheckout() {
  const checkoutBtn = document.getElementById('proceedToCheckoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      // If cart is empty, prevent opening
      if (getCartCount() === 0) {
        if (typeof showToast === 'function') {
          showToast('Your cart is empty. Add coffees before checkout!', 'warning');
        }
        return;
      }
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  // Handle Form Submission
  const checkoutForm = document.getElementById('checkoutOrderForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }

  // Listen for Cart Updates to refresh summary if modal open
  window.addEventListener('cartUpdated', () => {
    const modal = document.getElementById('checkoutModal');
    if (modal && modal.classList.contains('active')) {
      renderCheckoutSummary();
    }
  });
}

// Open Checkout Modal
function openCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const backdrop = document.getElementById('checkoutModalBackdrop');
  if (!modal || !backdrop) return;

  // Reset any previous confirmation screen back to the form view
  document.getElementById('checkoutFormView').style.display = 'block';
  document.getElementById('checkoutSuccessView').style.display = 'none';

  renderCheckoutSummary();

  modal.classList.add('active');
  backdrop.classList.add('active');
  document.body.classList.add('modal-open');
}

// Close Checkout Modal
function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const backdrop = document.getElementById('checkoutModalBackdrop');
  if (!modal || !backdrop) return;

  modal.classList.remove('active');
  backdrop.classList.remove('active');
  document.body.classList.remove('modal-open');
}

// Render Order Summary in Checkout Modal
function renderCheckoutSummary() {
  const container = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const shippingEl = document.getElementById('checkoutShipping');
  const totalEl = document.getElementById('checkoutGrandTotal');
  const badgeCountEl = document.getElementById('checkoutItemCountBadge');

  if (!container) return;

  const cartItems = getCart();
  const subtotal = getCartSubtotal();
  const shipping = getCartShipping();
  const total = getCartTotal();
  const count = getCartCount();

  if (badgeCountEl) badgeCountEl.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;

  if (cartItems.length === 0) {
    container.innerHTML = `<div class="empty-checkout-cart">Your cart is currently empty.</div>`;
    if (subtotalEl) subtotalEl.textContent = '₹0';
    if (shippingEl) shippingEl.textContent = '₹0';
    if (totalEl) totalEl.textContent = '₹0';
    return;
  }

  let html = '';
  cartItems.forEach(item => {
    const product = getProductById(item.id);
    if (!product) return;

    const lineTotal = product.price * item.quantity;

    html += `
      <div class="checkout-item-row">
        <div class="checkout-item-thumb">
          <img src="${product.image}" alt="${product.name}" 
               onerror="this.onerror=null; this.src='${product.fallbackImage}';" />
          <span class="checkout-item-qty-badge">${item.quantity}</span>
        </div>
        <div class="checkout-item-details">
          <div class="checkout-item-name">${product.name}</div>
          <div class="checkout-item-sub">${item.grind || 'Whole Beans'} • ₹${product.price} each</div>
        </div>
        <div class="checkout-item-price">₹${lineTotal}</div>
      </div>
    `;
  });

  container.innerHTML = html;

  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (shippingEl) {
    shippingEl.innerHTML = shipping === 0 ? `<span class="free-badge">FREE</span>` : `₹${shipping}`;
  }
  if (totalEl) totalEl.textContent = `₹${total}`;
}

// Handle Checkout Form Submission & Validation
function handleCheckoutSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();
  const address = form.address.value.trim();
  const city = form.city.value.trim();
  const pincode = form.pincode.value.trim();
  const paymentMethod = form.paymentMethod ? form.paymentMethod.value : 'Demo Cash on Delivery';

  // Validation
  let isValid = true;

  if (fullName.length < 3) {
    showFieldError('fullName', 'Please enter your full name (minimum 3 characters)');
    isValid = false;
  } else {
    clearFieldError('fullName');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showFieldError('email', 'Please enter a valid email address');
    isValid = false;
  } else {
    clearFieldError('email');
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    showFieldError('phone', 'Please enter a valid 10-digit mobile number');
    isValid = false;
  } else {
    clearFieldError('phone');
  }

  if (address.length < 8) {
    showFieldError('address', 'Please provide a complete street delivery address');
    isValid = false;
  } else {
    clearFieldError('address');
  }

  if (city.length < 2) {
    showFieldError('city', 'Please enter your city name');
    isValid = false;
  } else {
    clearFieldError('city');
  }

  const pinDigits = pincode.replace(/\D/g, '');
  if (pinDigits.length !== 6) {
    showFieldError('pincode', 'Please enter a valid 6-digit Indian PIN code');
    isValid = false;
  } else {
    clearFieldError('pincode');
  }

  if (!isValid) return;

  // Show simulated placing order loading state
  const submitBtn = document.getElementById('checkoutSubmitBtn');
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Securing Your Coffee Order...
  `;

  setTimeout(() => {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    // Generate Order Details
    const orderId = 'RC-' + Math.floor(10000 + Math.random() * 90000);
    const orderTotal = getCartTotal();
    const orderItems = getCart();

    // Calculate delivery estimated date (3 days ahead)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    const dateStr = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Populate Success Confirmation View
    document.getElementById('confirmOrderId').textContent = `#${orderId}`;
    document.getElementById('confirmCustomerName').textContent = fullName;
    document.getElementById('confirmDeliveryAddress').textContent = `${address}, ${city} - ${pincode}`;
    document.getElementById('confirmPaymentMethod').textContent = paymentMethod;
    document.getElementById('confirmOrderTotal').textContent = `₹${orderTotal}`;
    document.getElementById('confirmDeliveryDate').textContent = dateStr;

    // Switch Views inside modal
    document.getElementById('checkoutFormView').style.display = 'none';
    document.getElementById('checkoutSuccessView').style.display = 'block';

    // Clear the cart!
    clearCart();

    // Show toast confirmation
    if (typeof showToast === 'function') {
      showToast(`Order <strong>#${orderId}</strong> placed successfully! (Demo)`, 'success');
    }

    // Reset Form
    form.reset();
  }, 900);
}

// Field Error Helpers
function showFieldError(fieldName, message) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  if (!field) return;
  field.classList.add('is-invalid');
  const errorContainer = document.getElementById(`${fieldName}Error`);
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';
  }
}

function clearFieldError(fieldName) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  if (!field) return;
  field.classList.remove('is-invalid');
  const errorContainer = document.getElementById(`${fieldName}Error`);
  if (errorContainer) {
    errorContainer.textContent = '';
    errorContainer.style.display = 'none';
  }
}

// Escape key listener for checkout
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeCheckoutModal();
  }
});
