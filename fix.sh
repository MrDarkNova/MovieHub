#!/bin/bash
# Run from inside the MovieHub/ folder

# ════════════════════════════════════════════
# FILE 1: index.html
# ════════════════════════════════════════════
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>ᴅᴀʀᴋɴᴏᴠᴀ · anime & movie hub</title>
    <meta property="og:title" content="ᴅᴀʀᴋɴᴏᴠᴀ · Anime & Movie Hub" />
    <meta property="og:description" content="Watch and download the latest movies, TV series, and anime. Free streaming and direct downloads." />
    <meta property="og:image" content="https://files.catbox.moe/p1vn75.png" />
    <meta property="og:url" content="https://mrdarknova-movie-hub.netlify.app" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="ᴅᴀʀᴋɴᴏᴠᴀ" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ᴅᴀʀᴋɴᴏᴠᴀ · Anime & Movie Hub" />
    <meta name="twitter:description" content="Watch and download the latest movies, series and anime." />
    <meta name="twitter:image" content="https://files.catbox.moe/p1vn75.png" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.3/dist/hls.min.js"></script>
</head>
<body>
<div id="dnLoader">
    <div class="dn-lname">DARKNOVA</div>
    <div class="dn-lsub">LOADING...</div>
    <div class="dn-lbar"></div>
</div>
    <div class="scene-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
    </div>
    <div id="toast" class="toast">✦ ᴅᴀʀᴋɴᴏᴠᴀ</div>
    <div class="back-to-top" id="backToTop">
        <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg>
    </div>
    <header class="top-bar">
        <div class="logo">ᴅᴀʀᴋɴᴏᴠᴀ</div>
        <div class="search-container">
            <svg class="search-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><line x1="16.5" y1="16.5" x2="22" y2="22"></line></svg>
            <input type="text" id="searchInput" placeholder="Search movies, series..." autocomplete="off">
            <button id="searchBtn">SEARCH</button>
        </div>
        <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
            <svg id="iconMoon" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <svg id="iconSun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:none"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        </button>
    </header>
    <nav class="bottom-nav">
        <div class="nav-item active" data-section="home">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span class="nav-label">HOME</span>
            <span class="tooltip">Home</span>
        </div>
        <div class="nav-item" data-section="trending">
            <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            <span class="nav-label">TREND</span>
            <span class="tooltip">Trending</span>
        </div>
        <div class="nav-item" data-section="series">
            <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span class="nav-label">SERIES</span>
            <span class="tooltip">TV/Series</span>
        </div>
        <div class="nav-item" data-section="anime">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span class="nav-label">ANIME</span>
            <span class="tooltip">Anime</span>
        </div>
        <div class="nav-item" data-section="live">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
            <span class="nav-label">LIVE</span>
            <span class="tooltip">Live Sports</span>
        </div>
        <div class="nav-item" data-section="discover">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            <span class="nav-label">FIND</span>
            <span class="tooltip">Discover</span>
        </div>
    </nav>
    <main class="main" id="mainContent">
        <div class="loader" id="globalLoader" style="display:none;"></div>
        <div id="contentContainer"></div>
    </main>
    <div id="detailModal" class="modal">
        <div class="modal-card">
            <button class="close" id="closeModal" aria-label="Close"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            <div id="modalDynamic"></div>
        </div>
    </div>
    <script src="script.js"></script>
<script>
(function(){
  function hide(){var l=document.getElementById('dnLoader');if(l){l.classList.add('dn-hidden');setTimeout(function(){if(l.parentNode)l.parentNode.removeChild(l);},500);}}
  document.addEventListener('DOMContentLoaded',function(){setTimeout(hide,1600);});
  window.addEventListener('load',function(){setTimeout(hide,300);});
  setTimeout(hide,3000);
})();
</script>
</body>
</html>
EOF
echo "✓ index.html"

# ════════════════════════════════════════════
# FILE 2: style.css — strip garbage, add loader
# ════════════════════════════════════════════
python3 - << 'PYEOF'
with open('style.css','r') as f:
    content = f.read()

cut = content.find('}50%{opacity')
if cut != -1:
    content = content[:cut+1]

