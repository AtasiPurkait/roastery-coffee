# ROASTERY COFFEE – Premium Specialty Coffee E-Commerce Frontend

A modern, responsive specialty coffee e-commerce website with a premium light-theme aesthetic, interactive shopping cart, wishlist, live product search & filtering, quick view modal, and checkout demonstration.

---

## 🎨 Design Themes

### 1. Premium Light Theme (Default)
The website's original warm, specialty coffee-inspired light aesthetic is fully preserved:

| Element | Color Name | Hex Code |
| :--- | :--- | :--- |
| **Main Background** | Warm Cream | `#FAF7F0` |
| **Secondary Background** | Soft Beige | `#F1E9DC` |
| **Primary Text** | Dark Coffee Brown | `#3B2922` |
| **Secondary Text** | Muted Brown | `#806B5D` |
| **Accent & Badges** | Coffee Caramel | `#B77A45` |
| **Primary Buttons** | Deep Espresso Brown | `#49352B` |
| **Cards & Modals** | Warm Off-White / Pure White | `#FFFDF9` / `#FFFFFF` |

### 2. Premium Dark Theme
An elegant, warm, coffeehouse-inspired dark mode that activates via the navbar toggle:

| Element | Color Name | Hex Code |
| :--- | :--- | :--- |
| **Main Background** | Deep Coffee Black | `#171310` |
| **Secondary Background** | Warm Roast Dark | `#211B17` |
| **Product Cards & Modals** | Espresso Bean Brown | `#2B231D` |
| **Primary Text** | Warm Cream White | `#F7F1E8` |
| **Secondary Text** | Muted Oat Brown | `#C5B8AA` |
| **Accent** | Roasted Caramel | `#C99562` |
| **Buttons** | Warm Caramel Bronze | `#B77A45` |
| **Borders** | Subtle Roast Border | `#42352B` |

- **Theme Toggle**: Small sun/moon toggle button in the navbar.
- **Smooth Transition**: 0.35s ease cross-fade transition when toggling themes.
- **Persistence**: Remembers user preference in `localStorage`. Defaults to Light Theme for first-time visitors.

- **Typography**: `Playfair Display` (editorial serif headings) + `Plus Jakarta Sans` (clean, accessible sans-serif body).
- **Aesthetic Elements**: Soft warm shadows, rounded cards (`14px`–`20px`), subtle hover lifts, smooth transitions, and inline SVGs for crisp offline rendering.

---

## 🚀 Key Features

### 1. Navigation & Header
- **Sticky Navbar**: Background blur and soft shadow elevation on scroll.
- **Brand Identity**: Custom artisanal coffee cup vector badge and typography.
- **Active Counter Badges**: Dynamic badges for Cart and Wishlist with pop bounce animations.
- **Mobile Menu**: Responsive slide-in mobile navigation with smooth backdrop dismissal.

### 2. Homepage Hero Section
- **Headline**: *"Discover the Art of Perfect Coffee"*
- **Subtitle**: *"Crafted with passion, roasted to perfection. Explore our collection of premium coffee blends and bring the café experience home."*
- **Call-to-Action Buttons**: *"Shop Now"* (smooth scroll to Shop) and *"Explore Our Coffee"* (smooth scroll to Categories).
- **Artisan Highlights**: Micro-batch roasted, 100% specialty grade, and sealed valve pouch indicators.

### 3. Shopping Categories (Collections)
- 4 curated roast categories:
  - **Espresso Collection**: Rich, concentrated with thick golden crema.
  - **Dark Roast**: Bold, smoky intensity with low acidity.
  - **Premium Arabica**: Complex aromas, floral perfume, citrus blossom.
  - **Flavoured Coffee**: Madagascar vanilla, hazelnut, and Belgian cocoa.
- Clicking any category card filters the shop collection and smoothly navigates to the products grid.

### 4. Featured Bestselling Coffee (Products Grid)
- Catalog of 12 artisan blends (including the 8 required sample roasts):
  1. **Classic Espresso** (₹549)
  2. **Colombian Dark Roast** (₹599)
  3. **Arabica Gold** (₹649)
  4. **Vanilla Latte Blend** (₹529)
  5. **Hazelnut Coffee** (₹529)
  6. **Mocha Delight** (₹579)
  7. **French Roast** (₹619)
  8. **Caramel Macchiato Blend** (₹559)
  9. *Monsoon Malabar AA* (₹580)
  10. *Ethiopian Yirgacheffe* (₹699)
  11. *Artisan Cold Brew Blend* (₹499)
  12. *Estate Peaberry Reserve* (₹669)
