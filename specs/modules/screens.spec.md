# Screens & Design Specification

> This document provides context and structural constraints for Design Agents to create consistent, domain-accurate, and theme-compliant designs for the Quick_yt app.

## 1. Core Pillars & Strategy

### Core Domain (The Job to be Done)
**Purpose:** A personal, AI-driven research and archiving tool for video content.
The primary job to be done is allowing users to ingest YouTube URLs, securely extract transcripts on-device, process them through Gemini 1.5 Pro (for analysis, summarization, and PDF report generation), and seamlessly sync the underlying SQLite data to a local PC. It is a focused productivity and research application, not a social or e-commerce platform.

### Visual Identity
**Aesthetic:** "Intellectual Noir" (Evolving and Refining)
We are strictly adhering to and evolving this aesthetic to feel highly premium, focused, and immersive.
- **Color Palette:** Deep charcoals for backgrounds to reduce eye strain and provide a "dark mode native" feel, accented by amber/gold for primary actions and highlights.
- **Typography:** Serif fonts (e.g., Newsreader) for headers to give an editorial, academic feel, paired with clean sans-serif (e.g., Inter) for dense data readability.
- **Layout Rule:** **Absolutely no dividing lines or borders.** Separation must be achieved entirely through spacing, typography scaling, and depth (shadows/elevation).

### MVP Roadmap (The North Star Screens)
The core experience is defined by these 4 primary screens:
1. **Dashboard Screen (The Hub):** Where users ingest new URLs, view a feed/list of processing and completed videos, and see at-a-glance sync status.
2. **Video Detail Screen (The Consumption View):** The reading environment for a specific video, displaying the raw transcript alongside the rich Markdown report from Gemini, complete with a lifecycle status tracker.
3. **Sync & Settings Screen:** The control center for the `DevSyncManager` to back up or restore the database from a PC, along with user preferences.
4. **Metrics & Audit Logs Screen:** A data-dense, technical view for observing system health, showing performance sparklines and success/failure logs from the `audit_logs` table.

---

## 2. Global UI Constraints

- **Framework:** React Native Paper v5 (Material Design 3).
- **Navigation:** Hardware back-button native support (Android), and a `DrawerNavigator` utilizing a swipe-from-left gesture.
- **Touch & Interactions:** All interactive elements **must** use native `android_ripple` effects. Do not use generic opacity fades (e.g., replace `TouchableOpacity` with ripple-supported alternatives).
- **Haptics & Feedback:** Bound globally to the `useToastStore` and `<GlobalSnackbar>` component. Haptics (`notificationAsync`, `impactAsync`) must trigger systemically on state changes, never ad-hoc.
- **Safe Areas:** Notch-aware layouts via `SafeAreaProvider` are mandatory (Target device: Pixel 8a).

---

## 3. Data Models mapped to UI Components

Design Agents should utilize the following data properties to build meaningful UI widgets:

### A. Video Entity (`videos` table)
| Data Point | UI Component Translation |
| :--- | :--- |
| `status` | Progress steppers or color-coded badges indicating lifecycle (`pending` → `transcribing` → `processing` → `generating_pdf` → `complete` / `failed`). |
| `timestampAdded` | Relative time labels (e.g., "Added 2 hours ago"). |
| `markdownReport` | Rich-text Markdown renderer widget with syntax highlighting, blockquotes, and clean typography. |
| `url` & `title` | Hero headers for the video, potentially fetching and displaying thumbnail placeholders. |

### B. Audit Log Entity (`audit_logs` table)
| Data Point | UI Component Translation |
| :--- | :--- |
| `performanceMs` | Performance sparklines, or health indicator badges (e.g., Green for <500ms, Amber for 500-2000ms, Red for >2000ms). |
| `status` | Success/Failure color-coding in data grids (Green checkmarks vs Red warning icons). |
| `synced` | Cloud sync indicator icons (e.g., Cloud with checkmark vs Cloud with sync arrows). |

---

## 4. Specific Widget Requirements

When designing components, ensure the following are accounted for:
1. **Global Snackbar:** A transient toast component mounted at the root, styled dynamically based on type (Success=Green-900, Error=Red-900, Info=Blue-900).
2. **Ingest Input Field:** A prominent text input for pasting URLs that feels integrated into the Dashboard without heavy borders.
3. **Drawer Menu:** A clean, spacious side navigation that uses typography and active state highlights (amber) instead of boxed backgrounds.
