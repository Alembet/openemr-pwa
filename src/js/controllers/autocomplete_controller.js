import { Controller } from '@hotwired/stimulus';

// Reusable autocomplete backed by a JSON endpoint.
// Usage:
//   <div data-controller="autocomplete"
//        data-autocomplete-url-value="/api/patients/search"
//        data-autocomplete-min-length-value="2">
//     <input data-autocomplete-target="input" type="text">
//     <ul  data-autocomplete-target="list" hidden></ul>
//   </div>
export default class extends Controller {
  static targets = ['input', 'list', 'hidden'];
  static values  = { url: String, minLength: { type: Number, default: 2 }, delay: { type: Number, default: 200 } };

  #debounce = null;

  connect() {
    this.inputTarget.setAttribute('autocomplete', 'off');
    this.inputTarget.setAttribute('role', 'combobox');
    this.inputTarget.setAttribute('aria-autocomplete', 'list');
  }

  onInput() {
    clearTimeout(this.#debounce);
    const q = this.inputTarget.value.trim();
    if (q.length < this.minLengthValue) { this.#hide(); return; }
    this.#debounce = setTimeout(() => this.#fetch(q), this.delayValue);
  }

  select(e) {
    const item = e.currentTarget;
    this.inputTarget.value  = item.dataset.label;
    if (this.hasHiddenTarget) this.hiddenTarget.value = item.dataset.value;
    this.#hide();
    this.dispatch('selected', { detail: { label: item.dataset.label, value: item.dataset.value } });
  }

  onKeydown(e) {
    const items = [...this.listTarget.querySelectorAll('[role="option"]')];
    const active = this.listTarget.querySelector('[aria-selected="true"]');
    let idx = items.indexOf(active);
    if (e.key === 'ArrowDown') { e.preventDefault(); idx = Math.min(idx + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); idx = Math.max(idx - 1, 0); }
    else if (e.key === 'Enter' && active) { e.preventDefault(); active.click(); return; }
    else if (e.key === 'Escape') { this.#hide(); return; }
    items.forEach((el, i) => el.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
  }

  // ── private ──────────────────────────────────────────────────────────────

  async #fetch(q) {
    const res  = await fetch(`${this.urlValue}?q=${encodeURIComponent(q)}`);
    const data = await res.json(); // [{ value, label, meta? }]
    this.listTarget.innerHTML = data
      .map(item => `<li role="option" aria-selected="false"
             data-value="${item.value}" data-label="${item.label}"
             data-action="click->autocomplete#select"
             class="autocomplete-item">
               ${item.label}
               ${item.meta ? `<small class="text-muted">${item.meta}</small>` : ''}
           </li>`)
      .join('');
    this.listTarget.hidden = data.length === 0;
  }

  #hide() {
    this.listTarget.hidden = true;
    this.listTarget.innerHTML = '';
  }
}