loader_css = """

#dnLoader{position:fixed;inset:0;z-index:9999;background:#050508;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;transition:opacity .5s ease,visibility .5s ease;}
#dnLoader.dn-hidden{opacity:0;visibility:hidden;pointer-events:none;}
.dn-lname{font-family:'Bebas Neue',cursive;font-size:2.8rem;letter-spacing:10px;background:linear-gradient(135deg,#7c5cfc,#22d3ee,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 24px rgba(124,92,252,.7));animation:dnPulse 1.6s ease-in-out infinite;}
.dn-lsub{font-family:'Space Mono',monospace;font-size:.55rem;letter-spacing:.22em;color:#5a5475;margin-top:-14px;}
.dn-lbar{width:140px;height:2px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;}
.dn-lbar::after{content:'';display:block;height:100%;background:linear-gradient(90deg,#7c5cfc,#22d3ee);animation:dnBar 1.3s ease-in-out infinite;}
@keyframes dnPulse{0%,100%{opacity:1;filter:drop-shadow(0 0 24px rgba(124,92,252,.7))}50%{opacity:.6;filter:drop-shadow(0 0 12px rgba(124,92,252,.3))}}
@keyframes dnBar{0%{width:0;margin-left:0}50%{width:80%;margin-left:0}100%{width:0;margin-left:100%}}
"""

if '#dnLoader' not in content:
    content = content + loader_css

with open('style.css','w') as f:
    f.write(content)
print('✓ style.css')
PYEOF

# ════════════════════════════════════════════
# FILE 3: script.js — TMDB details/trailers + xcasper streams/downloads
# ════════════════════════════════════════════
cat > script.js << 'EOF'
(function(){
  function revert(){
    var a=document.querySelector('.logo');
    if(a&&a.innerText.trim()!=='ᴅᴀʀᴋɴᴏᴠᴀ')a.innerText='ᴅᴀʀᴋɴᴏᴠᴀ';
  }
  setInterval(revert,2000);revert();
})();

