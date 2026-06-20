---
name: Hekas POS System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#5c5f61'
  on-secondary: '#ffffff'
  secondary-container: '#e0e3e5'
  on-secondary-container: '#626567'
  tertiary: '#003272'
  on-tertiary: '#ffffff'
  tertiary-container: '#00489e'
  on-tertiary-container: '#9cbbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#e0e3e5'
  secondary-fixed-dim: '#c4c7c9'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  numeral-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-page: 32px
  container-sidebar: 280px
  container-cart: 400px
---

## Brand & Style

The brand personality for this design system is **efficient, reliable, and modern**. As a Point of Sale (POS) system for a minimarket, the UI is optimized for high-frequency transactions and clarity under pressure. The design style follows a **Corporate Modern** approach—utilizing a flat design foundation with sophisticated soft shadows to create clear functional layers. 

The aesthetic is inspired by high-productivity tools: it is utilitarian without being cold. It prioritizes "information scent" (helping users find what they need quickly) through generous whitespace and a strict blue-anchored color hierarchy. The goal is to evoke a sense of operational stability for the merchant and a premium, clean experience for the customer.

## Colors

The palette is built on a "Trust Blue" foundation to ensure the interface feels professional and authoritative.

- **Primary (#1E40AF):** Used for structural navigation, primary branding, and heavy-duty interactive elements. It signifies the core of the system.
- **Secondary (#F8FAFC):** An off-white "Slate 50" that serves as the canvas, reducing eye strain during long shifts compared to pure white.
- **Accent (#3B82F6):** A vibrant "Blue 600" specifically reserved for high-priority Call-to-Actions (CTAs) like "Pay," "Add to Cart," or "Complete Membership."
- **Neutral (#64748B):** A balanced gray for secondary text, icons, and borders.
- **System States:** High-visibility success greens (#10B981) for completed payments and urgent reds (#EF4444) for voided items or errors.

## Typography

This design system uses **Inter** exclusively for its exceptional legibility and neutral tone. In a POS environment, scanning speed is critical, so we utilize a highly structured type hierarchy.

**Numerical Data:** Prices and quantities utilize `numeral-xl` or bold weights of body text to ensure they are readable from a distance (e.g., across the counter).
**Labels:** Used for metadata like "SKU," "Stock," or "Member ID," always in a semi-bold weight to distinguish them from variable data.
**Mobile Scaling:** Headlines scale down for handheld scanning devices while maintaining large touch-friendly line heights.

## Layout & Spacing

The layout uses a **Hybrid Fixed-Fluid Grid** optimized for landscape tablets and desktop monitors typically found at checkout counters.

1.  **Three-Pane Architecture:**
    *   **Left (Fixed):** A slim navigation bar (80px) or full sidebar (280px) for switching between Sales, Inventory, and Reports.
    *   **Center (Fluid):** The main catalog/search area where items are displayed in a responsive grid.
    *   **Right (Fixed):** A dedicated 400px checkout/cart panel that remains persistent during the transaction.
2.  **Rhythm:** An 8px base unit governs all padding and margins. 
3.  **Touch Targets:** All interactive elements maintain a minimum hit area of 44x44px to accommodate rapid finger-tapping.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layering** and **Ambient Shadows**.

- **Level 0 (Base):** The secondary background color (#F8FAFC).
- **Level 1 (Cards/Panels):** Pure white (#FFFFFF) surfaces with a subtle 1px border (#E2E8F0) and no shadow. Used for item cards in the catalog.
- **Level 2 (Active Cart/Search):** Pure white surfaces with a soft, diffused shadow (Offset: 0, 4px; Blur: 12px; Opacity: 4% Black). This lifts the cart area above the catalog.
- **Level 3 (Modals/Pop-overs):** Used for payment processing or membership details. Higher elevation shadow (Offset: 0, 10px; Blur: 25px; Opacity: 8% Black) to focus the user's attention.

## Shapes

The design system utilizes a **Rounded** (0.5rem / 8px) corner radius for primary components. 

- **Standard (8px):** Buttons, input fields, and item cards. This provides a modern, approachable feel while maintaining professional structure.
- **Large (16px):** Main containers like the cart panel or modal windows.
- **Pill (Full):** Used exclusively for status indicators (e.g., "In Stock") and category chips to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid Accent (#3B82F6) with white text. High prominence for "Pay."
- **Secondary:** Outlined with Primary Blue (#1E40AF) for less critical actions like "Add Note."
- **Ghost:** No background, Primary Blue text for "Cancel" or "Clear Cart."

### Item Cards
- Minimalist design with a thumbnail image (top), Item Name (Body-md Bold), and Price (Body-lg Bold, Blue). 
- Hover state or active state should show a +1 badge in the primary color.

### Input Fields
- **Barcode Input:** A persistent, high-contrast field at the top of the screen with a magnifying glass and barcode icon. Focus state uses a 2px Primary Blue glow.
- **Quantity Adjuster:** A horizontal component with minus/plus buttons flanking the numerical value.

### Membership/Loyalty Section
- A distinct, slightly tinted card within the cart panel (using a very light tint of the Primary color) to separate customer data from transaction data. Features a quick-add "New Member" button.

### Lists (The Cart)
- High-density rows. Each row includes: Remove icon (left), Item name & Price (center), and Total (right). Zebra-striping is not needed; use subtle bottom borders instead.