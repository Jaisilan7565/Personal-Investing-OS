---
name: Aether Portfolio OS
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#d0bcff'
  on-secondary: '#3c0091'
  secondary-container: '#571bc1'
  on-secondary-container: '#c4abff'
  tertiary: '#ffb783'
  on-tertiary: '#4f2500'
  tertiary-container: '#d97721'
  on-tertiary-container: '#452000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#d0bcff'
  on-secondary-fixed: '#23005c'
  on-secondary-fixed-variant: '#5516be'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
  calm-blue: '#B2D5FF'
  greed-amber: '#F59E0B'
  fear-red: '#EF4444'
  discipline-emerald: '#10B981'
  surface-border: rgba(255, 255, 255, 0.06)
  glass-bg: rgba(13, 17, 23, 0.8)
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.02em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  headline-sm:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.006em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Courier Prime
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1'
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-page: 32px
  component-padding-x: 12px
  component-padding-y: 8px
---

## Brand & Style

The design system is engineered for the "Personal Investing OS," targeting sophisticated investors who demand clarity, speed, and a high-density information environment. The aesthetic is **Modern Minimalist with a Linear-inspired technical edge**, prioritizing functional elegance over decorative flourish.

The brand personality is professional, precise, and stoic. It evokes an emotional response of "calm control" amidst market volatility. The UI utilizes a "Dark Mode First" philosophy to reduce eye strain during long analytical sessions, employing a hierarchy of depth through subtle translucency and surgical precision in spacing.

## Colors

The palette is anchored by **Deep Charcoal (#0D1117)**, serving as the canvas for high-contrast data visualization. The **Indigo-Violet (#6366F1)** primary accent is used sparingly for primary actions and focus states to maintain a calm atmosphere.

Semantic colors are mapped to psychological investment states rather than standard utility:
- **Calm (Soft Blue):** Used for steady-state data, indices, and historical benchmarks.
- **Greed (Amber):** Highlights overbought conditions or aggressive growth targets.
- **Fear (Muted Red):** Indicates drawdown, risk alerts, or stop-loss proximity.
- **Discipline (Emerald):** Marks executed trades, hit targets, and consistent performance metrics.

Surface colors utilize incremental transparency rather than solid grays to create a sense of layering.

## Typography

This design system uses a dual-font strategy. **Sora** provides a modern, geometric feel for headlines and key metrics, characterized by wide apertures and a high-tech vibe. **Inter** is used for all body text and interface elements to ensure maximum legibility at high densities.

**Technical Refinements:**
- Headers (Sora) must always use a slight positive letter-spacing (+2%) to emphasize the "Linear" aesthetic.
- Labels and secondary metadata use "Inter" with medium weight and 5% letter-spacing for a systematic, professional look.
- For financial figures and ticker symbols, use a monospaced variant to ensure alignment in data tables.

## Layout & Spacing

The layout model is a **High-Density Fluid Grid** optimized for 12-column desktop views. It prioritizes information throughput over whitespace.

- **Grid:** 12-column system with 16px gutters.
- **Density:** Elements are packed tightly using a 4px base unit. Component height is minimized to allow more data to be visible above the fold.
- **Reflow:** On mobile, the 12-column grid collapses to 1 column. Sidebars become bottom-sheet navigation or hidden drawers.
- **Alignment:** Strict adherence to a baseline grid ensures that technical data across adjacent cards remains perfectly aligned for easy scanning.

## Elevation & Depth

Depth is achieved through **Tonal Layering and Glassmorphism** rather than traditional shadows.

1.  **Background (Base):** #0D1117.
2.  **Surface (Cards/Panels):** Glassmorphic backgrounds using `backdrop-filter: blur(12px)` and a semi-transparent fill (`rgba(255, 255, 255, 0.03)`).
3.  **Outlines:** Every elevated surface must have a **1px subtle border** (#ffffff10).
4.  **Interaction:** On hover, surfaces increase in brightness (`rgba(255, 255, 255, 0.06)`) and the border opacity increases to 20%.

Avoid heavy shadows. If a shadow is required for a floating modal, use a very large, ultra-soft indigo-tinted glow with 0% offset.

## Shapes

The design system employs a **consistent 12px (0.75rem) corner radius** for all primary containers and cards. This softens the technical aesthetic, making the professional environment feel modern and approachable.

- **Standard Buttons/Inputs:** 8px radius.
- **Large Cards/Modals:** 12px radius.
- **Utility Tags/Chips:** Full pill (100px) or 4px for a more technical "tag" look.

## Components

### Buttons
- **Primary:** Solid Indigo-Violet (#6366F1) with white text. No gradient.
- **Secondary:** Ghost style. 1px border (#ffffff15) with a subtle hover state that adds a 5% white overlay.
- **Tertiary:** Text-only with Indigo-Violet color on hover.

### Inputs
Fields use a dark background (#08090A) with a 1px border. Focus state triggers a 1px Indigo-Violet border and a subtle 2px outer glow of the same color.

### Cards & Glassmorphism
All cards must use the 12px border radius and the glassmorphic background (`blur(20px)`). Headers within cards should be separated by a 1px horizontal rule (#ffffff08).

### Data Tables
Tables are the heart of the OS. Use `Inter` at 13px. Rows should have a subtle hover highlight. No vertical borders; use generous horizontal cell padding (12px) and a 1px bottom divider.

### Chips & Badges
Small, low-profile badges for "Discipline," "Fear," etc. Use a desaturated background version of the semantic color with high-contrast text (e.g., 10% opacity background of the emerald color for a "Discipline" tag).
