import { Controller } from '@hotwired/stimulus';

// Auto-dismiss toast notifications.
// Usage: <div data-controller="notification" data-notification-delay-value="4000">
export default class extends Controller {
  static values = { delay: { type: Number, default: 4000 } };

  connect() {
    if (this.delayValue > 0) {
      this.#timer = setTimeout(() => this.dismiss(), this.delayValue);
    }
  }

  disconnect() {
    clearTimeout(this.#timer);
  }

  dismiss() {
    this.element.classList.add('hiding');
    this.element.addEventListener('animationend', () => this.element.remove(), { once: true });
  }

  #timer = null;
}
