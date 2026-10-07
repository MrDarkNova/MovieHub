/* MovieHub — catalog, trailers, anime board, personal list.
   No build step. Talks only to /api/prexzy (see api/prexzy.js). */

const IMG = "https://image.tmdb.org/t/p";
const LIST_KEY = "moviehub_list";
const $app = document.getElementById("app");
const $modal = document.getElementById("modal");
const $modalCard = $modal.querySelector(".modal-card");
const $toasts = document.getElementById("toasts");
const $searchInput = document.getElementById("search-input");

const cache = new Map();      // successful API responses, keyed by query string
const registry = new Map();   // "type:id" -> normalised item, filled as cards render
let navToken = 0;             // guards against slow responses painting over newer pages
let detailToken = 0;
let heroTimer = null;
let lastFocus = null;

/* ---------- small helpers ---------- */

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ESC[c]);
}
const posterPath = (p, size = "w342") => (p ? `${IMG}/${size}${p}` : "");
const year = (d) => (d ? String(d).slice(0, 4) : "");
const unwrap = (json) => json?.result ?? json?.data?.data ?? json?.data ?? json;
const asArray = (v) => (Array.isArray(v) ? v : []);
const keyOf = (item) => `${item.media_type}:${item.id}`;
const typeLabel = (t) => ({ movie: "Movie", tv: "Series", series: "Series", anime: "Anime" }[t] || t);
const score = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n.toFixed(1) : "";
};

function toast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  $toasts.appendChild(el);
  setTimeout(() => el.classList.add("out"), 2000);
  setTimeout(() => el.remove(), 2400);
}

/* ---------- API ---------- */

async function px(path, params = {}, { retries = 1 } = {}) {
  const qs = new URLSearchParams({ path, ...params });
  const key = qs.toString();
  if (cache.has(key)) return cache.get(key);

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(`/api/prexzy?${key}`, { signal: ctrl.signal });
      if (res.ok) {
        const data = await res.json();
        cache.set(key, data);
        return data;
      }
      lastErr = new Error(`Catalog request failed (${res.status})`);
      if (res.status < 500) break; // 4xx will not improve on retry
    } catch (err) {
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
    if (attempt < retries) await new Promise((r) => setTimeout(r, 400));
  }
  throw lastErr || new Error("Catalog request failed");
}

/* Run several requests; a failure in one must not blank the whole page. */
async function settle(promises) {
  const out = await Promise.allSettled(promises);
  return { values: out.map((o) => (o.status === "fulfilled" ? o.value : null)), failed: out.filter((o) => o.status === "rejected").length };
}

/* ---------- My list (localStorage, never throws) ---------- */

function list() {
  try {
    const raw = JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((x) => x && x.id != null && x.media_type) : [];
  } catch {
    return [];
  }
}
function saveList(items) {
  try {
    localStorage.setItem(LIST_KEY, JSON.stringify(items));
    return true;
  } catch {
    toast("Could not save: browser storage is unavailable");
    return false;
  }
}
const inList = (item) => list().some((x) => keyOf(x) === keyOf(item));
function toggleList(item) {
  const id = keyOf(item);
  const had = inList(item);
  const next = had ? list().filter((x) => keyOf(x) !== id) : [...list(), item];
  if (saveList(next)) toast(had ? "Removed from My List" : "Added to My List");
  updateListBadge();
  return !had;
}
function saveText(btn, on) {
  const kind = btn.dataset.label;
  if (kind === "long") return on ? "✓ In My List" : "+ Add to My List";
  if (kind === "hero") return on ? "✓ In My List" : "+ My List";
  return on ? "✓" : "+";
}
function updateListBadge() {
  const n = list().length;
  const badge = document.getElementById("list-count");
  if (badge) {
    badge.textContent = n;
    badge.hidden = n === 0;
  }
  document.querySelectorAll("[data-save]").forEach((btn) => {
    const item = registry.get(btn.dataset.save);
    if (!item) return;
    const on = inList(item);
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", String(on));
    if (!btn.dataset.label) btn.setAttribute("aria-label", `${on ? "Remove" : "Add"} ${item.title} ${on ? "from" : "to"} My List`);
    btn.textContent = saveText(btn, on);
  });
}

