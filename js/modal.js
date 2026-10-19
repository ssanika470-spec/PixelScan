/**
 * PixelScan - modal.js (Week 2)
 * Reusable, accessible modal dialog component.
 *
 * USAGE
 *   var modal = new PixelScanModal(document.getElementById("analysisModal"), {
 *     onOpen:  function () {},            // called after the modal opens
 *     onClose: function () {},            // called after the modal closes
 *     canClose: function () { return true; } // return false to block closing
 *   });
 *   modal.open(); modal.close();
 *
 * MARKUP CONTRACT
 *   - Root element has role="dialog", aria-modal="true", aria-labelledby, and `hidden`.
 *   - Any element with [data-modal-close] closes the modal.
 *
 * ACCESSIBILITY FEATURES
 *   - Focus moves into the dialog on open and returns to the trigger on close.
 *   - Tab / Shift+Tab are trapped inside the dialog.
 *   - Escape and a click on the dark backdrop close it.
 *   - Background page scroll is locked while open.
 *
 * ERROR HANDLING
 *   - Throws a clear Error if the root element is missing (callers catch it).
 *   - Callbacks are wrapped in try/catch so one bad callback cannot break the modal.
 */
(function (global) {
  "use strict";

  // Elements that can receive keyboard focus
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function PixelScanModal(element, options) {
    if (!element) throw new Error("PixelScanModal: root element not found.");
    this.el = element;
    this.options = options || {};
    this.isOpen = false;
    this.trigger = null;                      // element to refocus on close

    // Bind once so the same function can be added and removed as a listener
    this._onKeydown = this._onKeydown.bind(this);
    this._onClick = this._onClick.bind(this);
    this.el.addEventListener("click", this._onClick);
  }

  /** Call a user-supplied callback safely. */
  PixelScanModal.prototype._call = function (name) {
    try {
      if (typeof this.options[name] === "function") return this.options[name]();
    } catch (err) {
      console.error("PixelScanModal: error in " + name + " callback", err);
    }
  };

  /** Visible, focusable elements currently inside the dialog. */
  PixelScanModal.prototype._focusable = function () {
    return Array.prototype.filter.call(this.el.querySelectorAll(FOCUSABLE), function (node) {
      return !node.hidden && node.offsetParent !== null;
    });
  };

  /** Open the modal and move focus inside it. */
  PixelScanModal.prototype.open = function () {
    if (this.isOpen) return;
    this.trigger = document.activeElement;    // remember who opened us
    this.el.hidden = false;
    document.body.classList.add("modal-open");
    document.addEventListener("keydown", this._onKeydown);
    this.isOpen = true;

    var first = this._focusable()[0];
    if (first) first.focus();
    this._call("onOpen");
  };

  /** Close the modal (unless canClose() vetoes it) and restore focus. */
  PixelScanModal.prototype.close = function () {
    if (!this.isOpen) return;
    if (this._call("canClose") === false) return;
    this.el.hidden = true;
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", this._onKeydown);
    this.isOpen = false;

    if (this.trigger && typeof this.trigger.focus === "function") this.trigger.focus();
    this._call("onClose");
  };

  /** Click on a [data-modal-close] element or on the backdrop closes the modal. */
  PixelScanModal.prototype._onClick = function (event) {
    if (event.target === this.el || event.target.closest("[data-modal-close]")) this.close();
  };

  /** Escape closes; Tab is kept inside the dialog (focus trap). */
  PixelScanModal.prototype._onKeydown = function (event) {
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== "Tab") return;

    var items = this._focusable();
    if (!items.length) { event.preventDefault(); return; }
    var first = items[0], last = items[items.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();   // wrap backwards
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();  // wrap forwards
    }
  };

  global.PixelScanModal = PixelScanModal;
})(window);
