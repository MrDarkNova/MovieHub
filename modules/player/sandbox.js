/**
 * sandbox.js
 * Player iframe hardening — applies security attributes to stream iframes
 * after React renders them. Works alongside blocker.js.
 *
 * Permissions granted to stream iframes:
 *   allow-scripts        → JS must run for the player to work
 *   allow-same-origin    → needed for player session cookies
 *   allow-forms          → some players need form submissions
 *   allow-presentation   → fullscreen / picture-in-picture
 *
 * Permissions BLOCKED (not in sandbox):
 *   allow-popups         → no new tab/window spawning
 *   allow-top-navigation → can't redirect the parent page
 *   allow-modals         → no alert/confirm/prompt dialogs
 *   allow-pointer-lock   → no cursor hijacking
 */

const PLAYER_SANDBOX =
  "allow-scripts allow-same-origin allow-forms allow-presentation";

/**
 * Hardens all stream player iframes currently in the DOM.
 * Call this after the player component mounts.
 */
export function hardenPlayerIframes() {
  const iframes = document.querySelectorAll("iframe[allowfullscreen]");
  iframes.forEach((iframe) => {
    // Only touch iframes that don't already have sandbox set
    if (!iframe.hasAttribute("sandbox")) {
      iframe.setAttribute("sandbox", PLAYER_SANDBOX);
    }

    // Ensure referrer policy doesn't leak user data to ad servers
    if (!iframe.hasAttribute("referrerpolicy")) {
      iframe.setAttribute("referrerpolicy", "no-referrer");
    }
  });
}

/**
 * Observe for player iframes added by React and harden them automatically.
 */
export function watchForPlayerIframes() {
  const observer = new MutationObserver(() => hardenPlayerIframes());
  observer.observe(document.getElementById("root") || document.body, {
    childList: true,
    subtree: true,
  });
  return observer; // caller can disconnect if needed
}
