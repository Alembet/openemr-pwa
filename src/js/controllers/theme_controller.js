import { Controller } from '@hotwired/stimulus';

// Light / dark / system theme toggle.
// Stores preference in localStorage and applies [data-bs-theme] to <html>.
export default class extends Controller {
  static targets = ['icon'];

  connect() {
    this.#apply(this.#stored());
  }

  toggle() {
    const next = this.#current() === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    this.#apply(next);
  }

  setTheme({ params: { theme } }) {
    localStorage.setItem('theme', theme);
    this.#apply(theme);
  }

  // ── private ──────────────────────────────────────────────────────────────

  #stored() {
    return localStorage.getItem('theme')
      ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  #current() {
    return document.documentElement.getAttribute('data-bs-theme') ?? 'light';
  }

  #apply(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    if (this.hasIconTarget) {
      this.iconTarget.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    }
  }
}
