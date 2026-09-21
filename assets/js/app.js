const IMG = "https://image.tmdb.org/t/p";
const KEY_STORE = "moviehub_tmdb_key";

const state = {
  key: localStorage.getItem(KEY_STORE) || "",
  cache: new Map(),
};

const $app = document.getElementById("app");
const $modal = document.getElementById("modal");
const $modalCard = $modal.querySelector(".modal-card");

function poster(path, size = "w342") {
  return path ? `${IMG}/${size}${path}` : "";
}
function backdrop(path) {
  return path ? `${IMG}/w1280${path}` : "";
}
function year(date) {
  return date ? date.slice(0, 4) : "";
}
function titleOf(item) {
  return item.title || item.name || "Untitled";
}
function mediaType(item, fallback = "movie") {
  return item.media_type && item.media_type !== "person" ? item.media_type : fallback;
}

async function tmdb(path, params = {}) {
  const qs = new URLSearchParams(params);
  const cacheKey = path + "?" + qs.toString();
  if (state.cache.has(cacheKey)) return state.cache.get(cacheKey);

  const localKey = state.key;
  let url = `/api/tmdb?path=${encodeURIComponent(path)}&${qs.toString()}`;
  if (localKey) url += `&api_key=${encodeURIComponent(localKey)}`;

  let res = await fetch(url);
  if (!res.ok && localKey) {
    const direct = new URL(`https://api.themoviedb.org/3/${path.replace(/^\//, "")}`);
    Object.entries(params).forEach(([k, v]) => direct.searchParams.set(k, v));
    direct.searchParams.set("api_key", localKey);
    res = await fetch(direct);
  }
  if (!res.ok) {
    const err = new Error("TMDB request failed");
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  state.cache.set(cacheKey, data);
  return data;
}

function list() {
  try {
    return JSON.parse(localStorage.getItem("moviehub_list") || "[]");
  } catch {
    return [];
  }
}
function saveList(items) {
  localStorage.setItem("moviehub_list", JSON.stringify(items));
}
function inList(item) {
  const id = `${mediaType(item)}:${item.id}`;
  return list().some((x) => `${x.media_type}:${x.id}` === id);
}
function toggleList(item) {
  const type = mediaType(item);
  const id = `${type}:${item.id}`;
  const next = inList(item)
    ? list().filter((x) => `${x.media_type}:${x.id}` !== id)
    : [...list(), { id: item.id, media_type: type, title: titleOf(item), poster_path: item.poster_path, release_date: item.release_date || item.first_air_date }];
  saveList(next);
}

function setupView(message = "") {
  $app.innerHTML = `
    <section class="panel setup">
      <p class="kicker">Setup</p>
      <h1>Connect a free TMDB key</h1>
      <p class="muted">MovieHub uses The Movie Database for posters, plots, ratings, official trailers, and legal watch providers. Get a free API key at themoviedb.org, then paste it here. You can also set <code>TMDB_API_KEY</code> on the Vercel project.</p>
      ${message ? `<p class="muted">${message}</p>` : ""}
      <form id="key-form">
        <input name="key" placeholder="TMDB API key" value="${state.key}" />
        <div class="actions">
          <button class="btn btn-gold" type="submit">Save & load catalog</button>
          <a class="btn btn-ghost" href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener">Get a key</a>
        </div>
      </form>
    </section>`;
  document.getElementById("key-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const key = new FormData(e.target).get("key").trim();
    state.key = key;
    localStorage.setItem(KEY_STORE, key);
    location.hash = "#/";
    boot();
  });
}

function cardHtml(item, type) {
  const t = mediaType(item, type);
  return `
    <article class="card" data-id="${item.id}" data-type="${t}">
      ${item.poster_path ? `<img class="poster" alt="" src="${poster(item.poster_path)}" />` : `<div class="poster"></div>`}
      <div class="card-meta">
        <h3>${titleOf(item)}</h3>
        <span>${year(item.release_date || item.first_air_date)} · ${Number(item.vote_average || 0).toFixed(1)}</span>
      </div>
    </article>`;
}

function bindCards(root) {
  root.querySelectorAll(".card").forEach((el) => {
    el.addEventListener("click", () => openDetail(el.dataset.type, el.dataset.id));
  });
}

async function homeView() {
  $app.innerHTML = `<div class="empty">Loading catalog…</div>`;
  const [trending, movies, tv] = await Promise.all([
    tmdb("/trending/all/week"),
    tmdb("/movie/popular"),
    tmdb("/tv/popular"),
  ]);
  const hero = (trending.results || []).find((x) => x.backdrop_path) || trending.results?.[0];
  $app.innerHTML = `
    <section class="hero">
      <div class="hero-bg" style="background-image:url('${backdrop(hero?.backdrop_path)}')"></div>
      <div class="hero-copy">
        <div class="kicker">This week</div>
        <h1>${titleOf(hero || { title: "MovieHub" })}</h1>
        <p>${hero?.overview || "A clean catalog for movies and series."}</p>
        <div class="actions">
          <button class="btn btn-gold" id="hero-open">Details & trailer</button>
          <button class="btn btn-ghost" id="hero-list">${inList(hero) ? "In my list" : "Add to list"}</button>
        </div>
      </div>
    </section>
    <section class="section">
      <h2>Trending</h2>
      <div class="rail">${(trending.results || []).filter((x) => x.media_type !== "person").slice(0, 16).map((x) => cardHtml(x)).join("")}</div>
      <h2>Popular movies</h2>
      <div class="rail">${(movies.results || []).slice(0, 16).map((x) => cardHtml(x, "movie")).join("")}</div>
      <h2>Popular TV</h2>
      <div class="rail">${(tv.results || []).slice(0, 16).map((x) => cardHtml(x, "tv")).join("")}</div>
    </section>`;
  bindCards($app);
  document.getElementById("hero-open")?.addEventListener("click", () => openDetail(mediaType(hero), hero.id));
  document.getElementById("hero-list")?.addEventListener("click", (e) => {
    toggleList(hero);
    e.target.textContent = inList(hero) ? "In my list" : "Add to list";
  });
}

