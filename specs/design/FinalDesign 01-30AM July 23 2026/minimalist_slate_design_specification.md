# Design System: Minimalist Slate (QuickYT)

## North Star: "Precision & Clarity"
A clinical, high-contrast aesthetic designed for rapid technical research. It prioritizes structure and information hierarchy over decorative elements, using bold typography and generous whitespace to create a focused, professional workspace.

## 1. Visual Language
*   **Aesthetic:** Clean, structured, modern-clinical.
*   **Hierarchy:** Established through tonal shifts and typographic scale rather than borders or shadows.
*   **Rhythm:** Strict grid-based alignment with 32px vertical section gaps and 24px internal card padding.

## 2. Color Palette
The system utilizes a monochromatic "Slate" stack to define depth and structure.

| Token | Hex Code | Use Case |
|---|---|---|
| **Canvas** | `#FFFFFF` | Global background for light mode (as seen in SCREEN_14). |
| **Surface (Low)** | `#F5F5F5` | Secondary containers, background for "In Queue" or "Completed" cards. |
| **Surface (High)** | `#E0E0E0` | Active input fields or hover states. |
| **Primary Ink** | `#000000` | Primary headlines, ingest buttons, and high-priority labels. |
| **Secondary Ink** | `#424242` | Body copy, secondary metadata, and placeholder text. |
| **Accent (Amber)** | `#FFB300` | Used exclusively for "Active" processing indicators (e.g., progress bars). |

## 3. Typography
A dual-typeface system that balances authority with technical utility.

| Role | Font Family | Weight | Case |
|---|---|---|---|
| **Display / Headlines** | Newsreader (Serif) | 600 (Semi-Bold) | Page titles, major section headers. |
| **UI Labels / Buttons** | Inter (Sans-Serif) | 600 (Semi-Bold) | Primary CTA, tags, status badges. |
| **Body / Paragraphs** | Inter (Sans-Serif) | 400 (Regular) | Analysis summaries, descriptive metadata. |
| **Utility** | Inter (Sans-Serif) | 500 (Medium) | Small metadata (e.g., "24M AGO"), labels. |

## 4. UI Components & Patterns
*   **App Header:** Centered Serif headline. Left-aligned hamburger icon for navigation. 56px height. No bottom border.
*   **Primary Ingest Field:** A full-width `#F5F5F5` container with a minimalist link icon and parchment-style placeholder text.
*   **Action Button:** Solid black (`#000000`) with white text. High-contrast and center-aligned.
*   **Analysis Cards:** 
    *   **Border:** None.
    *   **Background:** `#F5F5F5`.
    *   **Radius:** 0px (Stark) or very subtle 4px.
    *   **Internal Padding:** 24px.
*   **Status Indicators:** 
    *   **Processing:** Progress bar using a black track and an Amber (`#FFB300`) fill.
    *   **Completed:** Minimalist checkmark icon.

## 5. Mobile UX Rules
*   **No Bottom Navigation:** All routing is managed via the navigation drawer.
*   **Collapsed by Default:** Sidebars remain hidden until toggled via the header.
*   **High Contrast:** Use strict black on white or dark grey on light grey to ensure maximum legibility under research conditions.
