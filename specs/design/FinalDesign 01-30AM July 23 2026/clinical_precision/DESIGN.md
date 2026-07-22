---
name: Clinical Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#281900'
  on-tertiary-container: '#af7a00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#ffdeac'
  tertiary-fixed-dim: '#ffba38'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#604100'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
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
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: 0.03em
  utility-mono:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  section-v: 32px
  card-padding: 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

This design system is engineered for high-density technical research and data synthesis. The brand personality is clinical, objective, and authoritative, prioritizing the speed of information retrieval over decorative flair. 

The aesthetic is rooted in **Minimalism** with a focus on high-contrast legibility. It utilizes a "Paper and Ink" philosophy where depth is communicated through tonal shifts rather than physical metaphors. The interface should feel like a high-end technical journal—intentional, sparse, and extremely focused. There are no shadows or borders; structural integrity is maintained through strict alignment and distinct background fills.

## Colors

The palette is strictly monochromatic to reduce cognitive load, with a single functional accent.

- **Canvas (#FFFFFF):** The base layer for all primary reading experiences.
- **Surface Low (#F5F5F5):** Used for secondary layout regions, sidebars, and input backgrounds.
- **Surface High (#E0E0E0):** Used for active states, hover transitions, and subtle structural divisions.
- **Primary Ink (#000000):** The standard for headlines and primary body text.
- **Secondary Ink (#424242):** Used for metadata, labels, and helper text to create visual hierarchy.
- **Accent Amber (#FFB300):** Reserved exclusively for active indicators, status alerts, or critical interactive highlights.

## Typography

The typography strategy leverages the contrast between the authoritative, editorial feel of **Newsreader** and the functional, neutral clarity of **Inter**.

- **Headlines:** Use Newsreader for all primary headings. It should feel like a printed document. Use tighter letter spacing for large display sizes.
- **Body & UI:** Inter is used for all functional text. Body text should maintain a generous line height (1.5 - 1.6) to ensure readability during long research sessions.
- **Utility:** Use uppercase for `label-sm` to differentiate from body text without increasing weight. Monospace is used sparingly for technical data points or video timestamps.

## Layout & Spacing

The layout follows a strict 12-column fixed grid for desktop (max-width 1280px) and a fluid 4-column grid for mobile.

- **Vertical Rhythm:** Sections are separated by exactly 32px of whitespace. 
- **Containment:** This design system avoids borders. Elements are contained via 24px of internal padding against `Surface Low` or `Surface High` backgrounds.
- **Breakpoints:**
  - Mobile: < 600px (16px margins)
  - Tablet: 600px - 1024px (24px margins)
  - Desktop: > 1024px (Auto margins, 48px internal gutter)

## Elevation & Depth

This design system uses **Tonal Layering** exclusively. 
- **Level 0 (Canvas):** The base #FFFFFF layer for the primary content feed.
- **Level 1 (Surface Low):** Used for cards, sidebars, and navigation bars to sit "above" the canvas.
- **Level 2 (Surface High):** Used for interactive elements (hover states) or nested components.

**Strict Rule:** No box-shadows, drop-shadows, or blurs are permitted. Depth is strictly binary and achieved through color fill changes.

## Shapes

The shape language is rigid and architectural. 
- **Default:** Use 0px (Sharp) for large containers, hero sections, and main layout blocks.
- **Interactive:** Small interactive elements (Buttons, Inputs, Chips) use a 4px (Soft) radius to provide a subtle hint of "touchability" without breaking the technical aesthetic.
- **Indicators:** Use 0px for the `Accent Amber` active indicators (usually 2px wide bars).

## Components

- **Buttons:**
  - *Primary:* Solid #000000 background, #FFFFFF text, 4px radius.
  - *Secondary:* #F5F5F5 background, #000000 text, no border.
  - *Tertiary:* Ghost style, underline on hover only.
- **Input Fields:** #F5F5F5 background with a bottom-only 2px indicator that turns `Accent Amber` on focus. No 4-sided borders.
- **Cards:** No borders. Distinguished from the canvas by a #F5F5F5 background. All cards must use the 24px padding token.
- **Chips/Tags:** #E0E0E0 background, `label-sm` typography, 4px radius.
- **Active Indicators:** A 2px or 4px solid #FFB300 line placed at the leading edge (left) or bottom of an active navigation item or tab.
- **Lists:** Clean rows with 1px #E0E0E0 horizontal dividers only. Remove dividers for the last item in a set.