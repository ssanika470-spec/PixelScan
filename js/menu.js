/**
 * PixelScan - menu.js (Week 1)
 * Responsive navigation toggle for small screens.
 *
 * Behaviour:
 *  - Button toggles the menu and keeps aria-expanded in sync (screen readers).
 *  - Escape closes the menu and returns focus to the button.
 *  - Choosing a link closes the menu.
 *  - Resizing to desktop width (>= 900px) resets the menu state.
 * Wrapped in an IIFE so no variables leak into the global scope.
 */
(function () {
  "use strict";

  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  if (!toggle || !nav) return;            // fail quietly: nav stays visible (CSS fallback)

  var DESKTOP_QUERY = "(min-width: 900px)"; // must match the breakpoint in styles.css

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close when a link inside the menu is chosen
  nav.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  // Keyboard: Escape closes the open menu
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  // Reset when the viewport grows to desktop size (matchMedia may be missing in very old browsers)
  if (window.matchMedia) {
    var mq = window.matchMedia(DESKTOP_QUERY);
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange); // Safari < 14 fallback
  }
})();
