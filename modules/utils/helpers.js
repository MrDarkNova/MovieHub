/**
 * helpers.js
 * Shared utility functions used across modules.
 */

/**
 * Safely parses a URL and returns a URL object, or null on failure.
 * @param {string} url
 * @param {string} [base]
 * @returns {URL|null}
 */
export function safeParseUrl(url, base = location.origin) {
  try {
    return new URL(url, base);
  } catch {
    return null;
  }
}

/**
 * Returns the hostname of a URL string, or empty string on failure.
 * @param {string} url
 * @returns {string}
 */
export function getHostname(url) {
  return safeParseUrl(url)?.hostname?.toLowerCase() ?? "";
}

/**
 * Debounce a function — useful for MutationObserver callbacks.
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Logs a message with the Nexus prefix — only in non-production.
 * @param {string} level  'log' | 'warn' | 'error' | 'info'
 * @param  {...any} args
 */
export function log(level = "log", ...args) {
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
    console[level]("[Nexus]", ...args);
  }
}
