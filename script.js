(function(){
  function revert(){
    var a=document.querySelector('.logo');
    if(a&&a.innerText.trim()!=='ᴅᴀʀᴋɴᴏᴠᴀ')a.innerText='ᴅᴀʀᴋɴᴏᴠᴀ';
  }
  setInterval(revert,2000);revert();
})();

(function() {

  /* ── TMDB CONFIG ── */
  const KEY   = '8265bd1679663a7ea12ac168da84d2e8';
  const TMDB  = 'https://api.themoviedb.org/3';
  const IMG   = 'https://image.tmdb.org/t/p';
  const EMBED = (type, id, s, e) =>
    type === 'tv'
      ? `https://vidsrc.to/embed/tv/${id}${s?'/'+s:''}${e?'/'+e:''}`
      : `https://vidsrc.to/embed/movie/${id}`;
  const EMBED2 = (type, id, s, e) =>
    type === 'tv'
      ? `https://www.2embed.cc/embedtv/${id}&s=${s||1}&e=${e||1}`
      : `https://www.2embed.cc/embed/${id}`;

  /* ── DOM ── */
  const container      = document.getElementById('contentContainer');
  const globalLoader   = document.getElementById('globalLoader');
  const searchInput    = document.getElementById('searchInput');
  const searchBtn      = document.getElementById('searchBtn');
  const themeToggle    = document.getElementById('themeToggle');
  const navItems       = document.querySelectorAll('.nav-item');
  const modal          = document.getElementById('detailModal');
  const modalDynamic   = document.getElementById('modalDynamic');
  const closeModal     = document.getElementById('closeModal');

  /* ── HELPERS ── */
  function showLoader(show) { if(globalLoader) globalLoader.style.display = show ? 'block' : 'none'; }

  function poster(path, size='w342') {
    if (!path) return 'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
    return `${IMG}/${size}${path}`;
  }
  function backdrop(path, size='w780') {
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
  function closeModalFn() { modal.classList.remove('active'); document.body.style.overflow=''; modalDynamic.innerHTML=''; }

  closeModal?.addEventListener('click', closeModalFn);
  modal?.addEventListener('click', e => { if(e.target===modal) closeModalFn(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModalFn(); });

  /* ── THEME ── */
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

  /* ── BACK TO TOP ── */
  const btt = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if(btt) btt.classList.toggle('show', window.scrollY > 400);
  }, { passive: true });
  btt?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  /* ── ROW ICONS ── */
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
      const bg   = backdrop(item.backdrop_path) || poster(item.poster_path,'w780');
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
    const timer = setInterval(() => go(idx+1), 5000);
    track.closest('.carousel-container')?.addEventListener('mouseenter', () => clearInterval(timer));
    // play button in carousel
    document.querySelectorAll('.carousel-play-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openDetail(btn.dataset.id, btn.dataset.type, btn.dataset.title, btn.dataset.cover);
      });
    });
    // slide click
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

  /* ── DETAIL MODAL ── */
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
      const genres   = (detail.genres||[]).map(g=>g.name).join(', ') || 'N/A';
      const overview = detail.overview || 'No description available.';
      const runtime  = detail.runtime ? `${detail.runtime}min` : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]}min` : '');
      const bdUrl    = backdrop(detail.backdrop_path,'w1280');
      const pUrl     = poster(detail.poster_path,'w342') || fallbackCover;
      const cast     = (credits.cast||[]).slice(0,5).map(c=>c.name).join(', ');
      const seasons  = type==='tv' ? (detail.number_of_seasons||1) : 0;

      let seasonHtml = '';
      if (type === 'tv' && seasons > 0) {
        seasonHtml = `<div class="imdb-row" style="margin-top:8px;gap:8px;flex-wrap:wrap;">
          <span style="color:var(--text3);font-family:var(--font-mono);font-size:.65rem;letter-spacing:.1em;">WATCH:</span>`;
        for (let s=1; s<=Math.min(seasons,10); s++) {
          const eps = detail.seasons?.find(x=>x.season_number===s)?.episode_count||12;
          seasonHtml += `<select class="chip" id="epSel-${s}" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text2);padding:4px 8px;cursor:pointer;">`;
          for (let e=1; e<=eps; e++) seasonHtml += `<option value="${e}">S${s}E${e}</option>`;
          seasonHtml += `</select>`;
        }
        seasonHtml += '</div>';
      }

      modalDynamic.innerHTML = `
        <div class="info-backdrop" style="background-image:url('${bdUrl}')">
          ${bdUrl?`<div class="backdrop-img" style="background-image:url('${bdUrl}')"></div>`:''}
          <div class="info-backdrop::after"></div>
        </div>
        <div class="info-content">
          <img class="info-poster" src="${pUrl}" onerror="this.src='https://placehold.co/160x240/0a0a10/9890b8?text=N/A'" alt="${t}">
          <div class="info-text">
            <h2>${t}</h2>
            <div class="imdb-row">
              <span class="imdb-badge">TMDB</span>
              <span>★ ${rating}</span>
              <span style="opacity:.5">·</span>
              <span>${genres}</span>
              ${runtime ? `<span style="opacity:.5">·</span><span>${runtime}</span>` : ''}
              ${year ? `<span style="opacity:.5">·</span><span>${year}</span>` : ''}
            </div>
            ${cast ? `<div class="imdb-row" style="margin-top:4px;"><span style="color:var(--text3);font-family:var(--font-mono);font-size:.65rem;letter-spacing:.1em;">CAST:</span><span style="color:var(--text2);font-size:.72rem;">${cast}</span></div>` : ''}
            <p>${overview}</p>
            ${seasonHtml}
            <div class="button-group">
              <button class="btn-primary" id="watchBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> WATCH
              </button>
              <button class="btn-secondary" id="trailerBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> TRAILER
              </button>
            </div>
          </div>
        </div>
        <p style="color:var(--text2);font-size:.76rem;line-height:1.6;padding:0 4px 16px;">${overview}</p>
        ${similar.results?.length ? `<h4 style="font-family:var(--font-display);letter-spacing:1px;font-size:1.1rem;color:var(--text2);margin-bottom:8px;">SIMILAR</h4><div class="movie-row" id="similarRow"></div>` : ''}
      `;

      // WATCH button
      document.getElementById('watchBtn')?.addEventListener('click', () => {
        let ep = 1, s = 1;
        if (type === 'tv') {
          // find first visible season select
          const sel = document.querySelector('[id^="epSel-"]');
          if (sel) {
            s = parseInt(sel.id.replace('epSel-',''));
            ep = parseInt(sel.value);
          }
        }
        const src = EMBED(type, id, s, ep);
        const src2 = EMBED2(type, id, s, ep);
        modalDynamic.innerHTML = `
          <div style="padding:12px 0 8px;">
            <button id="backToDetail" style="display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--accent2);font-family:var(--font-mono);font-size:.72rem;cursor:pointer;letter-spacing:.08em;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> BACK
            </button>
          </div>
          <div style="background:#000;border-radius:var(--radius);overflow:hidden;position:relative;padding-top:56.25%;">
            <iframe id="playerFrame" src="${src}" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allowfullscreen allow="autoplay; fullscreen"></iframe>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px;">
            <button class="chip" id="src1Btn" style="background:var(--glow2);border-color:var(--accent);">Server 1</button>
            <button class="chip" id="src2Btn">Server 2</button>
          </div>`;
        document.getElementById('backToDetail')?.addEventListener('click', () => openDetail(id, type, t, pUrl));
        document.getElementById('src1Btn')?.addEventListener('click', () => { document.getElementById('playerFrame').src=src; });
        document.getElementById('src2Btn')?.addEventListener('click', () => { document.getElementById('playerFrame').src=src2; });
      });

      // TRAILER button
      document.getElementById('trailerBtn')?.addEventListener('click', () => {
        const trailer = videos.results?.find(v => v.type==='Trailer' && v.site==='YouTube') || videos.results?.[0];
        if (!trailer) { showToast('No trailer available'); return; }
        modalDynamic.innerHTML = `
          <div style="padding:12px 0 8px;">
            <button id="backToDetail2" style="display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--accent2);font-family:var(--font-mono);font-size:.72rem;cursor:pointer;letter-spacing:.08em;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> BACK
            </button>
          </div>
          <div style="background:#000;border-radius:var(--radius);overflow:hidden;position:relative;padding-top:56.25%;">
            <iframe src="https://www.youtube.com/embed/${trailer.key}?autoplay=1" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allowfullscreen allow="autoplay"></iframe>
          </div>`;
        document.getElementById('backToDetail2')?.addEventListener('click', () => openDetail(id, type, t, pUrl));
      });

      // Similar row
      const simRow = document.getElementById('similarRow');
      if (simRow && similar.results?.length) {
        similar.results.slice(0,10).forEach(item => {
          const card = document.createElement('div');
          card.className = 'movie-card';
          card.style.flex = '0 0 90px';
          const iType = type;
          const iImg  = poster(item.poster_path,'w185');
          card.innerHTML = `<img class="card-img" src="${iImg}" onerror="this.src='https://placehold.co/200x300'"><div class="card-info"><div class="card-title">${item.title||item.name||''}</div></div>`;
          card.addEventListener('click', () => openDetail(item.id, iType));
          simRow.appendChild(card);
        });
      }

    } catch(e) {
      modalDynamic.innerHTML = `<div class="error-message"><p>Failed to load details: ${e.message}</p></div>`;
    }
  }

  /* ── HOME ── */
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

      const trendItems  = trending.results    || [];
      const topMItems   = topMovies.results   || [];
      const topTVItems  = topTV.results       || [];
      const nowItems    = nowPlaying.results  || [];
      const upcomItems  = upcoming.results    || [];

      let html = renderCarousel(trendItems.slice(0,6));
      html += renderRow('Trending Today',   trendItems,  'trending', 'movie');
      html += renderRow('Top Rated Movies', topMItems,   'star',     'movie');
      html += renderRow('Top Rated TV',     topTVItems,  'tv',       'tv');
      html += renderRow('Now Playing',      nowItems,    'film',     'movie');
      html += renderRow('Coming Soon',      upcomItems,  'fire',     'movie');
      container.innerHTML = html;
      initCarousel();
      attachCardListeners();
    } catch(e) {
      container.innerHTML = `<div class="error-message"><p>Failed to load content: ${e.message}<br>Check your internet connection.</p></div>`;
    } finally {
      showLoader(false);
    }
  }

  /* ── TRENDING ── */
  async function loadTrending() {
    showLoader(true);
    try {
      const [day, week] = await Promise.all([
        tmdb('trending/all/day'),
        tmdb('trending/all/week'),
      ]);
      let html = renderRow('Trending Today',  day.results||[],  'trending', 'movie');
      html    += renderRow('Trending This Week', week.results||[], 'fire', 'movie');
      container.innerHTML = html;
      attachCardListeners();
    } catch(e) {
      container.innerHTML = `<div class="error-message"><p>${e.message}</p></div>`;
    } finally { showLoader(false); }
  }

  /* ── SERIES ── */
  async function loadSeries() {
    showLoader(true);
    try {
      const [popular, topRated, onAir, airingToday] = await Promise.all([
        tmdb('tv/popular',      { page:1 }),
        tmdb('tv/top_rated',    { page:1 }),
        tmdb('tv/on_the_air',   { page:1 }),
        tmdb('tv/airing_today', { page:1 }),
      ]);
      let html = renderRow('Popular Series',   popular.results||[],     'tv',   'tv');
      html    += renderRow('Top Rated Series', topRated.results||[],    'star', 'tv');
      html    += renderRow('On The Air',       onAir.results||[],       'film', 'tv');
      html    += renderRow('Airing Today',     airingToday.results||[], 'fire', 'tv');
      container.innerHTML = html;
      attachCardListeners();
    } catch(e) {
      container.innerHTML = `<div class="error-message"><p>${e.message}</p></div>`;
    } finally { showLoader(false); }
  }

  /* ── ANIME ── */
  async function loadAnime() {
    showLoader(true);
    try {
      // TMDB has animation genre (id=16), filter by it
      const [anime1, anime2, anime3] = await Promise.all([
        tmdb('discover/tv',    { with_genres:16, sort_by:'popularity.desc', page:1 }),
        tmdb('discover/tv',    { with_genres:16, sort_by:'vote_average.desc', vote_count_gte:100, page:1 }),
        tmdb('discover/movie', { with_genres:16, sort_by:'popularity.desc', page:1 }),
      ]);
      let html = `<div style="padding:16px 0 0;"><input id="animeSearch" class="search-container" placeholder="Search anime..." style="width:100%;max-width:400px;padding:10px 16px;margin-bottom:16px;background:var(--surface2);border:1px solid var(--border2);border-radius:100px;color:var(--text);font-family:var(--font-mono);font-size:.8rem;outline:none;"></div>`;
      html += renderRow('Popular Anime',  anime1.results||[], 'anime', 'tv');
      html += renderRow('Top Rated Anime',anime2.results||[], 'star',  'tv');
      html += renderRow('Anime Movies',   anime3.results||[], 'film',  'movie');
      container.innerHTML = html;
      attachCardListeners();
      document.getElementById('animeSearch')?.addEventListener('keydown', async e => {
        if (e.key !== 'Enter') return;
        const q = e.target.value.trim();
        if (!q) return;
        showLoader(true);
        const res = await tmdb('search/multi', { query:q, page:1 });
        showLoader(false);
        const items = (res.results||[]).filter(x => x.genre_ids?.includes(16));
        container.innerHTML = `<button id="backAnime" style="margin:16px 0;display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--accent2);font-family:var(--font-mono);font-size:.72rem;cursor:pointer;letter-spacing:.08em;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> BACK</button>` + renderRow(`Results: "${q}"`, items.length ? items : res.results||[], 'search', 'tv');
        attachCardListeners();
        document.getElementById('backAnime')?.addEventListener('click', loadAnime);
      });
    } catch(e) {
      container.innerHTML = `<div class="error-message"><p>${e.message}</p></div>`;
    } finally { showLoader(false); }
  }

  /* ── LIVE (Sports) ── */
  async function loadLive() {
    // No live sports API available freely - show sports-themed movies/docs
    showLoader(true);
    try {
      const [sports, action] = await Promise.all([
        tmdb('discover/movie', { with_genres:'28,12', sort_by:'popularity.desc', page:1 }),
        tmdb('discover/tv',    { with_genres:'10759', sort_by:'popularity.desc', page:1 }),
      ]);
      container.innerHTML = `
        <div style="padding:20px 0 8px;">
          <div style="font-family:var(--font-display);font-size:clamp(1.5rem,4vw,2.5rem);letter-spacing:.08em;color:var(--text2);margin-bottom:4px;">LIVE SPORTS</div>
          <div style="font-family:var(--font-mono);font-size:.65rem;color:var(--text3);letter-spacing:.15em;margin-bottom:16px;">⚡ Live streaming requires a premium source. Enjoy sports movies & action series below.</div>
        </div>
        ${renderRow('Action & Adventure Movies', sports.results||[], 'sport', 'movie')}
        ${renderRow('Action & Adventure Series', action.results||[], 'sport', 'tv')}
      `;
      attachCardListeners();
    } catch(e) {
      container.innerHTML = `<div class="error-message"><p>${e.message}</p></div>`;
    } finally { showLoader(false); }
  }

  /* ── DISCOVER ── */
  const GENRES_MOVIE = [
    {id:28,name:'Action'},{id:12,name:'Adventure'},{id:16,name:'Animation'},
    {id:35,name:'Comedy'},{id:80,name:'Crime'},{id:99,name:'Documentary'},
    {id:18,name:'Drama'},{id:14,name:'Fantasy'},{id:27,name:'Horror'},
    {id:9648,name:'Mystery'},{id:10749,name:'Romance'},{id:878,name:'Sci-Fi'},
    {id:53,name:'Thriller'},{id:10752,name:'War'},{id:37,name:'Western'},
  ];

  async function loadDiscover() {
    showLoader(true);
    try {
      const popular = await tmdb('movie/popular', { page:1 });
      let chipsHtml = '<div class="chips">';
      GENRES_MOVIE.forEach(g => {
        chipsHtml += `<div class="chip" data-genre="${g.id}">${g.name}</div>`;
      });
      chipsHtml += '</div>';

      container.innerHTML = chipsHtml + renderRow('Popular Movies', popular.results||[], 'discover', 'movie');
      attachCardListeners();

      document.querySelectorAll('.chip[data-genre]').forEach(chip => {
        chip.addEventListener('click', async () => {
          document.querySelectorAll('.chip[data-genre]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          showLoader(true);
          const res = await tmdb('discover/movie', { with_genres:chip.dataset.genre, sort_by:'popularity.desc', page:1 });
          showLoader(false);
          const existing = container.querySelector('.chips');
          const rowHtml  = renderRow(chip.textContent + ' Movies', res.results||[], 'discover', 'movie');
          container.innerHTML = chipsHtml + rowHtml;
          attachCardListeners();
          chip.classList.add('active');
        });
      });
    } catch(e) {
      container.innerHTML = `<div class="error-message"><p>${e.message}</p></div>`;
    } finally { showLoader(false); }
  }

  /* ── SEARCH ── */
  async function performSearch(keyword) {
    showLoader(true);
    try {
      const res = await tmdb('search/multi', { query: keyword, page:1 });
      const items = (res.results||[]).filter(x => x.media_type !== 'person');
      let html = `<button id="backHome" style="margin:16px 0;display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--accent2);font-family:var(--font-mono);font-size:.72rem;cursor:pointer;letter-spacing:.08em;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> BACK
      </button>`;
      html += renderRow(`Results for "${keyword}"`, items, 'search', 'movie');
      container.innerHTML = html;
      attachCardListeners();
      document.getElementById('backHome')?.addEventListener('click', loadHome);
    } catch(e) {
      container.innerHTML = `<div class="error-message"><p>${e.message}</p></div>`;
    } finally { showLoader(false); }
  }

  /* ── NAV ── */
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

  searchBtn?.addEventListener('click', () => {
    const kw = searchInput.value.trim();
    if (kw) performSearch(kw);
  });
  searchInput?.addEventListener('keyup', e => {
    if (e.key === 'Enter') searchBtn?.click();
  });

  /* ── INIT ── */
  loadHome();

})();

