---
name: Slate Noir
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191c23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e0e2ec'
  on-surface-variant: '#cec5b9'
  inverse-surface: '#e0e2ec'
  inverse-on-surface: '#2d3038'
  outline: '#979085'
  outline-variant: '#4b463d'
  surface-tint: '#d5c5a6'
  primary: '#ffffff'
  on-primary: '#392f1a'
  primary-container: '#f2e1c1'
  on-primary-container: '#6f6349'
  inverse-primary: '#695d44'
  secondary: '#a9c8fb'
  on-secondary: '#0a315b'
  secondary-container: '#274773'
  on-secondary-container: '#98b7e9'
  tertiary: '#ffffff'
  on-tertiary: '#2e2f3f'
  tertiary-container: '#e2e1f6'
  on-tertiary-container: '#626375'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#f2e1c1'
  primary-fixed-dim: '#d5c5a6'
  on-primary-fixed: '#231a07'
  on-primary-fixed-variant: '#50462e'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#a9c8fb'
  on-secondary-fixed: '#001c3b'
  on-secondary-fixed-variant: '#274773'
  tertiary-fixed: '#e2e1f6'
  tertiary-fixed-dim: '#c5c5d9'
  on-tertiary-fixed: '#191a29'
  on-tertiary-fixed-variant: '#454556'
  background: '#10131a'
  on-background: '#e0e2ec'
  surface-variant: '#32353c'
typography:
  headline-lg:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  section-gap: 32px
  element-gap: 16px
  container-padding: 24px
  sidebar-width: 280px
  gutter: 24px
---

## Brand & Style
The design system moves away from organic warmth toward a clinical, monochromatic precision. It is tailored for high-density information consumption with a focus on cinematic clarity. The aesthetic is a fusion of **Minimalism** and **Tonal Layering**, utilizing a cold, slate-based palette to reduce visual fatigue and emphasize content. 

The emotional response is one of calm authority and professional focus. By stripping away borders and shadows, the UI relies entirely on color theory and spatial relationships to define structure.

## Colors
The palette is rooted in cold slate tones to provide a sophisticated, metallic atmosphere. 

- **Floor (#0A0C10):** Used for the background behind the primary navigation and the deepest canvas layers.
- **Surface (#12151C):** The standard background for content areas and the sidebar.
- **Surface-Container (#1B1F27):** Used for card backgrounds and grouped information blocks.
- **Primary Accent (#F2E1C1):** A "Cool Amber" used sparingly for high-value actions and active states, providing a metallic contrast against the slate.
- **Typography:** High-contrast text uses Slate-White (#E2E2E6), while secondary information uses Muted Slate (#90949F).

## Typography
This design system employs a dual-font strategy to balance editorial elegance with functional utility. 

- **Newsreader (Serif):** Reserved for headlines, titles, and editorial moments. It adds a scholarly, authoritative layer to the clinical slate background.
- **Inter (Sans):** Used for all UI elements, body text, labels, and navigation. It provides maximum legibility and a systematic feel.

All typography should follow a tight vertical rhythm. Large headlines use negative letter spacing to maintain visual density. Labels should be set in uppercase when used for categorization to distinguish them from body copy.

## Layout & Spacing
The layout follows a **Fluid Grid** with fixed-width sidebars. The defining characteristic is the **32px vertical rhythm**, which creates a spacious, "breathable" feel despite the dark palette.

- **Navigation:** A sidebar-first architecture. On desktop, the sidebar is permanent or collapsible; on mobile, it is hidden behind a global hamburger menu located in the header.
- **Header:** Every screen must feature a top bar containing the hamburger toggle (left-aligned) and primary view actions.
- **Breakpoints:** 
  - Mobile (< 600px): Single column, 16px margins.
  - Tablet (600px - 1024px): 8-column grid, 24px margins.
  - Desktop (> 1024px): 12-column grid with a 280px fixed sidebar.

## Elevation & Depth
This design system strictly prohibits the use of drop shadows and borders. Depth is communicated exclusively through **Tonal Layers**.

- **Level 0 (Floor):** The base canvas (#0A0C10).
- **Level 1 (Surface):** Content areas and the main sidebar (#12151C).
- **Level 2 (Container):** Cards, input fields, and hover states (#1B1F27).
- **Level 3 (Bright):** Active highlights or transient menus (#282D38).

Transitions between these layers should be sharp and immediate. Interaction states are signaled by shifting the background color to the next tier of brightness rather than adding shadows or outlines.

## Shapes
Shapes are kept disciplined and subtle. We use **Soft (0.25rem)** rounding for standard components like buttons and cards to avoid a "bubbly" appearance while softening the clinical edges of the slate palette. Large containers or featured sections may use 0.5rem (rounded-lg) to subtly differentiate them from smaller UI elements.

## Components
- **Buttons:** Primary buttons use the Cool Amber (#F2E1C1) background with black text. Secondary buttons use Surface-Bright (#282D38) with On-Surface text. No borders are allowed.
- **Chips:** Small, pill-shaped elements using Surface-Container (#1B1F27). They are used for filtering or tagging.
- **Input Fields:** Flat backgrounds using Surface-Container (#1B1F27). Interaction is shown by shifting the background to Surface-Bright (#282D38).
- **Cards:** No borders or shadows. Cards are defined by a background color of Surface-Container.
- **Lists:** Separated by whitespace (16px) or subtle tonal shifts. Do not use divider lines.
- **Sidebar:** The primary navigation hub. Icons should be monochrome (On-Surface-Variant), turning to Cool Amber when active.
- **The Toggle (Hamburger):** A simple, three-line icon in the top-left of the header, providing consistent access to the navigation drawer across all device sizes.