(function() {

  const KEY   = '8265bd1679663a7ea12ac168da84d2e8';
  const TMDB  = 'https://api.themoviedb.org/3';
  const IMG   = 'https://image.tmdb.org/t/p';
  const XCASPER = 'https://movieapi.xcasper.space/api';

  const PROXY_LIST = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://proxy.cors.sh/',
    'https://thingproxy.freeboard.io/fetch/'
  ];

  const ANIME_BASE = 'https://apis.prexzyvilla.site/anime/';
  const animeSearchUrl = q => `${ANIME_BASE}animesearch?query=${encodeURIComponent(q)}`;
  const animeDetailUrl = u => `${ANIME_BASE}animedetail?url=${encodeURIComponent(u)}`;
  const animeDownloadUrl = u => `${ANIME_BASE}animedownload?url=${encodeURIComponent(u)}`;

  let _proxyIdx = 0;

  const container    = document.getElementById('contentContainer');
  const globalLoader = document.getElementById('globalLoader');
  const searchInput  = document.getElementById('searchInput');
  const searchBtn    = document.getElementById('searchBtn');
  const themeToggle  = document.getElementById('themeToggle');
  const navItems     = document.querySelectorAll('.nav-item');
  const modal        = document.getElementById('detailModal');
  const modalDynamic = document.getElementById('modalDynamic');
  const closeModalBtn= document.getElementById('closeModal');

  function showLoader(show) { if(globalLoader) globalLoader.style.display = show ? 'block' : 'none'; }

  function poster(path, size='w342') {
    if (!path) return 'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
    return `${IMG}/${size}${path}`;
  }
  function backdropUrl(path, size='w1280') {
    if (!path) return '';
    return `${IMG}/${size}${path}`;
  }

  async function tmdb(endpoint, params={}) {
    const url = new URL(`${TMDB}/${endpoint}`);
    url.searchParams.set('api_key', KEY);
    Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  }

  async function xcasper(endpoint) {
    try {
      const res = await fetch(`${XCASPER}${endpoint}`);
      if (!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async function fetchWithProxy(rawUrl, attempt=0) {
    if (attempt >= PROXY_LIST.length) throw new Error('All proxies exhausted');
    const proxy = PROXY_LIST[attempt];
    try {
      const res = await fetch(proxy + encodeURIComponent(rawUrl), {
        headers: { 'x-requested-with': 'XMLHttpRequest' },
        signal: AbortSignal.timeout(9000)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      _proxyIdx = attempt;
      return res;
    } catch(e) {
      return fetchWithProxy(rawUrl, attempt + 1);
    }
  }

  let toastTimer;
  function showToast(msg='✦ ᴅᴀʀᴋɴᴏᴠᴀ', dur=2400) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), dur);
  }

  function openModal() { modal.classList.add('active'); document.body.style.overflow='hidden'; }
  function closeModal() { modal.classList.remove('active'); document.body.style.overflow=''; modalDynamic.innerHTML=''; }

  closeModalBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if(e.target===modal) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

  function initTheme() {
    const saved = localStorage.getItem('dn_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    applyThemeIcons(saved);
  }
  function applyThemeIcons(theme) {
    const moon = document.getElementById('iconMoon');
    const sun  = document.getElementById('iconSun');
    if (moon) moon.style.display = theme==='dark' ? 'block' : 'none';
    if (sun)  sun.style.display  = theme==='light'? 'block' : 'none';
  }
  themeToggle?.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme')||'dark';
    const next = cur==='dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dn_theme', next);
    applyThemeIcons(next);
  });
  initTheme();

  const btt = document.getElementById('backToTop');
  window.addEventListener('scroll', () => { if(btt) btt.classList.toggle('show', window.scrollY > 400); }, { passive:true });
  btt?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  const rowIcons = {
    home:     '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    trending: '<svg class="row-header-icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    star:     '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    fire:     '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M13 2C6 8 6 14 12 14c-2 3-7 4-7 4s8 4 12-2c1-2 1-4 0-6-1 2-3 3-4 2 2-2 3-6 0-10z"/></svg>',
    film:     '<svg class="row-header-icon" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
    tv:       '<svg class="row-header-icon" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    search:   '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>',
    anime:    '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    sport:    '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-9.5 6.8L12 12l9.5-3.2A10 10 0 0 0 12 2z"/></svg>',
    discover: '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    dragon:   '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  };

  function renderRow(title, items, icon='film', mediaType='movie') {
    if (!items?.length) return '';
    let html = `<div class="row-header">${rowIcons[icon]||rowIcons.film}<h3>${title}</h3></div><div class="movie-row">`;
    items.slice(0,18).forEach(item => {
      const t    = item.title||item.name||'Untitled';
      const year = (item.release_date||item.first_air_date||'').slice(0,4);
      const vote = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
      const type = item.media_type || mediaType;
      const img  = poster(item.poster_path);
      html += `<div class="movie-card" data-id="${item.id}" data-type="${type}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${img}">
        <img class="card-img" src="${img}" loading="lazy" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'">
        <div class="card-info">
          <div class="card-title">${t}</div>
          <div class="card-meta"><span>${year}</span><span class="rating">★ ${vote}</span></div>
        </div>
      </div>`;
    });
    html += '</div>';
    return html;
  }

  function renderCarousel(items) {
    if (!items?.length) return '';
    const slides = items.slice(0,6);
    let html = '<div class="carousel-track">';
    slides.forEach(item => {
      const t    = item.title||item.name||'';
      const bg   = backdropUrl(item.backdrop_path) || poster(item.poster_path,'w780');
      const year = (item.release_date||item.first_air_date||'').slice(0,4);
      const type = item.media_type || 'movie';
      html += `<div class="carousel-slide" data-id="${item.id}" data-type="${type}" style="background-image:url('${bg}')">
        <div class="carousel-info">
          <div class="carousel-title">${t}</div>
          <div class="carousel-meta">${year} · ${item.vote_average?.toFixed(1)||'N/A'} ★</div>
          <button class="btn-primary carousel-play-btn" data-id="${item.id}" data-type="${type}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${poster(item.poster_path)}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> WATCH NOW
          </button>
        </div>
      </div>`;
    });
    html += '</div>';
    if (slides.length > 1) {
      html += '<div class="carousel-indicators">';
      slides.forEach((_,i) => html += `<div class="carousel-indicator${i===0?' active':''}" data-i="${i}"></div>`);
      html += '</div>';
    }
    return `<div class="carousel-container">${html}</div>`;
  }

  function initCarousel() {
    const track = document.querySelector('.carousel-track');
    const dots  = document.querySelectorAll('.carousel-indicator');
    if (!track) return;
    let idx = 0;
    const slides = track.querySelectorAll('.carousel-slide');
    function go(n) {
      idx = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d,i) => d.classList.toggle('active', i===idx));
    }
    dots.forEach(d => d.addEventListener('click', () => go(parseInt(d.dataset.i))));
    let timer = setInterval(() => go(idx+1), 5000);
    track.closest('.carousel-container')?.addEventListener('mouseenter', () => clearInterval(timer));
    track.addEventListener('touchstart', e => { clearInterval(timer); this._tx=e.touches[0].clientX; }, {passive:true});
    track.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].clientX - (this._tx||0);
      if (Math.abs(diff) > 50) go(diff > 0 ? idx-1 : idx+1);
      timer = setInterval(() => go(idx+1), 5000);
    }, {passive:true});
    document.querySelectorAll('.carousel-play-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openDetail(btn.dataset.id, btn.dataset.type, btn.dataset.title, btn.dataset.cover);
      });
    });
    slides.forEach(slide => slide.addEventListener('click', () => {
      openDetail(slide.dataset.id, slide.dataset.type);
    }));
  }

  function attachCardListeners() {
    document.querySelectorAll('.movie-card').forEach(card => {
      card.addEventListener('click', () => {
        openDetail(card.dataset.id, card.dataset.type, card.dataset.title, card.dataset.cover);
      });
    });
  }

  async function searchXcasper(title, year) {
    try {
      const data = await xcasper(`/search?keyword=${encodeURIComponent(title)}&page=1&perPage=8&subjectType=0`);
      const items = data?.data || [];
      if (!items.length) return null;
      const match = items.find(i => {
        const iYear = (i.releaseDate||'').slice(0,4);
        return year ? iYear === String(year) : true;
      }) || items[0];
      if (!match) return null;
      const sid = match.subjectId || match.id || match._id;
      if (!sid) return null;
      const playData = await xcasper(`/play?subjectId=${sid}`);
      return {
        streams: playData?.data?.streams || [],
        subjectId: sid,
        detailPath: match.detailPath || ''
      };
    } catch { return null; }
  }

  async function openDetail(id, type='movie', fallbackTitle='', fallbackCover='') {
    openModal();
    modalDynamic.innerHTML = '<div class="loader"></div>';
    try {
      const [detail, credits, videos, similar] = await Promise.all([
        tmdb(`${type}/${id}`, { append_to_response: 'external_ids' }),
        tmdb(`${type}/${id}/credits`),
        tmdb(`${type}/${id}/videos`),
        tmdb(`${type}/${id}/similar`),
      ]);

      const t        = detail.title||detail.name||fallbackTitle||'Untitled';
      const year     = (detail.release_date||detail.first_air_date||'').slice(0,4);
      const rating   = detail.vote_average ? detail.vote_average.toFixed(1) : 'N/A';
      const imdbId   = detail.external_ids?.imdb_id || '';
      const genres   = (detail.genres||[]).map(g=>g.name).join(', ') || 'N/A';
      const overview = detail.overview || 'No description available.';
      const runtime  = detail.runtime ? `${detail.runtime}min` : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]}min` : '');
      const bd       = backdropUrl(detail.backdrop_path,'w1280');
      const pUrl     = poster(detail.poster_path,'w342') || fallbackCover;
      const cast     = (credits.cast||[]).slice(0,5).map(c=>c.name).join(', ');
      const trailer  = (videos.results||[]).find(v => v.type==='Trailer' && v.site==='YouTube') || videos.results?.[0];

      const imdbLink = imdbId ? `<a href="https://www.imdb.com/title/${imdbId}/" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:5px;background:#f5c518;color:#000;font-family:var(--font-mono);font-size:.6rem;font-weight:700;padding:2px 8px;border-radius:4px;text-decoration:none;letter-spacing:.04em;">IMDb <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg></a>` : '';

      modalDynamic.innerHTML = `
        <div class="info-backdrop">
          ${bd ? `<img class="backdrop-img" src="${bd}" onerror="this.src=''" alt="">` : ''}
          <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,16,.98) 0%,rgba(10,10,16,.5) 100%);pointer-events:none;"></div>
        </div>
        <div class="info-content">
          <img class="info-poster" src="${pUrl}" onerror="this.src='https://placehold.co/160x240/0a0a10/9890b8?text=N/A'" alt="${t}">
          <div class="info-text">
            <h2>${t}</h2>
            <div class="imdb-row">
              <span class="imdb-badge">IMDb</span>
              <span>★ ${rating}</span>
              <span style="opacity:.5">·</span>
              <span>${genres}</span>
              ${runtime ? `<span style="opacity:.5">·</span><span>${runtime}</span>` : ''}
              ${year ? `<span style="opacity:.5">·</span><span>${year}</span>` : ''}
              ${imdbLink}
            </div>
            ${cast ? `<div class="imdb-row" style="margin-top:4px;flex-wrap:wrap;"><span style="color:var(--text3);font-family:var(--font-mono);font-size:.62rem;">CAST:</span><span style="color:var(--text2);font-size:.7rem;">${cast}</span></div>` : ''}
            <p>${overview}</p>
            <div class="button-group">
              <button class="btn-primary" id="watchBtn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> WATCH
              </button>
              ${trailer ? `<button class="btn-secondary" id="trailerBtn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> TRAILER
              </button>` : ''}
              <button class="btn-secondary" id="downloadBtn" style="background:linear-gradient(135deg,var(--success),#059669);">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> DOWNLOAD
              </button>
            </div>
            <div id="downloadLinksArea" class="download-dropdown" style="margin-top:8px;"></div>
          </div>
        </div>
        ${similar.results?.length ? `<h4 style="font-family:var(--font-display);letter-spacing:1px;font-size:1.1rem;color:var(--text2);margin:16px 0 8px;">SIMILAR</h4><div class="movie-row" id="similarRow"></div>` : ''}
      `;

      document.getElementById('watchBtn')?.addEventListener('click', () => {
        const src  = type==='tv' ? `https://vidsrc.to/embed/tv/${id}/1/1` : `https://vidsrc.to/embed/movie/${id}`;
        const src2 = type==='tv' ? `https://www.2embed.cc/embedtv/${id}&s=1&e=1` : `https://www.2embed.cc/embed/${id}`;
        modalDynamic.innerHTML = `
          <button id="backDetail" style="display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--accent2);font-family:var(--font-mono);font-size:.72rem;cursor:pointer;letter-spacing:.08em;padding:12px 0 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> BACK
          </button>
          <div style="background:#000;border-radius:var(--radius);overflow:hidden;position:relative;padding-top:56.25%;">
            <iframe id="playerFrame" src="${src}" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allowfullscreen allow="autoplay; fullscreen"></iframe>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
            <button class="chip" id="sv1" style="background:var(--glow2);border-color:var(--accent);color:var(--accent2);">Server 1</button>
            <button class="chip" id="sv2">Server 2</button>
          </div>`;
        document.getElementById('backDetail')?.addEventListener('click', () => openDetail(id, type, t, pUrl));
        document.getElementById('sv1')?.addEventListener('click', () => { document.getElementById('playerFrame').src=src; });
        document.getElementById('sv2')?.addEventListener('click', () => { document.getElementById('playerFrame').src=src2; });
      });

      document.getElementById('trailerBtn')?.addEventListener('click', () => {
        if (!trailer) { showToast('No trailer available'); return; }
        modalDynamic.innerHTML = `
          <button id="backDetail3" style="display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--accent2);font-family:var(--font-mono);font-size:.72rem;cursor:pointer;letter-spacing:.08em;padding:12px 0 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> BACK
          </button>
          <div style="background:#000;border-radius:var(--radius);overflow:hidden;position:relative;padding-top:56.25%;">
            <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allowfullscreen allow="autoplay"></iframe>
          </div>`;
        document.getElementById('backDetail3')?.addEventListener('click', () => openDetail(id, type, t, pUrl));
      });

      document.getElementById('downloadBtn')?.addEventListener('click', async () => {
        const area = document.getElementById('downloadLinksArea');
        if (!area) return;
        if (area.innerHTML && area.classList.contains('show')) { area.classList.remove('show'); return; }
        area.innerHTML = '<div class="loader" style="width:24px;height:24px;margin:8px auto;"></div>';
        area.classList.add('show');
        showToast('Searching xcasper for download links…');
        const xcData = await searchXcasper(t, year);
        if (!xcData || !xcData.streams.length) {
          area.innerHTML = `<p style="font-family:var(--font-mono);font-size:.7rem;color:var(--text3);padding:8px;">No download links found on xcasper. Try searching manually.</p>`;
          return;
        }
        let ddHtml = '';
        xcData.streams.forEach(s => {
          const dlUrl = s.downloadUrl || `${XCASPER}/bff/stream?subjectId=${xcData.subjectId}&resolution=${s.resolutions}&download=1`;
          const sizeMB = s.size ? (s.size/1024/1024).toFixed(1) : '?';
          ddHtml += `<div class="download-item">
            <span style="font-family:var(--font-mono);font-size:.72rem;">${s.resolutions}p</span>
            <a href="${dlUrl}" target="_blank" rel="noopener">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>${sizeMB} MB
            </a>
          </div>`;
        });
        area.innerHTML = ddHtml || '<p style="font-family:var(--font-mono);font-size:.7rem;color:var(--text3);padding:8px;">No download streams available.</p>';
      });

      const simRow = document.getElementById('similarRow');
      if (simRow && similar.results?.length) {
        similar.results.slice(0,10).forEach(item => {
          const card = document.createElement('div');
          card.className = 'movie-card';
          card.style.flex = '0 0 90px';
          card.innerHTML = `<img class="card-img" src="${poster(item.poster_path,'w185')}" onerror="this.src='https://placehold.co/200x300'"><div class="card-info"><div class="card-title">${item.title||item.name||''}</div></div>`;
          card.addEventListener('click', () => openDetail(item.id, type));
          simRow.appendChild(card);
        });
      }

    } catch(e) {
      modalDynamic.innerHTML = `<div class="error-message"><p>Failed to load details: ${e.message}</p></div>`;
    }
  }

  async function loadHome() {
    showLoader(true);
    try {
      const [trending, topMovies, topTV, nowPlaying, upcoming] = await Promise.all([
        tmdb('trending/all/day'),
        tmdb('movie/top_rated', { page:1 }),
        tmdb('tv/top_rated',    { page:1 }),
        tmdb('movie/now_playing', { page:1 }),
        tmdb('movie/upcoming',   { page:1 }),
      ]);
      let html = renderCarousel(trending.results||[]);
      html += renderRow('Trending Today',   trending.results||[],   'trending', 'movie');
      html += renderRow('Top Rated Movies', topMovies.results||[],  'star',     'movie');
      html += renderRow('Top Rated TV',     topTV.results||[],      'tv',       'tv');
      html += renderRow('Now Playing',      nowPlaying.results||[], 'film',     'movie');
      html += renderRow('Coming Soon',      upcoming.results||[],   'fire',     'movie');
      container.innerHTML = html;
      initCarousel();
      attachCardListeners();
    } catch(e) {
      container.innerHTML = `<div class="error-message"><p>Failed to load content: ${e.message}</p></div>`;
    } finally { showLoader(false); }
  }

  async function loadTrending() {
    showLoader(true);
    try {
      const [day, week] = await Promise.all([tmdb('trending/all/day'), tmdb('trending/all/week')]);
      container.innerHTML = renderRow('Trending Today', day.results||[], 'trending', 'movie') + renderRow('Trending This Week', week.results||[], 'fire', 'movie');
      attachCardListeners();
    } catch(e) { container.innerHTML=`<div class="error-message"><p>${e.message}</p></div>`; }
    finally { showLoader(false); }
  }

  async function loadSeries() {
    showLoader(true);
    try {
      const [popular, topRated, onAir, airingToday] = await Promise.all([
        tmdb('tv/popular'), tmdb('tv/top_rated'), tmdb('tv/on_the_air'), tmdb('tv/airing_today'),
      ]);
      container.innerHTML =
        renderRow('Popular Series',   popular.results||[],     'tv',   'tv') +
        renderRow('Top Rated Series', topRated.results||[],    'star', 'tv') +
        renderRow('On The Air',       onAir.results||[],       'film', 'tv') +
        renderRow('Airing Today',     airingToday.results||[], 'fire', 'tv');
      attachCardListeners();
    } catch(e) { container.innerHTML=`<div class="error-message"><p>${e.message}</p></div>`; }
    finally { showLoader(false); }
  }

  async function loadAnime() {
    showLoader(true);
    try {
      const [a1, a2, a3] = await Promise.all([
        tmdb('discover/tv',    { with_genres:16, sort_by:'popularity.desc' }),
        tmdb('discover/tv',    { with_genres:16, sort_by:'vote_average.desc', 'vote_count.gte':100 }),
        tmdb('discover/movie', { with_genres:16, sort_by:'popularity.desc' }),
      ]);
      let html = `<div style="padding:16px 0 8px;">
        <div style="font-family:var(--font-display);font-size:clamp(1.5rem,4vw,2.5rem);letter-spacing:.08em;color:var(--accent2);margin-bottom:8px;">ANIME</div>
        <input id="animeSearch" placeholder="Search anime..." style="width:100%;max-width:400px;padding:10px 16px;background:var(--surface2);border:1px solid var(--border2);border-radius:100px;color:var(--text);font-family:var(--font-mono);font-size:.8rem;outline:none;margin-bottom:16px;">
      </div>`;
      html += renderRow('Popular Anime',   a1.results||[], 'anime', 'tv');
      html += renderRow('Top Rated Anime', a2.results||[], 'star',  'tv');
      html += renderRow('Anime Movies',    a3.results||[], 'film',  'movie');
      container.innerHTML = html;
      attachCardListeners();
      document.getElementById('animeSearch')?.addEventListener('keydown', async e => {
        if (e.key !== 'Enter') return;
        const q = e.target.value.trim();
        if (!q) return;
        showLoader(true);
        const res = await tmdb('search/multi', { query:q });
        showLoader(false);
        const items = (res.results||[]).filter(x=>x.genre_ids?.includes(16)||x.media_type!=='person');
        container.innerHTML = `<button id="backAnime" style="margin:16px 0;display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--accent2);font-family:var(--font-mono);font-size:.72rem;cursor:pointer;letter-spacing:.08em;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> BACK</button>` + renderRow(`Results: "${q}"`, items, 'search', 'tv');
        attachCardListeners();
        document.getElementById('backAnime')?.addEventListener('click', loadAnime);
      });
    } catch(e) { container.innerHTML=`<div class="error-message"><p>${e.message}</p></div>`; }
    finally { showLoader(false); }
  }

  async function loadLive() {
    showLoader(true);
    try {
      const xcLive = await xcasper('/live');
      if (xcLive?.data?.matchList?.length) {
        let html = `<div class="row-header">${rowIcons.sport}<h3>Live Matches</h3></div>`;
        xcLive.data.matchList.forEach(match => {
          const title = `${match.team1.name} vs ${match.team2.name}`;
          const score = `${match.team1.score} - ${match.team2.score}`;
          const thumb = match.team1.avatar||match.team2.avatar||'https://placehold.co/600x400/0a0a10/9890b8?text=Live';
          html += `<div class="live-match" data-stream="${match.playPath}" data-title="${title}" data-score="${score}">
            <img class="live-match-img" src="${thumb}" onerror="this.src='https://placehold.co/600x400/0a0a10/9890b8?text=Live'">
            <div class="live-match-info"><div class="live-match-title">${title}</div><div class="live-match-score">Score: ${score}</div></div>
            <div class="live-badge">LIVE</div>
          </div>`;
        });
        container.innerHTML = html;
        document.querySelectorAll('.live-match').forEach(m => {
          m.addEventListener('click', () => {
            const streamUrl = m.dataset.stream;
            const title = m.dataset.title;
            if (!streamUrl) { showToast('Stream URL not available'); return; }
            openModal();
            modalDynamic.innerHTML = `
              <h2 style="font-family:var(--font-display);letter-spacing:1px;margin-bottom:8px;">${title}</h2>
              <p style="font-family:var(--font-mono);color:var(--gold);font-size:1rem;margin-bottom:12px;">${m.dataset.score}</p>
              <div style="background:#000;border-radius:var(--radius);overflow:hidden;position:relative;padding-top:56.25%;">
                <video id="liveVid" controls autoplay style="position:absolute;inset:0;width:100%;height:100%;"></video>
              </div>`;
            const video = document.getElementById('liveVid');
            if (Hls.isSupported()) { const hls=new Hls(); hls.loadSource(streamUrl); hls.attachMedia(video); }
            else video.src = streamUrl;
          });
        });
        return;
      }
      const [sports, action] = await Promise.all([
        tmdb('discover/movie', { with_genres:'28,12', sort_by:'popularity.desc' }),
        tmdb('discover/tv',    { with_genres:'10759', sort_by:'popularity.desc' }),
      ]);
      container.innerHTML = `<div style="padding:20px 0 8px;font-family:var(--font-mono);font-size:.65rem;color:var(--text3);letter-spacing:.1em;">⚡ No live events right now — showing action content</div>` +
        renderRow('Action & Adventure Movies', sports.results||[], 'sport', 'movie') +
        renderRow('Action & Adventure Series', action.results||[], 'sport', 'tv');
      attachCardListeners();
    } catch(e) { container.innerHTML=`<div class="error-message"><p>${e.message}</p></div>`; }
    finally { showLoader(false); }
  }

  async function loadDiscover() {
    showLoader(true);
    try {
      const GENRES = [
        {id:28,name:'Action'},{id:12,name:'Adventure'},{id:16,name:'Animation'},
        {id:35,name:'Comedy'},{id:80,name:'Crime'},{id:18,name:'Drama'},
        {id:14,name:'Fantasy'},{id:27,name:'Horror'},{id:9648,name:'Mystery'},
        {id:10749,name:'Romance'},{id:878,name:'Sci-Fi'},{id:53,name:'Thriller'},
        {id:10752,name:'War'},{id:37,name:'Western'},
      ];
      const popular = await tmdb('movie/popular');
      let chipsHtml = '<div class="chips">';
      GENRES.forEach(g => { chipsHtml += `<div class="chip" data-genre="${g.id}">${g.name}</div>`; });
      chipsHtml += '</div>';
      container.innerHTML = chipsHtml + renderRow('Popular Movies', popular.results||[], 'discover', 'movie');
      attachCardListeners();
      document.querySelectorAll('.chip[data-genre]').forEach(chip => {
        chip.addEventListener('click', async () => {
          document.querySelectorAll('.chip[data-genre]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          showLoader(true);
          const res = await tmdb('discover/movie', { with_genres:chip.dataset.genre, sort_by:'popularity.desc' });
          showLoader(false);
          container.innerHTML = chipsHtml + renderRow(chip.textContent+' Movies', res.results||[], 'discover', 'movie');
          attachCardListeners();
          document.querySelector(`[data-genre="${chip.dataset.genre}"]`)?.classList.add('active');
        });
      });
    } catch(e) { container.innerHTML=`<div class="error-message"><p>${e.message}</p></div>`; }
    finally { showLoader(false); }
  }

  async function performSearch(keyword) {
    showLoader(true);
    try {
      const res = await tmdb('search/multi', { query:keyword });
      const items = (res.results||[]).filter(x => x.media_type!=='person');
      let html = `<button id="backHome" style="margin:16px 0;display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--accent2);font-family:var(--font-mono);font-size:.72rem;cursor:pointer;letter-spacing:.08em;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> BACK
      </button>`;
      html += renderRow(`Results for "${keyword}"`, items, 'search', 'movie');
      container.innerHTML = html;
      attachCardListeners();
      document.getElementById('backHome')?.addEventListener('click', loadHome);
    } catch(e) { container.innerHTML=`<div class="error-message"><p>${e.message}</p></div>`; }
    finally { showLoader(false); }
  }

  navItems.forEach(item => {
    item.addEventListener('click', async () => {
      const section = item.dataset.section;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if      (section==='home')     await loadHome();
      else if (section==='trending') await loadTrending();
      else if (section==='series')   await loadSeries();
      else if (section==='anime')    await loadAnime();
      else if (section==='live')     await loadLive();
      else if (section==='discover') await loadDiscover();
    });
  });

  searchBtn?.addEventListener('click', () => { const kw=searchInput.value.trim(); if(kw) performSearch(kw); });
  searchInput?.addEventListener('keyup', e => { if(e.key==='Enter') searchBtn?.click(); });

  loadHome();

})();
EOF
echo "✓ script.js"
echo ""
echo "✓ All done — now push:"
echo "  git add . && git commit -m 'fix: DOCTYPE + loader + TMDB detail/trailer + xcasper downloads' && git push origin master --force"