/* ---------- normalisers ---------- */

function fromTmdb(item, type = "movie") {
  const media = item.media_type && item.media_type !== "person" ? item.media_type : type;
  return {
    id: item.id,
    media_type: media,
    title: item.title || item.name || "Untitled",
    poster: posterPath(item.poster_path),
    backdrop: item.backdrop_path ? `${IMG}/w1280${item.backdrop_path}` : "",
    year: year(item.release_date || item.first_air_date),
    score: score(item.vote_average),
    overview: item.overview || "",
    source: "tmdb",
  };
}
function fromSubject(item) {
  return {
    id: item.subjectId,
    media_type: Number(item.subjectType) === 1 ? "movie" : "series",
    title: item.title || "Untitled",
    poster: item.cover?.url || "",
    backdrop: item.stills?.[0]?.url || item.cover?.url || "",
    year: year(item.releaseDate),
    score: score(item.imdbRatingValue),
    overview: item.description || item.genre || "",
    trailer: item.trailer?.videoAddress?.url || "",
    source: "catalog",
  };
}
function fromHome(json) {
  const entries = asArray(json?.home?.operatingList).flatMap((section) => [
    ...asArray(section?.banner?.items).map((entry) => entry?.subject || entry),
    ...asArray(section?.subjects),
  ]);
  return [...new Map(
    entries
      .filter((entry) => entry?.subjectId != null)
      .map((entry) => [String(entry.subjectId), fromSubject(entry)])
  ).values()];
}

function fromAnime(item) {
  return {
    id: item.anime_id,
    media_type: "anime",
    title: item.name || "Untitled",
    poster: item.small_poster || item.orginal_poster || "",
    backdrop: item.large_poster || item.orginal_poster || item.small_poster || "",
    year: year(item.add_on_date),
    score: score(item.score),
    overview: item.description || item.synonyms || item.genre || "",
    genre: item.genre || "",
    source: "anime",
  };
}
const tmdbList = (json, type) => asArray(unwrap(json)?.results).filter((x) => x.media_type !== "person").map((x) => fromTmdb(x, type));

/* ---------- views: building blocks ---------- */

function remember(item) {
  registry.set(keyOf(item), item);
  return item;
}

function cardHtml(item) {
  remember(item);
  const k = esc(keyOf(item));
  const on = inList(item);
  const meta = [item.year, item.score && `★ ${item.score}`].filter(Boolean).join(" · ");
  const img = item.poster
    ? `<img class="poster" alt="" loading="lazy" decoding="async" src="${esc(item.poster)}" data-fallback />`
    : `<div class="poster ph" aria-hidden="true">${esc(item.title.slice(0, 1))}</div>`;
  return `
    <article class="card">
      <button type="button" class="card-open" data-open="${k}" aria-label="${esc(item.title)}${item.year ? `, ${esc(item.year)}` : ""}">
        ${img}
        <span class="card-meta">
          <span class="t">${esc(item.title)}</span>
          <span class="m">${esc(meta || typeLabel(item.media_type))}</span>
        </span>
      </button>
      <button type="button" class="card-save ${on ? "on" : ""}" data-save="${k}" aria-pressed="${on}" aria-label="${on ? "Remove" : "Add"} ${esc(item.title)} ${on ? "from" : "to"} My List">${on ? "✓" : "+"}</button>
    </article>`;
}

function rail(title, items, id) {
  if (!items.length) return "";
  return `
    <section class="rail-block" aria-label="${esc(title)}">
      <div class="rail-head">
        <h2>${esc(title)}</h2>
        <span class="rail-arrows">
          <button type="button" data-scroll="-1" data-rail="${id}" aria-label="Scroll ${esc(title)} left">‹</button>
          <button type="button" data-scroll="1" data-rail="${id}" aria-label="Scroll ${esc(title)} right">›</button>
        </span>
      </div>
      <div class="rail" id="${id}" tabindex="-1">${items.map(cardHtml).join("")}</div>
    </section>`;
}

