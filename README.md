# MovieHub

Movies, series, and anime for DarkNova. Catalog data comes from Prexzy. No API key.

**Catalog and official trailers only.** MovieHub does not host or stream full films.

## Features

- Home with a rotating featured hero, plus Trending, Movies, Series and Fresh catalog rails (arrow buttons on desktop, swipe on touch)
- Movies and Series pages with "Load more"
- Search across movies and series, with All / Movies / Series filters (press `/` to jump to the search box)
- Anime: genres, featured, the weekly schedule, synopsis and episode list
- Title details with an official YouTube trailer (loads only when you press play, via youtube-nocookie)
- My List: one-tap save from any card, filters, clear all; stored in the browser only
- Loading skeletons, per-row error handling with retry, one failing source never blanks a page
- Accessible: skip link, labelled controls, focus-trapped dialog, Escape to close, keyboard-operable cards, reduced-motion support
- Responsive down to small phones; the detail view becomes a bottom sheet on mobile

## Structure

```
index.html            page shell
assets/js/app.js      router, views, list, detail dialog (ES module, no build step)
assets/css/app.css    styles
api/prexzy.js         Vercel function that proxies the allow-listed catalog routes
vercel.json           security headers and CSP
```

## Deploy

Deploy on Vercel. The `/api/prexzy` function proxies the allowed catalog routes with a 10 second timeout, caches only successful responses, and caps the number and size of query parameters.

To run locally use `vercel dev` (the static page alone cannot reach the `/api` route).
