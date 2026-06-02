/**
 * router.js
 * Lightweight SPA navigation utilities.
 *
 * The main app (index-DYgi9BK6.js) handles its own React Router internally.
 * This module wraps the History API to:
 *   - Track page views for analytics (replaces the base44 tracker)
 *   - Provide a clean hook for future middleware (auth guards, logging, etc.)
 *
 * Supported routes (from app bundle):
 *   /           → Home / Browse
 *   /movies     → Movies browse
 *   /tv         → TV Shows browse
 *   /anime      → Anime browse
 *   /my-list    → User watchlist
 *   /search     → Search
 *   /Login
 *   /Register
 *   /ForgotPassword
 *   /ResetPassword
 */

const KNOWN_ROUTES = [
  "/",
  "/movies",
  "/tv",
  "/anime",
  "/my-list",
  "/search",
  "/login",
  "/register",
  "/forgotpassword",
  "/resetpassword",
];

let _lastPath = "";
let _listeners = [];

/**
 * Register a callback fired on every route change.
 * @param {(path: string, pageName: string) => void} fn
 */
export function onRouteChange(fn) {
  _listeners.push(fn);
}

function _emit(path) {
  if (path === _lastPath) return;
  _lastPath = path;
  const pageName = path.split("/").filter(Boolean)[0] || "home";
  _listeners.forEach((fn) => {
    try {
      fn(path, pageName);
    } catch (err) {
      console.error("[Nexus Router] Listener error:", err);
    }
  });
}

/**
 * Patches History API and fires registered listeners on navigation.
 * Call once at app boot — idempotent.
 */
export function initRouter() {
  if (window.__nexusRouterInit) return;
  window.__nexusRouterInit = true;

  const _push = history.pushState.bind(history);
  history.pushState = function (...args) {
    _push(...args);
    _emit(location.pathname);
  };

  const _replace = history.replaceState.bind(history);
  history.replaceState = function (...args) {
    _replace(...args);
    _emit(location.pathname);
  };

  window.addEventListener("popstate", () => _emit(location.pathname));
  _emit(location.pathname); // fire for initial load
}

/**
 * Returns true if the current path is a known app route.
 * @param {string} [path]
 */
export function isKnownRoute(path = location.pathname) {
  return KNOWN_ROUTES.includes(path.toLowerCase());
}
