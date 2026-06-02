/**
 * main.js
 * Nexus — module bootstrap entry point.
 *
 * Load order matters:
 *   1. blocker.js  → must patch window.open, fetch, XHR BEFORE app bundle runs
 *   2. router.js   → wraps History API before React Router initialises
 *   3. sandbox.js  → watches for player iframes after React mounts
 *
 * The compiled app bundle (assets/js/index-DYgi9BK6.js) is loaded via
 * index.html as a <script type="module"> AFTER this file, so all patches
 * are in place before app code executes.
 */

import "./adblocker/blocker.js";
import { initRouter, onRouteChange } from "./router/router.js";
import { watchForPlayerIframes } from "./player/sandbox.js";
import { log } from "./utils/helpers.js";

// ─── Boot sequence ────────────────────────────────────────────────────────────

// 1. Router — wrap History API early
initRouter();

// 2. Optional: log route changes in dev
onRouteChange((path, page) => {
  log("info", `Navigated → ${path} (${page})`);
});

// 3. Player iframe hardening — start observing DOM
watchForPlayerIframes();

log("info", "Nexus modules loaded ✓");
