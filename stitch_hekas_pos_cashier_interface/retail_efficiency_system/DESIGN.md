---
name: Retail Efficiency System
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fd'
  surface-container: '#ededf8'
  surface-container-high: '#e7e7f2'
  surface-container-highest: '#e1e2ec'
  on-surface: '#191b23'
  on-surface-variant: '#434654'
  inverse-surface: '#2e3038'
  inverse-on-surface: '#f0f0fb'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#006c47'
  on-secondary: '#ffffff'
  secondary-container: '#82f9be'
  on-secondary-container: '#00734c'
  tertiary: '#5e3c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#7d5200'
  on-tertiary-container: '#ffca81'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#82f9be'
  secondary-fixed-dim: '#65dca4'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005235'
  tertiary-fixed: '#ffddb3'
  tertiary-fixed-dim: '#ffb950'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#624000'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ec'
typography:
  display-price:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  numeric-data:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  touch-target-min: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-tablet: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

This design system is engineered for the high-velocity environment of Indonesian retail. The brand personality is **dependable, efficient, and precise**, prioritizing operational speed over decorative flair. The target audience consists of retail cashiers and floor managers who require a tool that reduces cognitive load during long shifts.

The design style follows a **Corporate / Modern SaaS** aesthetic with a focus on high-readability and "Frictionless Utility." It utilizes a "Clean Surface" approach: stark white interaction zones layered over subtle light-gray foundations to define functional boundaries without heavy visual weight. Every element is sized for high-confidence touch interaction, ensuring that transaction speed is never hindered by UI ambiguity.

## Colors

The palette is functional and semantic, designed to guide the cashier through the checkout flow using industry-standard color associations.

- **Primary Blue (#0052CC):** Used for the main action path (e.g., adding items, selecting customers). It signifies "Operation" and "Progress."
- **Success Green (#36B37E):** Specifically reserved for the final "Bayar" (Pay) stage and completed transaction states.
- **Warning Amber (#FFAB00):** Used for stock alerts and low-inventory warnings, ensuring they are visible but not alarming.
- **Error Red (#FF5630):** Dedicated to destructive actions like "Hapus Baris" (Delete Row) or "Batalkan Transaksi" (Cancel Transaction).
- **Neutral Grays:** A cool-toned gray scale is used for backgrounds and borders to maintain a clean, professional workspace that doesn't strain the eyes under bright retail lighting.

## Typography

**Inter** is selected for its exceptional legibility and neutral character. In a POS environment, typography must distinguish between product names and numeric values instantly.

- **Numeric Data:** All prices and quantities must use **tabular figures** (`tnum`) to ensure columns of numbers align perfectly for quick scanning.
- **Visual Hierarchy:** Large, bold styles are used for the "Total Belanja" (Grand Total) to ensure it is visible to both cashier and customer from a distance.
- **Language Adaptation:** Indonesian terminology (e.g., *Kembalian*, *Subtotal*) uses medium weights to maintain clarity against the high-contrast price values.

## Layout & Spacing

This design system utilizes a **fixed-column layout** optimized for 10-12 inch tablets in landscape orientation.

- **Dual-Pane Model:** The screen is split into a 60% Left Pane (Transaction List/Basket) and a 40% Right Pane (Product Grid/Numeric Keypad).
- **Touch Targets:** A strict minimum of 48px is enforced for all interactive elements to prevent "fat-finger" errors during peak hours.
- **Scanning Rhythm:** Vertical lists (the basket) use a 16px gutter between items to provide clear separation, allowing the cashier to verify scanned items at a glance.
- **Safe Zones:** Margins of 24px are maintained around the screen edges to ensure hardware bezels do not interfere with corner touch-actions.

## Elevation & Depth

To maintain a "Professional SaaS" feel while ensuring clarity, this system uses **Tonal Layers** supplemented by **Low-Contrast Outlines**.

- **Level 0 (Background):** The base layer uses `#F4F5F7` (Neutral Gray) to reduce screen glare.
- **Level 1 (Surfaces):** Cards and main container areas use White with a 1px solid border (`#DFE1E6`) rather than shadows. This keeps the UI feeling crisp and flat.
- **Level 2 (Active Elements):** Buttons and active input fields use a subtle, highly-diffused shadow (4px blur, 10% opacity) to signify they are "above" the surface and ready for interaction.
- **Modal Overlays:** Full-screen dimming (40% opacity black) is used when a payment modal or stock adjustment dialog appears, focusing the cashier’s attention entirely on the task at hand.

## Shapes

The shape language is **Soft** (4px - 8px radius). This provides a modern, approachable feel while maintaining the structural integrity of a grid-based POS system.

- **Standard Elements:** Buttons and Input fields use a 4px (0.25rem) radius.
- **Product Cards:** Large product selection tiles use an 8px (0.5rem) radius to feel distinct from functional utility buttons.
- **Feedback Indicators:** Status chips (e.g., "Stok Habis") use a pill-shape to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#0052CC` with White text. Used for "Bayar" or "Cari Produk."
- **Secondary:** White background with 1px gray border and `#0052CC` text. Used for "Diskon" or "Catatan."
- **Danger:** Solid `#FF5630` for "Void" or "Hapus."

### Input Fields
- Focus states must be highly visible with a 2px Primary Blue border.
- Numeric inputs should always trigger a large, dedicated on-screen keypad rather than the standard system keyboard.

### Transaction List (Basket)
- Each row must be at least 64px tall.
- Information order: [Quantity] x [Product Name] ... [Total Price].
- Swipe-to-delete gestures should be supported but must have a visual "Hapus" button for accessibility.

### Cards (Product Grid)
- High-contrast text for prices.
- Images (if used) should be secondary to the text label.
- A "badge" in the top-right corner indicates current stock levels.

### Keypad
- The "Enter" or "OK" key on the numeric pad should be the Primary Blue.
- The "000" (Ribu) button is mandatory for Indonesian currency efficiency.