// ─── Turbo (SPA navigation + Frames + Streams) ───────────────────────────────
import * as Turbo from '@hotwired/turbo';
Turbo.start();

// Turbo: keep sidebar/nav outside the drive by marking them as permanent
// In templates: <nav data-turbo-permanent id="main-nav">

// ─── htmx (hypermedia enhancements) ──────────────────────────────────────────
import htmx from 'htmx.org';
window.htmx = htmx;

// htmx config
htmx.config.defaultSwapStyle = 'morph:innerHTML';
htmx.config.defaultSwapDelay = 0;
htmx.config.scrollIntoViewOnBoost = false;
htmx.config.historyCacheSize = 20;

// ─── _hyperscript (inline event scripting) ───────────────────────────────────
import 'hyperscript.org';

// ─── Stimulus ─────────────────────────────────────────────────────────────────
import { Application } from '@hotwired/stimulus';
import { registerControllers } from './controllers/index.js';

const app = Application.start();
app.debug = import.meta.env.DEV;
registerControllers(app);

// ─── Bootstrap JS (dropdowns, tooltips, etc.) ────────────────────────────────
import { Tooltip, Popover, Toast } from 'bootstrap';

// Re-init Bootstrap components after each Turbo navigation
document.addEventListener('turbo:render', () => {
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new Tooltip(el));
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new Popover(el));
});

// ─── PWA: register service worker ────────────────────────────────────────────
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a Turbo Stream toast when a new SW version is available
    const html = `
      <turbo-stream action="append" target="toasts">
        <template>
          <div class="toast show align-items-center text-bg-info border-0" role="alert"
               data-controller="notification" data-notification-delay-value="8000">
            <div class="d-flex">
              <div class="toast-body">Nouvelle version disponible — <button onclick="updateSW()" class="btn btn-sm btn-light">Mettre à jour</button></div>
            </div>
          </div>
        </template>
      </turbo-stream>`;
    Turbo.renderStreamMessage(html);
  },
  onOfflineReady() {
    console.info('[PWA] Prêt en mode hors-ligne');
  },
});

window.updateSW = updateSW;

// ─── CSRF token for htmx + Turbo forms ───────────────────────────────────────
document.addEventListener('htmx:configRequest', (e) => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) e.detail.headers['X-CSRF-Token'] = meta.content;
});

document.addEventListener('turbo:before-fetch-request', (e) => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  if (meta) e.detail.fetchOptions.headers['X-CSRF-Token'] = meta.content;
});