const skeletonRail = (n = 8) => `<div class="rail-block"><div class="sk-title"></div><div class="rail">${'<div class="card sk"><div class="poster"></div><div class="sk-line"></div></div>'.repeat(n)}</div></div>`;
const skeletonGrid = (n = 12) => `<div class="grid">${'<div class="card sk"><div class="poster"></div><div class="sk-line"></div></div>'.repeat(n)}</div>`;

function errorPanel(message, retryable = true) {
  return `<section class="panel" role="alert">
    <h1>Something went wrong</h1>
    <p class="muted">${esc(message)}</p>
    ${retryable ? '<div class="actions"><button type="button" class="btn btn-gold" data-retry>Try again</button></div>' : ""}
  </section>`;
}

/* Paint only if this navigation is still the current one. */
function paint(token, html) {
  if (token !== navToken) return false;
  $app.innerHTML = html;
  return true;
}

/* ---------- views ---------- */

function clearHero() {
  clearInterval(heroTimer);
  heroTimer = null;
}

function heroHtml(slides) {
  return `
    <section class="hero" aria-roledescription="carousel" aria-label="Featured titles">
      <div class="hero-bg" id="hero-bg"></div>
      <div class="hero-copy" aria-live="off">
        <div class="kicker" id="hero-kicker"></div>
        <h1 id="hero-title"></h1>
        <div class="chips" id="hero-chips"></div>
        <p id="hero-text"></p>
        <div class="actions">
          <button type="button" class="btn btn-gold" id="hero-open">View details</button>
          <button type="button" class="btn btn-ghost" id="hero-list"></button>
        </div>
        ${slides.length > 1 ? `<div class="dots" role="tablist" aria-label="Featured title">${slides.map((_, i) => `<button type="button" role="tab" data-slide="${i}" aria-label="Show featured title ${i + 1}"></button>`).join("")}</div>` : ""}
      </div>
    </section>`;
}

function initHero(slides) {
  if (!slides.length) return;
  let index = 0;
  const set = (i) => {
    index = (i + slides.length) % slides.length;
    const s = remember(slides[index]);
    const bg = document.getElementById("hero-bg");
    if (!bg) return clearHero();
    bg.style.backgroundImage = s.backdrop || s.poster ? `url("${(s.backdrop || s.poster).replace(/"/g, "%22")}")` : "none";
    document.getElementById("hero-kicker").textContent = typeLabel(s.media_type) + " · Trending";
    document.getElementById("hero-title").textContent = s.title;
    document.getElementById("hero-chips").innerHTML = [s.year, s.score && `★ ${s.score}`].filter(Boolean).map((c) => `<span class="chip">${esc(c)}</span>`).join("");
    document.getElementById("hero-text").textContent = s.overview || "Movies, series, and anime in one catalog.";
    const btn = document.getElementById("hero-list");
    btn.dataset.label = "hero";
    btn.dataset.save = keyOf(s);
    btn.textContent = saveText(btn, inList(s));
    document.getElementById("hero-open").dataset.open = keyOf(s);
    $app.querySelectorAll(".dots button").forEach((d, n) => d.setAttribute("aria-selected", String(n === index)));
  };
  set(0);
  $app.querySelectorAll("[data-slide]").forEach((d) => d.addEventListener("click", () => { set(Number(d.dataset.slide)); restart(); }));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function restart() {
    clearHero();
    if (!reduce && slides.length > 1) heroTimer = setInterval(() => { if (!document.hidden) set(index + 1); }, 8000);
  }
  const hero = $app.querySelector(".hero");
  hero.addEventListener("mouseenter", clearHero);
  hero.addEventListener("mouseleave", restart);
  hero.addEventListener("focusin", clearHero);
  hero.addEventListener("focusout", restart);
  restart();
}

