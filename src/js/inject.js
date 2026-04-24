// Safe injection into existing OpenEMR — does NOT load Turbo Drive
// (OpenEMR uses iframe-based tab navigation that Turbo would break)

// ─── htmx ────────────────────────────────────────────────────────────────────
import htmx from 'htmx.org';
window.htmx = htmx;
htmx.config.defaultSwapStyle = 'innerHTML';
htmx.config.historyCacheSize  = 0; // disable history cache in iframe context

// ─── _hyperscript ─────────────────────────────────────────────────────────────
import 'hyperscript.org';

// ─── Stimulus (controllers only — no Turbo) ───────────────────────────────────
import { Application } from '@hotwired/stimulus';
import { registerControllers } from './controllers/index.js';

const app = Application.start();
app.debug = import.meta.env.DEV;
registerControllers(app);

// ─── Bootstrap 5 Tooltips + Popovers (alongside existing BS4) ────────────────
// We only init BS5 components on elements that opt-in via data-bs5="true"
// to avoid conflicts with Bootstrap 4 already loaded by OpenEMR.
import { Tooltip, Toast } from 'bootstrap';
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-bs5-tooltip]').forEach(el => new Tooltip(el));
});

// ─── CSRF header for htmx requests ───────────────────────────────────────────
document.addEventListener('htmx:configRequest', (e) => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) e.detail.headers['X-CSRF-Token'] = meta.content;
});

console.info('[openemr-pwa] Stimulus + htmx + _hyperscript injected ✓');
