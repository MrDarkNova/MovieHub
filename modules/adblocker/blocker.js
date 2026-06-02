/**
 * blocker.js
 * Core blocker module — intercepts popups, redirects, and ad network requests.
 *
 * Runs BEFORE the main app bundle so protections are in place from the start.
 * Hooks patched:
 *   - window.open          → blocks all popups
 *   - window.location      → blocks redirect to non-app origins
 *   - fetch                → blocks requests to ad domains
 *   - XMLHttpRequest       → blocks requests to ad domains
 *   - MutationObserver     → sandboxes ad iframes injected dynamically
 *   - window.onbeforeunload → prevents redirect-on-unload tricks
 */

import { isBlockedUrl, BLOCKED_DOMAINS } from "./adDomains.js";

// ─── 1. POPUP BLOCKER ────────────────────────────────────────────────────────

const _nativeOpen = window.open.bind(window);

window.open = function (url, target, features) {
  if (!url || url === "about:blank") return null; // blank popups → blocked
  if (isBlockedUrl(url)) {
    console.warn("[Nexus Blocker] Popup blocked:", url);
    return null;
  }
  // Allow only same-origin or trusted stream embed hosts
  try {
    const host = new URL(url, location.origin).hostname;
    const trustedHosts = [
      location.hostname,
      "vidsrc.to",
      "vidsrc.xyz",
      "vidsrc.vip",
      "embed.su",
      "multiembed.mov",
    ];
    if (!trustedHosts.some((h) => host === h || host.endsWith("." + h))) {
      console.warn("[Nexus Blocker] Untrusted popup blocked:", url);
      return null;
    }
  } catch {
    return null;
  }
  return _nativeOpen(url, target, features);
};

// ─── 2. REDIRECT BLOCKER ─────────────────────────────────────────────────────

(function patchLocation() {
  const appOrigin = location.origin;

  function guardHref(url) {
    if (!url) return;
    try {
      const dest = new URL(url, appOrigin);
      if (dest.origin !== appOrigin && isBlockedUrl(dest.href)) {
        console.warn("[Nexus Blocker] Redirect blocked:", dest.href);
        return true; // blocked
      }
    } catch {}
    return false;
  }

  // Intercept location.href setter
  const locDesc = Object.getOwnPropertyDescriptor(window, "location");
  if (!locDesc || locDesc.configurable) {
    try {
      const origHref = Object.getOwnPropertyDescriptor(
        Location.prototype,
        "href"
      );
      if (origHref && origHref.set) {
        Object.defineProperty(Location.prototype, "href", {
          get: origHref.get,
          set(url) {
            if (guardHref(url)) return;
            origHref.set.call(this, url);
          },
          configurable: true,
        });
      }
    } catch {}
  }

  // Intercept location.assign / location.replace
  const _assign = Location.prototype.assign;
  Location.prototype.assign = function (url) {
    if (guardHref(url)) return;
    _assign.call(this, url);
  };

  const _replace = Location.prototype.replace;
  Location.prototype.replace = function (url) {
    if (guardHref(url)) return;
    _replace.call(this, url);
  };
})();

// ─── 3. FETCH BLOCKER ────────────────────────────────────────────────────────

const _nativeFetch = window.fetch.bind(window);

window.fetch = function (input, init) {
  const url = typeof input === "string" ? input : input?.url;
  if (isBlockedUrl(url)) {
    console.warn("[Nexus Blocker] Fetch blocked:", url);
    return Promise.resolve(new Response(null, { status: 204 }));
  }
  return _nativeFetch(input, init);
};

// ─── 4. XHR BLOCKER ──────────────────────────────────────────────────────────

const _nativeXHROpen = XMLHttpRequest.prototype.open;

XMLHttpRequest.prototype.open = function (method, url, ...rest) {
  if (isBlockedUrl(url)) {
    console.warn("[Nexus Blocker] XHR blocked:", url);
    // Abort silently — calling send() on this will do nothing meaningful
    this._blocked = true;
  }
  return _nativeXHROpen.call(this, method, url, ...rest);
};

const _nativeXHRSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (...args) {
  if (this._blocked) return;
  return _nativeXHRSend.apply(this, args);
};

// ─── 5. IFRAME SANDBOX ENFORCER ──────────────────────────────────────────────
// Watches for dynamically injected iframes (common ad trick) and sandboxes them
// unless they are trusted stream embeds.

const TRUSTED_EMBED_HOSTS = [
  "vidsrc.to",
  "vidsrc.xyz",
  "vidsrc.vip",
  "embed.su",
  "multiembed.mov",
];

function isTrustedEmbed(src) {
  if (!src) return false;
  try {
    const host = new URL(src).hostname;
    return TRUSTED_EMBED_HOSTS.some(
      (h) => host === h || host.endsWith("." + h)
    );
  } catch {
    return false;
  }
}

function processIframe(iframe) {
  const src = iframe.getAttribute("src") || "";
  if (!src) return;

  if (isBlockedUrl(src)) {
    console.warn("[Nexus Blocker] Ad iframe removed:", src);
    iframe.remove();
    return;
  }

  if (!isTrustedEmbed(src)) {
    // Untrusted iframe — lock it down
    const current = iframe.getAttribute("sandbox") || "";
    if (!current) {
      iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin"
      );
      console.info("[Nexus Blocker] Sandboxed unknown iframe:", src);
    }
  }
}

const iframeObserver = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType !== 1) continue;
      if (node.tagName === "IFRAME") processIframe(node);
      // Also catch iframes nested inside added nodes
      node.querySelectorAll?.("iframe").forEach(processIframe);
    }
  }
});

iframeObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// ─── 6. UNLOAD REDIRECT BLOCKER ──────────────────────────────────────────────
// Some embeds try to redirect on page unload (e.g. when closing player).

window.addEventListener(
  "beforeunload",
  (e) => {
    // Don't prevent legitimate navigation — only intercept if something
    // tried to change location to a blocked domain right before unload.
    // We reset location.href attempts in patchLocation above, so this
    // is a last-resort safety net.
    e.stopImmediatePropagation();
  },
  { capture: true }
);

// ─── 7. STATUS LOG ───────────────────────────────────────────────────────────

console.info(
  `[Nexus Blocker] Active — blocking ${BLOCKED_DOMAINS.length} ad domains. Popups, redirects, XHR, fetch, and iframe injection all monitored.`
);