- **Product Card Features**: Image with hover zoom, badge, roast pill, star rating & review count, short tasting notes tags, Indian Rupee (`₹`) pricing with strike-through original price, Wishlist toggle heart icon, Quick View trigger, and Add to Cart button.

### 5. Live Search, Filtering & Sorting
- **Real-Time Search**: Instant filtering by product title, roast level, category, and flavor notes.
- **Category Filter Pills**: All Coffee, Espresso, Arabica, Dark Roast, Flavoured Coffee.
- **Sorting Options**: Price: Low to High, Price: High to Low, Highest Rated, Newest Arrivals, Featured.
- **Clear Filters**: One-click reset to return to the full catalog.
- **Empty State**: Friendly message and reset button when search yields no matches.

### 6. Full Shopping Cart Functionality
- **Slide-in Drawer**: Smooth sliding drawer from the right.
- **Features**: Add, remove, increase/decrease quantities, line totals, and subtotal.
- **Free Shipping Progress Bar**: Dynamically calculates distance to free shipping (Free on orders ≥ ₹799, otherwise ₹50).
- **Persistence**: Saved in browser `localStorage` across page refreshes.
- **Empty State**: Prompt with *"Start Shopping"* button.

### 7. Wishlist System
- **Slide-in Drawer**: Saved items drawer with roast details, price, and actions.
- **Toggle State**: Synchronized heart icons across cards and modals.
- **"Move to Cart"**: Seamlessly moves items from wishlist to cart with toast feedback.
- **Persistence**: Preserved in `localStorage`.

### 8. Product Quick View Modal
- Detailed inspection modal featuring:
  - Large product photography
  - Roast meter dots (1–5 scale)
  - Tasting notes pills
  - Full sensory story, origin, and processing method
  - Grind size selection dropdown (Whole Beans, Espresso, Moka Pot, Pour Over, French Press)
  - Quantity stepper (`-` / `+`)
  - Direct Add to Cart and Wishlist toggles
  - Dismissible via Close button (`×`), clicking outside, or pressing the `Escape` key.

### 9. Checkout Simulation (Frontend Demo)
- Complete checkout modal showing:
  - Live order summary with thumbnails and quantities.
  - Delivery address form: Full Name, Email, Phone, Address, City, PIN Code.
  - Payment method options (Demo Cash on Delivery, UPI / QR, Card simulation).
  - Client-side validation for all fields.
  - Simulated order placement with loading state.
  - Generates unique Order ID (e.g. `#RC-84920`) and estimated delivery date.
  - Clears cart upon confirmed demo checkout.

### 10. Brand Story, Pillars & Why Choose Us
- *"More Than Just Coffee"* section highlighting ethical sourcing and craft roasting.
- 4 Feature Cards: Premium Coffee Beans, Freshly Roasted, Carefully Crafted Blends, Coffee Delivered with Care.

### 11. Testimonials & Social Proof
- 3 sample customer reviews with ratings, author names, and locations (clearly identified as sample feedback).

### 12. Newsletter & Contact Form
- **Newsletter**: Instant regex email validation and confirmation feedback.
- **Contact Form**: Form validation with name, email, subject, and message.
- **Toast Notifications**: Floating feedback system for user actions.
- **Back-to-Top**: Floating button appears after scrolling 400px.

---

## 📁 Project Structure

```
ROASTERY COFFEE/
│
├── index.html          # Main HTML5 application structure
├── login.html          # Styled customer login demo page
├── README.md           # Documentation & instructions
│
├── css/
│   └── style.css       # Full modular CSS3 design system & light theme
│
├── js/
│   ├── products.js     # Catalog database with tasting notes & attributes
│   ├── cart.js         # Cart state, drawer UI, calculations & localStorage
│   ├── wishlist.js     # Wishlist state, drawer UI & localStorage sync
│   ├── checkout.js     # Checkout modal, validation & order confirmation
│   └── script.js       # Search, filters, sort, quick view modal, toasts
│
└── assets/
    └── images/         # Local coffee images & assets
```

---

## 💻 How to Run the Project Locally

No build steps, node modules, or compile tools are needed.

### Option 1: Direct File Open
Simply double-click `index.html` or drag and drop it into any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).

### Option 2: Using a Local HTTP Server (Recommended)
You can serve the folder with Python or Node:

**Using Python 3:**
```bash
python -m http.server 8000
```
Then open your browser to `http://localhost:8000`.

**Using Node.js (`npx serve`):**
```bash
npx serve .
```

---

## 📱 Responsive Testing
Tested and verified across:
- **Desktop** (1920×1080, 1440×900)
- **Laptop** (1366×768, 1280×800)
- **Tablet** (iPad 768×1024, Surface Pro)
- **Mobile Phones** (iPhone 12/13/14/15 390px, Android 360px - 412px)
