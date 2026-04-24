# OpenEMR PWA

Fork of [OpenEMR](https://github.com/openemr/openemr) rewritten as a **Progressive Web App** using a modern HTML-over-the-wire stack — no React, no heavy SPA framework.

## Tech Stack

| Layer | Tool |
|---|---|
| Navigation (SPA feel) | [Turbo Drive](https://turbo.hotwired.dev) — intercepts links, swaps `<body>` without full reload |
| Partial updates | [Turbo Frames](https://turbo.hotwired.dev/handbook/frames) — lazy-load tabs, inline forms, search results |
| Real-time DOM mutations | [Turbo Streams](https://turbo.hotwired.dev/handbook/streams) — multi-target updates from a single server response |
| Hypermedia enhancements | [htmx 2](https://htmx.org) — inline row edit, lazy loading, `hx-delete`, CSV export |
| JS controllers | [Stimulus 3](https://stimulus.hotwired.dev) — sidebar, search, autocomplete, datatable, theme |
| UI components | [Stimulus Components](https://www.stimulus-components.com) — clipboard, dialog, dropdown, reveal, sortable, notifications |
| Inline scripting | [_hyperscript](https://hyperscript.org) — simple `toggle`, `set`, `add class` without a controller |
| PWA / Offline | [Workbox](https://developer.chrome.com/docs/workbox) — network-first pages, cache-first assets, background sync |
| Build | [Vite 5](https://vitejs.dev) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app) |
| CSS | [Bootstrap 5.3](https://getbootstrap.com) + custom SCSS (dark mode, sidebar, responsive) |
| Templates | [Twig 3](https://twig.symfony.com) — Turbo-aware layouts with permanent nav/topbar |
| Backend | PHP 8.2 · Laminas · Symfony components (kept from OpenEMR core) |

## Project Structure

```
openemr-pwa/
├── public/
│   ├── manifest.json          # PWA manifest (installable, shortcuts)
│   └── dist/                  # Vite build output (hashed assets + sw.js)
├── src/
│   ├── js/
│   │   ├── app.js             # Entry: Turbo + htmx + Stimulus + hyperscript + PWA SW
│   │   └── controllers/       # Stimulus controllers
│   │       ├── index.js           # Registry
│   │       ├── navigation_controller.js
│   │       ├── search_controller.js
│   │       ├── sidebar_controller.js
│   │       ├── theme_controller.js
│   │       ├── notification_controller.js
│   │       ├── datatable_controller.js
│   │       ├── autocomplete_controller.js
│   │       └── print_controller.js
│   ├── scss/
│   │   ├── app.scss           # Bootstrap 5 + sidebar + dark mode + print
│   │   └── _variables.scss
│   └── sw.js                  # Workbox service worker source
├── resources/views/
│   ├── layouts/
│   │   ├── base.html.twig     # Base layout: sidebar + topbar + toast container
│   │   └── _nav.html.twig     # Sidebar navigation groups
│   └── patients/
│       ├── index.html.twig    # Patient list: Turbo Frame table + htmx actions
│       ├── show.html.twig     # Patient detail: lazy Bootstrap tabs via Turbo Frames
│       └── _stream_create.html.twig  # Turbo Stream: prepend row + toast on create
├── src/php/
│   ├── Controllers/
│   │   └── PatientController.php   # Handles Turbo/htmx/Stream variants
│   └── Middleware/
│       └── TurboMiddleware.php     # Detects Turbo-Frame / HX-Request headers
├── docker-compose.yml         # PHP + MariaDB + Node (Vite) + phpMyAdmin
├── vite.config.js
├── package.json
└── composer.json
```

## Quick Start

```bash
# Install frontend dependencies
npm install

# Dev server (Vite on :5173, proxies PHP to :8300)
npm run dev

# Production build
npm run build
```

### With Docker

```bash
docker compose up --detach
```

| Service | URL |
|---|---|
| OpenEMR PWA | http://localhost:8301 |
| phpMyAdmin | http://localhost:8311 |
| Vite dev | http://localhost:5173 |

**Default credentials:** `admin` / `pass`

## Key Patterns

### Turbo Frame — lazy tab
```html
<turbo-frame id="tab-encounters" src="/patients/42/encounters">
  Loading…
</turbo-frame>
```
Server returns a `<turbo-frame id="tab-encounters">` fragment — only that region updates.

### htmx — inline row edit
```html
<button hx-get="/patients/42/edit-row"
        hx-target="closest tr"
        hx-swap="outerHTML">Edit</button>
```

### Turbo Stream — multi-target after form submit
```html
<turbo-stream action="prepend" target="patients-table"><template>…row…</template></turbo-stream>
<turbo-stream action="update"  target="new-patient-form"><template></template></turbo-stream>
<turbo-stream action="append"  target="toasts"><template>…toast…</template></turbo-stream>
```

### _hyperscript — inline toggle
```html
<button _="on click toggle .d-none on #new-patient-form">New Patient</button>
```

### Stimulus — auto-registered controllers
```js
// src/js/controllers/search_controller.js
export default class extends Controller {
  static targets = ['input', 'results'];
  static values  = { url: String, delay: { type: Number, default: 250 } };
  // …
}
```

## PWA Features

- **Installable** — `manifest.json` with shortcuts (New Patient, Calendar, Encounters)
- **Offline** — Workbox service worker: network-first HTML, cache-first assets
- **Background sync** — offline form submissions queued in IndexedDB and replayed on reconnect
- **Auto-update** — `registerType: 'autoUpdate'` + Turbo Stream toast on new version

## License

GPL-3.0-or-later (same as OpenEMR)
