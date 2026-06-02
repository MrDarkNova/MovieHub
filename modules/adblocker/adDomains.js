/**
 * adDomains.js
 * Blocklist of known ad networks, trackers, and popup domains
 * used by streaming embed services (vidsrc, embed.su, multiembed, etc.)
 *
 * Add any new offending domains here — blocker.js reads this list automatically.
 */

export const BLOCKED_DOMAINS = [
  // --- Google Ads & Tracking ---
  "doubleclick.net",
  "googlesyndication.com",
  "adservice.google.com",
  "googletagmanager.com",
  "googletagservices.com",
  "google-analytics.com",
  "pagead2.googlesyndication.com",

  // --- Generic Ad Networks ---
  "ads.trafficjunky.net",
  "trafficjunky.net",
  "exoclick.com",
  "exosrv.com",
  "juicyads.com",
  "adsterra.com",
  "propellerads.com",
  "propellerclick.com",
  "popcash.net",
  "popads.net",
  "hilltopads.net",
  "adcash.com",
  "clickadu.com",
  "zeropark.com",
  "bidvertiser.com",
  "revcontent.com",
  "mgid.com",
  "taboola.com",
  "outbrain.com",

  // --- Popup / Redirect Domains used by streaming embeds ---
  "onclick.io",
  "onclickads.net",
  "adclickads.net",
  "clkads.net",
  "go2speed.org",
  "s4dn.com",
  "crispads.com",
  "trackersgg.com",
  "yeahmobitrack.com",
  "redir.com",
  "redirectingat.com",

  // --- Crypto miners ---
  "coinhive.com",
  "cryptoloot.pro",
  "webminer.com",
  "minero.cc",

  // --- Malicious / aggressive popup nets ---
  "popu.pt",
  "pornhub-popup.com",
  "bestpopads.com",
  "plugrush.com",
  "tsyndicate.com",
  "fuckingfast.co",
  "static.clickaine.com",
  "cdn.shakeadsn.com",
];

/**
 * Returns true if the given URL matches any blocked domain.
 * @param {string} url
 * @returns {boolean}
 */
export function isBlockedUrl(url) {
  if (!url || typeof url !== "string") return false;
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return BLOCKED_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith("." + domain)
    );
  } catch {
    // Not a valid URL — let it pass
    return false;
  }
}
