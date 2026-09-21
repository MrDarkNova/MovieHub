export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const path = (url.searchParams.get("path") || "/trending/all/week").replace(/[^a-z0-9/_-]/gi, "");
  const key = process.env.TMDB_API_KEY || url.searchParams.get("api_key") || "";

  if (!key) {
    res.status(401).json({
      error: "missing_api_key",
      hint: "Set TMDB_API_KEY in Vercel project env, or pass a personal TMDB key from the app setup screen.",
    });
    return;
  }

  const upstream = new URL(`https://api.themoviedb.org/3${path.startsWith("/") ? path : `/${path}`}`);
  url.searchParams.forEach((value, name) => {
    if (name !== "path" && name !== "api_key") upstream.searchParams.set(name, value);
  });
  upstream.searchParams.set("api_key", key);

  try {
    const response = await fetch(upstream, { headers: { Accept: "application/json" } });
    const body = await response.text();
    res.status(response.status).setHeader("Content-Type", "application/json").send(body);
  } catch (error) {
    res.status(502).json({ error: "upstream_failed", message: String(error) });
  }
}
