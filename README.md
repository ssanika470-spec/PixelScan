# PixelScan – responsive, accessible, fast file-inspection front end

Look closer. Think deeper. A multi-week frontend internship project (Weeks 1-5) built with
semantic HTML5, modern CSS (Grid/Flexbox, custom properties) and vanilla JavaScript. No frameworks, no external requests.

## Run it
```
python3 -m http.server 8000      # then open http://localhost:8000
```
`index.html` also works by double-clicking; the dashboard needs a server for `fetch()` (it shows a clear message and a sample otherwise).

## Structure
| Path | Purpose |
|---|---|
| `index.html` | Landing page: header/nav, hero, file inspector (interactive component), features, how-it-works, FAQ accordion, footer |
| `dashboard.html` | Week 5 mini-app: stats, bar chart, filterable + sortable table |
| `css/styles.css` / `.min.css` | Commented source / minified build |
| `js/main.js` / `.min.js` | Menu toggle, accordion, file inspector |
| `js/dashboard.js` / `.min.js` | Dashboard logic |
| `data/scans.json` | Static dataset (14 inspections) |
| `build.py` | Creates the `.min` files: `python3 build.py` |
| `_headers` | Cache headers for static hosts |
| `reports/` | Week 3, 4 and 5 reports (.docx) + report descriptions (.txt) |

## How to test the components
**Menu (Week 1):** shrink the window below 900 px → "Menu" button appears. Click or Enter/Space opens it; `Esc` closes and returns focus.
**Accordion (Week 2):** Tab to a question, Enter/Space toggles; ↑ ↓ Home End move between questions.
**Inspector:** choose a file (or drag one in). Try `.exe` (rejected), a file over 20 MB (rejected), a real PNG (Inspect shows dimensions; Analyze shows signature + SHA-256), and a PDF renamed to `.jpg` (flagged as mismatch).
**Dashboard:** type in Search, change the selects, click column headers to sort (state announced via `aria-sort`).

## Design decisions
- Mobile-first CSS; breakpoints at 640 px and 900 px add columns.
- System font stack, inline SVG logo/favicon, no libraries → tiny page weight.
- Features degrade gracefully: `no-js` class keeps menu and FAQ visible without JavaScript; storage and `crypto.subtle` failures are caught.
- Analysis results are observations about the file header, not proof of tampering.

Tested in Chromium (Playwright) at 375, 768 and 1280 px: see `reports/`. Firefox/Safari and screen-reader testing should be done manually before final submission.