async function homeView(token) {
  paint(token, `<div class="hero sk-hero"></div><section class="section">${skeletonRail()}${skeletonRail()}</section>`);
  const { values, failed } = await settle([
    px("/anime/tmdb", { action: "trending", type: "all", limit: "16" }),
    px("/anime/tmdb", { action: "discover", type: "movie", limit: "16" }),
    px("/anime/tmdb", { action: "discover", type: "tv", limit: "16" }),
    px("/home"),
  ]);
  if (token !== navToken) return;
  if (failed === values.length) return paint(token, errorPanel("The movie service did not answer. Check your connection and try again."));

  const [trendingJson, moviesJson, tvJson, nativeJson] = values;
  const trend = trendingJson ? tmdbList(trendingJson) : [];
  const film = moviesJson ? tmdbList(moviesJson, "movie") : [];
  const shows = tvJson ? tmdbList(tvJson, "tv") : [];
  const live = nativeJson ? fromHome(nativeJson) : [];
  const slides = trend.filter((x) => x.backdrop).slice(0, 5);
  if (!slides.length) slides.push(...[trend[0], live[0], film[0]].filter(Boolean).slice(0, 1));

  paint(token, `
    ${slides.length ? heroHtml(slides) : '<section class="hero hero-plain"><div class="hero-copy"><h1>MovieHub</h1><p>Movies, series, and anime in one catalog.</p></div></section>'}
    <section class="section">
      ${failed ? `<p class="notice">Some rows could not load right now. <button type="button" class="link" data-retry>Retry</button></p>` : ""}
      ${rail("Trending", trend.slice(0, 16), "r-trending")}
      ${rail("Movies", film.slice(0, 16), "r-movies")}
      ${rail("Series", shows.slice(0, 16), "r-series")}
      ${rail("Fresh catalog", live.slice(0, 12), "r-fresh")}
    </section>`);
  initHero(slides);
}

