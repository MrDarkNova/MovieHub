const ALLOW = new Set([
  "/anime/tmdb",
  "/home",
  "/suggest",
  "/recommendations",
  "/search/imdb",
  "/anime/animekill-home",
  "/anime/animekill-homestatic",
  "/anime/animekill-genres",
  "/anime/animekill-schedule",
  "/anime/animekill-bygenre",
  "/anime/animekill-detail",
  "/anime/animekill-episodes",
  "/anime/animekill-comments",
]);

const UPSTREAM = "https://prexzyapis.com";
const TIMEOUT_MS = 10000;
const MAX_PARAMS = 12;
const MAX_VALUE_LEN = 200;

function send(res, status, body, cache) {
  res.setHeader("Cache-Control", cache);
  res.status(status).json(body);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, { error: "method_not_allowed" }, "no-store");
  }

  const url = new URL(req.url, "http://localhost");
  let path = url.searchParams.get("path") || "/anime/tmdb";
  if (!path.startsWith("/")) path = `/${path}`;
  if (!ALLOW.has(path)) return send(res, 400, { error: "path_not_allowed" }, "no-store");

  const upstream = new URL(`${UPSTREAM}${path}`);
  let count = 0;
  for (const [name, value] of url.searchParams) {
    if (name === "path") continue;
    if (++count > MAX_PARAMS || value.length > MAX_VALUE_LEN) {
      return send(res, 400, { error: "bad_params" }, "no-store");
    }
    upstream.searchParams.set(name, value);
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(upstream, {
      headers: { Accept: "application/json", "User-Agent": "MovieHub" },
      signal: ctrl.signal,
    });
    const body = await response.text();
    // Only successful catalog responses are cacheable; errors must not stick for minutes.
    res.setHeader(
      "Cache-Control",
      response.ok ? "public, s-maxage=300, stale-while-revalidate=86400" : "no-store"
    );
    res.status(response.status).setHeader("Content-Type", "application/json; charset=utf-8").send(body);
  } catch (error) {
    const timedOut = error?.name === "AbortError";
    send(
      res,
      timedOut ? 504 : 502,
      { error: timedOut ? "upstream_timeout" : "upstream_failed" },
      "no-store"
    );
  } finally {
    clearTimeout(timer);
  }
}
