import { Controller } from '@hotwired/stimulus';

// Print a specific section of the page without a separate print route.
export default class extends Controller {
  static values = { selector: { type: String, default: '' } };

  print() {
    if (this.selectorValue) {
      const el = document.querySelector(this.selectorValue);
      if (!el) return;
      const win = window.open('', '_blank');
      win.document.write(`<!doctype html><html><head>
        <link rel="stylesheet" href="/dist/styles.css">
        <title>Impression</title></head><body>${el.innerHTML}</body></html>`);
      win.document.close();
      win.focus();
      win.print();
      win.close();
    } else {
      window.print();
    }
  }
}
