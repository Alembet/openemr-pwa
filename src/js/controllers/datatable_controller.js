import { Controller } from '@hotwired/stimulus';

// Lightweight sortable/filterable table without a heavy library.
// Works with htmx server-side pagination via hx-get.
export default class extends Controller {
  static targets = ['filter', 'row', 'sortBtn', 'empty'];
  static values  = { sortCol: { type: Number, default: -1 }, sortDir: { type: String, default: 'asc' } };

  filter() {
    const q = this.filterTarget.value.toLowerCase();
    let visible = 0;
    this.rowTargets.forEach(row => {
      const match = row.textContent.toLowerCase().includes(q);
      row.hidden = !match;
      if (match) visible++;
    });
    if (this.hasEmptyTarget) this.emptyTarget.hidden = visible > 0;
  }

  sort(e) {
    const btn = e.currentTarget;
    const col = Number(btn.dataset.col);
    if (this.sortColValue === col) {
      this.sortDirValue = this.sortDirValue === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColValue = col;
      this.sortDirValue = 'asc';
    }
    this.#applySortUI();
    this.#sortRows();
  }

  // ── private ──────────────────────────────────────────────────────────────

  #applySortUI() {
    this.sortBtnTargets.forEach(btn => {
      const active = Number(btn.dataset.col) === this.sortColValue;
      btn.setAttribute('aria-sort', active ? this.sortDirValue + 'ending' : 'none');
    });
  }

  #sortRows() {
    const col = this.sortColValue;
    const asc = this.sortDirValue === 'asc' ? 1 : -1;
    const tbody = this.rowTargets[0]?.parentElement;
    if (!tbody) return;
    [...this.rowTargets]
      .sort((a, b) => {
        const av = a.cells[col]?.textContent.trim() ?? '';
        const bv = b.cells[col]?.textContent.trim() ?? '';
        return av.localeCompare(bv, undefined, { numeric: true }) * asc;
      })
      .forEach(row => tbody.appendChild(row));
  }
}
