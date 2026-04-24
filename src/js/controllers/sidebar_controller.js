import { Controller } from '@hotwired/stimulus';

// Collapsible sidebar with localStorage persistence.
export default class extends Controller {
  static classes = ['collapsed'];

  connect() {
    const saved = localStorage.getItem('sidebar:collapsed');
    if (saved === '1') this.element.classList.add(...this.collapsedClasses);
  }

  toggle() {
    const collapsed = this.element.classList.toggle(...this.collapsedClasses);
    localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0');
    // Notify charts / tables that the viewport changed
    window.dispatchEvent(new Event('resize'));
  }
}