/* Movies / TV: "load more" tolerates an upstream that ignores the page parameter. */
async function catalogView(token, kind) {
  paint(token, `<section class="section"><div class="page-head"><h1>${kind === "tv" ? "Series" : "Movies"}</h1></div>${skeletonGrid()}</section>`);
  const seen = new Set();
  let page = 1;
  const fetchPage = async (n) => {
    const json = await px("/anime/tmdb", { action: "discover", type: kind, limit: "20", page: String(n) });
    return tmdbList(json, kind).filter((i) => {
      const k = keyOf(i);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };
  const first = await fetchPage(page);
  if (token !== navToken) return;
  paint(token, `
    <section class="section">
      <div class="page-head"><h1>${kind === "tv" ? "Series" : "Movies"}</h1><p class="muted">${first.length} titles</p></div>
      <div class="grid" id="grid">${first.map(cardHtml).join("") || '<p class="muted">Nothing to show right now.</p>'}</div>
      <div class="more"><button type="button" class="btn btn-ghost" id="more" ${first.length ? "" : "hidden"}>Load more</button></div>
    </section>`);
  const more = document.getElementById("more");
  more?.addEventListener("click", async () => {
    more.disabled = true;
    more.textContent = "Loading…";
    try {
      const next = await fetchPage(++page);
      if (token !== navToken) return;
      document.getElementById("grid").insertAdjacentHTML("beforeend", next.map(cardHtml).join(""));
      if (!next.length) { more.textContent = "That's everything for now"; return; }
      more.disabled = false;
      more.textContent = "Load more";
    } catch {
      more.disabled = false;
      more.textContent = "Couldn't load, try again";
    }
  });
}

async function animeView(token, genre) {
  paint(token, `<section class="section"><div class="page-head"><h1>Anime</h1></div>${skeletonRail()}${skeletonRail()}</section>`);
  const { values, failed } = await settle([
    px("/anime/animekill-home"),
    px("/anime/animekill-genres"),
    px("/anime/animekill-schedule"),
    genre ? px("/anime/animekill-bygenre", { genre, offset: "0" }) : Promise.resolve(null),
  ]);
  if (token !== navToken) return;
  const [home, genres, schedule, pack] = values;
  if (!home && !genres && !schedule) return paint(token, errorPanel("The anime service did not answer."));
  const banner = asArray(home?.data?.data?.topBannerAnime).map(fromAnime);
  const genreList = asArray(genres?.data?.data?.genres);
  const week = asArray(schedule?.data?.data?.animeSuggestions).slice(0, 18).map(fromAnime);
  const picked = asArray(pack?.data?.data?.animelist).map(fromAnime);
  paint(token, `
    <section class="section">
      <div class="page-head"><h1>Anime</h1></div>
      ${failed ? `<p class="notice">Some rows could not load. <button type="button" class="link" data-retry>Retry</button></p>` : ""}
      <div class="chips genre-chips" id="genres" role="group" aria-label="Genres">
        ${genre ? '<a class="chip on" href="#/anime">All genres ✕</a>' : ""}
        ${genreList.slice(0, 20).map((g) => `<a class="chip ${g.genre_name === genre ? "on" : ""}" href="#/anime?genre=${encodeURIComponent(g.genre_name)}">${esc(g.genre_name)}</a>`).join("")}
      </div>
      ${genre ? (picked.length ? rail(genre, picked, "r-genre") : `<p class="muted">No ${esc(genre)} titles right now.</p>`) : ""}
      ${rail("Featured", banner.slice(0, 14), "r-featured")}
      ${rail("This week", week, "r-week")}
    </section>`);
}

async function searchView(token, q) {
  paint(token, `<section class="section"><div class="page-head"><h1>Searching “${esc(q)}”…</h1></div>${skeletonGrid(10)}</section>`);
  const { values, failed } = await settle([
    px("/anime/tmdb", { action: "search", query: q, type: "movie", limit: "20" }),
    px("/anime/tmdb", { action: "search", query: q, type: "tv", limit: "20" }),
  ]);
  if (token !== navToken) return;
  if (failed === 2) return paint(token, errorPanel("Search is unavailable right now."));
  const items = [...(values[0] ? tmdbList(values[0], "movie") : []), ...(values[1] ? tmdbList(values[1], "tv") : [])];
  paint(token, `
    <section class="section">
      <div class="page-head">
        <h1>Results for “${esc(q)}”</h1>
        <p class="muted">${items.length} ${items.length === 1 ? "title" : "titles"}${failed ? " · one source did not respond" : ""}</p>
      </div>
      ${items.length ? `
        <div class="chips" role="group" aria-label="Filter results">
          <button type="button" class="chip on" data-filter="all">All</button>
          <button type="button" class="chip" data-filter="movie">Movies</button>
          <button type="button" class="chip" data-filter="tv">Series</button>
        </div>` : ""}
      <div class="grid" id="results">${items.map(cardHtml).join("") || '<p class="muted">No titles found. Try a different spelling.</p>'}</div>
    </section>`);
}

function listView(token, filter = "all") {
  const all = list();
  const items = all.filter((x) => filter === "all" || (filter === "tv" ? x.media_type === "tv" || x.media_type === "series" : x.media_type === filter));
  paint(token, `
    <section class="section">
      <div class="page-head">
        <h1>My List</h1>
        <p class="muted">${all.length} saved on this device</p>
      </div>
      ${all.length ? `
        <div class="chips" role="group" aria-label="Filter list">
          ${[["all", "All"], ["movie", "Movies"], ["tv", "Series"], ["anime", "Anime"]].map(([v, l]) => `<button type="button" class="chip ${v === filter ? "on" : ""}" data-listfilter="${v}">${l}</button>`).join("")}
          <button type="button" class="chip danger" id="clear-list">Clear all</button>
        </div>` : ""}
      <div class="grid">${items.map(cardHtml).join("") || `<div class="empty-state"><p>${all.length ? "Nothing in this filter." : "Nothing saved yet."}</p>${all.length ? "" : '<a class="btn btn-gold" href="#/">Browse titles</a>'}</div>`}</div>
    </section>`);
}

/* ---------- detail modal ---------- */

function openModalShell() {
  lastFocus = document.activeElement;
  $modal.hidden = false;
  document.body.classList.add("lock");
  $modalCard.scrollTop = 0;
}
function closeModal() {
  if ($modal.hidden) return;
  detailToken++;
  $modal.hidden = true;
  $modalCard.innerHTML = "";
  document.body.classList.remove("lock");
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}
function modalSkeleton() {
  $modalCard.innerHTML = `<button type="button" class="close-x" data-close aria-label="Close">×</button><div class="modal-hero sk"></div><div class="modal-body"><div class="sk-title"></div><div class="sk-line"></div><div class="sk-line"></div></div>`;
}
function modalError(message, item) {
  $modalCard.innerHTML = `<button type="button" class="close-x" data-close aria-label="Close">×</button>
    <div class="modal-body" role="alert"><h2>Couldn't load this title</h2><p class="muted">${esc(message)}</p>
    <div class="actions"><button type="button" class="btn btn-gold" data-reopen="${esc(item ? keyOf(item) : "")}">Try again</button><button type="button" class="btn btn-ghost" data-close>Close</button></div></div>`;
  $modalCard.querySelector(".close-x").focus();
}

function modalFrame(item, inner, extra = "") {
  const hero = item.backdrop || item.poster;
  return `
    <button type="button" class="close-x" data-close aria-label="Close">×</button>
    <div class="modal-hero" style="${hero ? `background-image:url('${esc(hero)}')` : ""}"></div>
    <div class="modal-body">
      <h2 id="modal-title">${esc(item.title)}</h2>
      ${inner}
      <div class="actions">
        <button type="button" class="btn btn-gold" data-save="${esc(keyOf(item))}" data-label="long">${inList(item) ? "✓ In My List" : "+ Add to My List"}</button>
      </div>
      ${extra}
    </div>`;
}

function trailerFacade(videoKey) {
  return `<div class="trailer" data-yt="${esc(videoKey)}">
    <button type="button" class="play" aria-label="Play trailer"><span>▶</span> Play trailer</button>
  </div>`;
}

async function openDetail(k) {
  const item = registry.get(k);
  if (!item) return;
  const my = ++detailToken;
  openModalShell();
  modalSkeleton();
  $modalCard.setAttribute("aria-labelledby", "modal-title");
  $modalCard.querySelector(".close-x").focus();
  try {
    if (item.source === "anime") await renderAnime(item, my);
    else if (item.source === "catalog") renderCatalog(item, my);
    else await renderTmdb(item, my);
  } catch (err) {
    if (my !== detailToken) return;
    modalError("The movie service did not answer.", item);
  }
  updateListBadge();
}

async function renderTmdb(item, my) {
  const type = item.media_type === "series" ? "tv" : item.media_type;
  const { values } = await settle([
    px("/anime/tmdb", { action: "detail", type, id: item.id }),
    px("/anime/tmdb", { action: "videos", type, id: item.id }),
    px("/anime/tmdb", { action: "recommend", type, id: item.id, limit: "8" }),
  ]);
  if (my !== detailToken) return;
  const [detailJson, videosJson, similarJson] = values;
  if (!detailJson) throw new Error("detail unavailable");
  const detail = unwrap(detailJson) || {};
  const full = remember({ ...item, ...fromTmdb({ ...detail, media_type: type }, type), source: "tmdb" });
  const genres = asArray(detail.genres).slice(0, 4).map((g) => g.name);
  const vids = asArray(unwrap(videosJson)?.results).filter((v) => v.site === "YouTube" && v.key);
  const trailer = vids.find((v) => /trailer/i.test(`${v.type} ${v.name}`)) || vids[0];
  const more = similarJson ? tmdbList(similarJson, type).slice(0, 8) : [];
  const runtime = detail.runtime ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : detail.number_of_seasons ? `${detail.number_of_seasons} season${detail.number_of_seasons > 1 ? "s" : ""}` : "";
  const chips = [typeLabel(full.media_type), full.year, full.score && `★ ${full.score}`, runtime, ...genres].filter(Boolean);
  $modalCard.innerHTML = modalFrame(
    full,
    `<div class="chips">${chips.map((c) => `<span class="chip static">${esc(c)}</span>`).join("")}</div>
     ${detail.tagline ? `<p class="tagline">${esc(detail.tagline)}</p>` : ""}
     <p>${esc(detail.overview || full.overview || "No overview yet.")}</p>`,
    `${trailer ? trailerFacade(trailer.key) : '<p class="muted">No official trailer in the catalog.</p>'}
     ${more.length ? `<h3>More like this</h3><div class="rail">${more.map(cardHtml).join("")}</div>` : ""}`
  );
  $modalCard.querySelector(".close-x").focus();
}

function renderCatalog(item, my) {
  if (my !== detailToken) return;
  $modalCard.innerHTML = modalFrame(
    item,
    `<div class="chips">${[typeLabel(item.media_type), item.year, item.score && `★ ${item.score}`].filter(Boolean).map((c) => `<span class="chip static">${esc(c)}</span>`).join("")}</div>
     <p>${esc(item.overview || "Catalog title.")}</p>`,
    item.trailer ? `<video class="yt" controls preload="none" playsinline src="${esc(item.trailer)}"></video>` : '<p class="muted">No trailer available for this title.</p>'
  );
  $modalCard.querySelector(".close-x").focus();
}

async function renderAnime(item, my) {
  const { values } = await settle([
    px("/anime/animekill-detail", { anime_id: item.id }),
    px("/anime/animekill-episodes", { anime_id: item.id, order: "asc" }),
  ]);
  if (my !== detailToken) return;
  const [detail, episodes] = values;
  const raw = detail?.data?.data?.animeDetails || {};
  const full = remember(raw.anime_id ? { ...item, ...fromAnime(raw) } : item);
  const seen = new Set();
  const eps = asArray(episodes?.data?.data?.animeVideos).map((e) => e.episodeNumber).filter((n) => n != null && !seen.has(n) && seen.add(n));
  $modalCard.innerHTML = modalFrame(
    full,
    `<div class="chips">${[typeLabel("anime"), full.genre, full.score && `★ ${full.score}`].filter(Boolean).map((c) => `<span class="chip static">${esc(c)}</span>`).join("")}</div>
     <p>${esc(raw.description || full.overview || "No synopsis yet.")}</p>`,
    eps.length
      ? `<h3>Episodes <span class="muted">(${eps.length})</span></h3><div class="chips">${eps.slice(0, 60).map((n) => `<span class="chip static">Ep ${esc(n)}</span>`).join("")}${eps.length > 60 ? `<span class="chip static">+${eps.length - 60} more</span>` : ""}</div>`
      : '<p class="muted">No episode list yet.</p>'
  );
  $modalCard.querySelector(".close-x").focus();
}

/* ---------- events (delegated) ---------- */

document.addEventListener("click", (e) => {
  const t = e.target;
  const open = t.closest("[data-open]");
  const save = t.closest("[data-save]");
  const scroller = t.closest("[data-scroll]");
  const yt = t.closest("[data-yt] .play");

  if (save) {
    const item = registry.get(save.dataset.save);
    if (!item) return;
    const added = toggleList(item);
    if (location.hash.startsWith("#/list") && !added) route();
    return;
  }
  if (open) { openDetail(open.dataset.open); return; }
  if (scroller) {
    const el = document.getElementById(scroller.dataset.rail);
    if (el) el.scrollBy({ left: Number(scroller.dataset.scroll) * el.clientWidth * 0.85, behavior: "smooth" });
    return;
  }
  if (yt) {
    const box = yt.closest("[data-yt]");
    box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(box.dataset.yt)}?autoplay=1&rel=0" title="Trailer" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    return;
  }
  if (t.closest("[data-close]")) { closeModal(); return; }
  if (t.closest("[data-retry]")) { cache.clear(); route(); return; }
  const re = t.closest("[data-reopen]");
  if (re) { cache.clear(); openDetail(re.dataset.reopen); return; }

  const f = t.closest("[data-filter]");
  if (f) {
    document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("on", b === f));
    document.querySelectorAll("#results .card").forEach((c) => {
      const item = registry.get(c.querySelector("[data-open]").dataset.open);
      const isTv = item.media_type === "tv" || item.media_type === "series";
      c.hidden = !(f.dataset.filter === "all" || (f.dataset.filter === "tv" ? isTv : item.media_type === f.dataset.filter));
    });
    return;
  }
  const lf = t.closest("[data-listfilter]");
  if (lf) { listView(navToken, lf.dataset.listfilter); return; }
  if (t.closest("#clear-list")) {
    if (confirm("Remove everything from My List?")) { saveList([]); updateListBadge(); listView(navToken); }
  }
});

