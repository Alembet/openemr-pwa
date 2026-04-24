import { Controller } from '@hotwired/stimulus';

// Handles the main sidebar navigation:
// - active state tracking across Turbo navigations
// - collapse/expand groups
// - mobile drawer toggle
export default class extends Controller {
  static targets = ['link', 'group', 'drawer'];
  static values  = { activeUrl: String };

  connect() {
    this.#markActive();
    document.addEventListener('turbo:load', this.#onTurboLoad);
  }

  disconnect() {
    document.removeEventListener('turbo:load', this.#onTurboLoad);
  }

  toggleDrawer() {
    this.drawerTarget.classList.toggle('show');
    document.body.classList.toggle('sidebar-open');
  }

  toggleGroup(e) {
    const btn  = e.currentTarget;
    const list = btn.nextElementSibling;
    const open = list.classList.toggle('show');
    btn.setAttribute('aria-expanded', open);
    // Persist collapsed state in localStorage
    localStorage.setItem(`nav-group:${btn.dataset.groupKey}`, open ? '1' : '0');
  }

  // ── private ──────────────────────────────────────────────────────────────

  #onTurboLoad = () => this.#markActive();

  #markActive() {
    const current = location.pathname;
    this.linkTargets.forEach(a => {
      const active = a.getAttribute('href') === current
        || current.startsWith(a.getAttribute('href') + '/');
      a.classList.toggle('active', active);
      a.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }
}
