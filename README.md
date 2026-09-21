# MovieHub

Clean movie and TV discovery app. Metadata from TMDB. Official YouTube trailers. Legal watch-provider logos via TMDB / JustWatch.

This rebuild does **not** host or embed unofficial full-movie streams.

## Setup

1. Create a free API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).
2. In the Vercel project `movie-hub`, add env var `TMDB_API_KEY`.
3. Or paste the key in the on-site setup screen (stored only in your browser).

## Stack

- Static frontend (`index.html`, `assets/css/app.css`, `assets/js/app.js`)
- Vercel serverless proxy: `api/tmdb.js`
- Watchlist in `localStorage`
