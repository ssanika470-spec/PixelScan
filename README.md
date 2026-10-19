# PixelScan – Responsive Landing Page + Accessible Modal

A digital-forensics themed frontend built with plain HTML, CSS and JavaScript (no frameworks, no build step).
It covers **Week 1** (responsive landing page) and **Week 2** (interactive UI component: accessible modal).

> The "analysis" is a **simulation**. No real manipulation detection happens, and the UI says so. Files never leave your device.

## Run it
Unzip and open `index.html` in a browser. No server is needed (scripts are plain `<script>` files, not ES modules, so `file://` works).

## Project structure
```
PixelScan/
├── index.html            Semantic page structure + modal markup
├── css/styles.css        Mobile-first styles, tokens, breakpoints, modal, a11y
├── js/menu.js            Week 1: responsive menu toggle
├── js/modal.js           Week 2: reusable PixelScanModal component
├── js/file-inspector.js  Page logic: validation, preview, modal wiring
└── README.md
```

## Week 1 – Responsive landing page
**Wireframe (mobile → desktop)**
```
Mobile (<600px)          Desktop (>=900px)
[Logo] [☰]               [Logo]        Home Features How  [Inspect]
Hero text                Hero text   |  Inspection panel
Inspection panel
Features (1 col)         Features (4 columns)
How it works             How it works (2 columns)
Footer                   Footer (one row)
```
**Design decisions**
- Semantic HTML5: `header`, `nav`, `main`, `section`, `article`, `ol`, `footer`; one `h1`; ordered headings.
- Mobile-first CSS with two breakpoints: **600px** (2-column features, side-by-side buttons) and **900px** (full nav bar, 2-column hero, 4-column features).
- Flexbox for rows and alignment; CSS Grid for hero, feature cards and workflow.
- Fluid type with `clamp()` (headline scales from 32px to ~50px). Content width is `min(960px, 100% - 32px)`.
- Progressive enhancement: with JavaScript off, the menu is simply always visible.

## Week 2 – Interactive component: accessible modal
`js/modal.js` exposes `PixelScanModal(element, options)` with `open()`, `close()` and callbacks `onOpen`, `onClose`, `canClose`.

**How to use it elsewhere**
1. Add markup with `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, the `hidden` attribute, and a `[data-modal-close]` button.
2. Create it: `var m = new PixelScanModal(document.getElementById("myModal")); m.open();`

**Accessibility & robustness**
- Focus moves into the dialog on open and returns to the triggering button on close.
- Tab / Shift+Tab are trapped inside; **Esc**, the × button and a backdrop click close it.
- `role="dialog"`, `aria-modal`, `aria-labelledby/describedby`, `role="status"` live regions, `role="progressbar"` with `aria-valuenow`.
- Closing is blocked (`canClose`) while the demo analysis runs, with a spoken message explaining why.
- Error handling: missing element throws a clear error; callbacks are try/catch-wrapped; file API feature detection disables the input with a message; empty, oversize (>20 MB) and unsupported files show specific errors; image preview failure falls back to a text label.
- Safe DOM: file names are inserted with `textContent`, never `innerHTML`.
- Fallbacks: `hidden` attribute (not CSS) hides the modal; `matchMedia` listener falls back to `addListener`; `<noscript>` message.

## Accessibility summary (specific numbers)
- Text contrast ≈ 8:1 (purple on white) and ≈ 8.5:1 (muted text on white); WCAG AAA is 7:1.
- All buttons and nav links have a **44 px** minimum touch target.
- Visible 3 px focus ring on every interactive element; skip link to `#main`.
- `prefers-reduced-motion` disables animations and smooth scrolling.

## Test checklist
**Responsive** – In browser dev tools, test **360, 600, 768, 900 and 1280 px** widths: at 360 px there is no horizontal scrolling, the menu shows a ☰ button; at 900 px+ the full nav bar appears and the hamburger disappears.
**Menu (keyboard)** – Tab to ☰ → Enter opens; Esc closes and refocuses the button; `aria-expanded` flips true/false.
**Modal (keyboard)** – Choose a `.png`; Tab to *Inspect File* → Enter. Check: focus lands on ×; Tab/Shift+Tab never leave the dialog; Esc closes; focus returns to *Inspect File*.
**Analyze** – *Analyze Selected File* → *Start Demo Analysis*: progress runs 0→100% in 1.5 s; Esc/× are blocked until it ends.
**Errors** – Try a `.zip` (unsupported), an empty file, a file over 20 MB, and cancel the file picker: each gives a specific message and keeps the buttons disabled.
**Screen reader** – Turn on NVDA/VoiceOver: dialog title is announced on open; status messages are announced.

## Browser support
Current Chrome, Edge, Firefox and Safari (plus Safari 13+ via fallbacks).