async function catalogView(kind) {
  const path = kind === "tv" ? "/tv/popular" : "/movie/popular";
  $app.innerHTML = `<div class="empty">Loading…</div>`;
  const data = await tmdb(path);
  $app.innerHTML = `
    <section class="section">
      <h2>${kind === "tv" ? "Popular TV" : "Popular movies"}</h2>
      <div class="grid">${(data.results || []).map((x) => cardHtml(x, kind)).join("")}</div>
    </section>`;
  bindCards($app);
}

async function searchView(q) {
  $app.innerHTML = `<div class="empty">Searching “${q}”…</div>`;
  const data = await tmdb("/search/multi", { query: q });
  const items = (data.results || []).filter((x) => x.media_type === "movie" || x.media_type === "tv");
  $app.innerHTML = `
    <section class="section">
      <h2>Results for “${q}”</h2>
      <div class="grid">${items.map((x) => cardHtml(x)).join("") || '<p class="muted">No titles found.</p>'}</div>
    </section>`;
  bindCards($app);
}

function listView() {
  const items = list();
  $app.innerHTML = `
    <section class="section">
      <h2>My list</h2>
      <div class="grid">${items.map((x) => cardHtml(x, x.media_type)).join("") || '<p class="muted">Nothing saved yet.</p>'}</div>
    </section>`;
  bindCards($app);
}

async function openDetail(type, id) {
  $modal.hidden = false;
  $modalCard.innerHTML = `<div class="modal-body"><p class="muted">Loading title…</p></div>`;
  const [detail, videos, providers] = await Promise.all([
    tmdb(`/${type}/${id}`),
    tmdb(`/${type}/${id}/videos`),
    tmdb(`/${type}/${id}/watch/providers`),
  ]);
  const trailer = (videos.results || []).find((v) => v.site === "YouTube" && /trailer/i.test(v.type))
    || (videos.results || []).find((v) => v.site === "YouTube");
  const region = providers.results?.NG || providers.results?.US || Object.values(providers.results || {})[0];
  const flats = [...(region?.flatrate || []), ...(region?.rent || []), ...(region?.buy || [])];
  $modalCard.innerHTML = `
    <button class="close-x" data-close>×</button>
    <div class="modal-hero" style="background-image:url('${backdrop(detail.backdrop_path)}')"></div>
    <div class="modal-body">
      <h2>${titleOf(detail)}</h2>
      <div class="chips">
        <span class="chip">${year(detail.release_date || detail.first_air_date)}</span>
        <span class="chip">${Number(detail.vote_average || 0).toFixed(1)} TMDB</span>
        ${(detail.genres || []).slice(0, 3).map((g) => `<span class="chip">${g.name}</span>`).join("")}
      </div>
      <p>${detail.overview || "No overview yet."}</p>
      <div class="actions">
        <button class="btn btn-gold" id="save-btn">${inList({ ...detail, media_type: type }) ? "Remove from list" : "Add to list"}</button>
        ${detail.homepage ? `<a class="btn btn-ghost" href="${detail.homepage}" target="_blank" rel="noopener">Official site</a>` : ""}
      </div>
      ${flats.length ? `<h3>Where to watch</h3><div class="providers">${flats.slice(0, 8).map((p) => `<img alt="${p.provider_name}" title="${p.provider_name}" src="${IMG}/w92${p.logo_path}" />`).join("")}</div><p class="muted">Availability via TMDB / JustWatch. Subscribe on the official service.</p>` : `<p class="muted">No watch-provider data for this title in the current region.</p>`}
      ${trailer ? `<iframe class="yt" src="https://www.youtube.com/embed/${trailer.key}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Official trailer"></iframe>` : ""}
    </div>`;
  document.getElementById("save-btn").addEventListener("click", (e) => {
    toggleList({ ...detail, media_type: type, poster_path: detail.poster_path });
    e.target.textContent = inList({ ...detail, media_type: type }) ? "Remove from list" : "Add to list";
  });
}

$modal.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) $modal.hidden = true;
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") $modal.hidden = true;
});

document.getElementById("search-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = document.getElementById("search-input").value.trim();
  if (q) location.hash = `#/search?q=${encodeURIComponent(q)}`;
});

function setNav(name) {
  document.querySelectorAll("[data-nav]").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === name);
  });
}

async function boot() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const [path, query] = hash.split("?");
  const params = new URLSearchParams(query || "");
  try {
    if (path.startsWith("/search")) {
      setNav("home");
      const q = params.get("q") || "";
      if (!q) return homeView();
      await searchView(q);
    } else if (path.startsWith("/movies")) {
      setNav("movies");
      await catalogView("movie");
    } else if (path.startsWith("/tv")) {
      setNav("tv");
      await catalogView("tv");
    } else if (path.startsWith("/list")) {
      setNav("list");
      listView();
    } else {
      setNav("home");
      await homeView();
    }
  } catch (err) {
    setupView(err.status === 401 || err.status === 403
      ? "TMDB rejected the key. Add a valid key below or set TMDB_API_KEY on Vercel."
      : "Could not reach TMDB. Add a free API key to continue.");
  }
}

window.addEventListener("hashchange", boot);
boot();
