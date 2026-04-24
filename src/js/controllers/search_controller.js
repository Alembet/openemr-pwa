import { Controller } from '@hotwired/stimulus';

// Global patient/encounter search with Turbo Frame results.
// The server endpoint returns a <turbo-frame id="search-results"> fragment.
export default class extends Controller {
  static targets = ['input', 'results', 'spinner'];
  static values  = { url: String, minLength: { type: Number, default: 2 }, delay: { type: Number, default: 250 } };

  #debounce = null;

  connect() {
    this.inputTarget.addEventListener('input',   this.#onInput);
    this.inputTarget.addEventListener('keydown', this.#onKeydown);
    document.addEventListener('click',           this.#onOutsideClick);
  }

  disconnect() {
    document.removeEventListener('click', this.#onOutsideClick);
    clearTimeout(this.#debounce);
  }

  clear() {
    this.inputTarget.value = '';
    this.#hideResults();
  }

  // ── private ──────────────────────────────────────────────────────────────

  #onInput = () => {
    clearTimeout(this.#debounce);
    const q = this.inputTarget.value.trim();
    if (q.length < this.minLengthValue) { this.#hideResults(); return; }
    this.#debounce = setTimeout(() => this.#fetch(q), this.delayValue);
  };

  async #fetch(q) {
    this.spinnerTarget.hidden = false;
    const url = `${this.urlValue}?q=${encodeURIComponent(q)}`;
    // Turbo Frame fetch — server returns <turbo-frame id="search-results">…</turbo-frame>
    this.resultsTarget.setAttribute('src', url);
    this.resultsTarget.hidden = false;
    this.spinnerTarget.hidden = true;
  }

  #onKeydown = (e) => {
    if (e.key === 'Escape') this.#hideResults();
  };

  #onOutsideClick = (e) => {
    if (!this.element.contains(e.target)) this.#hideResults();
  };

  #hideResults() {
    this.resultsTarget.hidden = true;
    this.resultsTarget.removeAttribute('src');
  }
}
