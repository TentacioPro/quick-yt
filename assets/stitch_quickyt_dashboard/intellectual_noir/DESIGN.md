---
name: Intellectual Noir
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d4c5ab'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9c8f78'
  outline-variant: '#504532'
  surface-tint: '#fbbc00'
  primary: '#ffe2ab'
  on-primary: '#402d00'
  primary-container: '#ffbf00'
  on-primary-container: '#6d5000'
  inverse-primary: '#795900'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#b4efff'
  on-tertiary: '#003640'
  tertiary-container: '#04dcff'
  on-tertiary-container: '#005d6d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdfa0'
  primary-fixed-dim: '#fbbc00'
  on-primary-fixed: '#261a00'
  on-primary-fixed-variant: '#5c4300'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#aaedff'
  tertiary-fixed-dim: '#00d9fc'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-margin-mobile: 20px
  container-margin-desktop: 64px
  section-gap: 48px
  stack-gap: 16px
  inline-gap: 12px
---

## Brand & Style
The design system embodies a sophisticated, editorial aesthetic that prioritizes focus and intellectual depth. It targets a discerning audience—scholars, analysts, and curators—who value a quiet, high-contrast environment.

The visual style is a blend of **Minimalism** and **Tonal Layering**. By eschewing traditional borders and dividers, the interface relies on the strategic use of whitespace and "noir" atmospheric depth. The emotional response is one of calm authority, mystery, and precision. Interaction is signaled through vibrant amber highlights, acting as a "candlelight" effect against deep, monochromatic surfaces.

## Colors
The palette is rooted in a "Noir" philosophy, using dark-mode-first principles. 

- **Primary Amber (#FFBF00):** Used exclusively for high-priority calls to action, active states, and essential status indicators. It represents clarity and warmth.
- **Surface Tiers:** The foundation is `#121212`. For elevated elements like cards or modals, a subtle shift to `#1A1A1A` provides depth without the need for borders.
- **Typography Colors:** Pure white is used for headings to maintain high contrast, while a muted grey is used for body text to reduce eye strain during long-form reading.

## Typography
The typography system creates a rhythmic contrast between the classical elegance of **Playfair Display** and the functional precision of **Inter**.

- **Headlines:** Large and expressive. Use Playfair Display for all titles to evoke a literary feel. Headlines should use tighter letter spacing to maintain a cohesive "block" look.
- **Body:** Inter provides maximum legibility on small screens. Line heights are generous (1.6x) to allow the text to breathe against the dark background.
- **Labels:** Small labels and metadata should use Inter with increased letter spacing and uppercase styling to provide a technical, curated feel.

## Layout & Spacing
This design system follows a **Fluid Grid** model with a mobile-first priority. 

Hierarchy is defined by **Negative Space** rather than lines. Group related elements using tight "stack gaps" (16px) and separate distinct sections with aggressive "section gaps" (48px+). 

On mobile, use a 4-column grid with 20px side margins. On desktop, transition to a 12-column grid centered in a max-width container of 1200px. Always favor vertical stacking for readability unless the content is inherently tabular.

## Elevation & Depth
Depth is achieved through **Tonal Layers** and **Ambient Shadows**. 

- **Level 0 (Base):** `#121212` — used for the primary background.
- **Level 1 (Raised):** `#1A1A1A` — used for cards, input fields, and navigation bars.
- **Level 2 (Floating):** `#242424` — used for modals and dropdown menus.

To enhance the "Noir" feel, Level 2 elements should use a very soft, high-spread shadow: `offset: 0, 20px; blur: 40px; color: rgba(0, 0, 0, 0.5)`. Never use borders; the transition from one hex value to the next provides enough distinction in a high-contrast dark environment.

## Shapes
The shape language is conservative and architectural. 

We use **Soft (0.25rem)** roundedness for standard components like buttons and inputs to suggest precision. Cards and larger containers may use **0.5rem (rounded-lg)** to feel more substantial. Avoid fully pill-shaped or circular elements except for profile avatars or floating action buttons, as sharp or subtly rounded corners better support the intellectual, serious tone.

## Components
Consistent implementation across components ensures the system remains sleek and professional.

- **Buttons:** Primary buttons use the Amber background with black text for maximum contrast. Secondary buttons are text-only with Amber coloring or a tonal `#1A1A1A` background.
- **Cards:** Cards have no borders. They use the `#1A1A1A` surface color. Padding should be generous (24px or more) to create an editorial feel.
- **Input Fields:** Use the `#1A1A1A` surface. The focus state is signaled by a 2px Amber bottom-bar or a subtle glow; do not outline the entire box.
- **Lists:** No dividers between items. Use 16px of vertical padding per item and use horizontal Amber accents (bullets or icons) only when an item is selected or active.
- **Chips:** Small, tonal backgrounds (`#242424`) with white text. Use these for tagging or categories.
- **Navigation:** A bottom-docked navigation bar on mobile using a translucent blur over `#121212` to maintain the depth effect.