/* Poster fallback without inline handlers (keeps the CSP strict). */
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img instanceof HTMLImageElement && img.hasAttribute("data-fallback")) {
    const ph = document.createElement("div");
    ph.className = "poster ph";
    ph.setAttribute("aria-hidden", "true");
    ph.textContent = (img.closest(".card")?.querySelector(".t")?.textContent || "?").slice(0, 1);
    img.replaceWith(ph);
  }
}, true);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement?.tagName) && $modal.hidden) {
    e.preventDefault();
    $searchInput.focus();
  }
  if (e.key === "Tab" && !$modal.hidden) {
    const f = [...$modalCard.querySelectorAll("button, a[href], iframe, video[controls]")].filter((x) => !x.hidden && x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

document.getElementById("modal").querySelector(".modal-backdrop").addEventListener("click", closeModal);

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $searchInput.value.trim();
  if (q) location.hash = `#/search?q=${encodeURIComponent(q)}`;
});

/* ---------- router ---------- */

function setNav(name) {
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const on = a.dataset.nav === name;
    a.classList.toggle("active", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
}


async function route() {
  const token = ++navToken;
  clearHero();
  closeModal();
  const hash = location.hash.replace(/^#/, "") || "/";
  const [path, query] = hash.split("?");
  const params = new URLSearchParams(query || "");
  try {
    if (path.startsWith("/search")) {
      const q = (params.get("q") || "").trim();
      $searchInput.value = q;
      setNav("");
      if (!q) { location.replace("#/"); return; }
      document.title = `“${q}” — MovieHub`;
      window.scrollTo(0, 0);
      return await searchView(token, q);
    }
    $searchInput.value = "";
    if (path.startsWith("/movies")) { setNav("movies"); document.title = "Movies — MovieHub"; window.scrollTo(0, 0); return await catalogView(token, "movie"); }
    if (path.startsWith("/tv")) { setNav("tv"); document.title = "Series — MovieHub"; window.scrollTo(0, 0); return await catalogView(token, "tv"); }
    if (path.startsWith("/anime")) { setNav("anime"); document.title = "Anime — MovieHub"; window.scrollTo(0, 0); return await animeView(token, params.get("genre") || ""); }
    if (path.startsWith("/list")) { setNav("list"); document.title = "My List — MovieHub"; window.scrollTo(0, 0); return listView(token); }
    setNav("home");
    document.title = "MovieHub — Discover films & series";
    window.scrollTo(0, 0);
    await homeView(token);
  } catch (err) {
    paint(token, errorPanel("The movie service did not answer. Try again in a moment."));
  } finally {
    if (token === navToken) document.getElementById("app").focus({ preventScroll: true });
    updateListBadge();
  }
}

window.addEventListener("hashchange", route);
window.addEventListener("storage", updateListBadge);
route();
