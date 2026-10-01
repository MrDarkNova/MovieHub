const ALLOW = new Set([
  "/anime/tmdb",
  "/trending",
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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=86400");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  let path = url.searchParams.get("path") || "/anime/tmdb";
  if (!path.startsWith("/")) path = `/${path}`;
  if (!ALLOW.has(path)) {
    res.status(400).json({ error: "path_not_allowed" });
    return;
  }

  const upstream = new URL(`https://prexzyapis.com${path}`);
  url.searchParams.forEach((value, name) => {
    if (name !== "path") upstream.searchParams.set(name, value);
  });

  try {
    const response = await fetch(upstream, {
      headers: { Accept: "application/json", "User-Agent": "MovieHub" },
    });
    const body = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json").send(body);
  } catch (error) {
    res.status(502).json({ error: "upstream_failed", message: String(error) });
  }
}
