const IMG = "https://image.tmdb.org/t/p";
const state = { cache: new Map() };
const $app = document.getElementById("app");
const $modal = document.getElementById("modal");
const $modalCard = $modal.querySelector(".modal-card");

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&", "<": "<", ">": ">", '"': """, "'": "&#39;",
  }[c]));
}
function posterPath(path, size = "w342") {
  return path ? `${IMG}/${size}${path}` : "";
}
function year(date) {
  return date ? String(date).slice(0, 4) : "";
}
function unwrap(json) {
  return json?.result ?? json?.data?.data ?? json?.data ?? json;
}

async function px(path, params = {}) {
  const qs = new URLSearchParams({ path, ...params });
  const key = qs.toString();
  if (state.cache.has(key)) return state.cache.get(key);
  const res = await fetch(`/api/prexzy?${key}`);
  if (!res.ok) {
    const err = new Error("Catalog request failed");
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  state.cache.set(key, data);
  return data;
}

function list() {
  try { return JSON.parse(localStorage.getItem("moviehub_list") || "[]"); }
  catch { return []; }
}
function saveList(items) { localStorage.setItem("moviehub_list", JSON.stringify(items)); }
function keyOf(item) { return `${item.media_type}:${item.id}`; }
function inList(item) { return list().some((x) => keyOf(x) === keyOf(item)); }
function toggleList(item) {
  const id = keyOf(item);
  const next = inList(item) ? list().filter((x) => keyOf(x) !== id) : [...list(), item];
  saveList(next);
}

function fromTmdb(item, type = "movie") {
  const media = item.media_type && item.media_type !== "person" ? item.media_type : type;
  return {
    id: item.id,
    media_type: media,
    title: item.title || item.name || "Untitled",
    poster: posterPath(item.poster_path),
    backdrop: item.backdrop_path ? `${IMG}/w1280${item.backdrop_path}` : "",
    year: year(item.release_date || item.first_air_date),
    score: Number(item.vote_average || 0).toFixed(1),
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
    score: item.imdbRatingValue || "",
    overview: item.description || item.genre || "",
    trailer: item.trailer?.videoAddress?.url || "",
    source: "catalog",
  };
}
function fromAnime(item) {
  return {
    id: item.anime_id,
    media_type: "anime",
    title: item.name || "Untitled",
    poster: item.small_poster || item.orginal_poster || "",
    backdrop: item.large_poster || item.orginal_poster || item.small_poster || "",
    year: year(item.add_on_date),
    score: item.score || "",
    overview: item.description || item.synonyms || item.genre || "",
    genre: item.genre || "",
    source: "anime",
  };
}

function cardHtml(item) {
  const img = item.poster
    ? `<img class="poster" alt="" src="${esc(item.poster)}" />`
    : `<div class="poster"></div>`;
  return `
    <article class="card" data-source="${esc(item.source)}" data-type="${esc(item.media_type)}" data-id="${esc(item.id)}">
      ${img}
      <div class="card-meta">
        <h3>${esc(item.title)}</h3>
        <span>${esc([item.year, item.score].filter(Boolean).join(" · "))}</span>
      </div>
    </article>`;
}
function bindCards(root) {
  root.querySelectorAll(".card").forEach((el) => {
    el.addEventListener("click", () => openDetail(el.dataset.source, el.dataset.type, el.dataset.id));
  });
}
function rail(title, items) {
  if (!items.length) return "";
  return `<h2>${esc(title)}</h2><div class="rail">${items.map(cardHtml).join("")}</div>`;
}

async function homeView() {
  $app.innerHTML = `<div class="empty">Loading catalog…</div>`;
  const [trending, movies, tv, native] = await Promise.all([
    px("/anime/tmdb", { action: "trending", type: "all", limit: "16" }),
    px("/anime/tmdb", { action: "discover", type: "movie", limit: "16" }),
    px("/anime/tmdb", { action: "discover", type: "tv", limit: "16" }),
    px("/trending", { page: "1", perPage: "12" }),
  ]);
  const trend = (unwrap(trending).results || []).filter((x) => x.media_type !== "person").map((x) => fromTmdb(x));
  const film = (unwrap(movies).results || []).map((x) => fromTmdb(x, "movie"));
  const shows = (unwrap(tv).results || []).map((x) => fromTmdb(x, "tv"));
  const live = (native.trending?.subjectList || []).map(fromSubject);
  const hero = trend.find((x) => x.backdrop) || trend[0] || live[0];
  $app.innerHTML = `
    <section class="hero">
      <div class="hero-bg" style="background-image:url('${esc(hero?.backdrop || hero?.poster || "")}')"></div>
      <div class="hero-copy">
        <div class="kicker">This week</div>
        <h1>${esc(hero?.title || "MovieHub")}</h1>
        <p>${esc(hero?.overview || "Movies, series, and anime in one catalog.")}</p>
        <div class="actions">
          <button class="btn btn-gold" id="hero-open">Open title</button>
          <button class="btn btn-ghost" id="hero-list">${hero && inList(hero) ? "In my list" : "Add to list"}</button>
        </div>
      </div>
    </section>
    <section class="section">
      ${rail("Trending", trend.slice(0, 16))}
      ${rail("Movies", film.slice(0, 16))}
      ${rail("Series", shows.slice(0, 16))}
      ${rail("Fresh catalog", live.slice(0, 12))}
    </section>`;
  bindCards($app);
  document.getElementById("hero-open")?.addEventListener("click", () => {
    if (hero) openDetail(hero.source, hero.media_type, hero.id);
  });
  document.getElementById("hero-list")?.addEventListener("click", (e) => {
    if (!hero) return;
    toggleList(hero);
    e.target.textContent = inList(hero) ? "In my list" : "Add to list";
  });
}

async function catalogView(kind) {
  $app.innerHTML = `<div class="empty">Loading…</div>`;
  const data = await px("/anime/tmdb", { action: "discover", type: kind, limit: "20" });
  const items = (unwrap(data).results || []).map((x) => fromTmdb(x, kind));
  $app.innerHTML = `
    <section class="section">
      <h2>${kind === "tv" ? "Series" : "Movies"}</h2>
      <div class="grid">${items.map(cardHtml).join("")}</div>
    </section>`;
  bindCards($app);
}

async function animeView(genre) {
  $app.innerHTML = `<div class="empty">Loading anime…</div>`;
  const [home, genres, schedule] = await Promise.all([
    px("/anime/animekill-home"),
    px("/anime/animekill-genres"),
    px("/anime/animekill-schedule"),
  ]);
  const banner = (home.data?.data?.topBannerAnime || []).map(fromAnime);
  const genreList = home.data?.data ? (genres.data?.data?.genres || []) : [];
  const week = (schedule.data?.data?.animeSuggestions || []).slice(0, 18).map(fromAnime);
  let picked = [];
  if (genre) {
    const pack = await px("/anime/animekill-bygenre", { genre, offset: "0" });
    picked = (pack.data?.data?.animelist || []).map(fromAnime);
  }
  $app.innerHTML = `
    <section class="section">
      <h2>Anime</h2>
      <div class="chips" id="genres">
        ${genreList.slice(0, 16).map((g) => `<button class="chip" data-genre="${esc(g.genre_name)}">${esc(g.genre_name)}</button>`).join("")}
      </div>
      ${picked.length ? rail(genre, picked) : ""}
      ${rail("Featured", banner.slice(0, 14))}
      ${rail("This week", week)}
    </section>`;
  bindCards($app);
  $app.querySelectorAll("[data-genre]").forEach((btn) => {
    btn.addEventListener("click", () => {
      location.hash = `#/anime?genre=${encodeURIComponent(btn.dataset.genre)}`;
    });
  });
}

async function searchView(q) {
  $app.innerHTML = `<div class="empty">Searching “${esc(q)}”…</div>`;
  const [movies, tv] = await Promise.all([
    px("/anime/tmdb", { action: "search", query: q, type: "movie", limit: "12" }),
    px("/anime/tmdb", { action: "search", query: q, type: "tv", limit: "12" }),
  ]);
  const items = [
    ...(unwrap(movies).results || []).map((x) => fromTmdb(x, "movie")),
    ...(unwrap(tv).results || []).map((x) => fromTmdb(x, "tv")),
  ];
  $app.innerHTML = `
    <section class="section">
      <h2>Results for “${esc(q)}”</h2>
      <div class="grid">${items.map(cardHtml).join("") || '<p class="muted">No titles found.</p>'}</div>
    </section>`;
  bindCards($app);
}

function listView() {
  const items = list();
  $app.innerHTML = `
    <section class="section">
      <h2>My list</h2>
      <div class="grid">${items.map(cardHtml).join("") || '<p class="muted">Nothing saved yet.</p>'}</div>
    </section>`;
  bindCards($app);
}

function closeModal() { $modal.hidden = true; }

async function openDetail(source, type, id) {
  $modal.hidden = false;
  $modalCard.innerHTML = `<div class="modal-body"><p class="muted">Loading title…</p></div>`;
  if (source === "anime" || type === "anime") return openAnime(id);
  if (source === "catalog") return openCatalog(id);
  const [detail, videos, similar] = await Promise.all([
    px("/anime/tmdb", { action: "detail", type, id }),
    px("/anime/tmdb", { action: "videos", type, id }),
    px("/anime/tmdb", { action: "recommend", type, id, limit: "8" }),
  ]);
  const item = fromTmdb({ ...unwrap(detail), media_type: type }, type);
  const genres = (unwrap(detail).genres || []).slice(0, 3).map((g) => g.name);
  const trailer = (unwrap(videos).results || []).find((v) => v.site === "YouTube" && /trailer/i.test(v.type || v.name || ""))
    || (unwrap(videos).results || []).find((v) => v.site === "YouTube");
  const more = (unwrap(similar).results || []).slice(0, 8).map((x) => fromTmdb(x, type));
  $modalCard.innerHTML = `
    <button class="close-x" data-close>×</button>
    <div class="modal-hero" style="background-image:url('${esc(item.backdrop || item.poster)}')"></div>
    <div class="modal-body">
      <h2>${esc(item.title)}</h2>
      <div class="chips">
        ${item.year ? `<span class="chip">${esc(item.year)}</span>` : ""}
        ${item.score ? `<span class="chip">${esc(item.score)}</span>` : ""}
        ${genres.map((g) => `<span class="chip">${esc(g)}</span>`).join("")}
      </div>
      <p>${esc(unwrap(detail).overview || item.overview || "No overview yet.")}</p>
      <div class="actions">
        <button class="btn btn-gold" id="save-btn">${inList(item) ? "Remove from list" : "Add to list"}</button>
      </div>
      ${trailer ? `<iframe class="yt" src="https://www.youtube.com/embed/${esc(trailer.key)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen title="Trailer"></iframe>` : ""}
      ${more.length ? `<h3>Related</h3><div class="rail">${more.map(cardHtml).join("")}</div>` : ""}
    </div>`;
  document.getElementById("save-btn").addEventListener("click", (e) => {
    toggleList(item);
    e.target.textContent = inList(item) ? "Remove from list" : "Add to list";
  });
  bindCards($modalCard);
}

async function openCatalog(id) {
  const saved = list().find((x) => String(x.id) === String(id) && x.source === "catalog");
  let item = saved;
  if (!item) {
    const native = await px("/trending", { page: "1", perPage: "20" });
    item = (native.trending?.subjectList || []).map(fromSubject).find((x) => String(x.id) === String(id));
  }
  if (!item) {
    $modalCard.innerHTML = `<div class="modal-body"><p class="muted">That title is not in the current catalog page.</p></div>`;
    return;
  }
  $modalCard.innerHTML = `
    <button class="close-x" data-close>×</button>
    <div class="modal-hero" style="background-image:url('${esc(item.backdrop || item.poster)}')"></div>
    <div class="modal-body">
      <h2>${esc(item.title)}</h2>
      <div class="chips">
        <span class="chip">${esc(item.media_type)}</span>
        ${item.year ? `<span class="chip">${esc(item.year)}</span>` : ""}
        ${item.score ? `<span class="chip">${esc(item.score)}</span>` : ""}
      </div>
      <p>${esc(item.overview || "Catalog title.")}</p>
      <div class="actions">
        <button class="btn btn-gold" id="save-btn">${inList(item) ? "Remove from list" : "Add to list"}</button>
      </div>
      ${item.trailer ? `<video class="yt" controls src="${esc(item.trailer)}"></video>` : ""}
    </div>`;
  document.getElementById("save-btn").addEventListener("click", (e) => {
    toggleList(item);
    e.target.textContent = inList(item) ? "Remove from list" : "Add to list";
  });
}

async function openAnime(id) {
  const [detail, episodes] = await Promise.all([
    px("/anime/animekill-detail", { anime_id: id }),
    px("/anime/animekill-episodes", { anime_id: id, order: "asc" }),
  ]);
  const raw = detail.data?.data?.animeDetails || {};
  const item = fromAnime(raw.anime_id ? raw : { anime_id: id, name: id });
  const eps = episodes.data?.data?.animeVideos || [];
  const seen = new Set();
  const unique = [];
  eps.forEach((ep) => {
    const n = ep.episodeNumber;
    if (seen.has(n)) return;
    seen.add(n);
    unique.push(n);
  });
  $modalCard.innerHTML = `
    <button class="close-x" data-close>×</button>
    <div class="modal-hero" style="background-image:url('${esc(item.backdrop || item.poster)}')"></div>
    <div class="modal-body">
      <h2>${esc(item.title)}</h2>
      <div class="chips">
        ${item.genre ? `<span class="chip">${esc(item.genre)}</span>` : ""}
        ${item.score ? `<span class="chip">${esc(item.score)}</span>` : ""}
      </div>
      <p>${esc(raw.description || item.overview || "No synopsis yet.")}</p>
      <div class="actions">
        <button class="btn btn-gold" id="save-btn">${inList(item) ? "Remove from list" : "Add to list"}</button>
      </div>
      ${unique.length ? `<h3>Episodes</h3><div class="chips">${unique.slice(0, 40).map((n) => `<span class="chip">Ep ${esc(n)}</span>`).join("")}</div>` : ""}
    </div>`;
  document.getElementById("save-btn").addEventListener("click", (e) => {
    toggleList(item);
    e.target.textContent = inList(item) ? "Remove from list" : "Add to list";
  });
}

$modal.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
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
    } else if (path.startsWith("/anime")) {
      setNav("anime");
      await animeView(params.get("genre") || "");
    } else if (path.startsWith("/list")) {
      setNav("list");
      listView();
    } else {
      setNav("home");
      await homeView();
    }
  } catch (err) {
    $app.innerHTML = `<section class="panel"><h1>Catalog unavailable</h1><p class="muted">The movie service did not answer. Try again in a moment.</p></section>`;
  }
}
window.addEventListener("hashchange", boot);
boot();
