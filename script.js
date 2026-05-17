/* DARKNOVA v2.0 — Fully Fixed & Upgraded */
(function(){
  'use strict';

  // ── Logo protection
  (function(){
    function revert(){ var a=document.querySelector('.logo-text'); if(a&&a.innerText.trim()!=='DARKNOVA') a.innerText='DARKNOVA'; }
    setInterval(revert,2000); revert();
  })();

  const API = 'https://movieapi.xcasper.space/api';

  const container     = document.getElementById('contentContainer');
  const globalLoader  = document.getElementById('globalLoader');
  const searchInput   = document.getElementById('searchInput');
  const searchBtn     = document.getElementById('searchBtn');
  const themeToggle   = document.getElementById('themeToggle');
  const navItems      = document.querySelectorAll('.nav-item');
  const modal         = document.getElementById('detailModal');
  const modalDynamic  = document.getElementById('modalDynamic');
  const closeModalBtn = document.getElementById('closeModal');

  // ── State
  let currentSubjectId  = null;
  let currentDetailPath = null;
  let currentStreams     = [];
  let currentTitle      = '';
  let currentCover      = '';
  let currentSubjectType = 0;
  let currentSeasons    = [];

  // ── Cache
  const _cache = new Map();
  const CACHE_TTL = 5 * 60 * 1000;

  // ── Loader
  function showLoader(show){
    if(globalLoader) globalLoader.style.display = show ? 'block' : 'none';
  }

  // ── API fetch with cache
  async function xcasper(endpoint){
    const key = endpoint;
    const cached = _cache.get(key);
    if(cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
    try {
      const res = await fetch(`${API}${endpoint}`);
      if(!res.ok) return null;
      const data = await res.json();
      _cache.set(key, { data, ts: Date.now() });
      return data;
    } catch { return null; }
  }

  // ── Debounce
  function debounce(fn, ms){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  // ── Toast
  let _toastTimer;
  function showToast(msg, dur=2600){
    const el = document.getElementById('toast');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('show'), dur);
  }

  // ── Modal
  function openModal(){
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.remove('active');
    document.body.style.overflow = '';
    modalDynamic.innerHTML = '';
    // Stop any playing video
    const v = document.getElementById('playerVideo') || document.getElementById('liveVid');
    if(v){ v.pause(); v.src = ''; }
  }
  closeModalBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

  // ── Theme
  function initTheme(){
    const saved = localStorage.getItem('dn_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('iconMoon').style.display = saved === 'dark'  ? 'block' : 'none';
    document.getElementById('iconSun').style.display  = saved === 'light' ? 'block' : 'none';
  }
  themeToggle?.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dn_theme', next);
    document.getElementById('iconMoon').style.display = next === 'dark'  ? 'block' : 'none';
    document.getElementById('iconSun').style.display  = next === 'light' ? 'block' : 'none';
  });
  initTheme();

  // ── Back to top
  const btt = document.getElementById('backToTop');
  window.addEventListener('scroll', () => { if(btt) btt.classList.toggle('show', window.scrollY > 400); }, { passive:true });
  btt?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  // ── Icons
  const rowIcons = {
    'home':     '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'trend':    '<svg class="row-header-icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    'bolt':     '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'star':     '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'search':   '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>',
    'download': '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    'trophy':   '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 5h12v7a6 6 0 0 1-12 0V5z"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>',
    'fire':     '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M13 2C6 8 6 14 12 14c-2 3-7 4-7 4s8 4 12-2c1-2 1-4 0-6-1 2-3 3-4 2 2-2 3-6 0-10z"/></svg>',
    'compass':  '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    'futbol':   '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
    'film':     '<svg class="row-header-icon" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
    'anime':    '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8 c-2 0-4 2-4 4s2 4 4 4 4-2 4-4-2-4-4-4z"/><path d="M8 8 c0-2 1-3 4-4"/><path d="M16 8 c0-2-1-3-4-4"/></svg>',
  };
  function icon(k){ return rowIcons[k] || rowIcons['film']; }

  // ── Data helpers
  function extractArray(data){
    if(!data) return null;
    if(Array.isArray(data)) return data;
    if(data.data){
      if(Array.isArray(data.data)) return data.data;
      if(data.data.items && Array.isArray(data.data.items)) return data.data.items;
      if(typeof data.data === 'object'){
        for(let k in data.data) if(Array.isArray(data.data[k])) return data.data[k];
      }
    }
    if(data.items   && Array.isArray(data.items))   return data.items;
    if(data.results && Array.isArray(data.results)) return data.results;
    return null;
  }

  function getSubjectId(item){
    return item.subjectId||item.id||item._id||item.movieId||item.showId||item.contentId||item.guid||'missing';
  }
  function getCoverUrl(item){
    if(!item) return null;
    if(typeof item.cover     === 'string' && item.cover)     return item.cover;
    if(typeof item.poster    === 'string' && item.poster)    return item.poster;
    if(typeof item.thumbnail === 'string' && item.thumbnail) return item.thumbnail;
    if(typeof item.image     === 'string' && item.image)     return item.image;
    if(item.cover?.url)    return item.cover.url;
    if(item.poster?.url)   return item.poster.url;
    if(item.stills?.url)   return item.stills.url;
    return null;
  }
  function getBackdropUrl(item){
    if(!item) return null;
    if(typeof item.backdrop === 'string' && item.backdrop) return item.backdrop;
    if(item.backdrop?.url) return item.backdrop.url;
    if(item.stills?.url) return item.stills.url;
    return getCoverUrl(item);
  }

  const PLACEHOLDER   = 'https://placehold.co/300x450/080810/6c3fff?text=No+Poster';
  const PLACEHOLDER_W = 'https://placehold.co/500x750/080810/6c3fff?text=';

  // ── Subtype label
  function getTypeLabel(subType){
    if(subType === 1) return 'FILM';
    if(subType === 2) return 'SERIES';
    if(subType === 5) return 'ANIME';
    return '';
  }

  // ── Build card HTML
  function buildCard(item, mini=false){
    const cover   = getCoverUrl(item) || PLACEHOLDER;
    const t       = item.title||item.name||'Untitled';
    const year    = item.releaseDate ? item.releaseDate.slice(0,4) : (item.year||'');
    const rating  = item.imdbRatingValue||item.imdbRating||item.rating||'';
    const sid     = getSubjectId(item);
    const path    = item.detailPath||item.path||'';
    const stype   = item.subjectType||0;
    const typeL   = getTypeLabel(stype);
    const sizeStyle = mini ? 'style="flex:0 0 90px"' : '';
    return `<div class="movie-card" ${sizeStyle} data-source="main" data-subjectid="${sid}" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}" data-rating="${rating}" data-year="${year}" data-subjecttype="${stype}">
      ${typeL ? `<div class="card-type-badge">${typeL}</div>` : ''}
      <img class="card-img" src="${cover}" loading="lazy" alt="${t.replace(/"/g,'')}" onerror="this.src='${PLACEHOLDER}'">
      <div class="card-overlay"><div class="card-play-icon"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div>
      <div class="card-info">
        <div class="card-title">${t}</div>
        <div class="card-meta"><span>${year}</span>${rating ? `<span class="rating">★ ${rating}</span>` : ''}</div>
      </div>
    </div>`;
  }

  function renderRow(title, items, iconKey='film'){
    if(!items?.length) return '';
    let html = `<div class="row-header">${icon(iconKey)}<h3>${title}</h3></div><div class="movie-row">`;
    items.slice(0,20).forEach(item => { html += buildCard(item); });
    html += '</div>';
    return html;
  }

  function buildGridCard(item){ return buildCard(item); }

  // ── Attach card click listeners
  function attachCardListeners(){
    document.querySelectorAll('.movie-card').forEach(card => {
      card.removeEventListener('click', cardClickHandler);
      card.addEventListener('click', cardClickHandler);
    });
  }

  async function cardClickHandler(e){
    const card      = e.currentTarget;
    const source    = card.dataset.source || 'main';
    const subjectId = card.dataset.subjectid;
    const path      = card.dataset.detailpath;
    const title     = card.dataset.title;
    const cover     = card.dataset.cover;
    const subType   = parseInt(card.dataset.subjecttype) || 0;

    if(source === 'newtoxic'){
      if(!path){ showToast('⚠ No detail path'); return; }
      await openNtDetail(path, title);
    } else {
      if(subjectId === 'missing'){ showToast('⚠ No details available'); return; }
      await openDetail(subjectId, path, title, cover, subType);
    }
  }

  // ═══════════════════════════════════════════
  // OPEN DETAIL MODAL (Main API - Movies/Series/Anime)
  // ═══════════════════════════════════════════
  async function openDetail(subjectId, detailPath, fallbackTitle, fallbackCover, subjectType){
    if(!subjectId || subjectId === 'missing'){ showToast('⚠ No valid ID'); return; }
    openModal();
    modalDynamic.innerHTML = '<div class="loader"></div>';

    try {
      const [xcDetail, xcPlay, xcRecommend] = await Promise.all([
        xcasper(`/detail?subjectId=${subjectId}`),
        detailPath
          ? xcasper(`/play?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}`)
          : xcasper(`/play?subjectId=${subjectId}`),
        xcasper(`/recommend?subjectId=${subjectId}&page=1&perPage=8`)
      ]);

      let coverUrl    = fallbackCover || PLACEHOLDER;
      let backdropImg = fallbackCover || '';
      let title       = fallbackTitle || 'Unknown Title';
      let imdb        = 'N/A';
      let genre       = '';
      let desc        = '';
      let streams     = [];
      let audioTracks = [];
      let seasons     = [];
      let isSeries    = subjectType === 2;

      if(xcDetail?.data){
        const d     = xcDetail.data;
        coverUrl    = getCoverUrl(d) || coverUrl;
        backdropImg = getBackdropUrl(d) || coverUrl;
        title       = d.title || title;
        imdb        = d.imdbRatingValue || d.imdbRating || imdb;
        genre       = Array.isArray(d.genre) ? d.genre.join(', ') : (d.genre || genre);
        desc        = d.description || d.storyline || d.overview || '';
        if(d.subjectType) isSeries = (d.subjectType === 2);
        seasons     = d.seasons || [];
      }
      if(xcPlay?.data){
        streams     = xcPlay.data.streams || [];
        audioTracks = xcPlay.data.audioTracks || [];
        // Also check for seasons in play response
        if(!seasons.length && xcPlay.data.seasons) seasons = xcPlay.data.seasons;
      }

      // Store global state
      currentSubjectId   = subjectId;
      currentDetailPath  = detailPath;
      currentStreams      = streams;
      currentTitle       = title;
      currentCover       = coverUrl;
      currentSubjectType = subjectType;
      currentSeasons     = seasons;

      const finalDesc = desc || 'No description available.';

      // ── Build info panel
      let html = `
      <div class="info-backdrop">
        <img class="backdrop-img" src="${backdropImg||coverUrl}" onerror="this.src='${PLACEHOLDER_W}'" alt="">
        <div class="info-content">
          <img class="info-poster" src="${coverUrl}" onerror="this.src='${PLACEHOLDER}'" alt="${title}">
          <div class="info-text">
            <div class="imdb-row">
              <span class="imdb-badge">IMDb</span>
              <span>${imdb}</span>
              ${genre ? `<span style="opacity:.4">·</span><span>${genre}</span>` : ''}
              ${isSeries ? '<span style="opacity:.4">·</span><span style="color:var(--cyan)">SERIES</span>' : ''}
            </div>
            <h2>${title}</h2>
            <p>${finalDesc}</p>
            <div class="button-group">
              <button class="btn-primary" id="playBtnInfo">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                ${isSeries && seasons.length ? 'EPISODES' : 'PLAY NOW'}
              </button>
              <button class="btn-secondary" id="downloadBtnInfo">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                DOWNLOAD
              </button>
            </div>
            <div id="downloadDropdownInfo" class="download-dropdown"></div>
          </div>
        </div>
      </div>`;

      // ── Audio tracks selector (non-series)
      if(!isSeries && audioTracks.length){
        html += `<div class="player-toolbar"><div class="audio-selector" id="audioSelector">`;
        audioTracks.forEach(track => {
          html += `<button class="audio-btn" data-lang="${track.languageCode||track.language}">${track.language}</button>`;
        });
        html += `</div></div>`;
      }

      // ════════════════════════════════════
      // SEASON & EPISODE SECTION (THE BIG FIX)
      // ════════════════════════════════════
      if(isSeries && seasons.length){
        html += buildSeasonEpisodeUI(seasons, subjectId);
      } else if(isSeries && !seasons.length){
        // Try to fetch seasons separately
        html += `<div id="seasonFetchArea" style="margin-top:16px;"><div class="loader" style="width:28px;height:28px;margin:20px auto;"></div></div>`;
      }

      // ── Recommendations
      if(xcRecommend){
        const recs = extractArray(xcRecommend);
        if(recs?.length){
          html += `<div class="similar-section"><h4>YOU MAY ALSO LIKE</h4><div class="movie-row" style="margin-bottom:10px;">`;
          recs.slice(0,8).forEach(rec => { html += buildCard(rec, true); });
          html += `</div></div>`;
        }
      }

      modalDynamic.innerHTML = html;

      // ── Setup download button
      const downloadBtn      = document.getElementById('downloadBtnInfo');
      const downloadDropdown = document.getElementById('downloadDropdownInfo');
      if(streams.length && downloadBtn){
        let ddHtml = '';
        streams.forEach(s => {
          const dlUrl  = s.downloadUrl || `${API}/bff/stream?subjectId=${subjectId}&resolution=${s.resolutions}&download=1`;
          const sizeMB = s.size ? (s.size/1024/1024).toFixed(1)+'MB' : '?';
          ddHtml += `<div class="download-item">
            <span style="font-family:var(--font-mono);font-size:.68rem;">${s.resolutions}p · ${sizeMB}</span>
            <a href="${dlUrl}" target="_blank" rel="noopener noreferrer" download>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download
            </a>
          </div>`;
        });
        if(downloadDropdown) downloadDropdown.innerHTML = ddHtml;
        downloadBtn.addEventListener('click', e => {
          e.stopPropagation();
          downloadDropdown.classList.toggle('show');
        });
      } else if(downloadBtn){
        downloadBtn.style.display = 'none';
      }

      // ── Play button
      document.getElementById('playBtnInfo')?.addEventListener('click', () => {
        if(isSeries && seasons.length){
          // Scroll to episodes section
          const sec = document.getElementById('seasonEpisodeSection');
          if(sec) sec.scrollIntoView({ behavior:'smooth', block:'start' });
        } else {
          if(!streams.length){ showToast('No streams available'); return; }
          showPlayerView();
        }
      });

      // ── Audio tracks
      document.querySelectorAll('.audio-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const lang = btn.dataset.lang;
          showToast('Loading audio track...');
          const newPlay = await xcasper(`/play?subjectId=${subjectId}&detailPath=${detailPath||''}&lang=${lang}`);
          if(newPlay?.data?.streams){ currentStreams = newPlay.data.streams; showPlayerView(); }
          else showToast('Audio track unavailable');
        });
      });

      // ── Fetch seasons if missing
      if(isSeries && !seasons.length){
        setTimeout(async () => {
          const fetchArea = document.getElementById('seasonFetchArea');
          if(!fetchArea) return;
          // Try detail endpoint again with different params
          const detailRes = await xcasper(`/detail?subjectId=${subjectId}&detailPath=${detailPath||''}`);
          const detailSeasons = detailRes?.data?.seasons || [];
          if(detailSeasons.length){
            currentSeasons = detailSeasons;
            fetchArea.innerHTML = buildSeasonEpisodeUI(detailSeasons, subjectId);
            attachSeasonEpisodeListeners(subjectId, detailPath, title);
          } else {
            // Show manual episode input as fallback
            fetchArea.innerHTML = buildManualEpisodeUI(subjectId, detailPath, title);
            attachManualEpisodeListeners(subjectId, detailPath, title);
          }
        }, 100);
      } else if(isSeries && seasons.length){
        attachSeasonEpisodeListeners(subjectId, detailPath, title);
      }

      // Attach recommendation card listeners
      attachCardListeners();

    } catch(err){
      console.error('Detail error:', err);
      modalDynamic.innerHTML = `<div class="error-message">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>Failed to load details. Please try again.</p>
      </div>`;
    }
  }

  // ═══════════════════════════════════════════
  // BUILD SEASON / EPISODE UI
  // ═══════════════════════════════════════════
  function buildSeasonEpisodeUI(seasons, subjectId){
    if(!seasons.length) return '';

    let html = `<div class="seasons-section" id="seasonEpisodeSection">
      <div class="seasons-section-title">
        <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        SEASONS & EPISODES
      </div>
      <div class="season-tabs">`;

    seasons.forEach((season, i) => {
      const sName = season.name || `Season ${season.seasonNumber || (i+1)}`;
      html += `<button class="season-tab ${i===0?'active':''}" data-season-idx="${i}">${sName}</button>`;
    });

    html += `</div>`;

    // Episode panels
    seasons.forEach((season, si) => {
      const episodes = season.episodes || [];
      html += `<div class="episode-panel ${si===0?'active':''}" id="ep-panel-${si}">`;

      if(!episodes.length){
        html += `<div style="padding:20px;text-align:center;color:var(--text3);font-size:.8rem;">No episodes listed for this season.</div>`;
      } else {
        html += `<div class="episode-grid">`;
        episodes.forEach((ep, ei) => {
          const epNum  = ep.episodeNumber || ep.episode || (ei+1);
          const sNum   = season.seasonNumber || (si+1);
          const epName = ep.name || ep.title || `Episode ${epNum}`;
          const epPath = ep.path || '';
          html += `<div class="episode-card" data-se="${sNum}" data-ep="${epNum}" data-ep-path="${epPath}" data-ep-name="${epName.replace(/"/g,'&quot;')}">
            <div class="ep-number">S${String(sNum).padStart(2,'0')} · E${String(epNum).padStart(2,'0')}</div>
            <div class="ep-title">${epName}</div>
            <div class="ep-actions">
              <button class="ep-btn ep-btn-play" data-se="${sNum}" data-ep="${epNum}">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> PLAY
              </button>
              <button class="ep-btn ep-btn-dl" data-se="${sNum}" data-ep="${epNum}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>
          </div>`;
        });
        html += `</div>`;
      }
      html += `</div>`;
    });

    html += `</div>`;
    return html;
  }

  // Attach season/episode listeners
  function attachSeasonEpisodeListeners(subjectId, detailPath, title){
    // Season tabs switching
    document.querySelectorAll('.season-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.episode-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById(`ep-panel-${tab.dataset.seasonIdx}`);
        if(panel) panel.classList.add('active');
      });
    });

    // Episode PLAY buttons
    document.querySelectorAll('.ep-btn-play').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const se = btn.dataset.se;
        const ep = btn.dataset.ep;
        const card = btn.closest('.episode-card');
        const epName = card?.dataset.epName || `Episode ${ep}`;

        btn.textContent = '⏳';
        btn.disabled = true;

        showToast(`Loading S${se}E${ep}...`);
        const epPlay = await xcasper(`/play?subjectId=${subjectId}&se=${se}&ep=${ep}`);

        btn.innerHTML = '<svg viewBox="0 0 24 24" width="9" height="9"><polygon points="5 3 19 12 5 21 5 3"/></svg> PLAY';
        btn.disabled = false;

        if(epPlay?.data?.streams && epPlay.data.streams.length){
          currentStreams = epPlay.data.streams;
          currentTitle  = `${title} · S${se}E${ep}`;
          showPlayerView(`S${se}E${ep} — ${epName}`);
        } else {
          // Try alternative endpoint
          const alt = await xcasper(`/play?subjectId=${subjectId}&season=${se}&episode=${ep}&detailPath=${detailPath||''}`);
          if(alt?.data?.streams && alt.data.streams.length){
            currentStreams = alt.data.streams;
            currentTitle  = `${title} · S${se}E${ep}`;
            showPlayerView(`S${se}E${ep} — ${epName}`);
          } else {
            showToast(`Episode S${se}E${ep} stream not available`);
          }
        }
      });
    });

    // Episode DOWNLOAD buttons
    document.querySelectorAll('.ep-btn-dl').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const se = btn.dataset.se;
        const ep = btn.dataset.ep;
        btn.textContent = '...';
        const epPlay = await xcasper(`/play?subjectId=${subjectId}&se=${se}&ep=${ep}`);
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="9" height="9"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
        const streams = epPlay?.data?.streams;
        if(streams?.length){
          // Download best quality
          const best = streams.sort((a,b)=>(parseInt(b.resolutions)||0)-(parseInt(a.resolutions)||0))[0];
          const url  = best.downloadUrl || `${API}/bff/stream?subjectId=${subjectId}&resolution=${best.resolutions}&download=1`;
          window.open(url, '_blank');
        } else {
          showToast(`No download available for S${se}E${ep}`);
        }
      });
    });

    // Episode card click (whole card = play)
    document.querySelectorAll('.episode-card').forEach(card => {
      card.addEventListener('click', e => {
        if(e.target.closest('.ep-btn')) return;
        card.querySelector('.ep-btn-play')?.click();
      });
    });
  }

  // ── Fallback: Manual episode input when API returns no seasons
  function buildManualEpisodeUI(subjectId, detailPath, title){
    return `<div class="seasons-section" id="seasonEpisodeSection">
      <div class="seasons-section-title">
        <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        STREAM EPISODE
      </div>
      <div style="display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:12px;">
        <div style="flex:1;min-width:80px;">
          <div style="font-family:var(--font-mono);font-size:.6rem;color:var(--text3);margin-bottom:5px;letter-spacing:.08em;">SEASON</div>
          <select id="manualSeasonInput" class="filter-select" style="width:100%;border-radius:10px;">
            ${Array.from({length:20},(_,i)=>`<option value="${i+1}">Season ${i+1}</option>`).join('')}
          </select>
        </div>
        <div style="flex:1;min-width:80px;">
          <div style="font-family:var(--font-mono);font-size:.6rem;color:var(--text3);margin-bottom:5px;letter-spacing:.08em;">EPISODE</div>
          <select id="manualEpisodeInput" class="filter-select" style="width:100%;border-radius:10px;">
            ${Array.from({length:50},(_,i)=>`<option value="${i+1}">Episode ${i+1}</option>`).join('')}
          </select>
        </div>
        <button class="btn-primary" id="manualPlayBtn" style="flex:1;min-width:100px;padding:10px 14px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          STREAM
        </button>
        <button class="btn-secondary" id="manualDlBtn" style="flex:1;min-width:100px;padding:10px 14px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          DOWNLOAD
        </button>
      </div>
      <div id="manualEpStatus" style="font-family:var(--font-mono);font-size:.68rem;color:var(--text3);min-height:20px;"></div>
    </div>`;
  }

  function attachManualEpisodeListeners(subjectId, detailPath, title){
    async function fetchEp(mode){
      const se  = document.getElementById('manualSeasonInput')?.value || 1;
      const ep  = document.getElementById('manualEpisodeInput')?.value || 1;
      const status = document.getElementById('manualEpStatus');
      if(status) status.textContent = `Fetching S${se}E${ep}...`;

      const epPlay = await xcasper(`/play?subjectId=${subjectId}&se=${se}&ep=${ep}`);
      const streams = epPlay?.data?.streams;

      if(!streams?.length){
        if(status) status.textContent = `⚠ S${se}E${ep} not available. Try another episode.`;
        return;
      }
      if(status) status.textContent = '';

      if(mode === 'play'){
        currentStreams = streams;
        currentTitle  = `${title} · S${se}E${ep}`;
        showPlayerView(`S${se}E${ep}`);
      } else {
        const best = streams.sort((a,b)=>(parseInt(b.resolutions)||0)-(parseInt(a.resolutions)||0))[0];
        const url  = best.downloadUrl || `${API}/bff/stream?subjectId=${subjectId}&resolution=${best.resolutions}&download=1`;
        window.open(url, '_blank');
      }
    }

    document.getElementById('manualPlayBtn')?.addEventListener('click', () => fetchEp('play'));
    document.getElementById('manualDlBtn')?.addEventListener('click',   () => fetchEp('dl'));
  }

  // ═══════════════════════════════════════════
  // PLAYER VIEW
  // ═══════════════════════════════════════════
  function showPlayerView(episodeLabel=''){
    if(!currentStreams.length){ showToast('No streams available'); return; }

    const sorted    = [...currentStreams].sort((a,b) => (parseInt(b.resolutions)||0) - (parseInt(a.resolutions)||0));
    const best      = sorted[0];
    const streamUrl = best.proxyUrl || `${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${best.resolutions}`;

    let html = `
    <button class="back-to-info" id="backToInfo">
      <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      Back
    </button>
    <div class="player-title-bar">
      <span>${currentTitle}</span>
      ${episodeLabel ? `<span class="ep-info">${episodeLabel}</span>` : ''}
    </div>
    <div class="player-wrap">
      <video id="playerVideo" class="video-player" controls autoplay playsinline></video>
    </div>
    <div class="player-toolbar">
      <div class="quality-selector" id="qualitySelector">`;

    sorted.forEach((s, i) => {
      const q    = s.resolutions || 'AUTO';
      const sUrl = s.proxyUrl || `${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${q}`;
      html += `<button class="quality-btn ${i===0?'active':''}" data-url="${sUrl}" data-res="${q}">${q}p</button>`;
    });

    html += `</div>
      <div style="position:relative;flex-shrink:0;">
        <button class="player-btn" id="playerDownloadBtn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download
        </button>
        <div id="playerDownloadDropdown" class="download-dropdown" style="position:absolute;bottom:110%;left:0;min-width:220px;"></div>
      </div>
      <button class="player-btn" id="shareBtn">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share
      </button>
    </div>`;

    // Episodes navigation for series
    if(currentSubjectType === 2 && currentSeasons.length){
      html += `<div style="margin-top:8px;">`;
      html += buildSeasonEpisodeUI(currentSeasons, currentSubjectId);
      html += `</div>`;
    }

    html += `<div class="similar-section"><h4>SIMILAR</h4><div class="movie-row" id="similarMoviesRow"></div></div>`;

    modalDynamic.innerHTML = html;

    // ── Load video
    const video = document.getElementById('playerVideo');
    function loadStream(url){
      if(url.includes('.m3u8') && typeof Hls !== 'undefined' && Hls.isSupported()){
        const hls = new Hls({ enableWorker:true, lowLatencyMode:true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function(event, data){
          if(data.fatal){ showToast('Stream error — try another quality'); }
        });
      } else {
        video.src = url;
      }
      video.play().catch(()=>{});
    }
    loadStream(streamUrl);

    // ── Quality buttons
    document.querySelectorAll('.quality-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadStream(btn.dataset.url);
      });
    });

    // ── Download dropdown in player
    const pdd = document.getElementById('playerDownloadDropdown');
    if(pdd){
      let ddHtml = '';
      sorted.forEach(s => {
        const dlUrl  = s.downloadUrl || `${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${s.resolutions}&download=1`;
        const sizeMB = s.size ? (s.size/1024/1024).toFixed(1)+' MB' : '?';
        ddHtml += `<div class="download-item">
          <span style="font-family:var(--font-mono);font-size:.68rem;">${s.resolutions}p · ${sizeMB}</span>
          <a href="${dlUrl}" target="_blank" rel="noopener noreferrer" download>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download
          </a>
        </div>`;
      });
      pdd.innerHTML = ddHtml;
      document.getElementById('playerDownloadBtn')?.addEventListener('click', e => {
        e.stopPropagation();
        pdd.classList.toggle('show');
      });
    }

    // ── Share
    document.getElementById('shareBtn')?.addEventListener('click', () => {
      if(navigator.share){
        navigator.share({ title: currentTitle, url: window.location.href }).catch(()=>{});
      } else {
        navigator.clipboard?.writeText(window.location.href);
        showToast('Link copied!');
      }
    });

    // ── Back to info
    document.getElementById('backToInfo')?.addEventListener('click', () => {
      openDetail(currentSubjectId, currentDetailPath, currentTitle.split(' · ')[0], currentCover, currentSubjectType);
    });

    // ── Keyboard shortcuts
    document.addEventListener('keydown', playerKeyHandler);
    function playerKeyHandler(e){
      if(!document.getElementById('playerVideo')) {
        document.removeEventListener('keydown', playerKeyHandler);
        return;
      }
      const v = document.getElementById('playerVideo');
      if(!v) return;
      if(e.key === ' ' || e.key === 'k'){ e.preventDefault(); v.paused ? v.play() : v.pause(); }
      if(e.key === 'ArrowRight') v.currentTime += 10;
      if(e.key === 'ArrowLeft')  v.currentTime -= 10;
      if(e.key === 'f') v.requestFullscreen?.();
      if(e.key === 'm') v.muted = !v.muted;
    }

    // ── Attach episode listeners in player view
    if(currentSubjectType === 2 && currentSeasons.length){
      attachSeasonEpisodeListeners(currentSubjectId, currentDetailPath, currentTitle.split(' · ')[0]);
    }

    // ── Similar
    (async () => {
      const rec  = await xcasper(`/recommend?subjectId=${currentSubjectId}&page=1&perPage=8`);
      const recs = extractArray(rec);
      const row  = document.getElementById('similarMoviesRow');
      if(recs?.length && row){
        row.innerHTML = '';
        recs.slice(0,8).forEach(r => {
          const el = document.createElement('div');
          const rc = getCoverUrl(r)||PLACEHOLDER;
          const rt = r.title||r.name||'Untitled';
          const rs = getSubjectId(r);
          const rp = r.detailPath||r.path||'';
          el.className = 'movie-card';
          el.style.flex = '0 0 90px';
          el.dataset.source     = 'main';
          el.dataset.subjectid  = rs;
          el.dataset.detailpath = rp;
          el.dataset.title      = rt;
          el.dataset.cover      = rc;
          el.dataset.subjecttype = r.subjectType||0;
          el.innerHTML = `<img class="card-img" src="${rc}" onerror="this.src='${PLACEHOLDER}'" alt="${rt}"><div class="card-info"><div class="card-title">${rt}</div></div>`;
          el.addEventListener('click', () => openDetail(rs, rp, rt, rc, r.subjectType||0));
          row.appendChild(el);
        });
      } else if(row){
        row.innerHTML = '<p style="font-size:.8rem;color:var(--text3);padding:10px 0;">No similar titles found.</p>';
      }
    })();
  }

  // ═══════════════════════════════════════════
  // NT DETAIL (Newtoxic / Series source)
  // ═══════════════════════════════════════════
  async function openNtDetail(path, title){
    openModal();
    modalDynamic.innerHTML = '<div class="loader"></div>';

    const detail = await xcasper(`/newtoxic/detail?path=${encodeURIComponent(path)}`);
    if(!detail?.data){
      modalDynamic.innerHTML = `<div class="error-message"><p>Error loading series details. Please try again.</p></div>`;
      return;
    }
    const data = detail.data;

    let html = `<h2 style="font-family:var(--font-display);font-size:1.5rem;letter-spacing:1px;margin-bottom:12px;">${data.title||title}</h2>`;
    if(data.thumbnail) html += `<img src="${data.thumbnail}" style="width:100%;border-radius:var(--radius);margin:10px 0;max-height:200px;object-fit:cover;">`;
    if(data.storyline) html += `<p style="color:var(--text2);font-size:.85rem;margin-bottom:10px;line-height:1.6;">${data.storyline}</p>`;
    if(data.genre)     html += `<p style="font-family:var(--font-mono);font-size:.68rem;color:var(--text3);margin-bottom:14px;letter-spacing:.04em;">${data.genre}</p>`;

    if(data.seasons && Array.isArray(data.seasons)){
      // Build proper season/episode UI
      html += buildNtSeasonUI(data.seasons, data.title||title);
    } else if(data.qualities && Array.isArray(data.qualities)){
      html += `<div class="seasons-section-title" style="margin-top:12px;">QUALITIES</div>`;
      for(let q of data.qualities){
        html += `<div class="nt-folder"><h4>${q.quality||'Quality'}</h4>`;
        if(q.path) html += `<button class="nt-get-files" data-path="${q.path}" style="font-family:var(--font-mono);font-size:.68rem;padding:6px 16px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
        html += `</div>`;
      }
    } else if(data.path){
      html += `<button class="nt-get-files" data-path="${data.path}" style="font-family:var(--font-mono);font-size:.68rem;padding:8px 20px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;margin-top:10px;">Show Files</button>`;
    }

    modalDynamic.innerHTML = html;
    attachNtListeners(data.title||title);
  }

  function buildNtSeasonUI(seasons, showTitle){
    let html = `<div class="seasons-section">
      <div class="seasons-section-title">
        <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        SEASONS & EPISODES
      </div>
      <div class="season-tabs">`;

    seasons.forEach((season, i) => {
      html += `<button class="season-tab ${i===0?'active':''}" data-season-idx="${i}">${season.name||`Season ${i+1}`}</button>`;
    });
    html += `</div>`;

    seasons.forEach((season, si) => {
      html += `<div class="episode-panel ${si===0?'active':''}" id="nt-ep-panel-${si}">`;
      const episodes = season.episodes || [];
      if(!episodes.length && season.path){
        html += `<button class="nt-get-files" data-path="${season.path}" style="font-family:var(--font-mono);font-size:.68rem;padding:8px 20px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;margin:12px 0;">Load Episodes</button>`;
      } else {
        html += `<div class="episode-grid">`;
        episodes.forEach((ep, ei) => {
          const epName = ep.name || ep.title || `Episode ${ei+1}`;
          const epPath = ep.path || '';
          const epId   = `nt_${si}_${ei}`;
          html += `<div class="episode-card" data-ep-path="${epPath}">
            <div class="ep-number">E${String(ei+1).padStart(2,'0')}</div>
            <div class="ep-title">${epName}</div>
            <div class="ep-actions">
              <button class="ep-btn ep-btn-play nt-load-ep" data-ep-path="${epPath}" data-ep-name="${epName.replace(/"/g,'&quot;')}">
                <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg> PLAY
              </button>
            </div>
            <div class="episode-languages" id="nt-langs-${epId}" style="display:none;margin-top:8px;"></div>
          </div>`;
        });
        html += `</div>`;
      }
      html += `</div>`;
    });

    html += `</div>`;
    return html;
  }

  function attachNtListeners(showTitle){
    // Season tabs
    document.querySelectorAll('.season-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const idx = tab.dataset.seasonIdx;
        document.querySelectorAll('[id^="nt-ep-panel-"]').forEach(p => p.classList.remove('active'));
        document.getElementById(`nt-ep-panel-${idx}`)?.classList.add('active');
      });
    });

    // NT Episode play (load language options)
    document.querySelectorAll('.nt-load-ep').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        const epPath  = btn.dataset.epPath;
        const epName  = btn.dataset.epName || 'Episode';
        if(!epPath){ showToast('No episode path'); return; }

        btn.textContent = '⏳';
        btn.disabled = true;

        const filesRes = await xcasper(`/newtoxic/files?path=${encodeURIComponent(epPath)}`);
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="9" height="9"><polygon points="5 3 19 12 5 21 5 3"/></svg> PLAY';
        btn.disabled = false;

        if(!filesRes?.data?.length){ showToast('No stream files found'); return; }

        const files = filesRes.data;

        // If only one file, play directly
        if(files.length === 1 && files[0].fid){
          await ntPlayFile(files[0].fid, epName);
          return;
        }

        // Show language options inline
        const card = btn.closest('.episode-card');
        let langContainer = card?.querySelector('.episode-languages');
        if(!langContainer){
          langContainer = document.createElement('div');
          langContainer.className = 'episode-languages';
          langContainer.style.marginTop = '8px';
          card?.appendChild(langContainer);
        }

        if(langContainer.innerHTML && langContainer.style.display !== 'none'){
          langContainer.style.display = 'none';
          return;
        }

        let listHtml = '<div style="margin-top:6px;display:flex;flex-direction:column;gap:5px;">';
        files.forEach(f => {
          const lang   = detectLang(f.name);
          const sizeMB = f.size ? (f.size/1024/1024).toFixed(1)+' MB' : '?';
          listHtml += `<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;padding:5px 0;border-bottom:1px solid var(--border);">
            <span style="font-size:.7rem;color:var(--text2);">${lang} · ${sizeMB}</span>
            <div style="display:flex;gap:5px;">
              ${f.fid ? `<button class="ep-btn ep-btn-play nt-watch-file" data-fid="${f.fid}" data-name="${epName}" style="font-size:.6rem;padding:4px 10px;">▶ Watch</button>
              <button class="ep-btn ep-btn-dl nt-dl-file" data-fid="${f.fid}" style="font-size:.6rem;padding:4px 10px;">⬇</button>` : '<span style="color:var(--text3);font-size:.68rem;">N/A</span>'}
            </div>
          </div>`;
        });
        listHtml += '</div>';
        langContainer.innerHTML = listHtml;
        langContainer.style.display = 'block';

        langContainer.querySelectorAll('.nt-watch-file').forEach(wb => {
          wb.addEventListener('click', async () => {
            await ntPlayFile(wb.dataset.fid, wb.dataset.name);
          });
        });
        langContainer.querySelectorAll('.nt-dl-file').forEach(db => {
          db.addEventListener('click', async () => {
            const resolve = await xcasper(`/newtoxic/resolve?fid=${db.dataset.fid}`);
            if(resolve?.data?.url) window.open(resolve.data.url, '_blank');
            else showToast('Download failed');
          });
        });
      });
    });

    // NT "Get files" button for seasons without episode list
    document.querySelectorAll('.nt-get-files').forEach(btn => {
      btn.addEventListener('click', async () => {
        const folderPath = btn.dataset.path;
        btn.textContent  = 'Loading...';
        btn.disabled     = true;
        const filesRes   = await xcasper(`/newtoxic/files?path=${encodeURIComponent(folderPath)}`);
        if(!filesRes?.data){
          btn.textContent = 'No files found';
          return;
        }
        const files = filesRes.data;
        let listHtml = '<div class="nt-folder"><h4>Files</h4>';
        files.forEach(f => {
          const sizeMB = f.size ? (f.size/1024/1024).toFixed(1)+' MB' : '?';
          listHtml += `<div class="nt-file">
            <span>${f.name} (${sizeMB})</span>
            ${f.fid ? `<div style="display:flex;gap:6px;">
              <button class="nt-watch-file ep-btn ep-btn-play" data-fid="${f.fid}" data-name="${f.name}" style="font-size:.62rem;padding:4px 12px;">▶ Watch</button>
              <button class="nt-dl-file ep-btn ep-btn-dl" data-fid="${f.fid}" style="font-size:.62rem;padding:4px 12px;">⬇</button>
            </div>` : ''}
          </div>`;
        });
        listHtml += '</div>';
        btn.insertAdjacentHTML('afterend', listHtml);
        btn.style.display = 'none';

        // Attach watch/dl listeners
        btn.parentElement.querySelectorAll('.nt-watch-file').forEach(wb => {
          wb.addEventListener('click', async () => { await ntPlayFile(wb.dataset.fid, wb.dataset.name); });
        });
        btn.parentElement.querySelectorAll('.nt-dl-file').forEach(db => {
          db.addEventListener('click', async () => {
            const resolve = await xcasper(`/newtoxic/resolve?fid=${db.dataset.fid}`);
            if(resolve?.data?.url) window.open(resolve.data.url, '_blank');
            else showToast('Download failed');
          });
        });
      });
    });
  }

  async function ntPlayFile(fid, name){
    showToast('Loading stream...');
    const resolve = await xcasper(`/newtoxic/resolve?fid=${fid}`);
    if(!resolve?.data?.url){ showToast('Could not resolve stream link'); return; }
    const url = resolve.data.url;

    // Build simple player
    modalDynamic.innerHTML = `
      <button class="back-to-info" id="ntBackBtn">
        <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back
      </button>
      <div class="player-title-bar">${name}</div>
      <div class="player-wrap">
        <video id="liveVid" class="video-player" controls autoplay playsinline></video>
      </div>`;

    const video = document.getElementById('liveVid');
    if(url.includes('.m3u8') && typeof Hls !== 'undefined' && Hls.isSupported()){
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
    video.play().catch(()=>{});

    document.getElementById('ntBackBtn')?.addEventListener('click', () => history.back?.() || closeModal());
  }

  function detectLang(name){
    name = name.toLowerCase();
    if(name.includes('hindi'))     return '🇮🇳 Hindi';
    if(name.includes('english'))   return '🇺🇸 English';
    if(name.includes('tamil'))     return '🇮🇳 Tamil';
    if(name.includes('telugu'))    return '🇮🇳 Telugu';
    if(name.includes('malayalam')) return '🇮🇳 Malayalam';
    if(name.includes('kannada'))   return '🇮🇳 Kannada';
    if(name.includes('bengali'))   return '🇮🇳 Bengali';
    if(name.includes('arabic'))    return '🇦🇪 Arabic';
    if(name.includes('french'))    return '🇫🇷 French';
    if(name.includes('spanish'))   return '🇪🇸 Spanish';
    if(name.includes('portuguese'))return '🇧🇷 Portuguese';
    return '🌐 Unknown';
  }

  // ═══════════════════════════════════════════
  // HOME
  // ═══════════════════════════════════════════
  async function loadHome(){
    showLoader(true);
    const [home, trending, hot, popular] = await Promise.all([
      xcasper('/homepage'),
      xcasper('/trending?page=0&perPage=20'),
      xcasper('/hot'),
      xcasper('/popular-search')
    ]);
    showLoader(false);

    let html = '';

    // ── Hero Carousel
    const carouselItems = extractArray(trending) || extractArray(hot) || [];
    if(carouselItems.length){
      const slides = carouselItems.slice(0,6);
      html += `<div class="hero-carousel" id="heroCarousel">
        <div class="carousel-track" id="carouselTrack">`;
      slides.forEach(item => {
        const bg   = getBackdropUrl(item) || getCoverUrl(item) || '';
        const t    = item.title||item.name||'Featured';
        const sid  = getSubjectId(item);
        const path = item.detailPath||item.path||'';
        const year = item.releaseDate ? item.releaseDate.slice(0,4) : '';
        const genre = Array.isArray(item.genre) ? item.genre.slice(0,2).join(' · ') : (item.genre||'').split(',').slice(0,2).join(' · ');
        const rating = item.imdbRatingValue || '';
        html += `<div class="carousel-slide" data-subjectid="${sid}" data-detailpath="${path}" style="background-image:url('${bg}');">
          <div class="slide-content">
            <div class="slide-badge">★ FEATURED</div>
            <div class="slide-title">${t}</div>
            <div class="slide-meta">${[year, genre, rating?'IMDb '+rating:''].filter(Boolean).join(' · ')}</div>
          </div>
          <div class="slide-play"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
        </div>`;
      });
      html += `</div>
        <button class="carousel-nav carousel-prev" id="carouselPrev"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button class="carousel-nav carousel-next" id="carouselNext"><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>
        <div class="carousel-indicators" id="carouselIndicators">`;
      slides.forEach((_,i) => { html += `<span class="carousel-indicator ${i===0?'active':''}"></span>`; });
      html += `</div></div>`;
    }

    // ── Popular search chips
    if(popular?.data && Array.isArray(popular.data)){
      html += `<div class="row-header">${icon('search')}<h3>Popular Searches</h3></div><div class="chips">`;
      popular.data.slice(0,20).forEach(term => {
        html += `<span class="chip" data-keyword="${term.replace(/"/g,'&quot;')}">${term}</span>`;
      });
      html += `</div>`;
    }

    const homeArr  = extractArray(home);
    const trendArr = extractArray(trending);
    const hotArr   = extractArray(hot);
    if(trendArr?.length) html += renderRow('Trending Now',   trendArr, 'trend');
    if(hotArr?.length)   html += renderRow('Hot This Week',  hotArr,   'fire');
    if(homeArr?.length)  html += renderRow('Recommended',    homeArr,  'star');

    if(!html){
      html = `<div class="error-message">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
        <p>No content available. Try searching.</p>
      </div>`;
    }

    container.innerHTML = html;

    // ── Init carousel
    setTimeout(() => {
      const track      = document.getElementById('carouselTrack');
      const slides     = document.querySelectorAll('.carousel-slide');
      const indicators = document.querySelectorAll('.carousel-indicator');
      if(!slides.length || !track) return;

      let cur = 0;
      const total = slides.length;
      let interval = setInterval(() => go(cur+1), 5000);

      function go(n){
        if(n < 0) n = total-1;
        if(n >= total) n = 0;
        cur = n;
        track.style.transform = `translateX(-${cur*100}%)`;
        indicators.forEach((d,i) => d.classList.toggle('active', i===cur));
      }

      document.getElementById('carouselPrev')?.addEventListener('click', () => { clearInterval(interval); go(cur-1); interval = setInterval(()=>go(cur+1),5000); });
      document.getElementById('carouselNext')?.addEventListener('click', () => { clearInterval(interval); go(cur+1); interval = setInterval(()=>go(cur+1),5000); });
      indicators.forEach((dot,i) => dot.addEventListener('click', () => { clearInterval(interval); go(i); interval = setInterval(()=>go(cur+1),5000); }));

      let sx, sy;
      track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; clearInterval(interval); }, { passive:true });
      track.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        if(Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) go(dx > 0 ? cur-1 : cur+1);
        interval = setInterval(()=>go(cur+1),5000);
      }, { passive:true });

      slides.forEach(slide => {
        slide.addEventListener('click', e => {
          if(e.target.closest('.carousel-nav')) return;
          const sid  = slide.dataset.subjectid;
          const path = slide.dataset.detailpath;
          const t    = slide.querySelector('.slide-title')?.textContent || '';
          if(sid && sid !== 'missing') openDetail(sid, path, t, '', 0);
        });
      });
    }, 80);

    // ── Chip click
    document.querySelectorAll('.chip').forEach(c => {
      c.addEventListener('click', e => {
        const kw = e.currentTarget.dataset.keyword;
        if(kw){ searchInput.value = kw; performSearch(kw); }
      });
    });

    attachCardListeners();
  }

  // ═══════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════
  const performSearch = debounce(async function(keyword){
    if(!keyword) return;
    showLoader(true);
    const [mainRes, ntRes] = await Promise.all([
      xcasper(`/search?keyword=${encodeURIComponent(keyword)}&page=1&perPage=30&subjectType=0`),
      xcasper(`/newtoxic/search?keyword=${encodeURIComponent(keyword)}`)
    ]);
    showLoader(false);

    let html = `<div class="row-header">${icon('search')}<h3>"${keyword}"</h3>
      <span class="results-back" id="backHome">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Home
      </span>
    </div><div class="grid-view">`;

    const mainItems = extractArray(mainRes);
    if(mainItems) mainItems.forEach(item => { html += buildGridCard(item); });

    const ntItems = extractArray(ntRes);
    if(ntItems) ntItems.forEach(item => {
      const cover = item.thumbnail||item.image||PLACEHOLDER;
      const t     = item.title||item.name||'Untitled';
      const path  = item.path||'';
      html += `<div class="movie-card" data-source="newtoxic" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}" data-subjecttype="2">
        <img class="card-img" src="${cover}" onerror="this.src='${PLACEHOLDER}'" alt="${t}">
        <div class="card-overlay"><div class="card-play-icon"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div>
        <div class="card-info"><div class="card-title">${t}</div></div>
      </div>`;
    });
    html += '</div>';

    if(!mainItems?.length && !ntItems?.length){
      html = `<div class="error-message">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <p>No results found for "<strong>${keyword}</strong>"</p>
        <p style="margin-top:8px;font-size:.8rem;">Try different keywords or browse by category</p>
      </div>`;
    }

    container.innerHTML = html;
    attachCardListeners();
    document.getElementById('backHome')?.addEventListener('click', loadHome);
  }, 350);

  // ═══════════════════════════════════════════
  // SERIES (Newtoxic)
  // ═══════════════════════════════════════════
  async function loadSeries(){
    showLoader(true);
    const [featured, latest] = await Promise.all([
      xcasper('/newtoxic/featured'),
      xcasper('/newtoxic/latest?page=1')
    ]);
    showLoader(false);

    let html = `<div class="nt-search-box">
      <input type="text" id="ntSearchInput" placeholder="Search TV shows, series..." autocomplete="off">
      <button id="ntSearchBtn" class="btn-primary" style="flex:0 0 auto;padding:10px 18px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>Search
      </button>
    </div>`;

    const fArr = extractArray(featured);
    const lArr = extractArray(latest);
    if(fArr?.length) html += renderRow('Featured Series', fArr, 'star');
    if(lArr?.length) html += renderRow('Latest Episodes', lArr, 'download');

    container.innerHTML = html || '<div class="error-message"><p>No series data available.</p></div>';

    document.getElementById('ntSearchBtn')?.addEventListener('click', () => {
      const kw = document.getElementById('ntSearchInput').value.trim();
      if(kw) searchNewToxic(kw);
    });
    document.getElementById('ntSearchInput')?.addEventListener('keyup', e => {
      if(e.key === 'Enter') document.getElementById('ntSearchBtn').click();
    });

    document.querySelectorAll('.movie-card').forEach(card => {
      card.dataset.source = 'newtoxic';
      card.removeEventListener('click', cardClickHandler);
      card.addEventListener('click', cardClickHandler);
    });
  }

  async function searchNewToxic(keyword){
    showLoader(true);
    const res = await xcasper(`/newtoxic/search?keyword=${encodeURIComponent(keyword)}`);
    showLoader(false);
    const items = extractArray(res);
    if(!items?.length){
      container.innerHTML = `<div class="error-message"><p>No results for "${keyword}"</p></div>`;
      return;
    }
    let html = `<div class="row-header">${icon('search')}<h3>Series: "${keyword}"</h3>
      <span class="results-back" id="backSeries"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back</span>
    </div><div class="grid-view">`;
    items.forEach(item => {
      const cover = item.thumbnail||item.image||PLACEHOLDER;
      const t     = item.title||item.name||'Untitled';
      const path  = item.path||'';
      html += `<div class="movie-card" data-source="newtoxic" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}" data-subjecttype="2">
        <img class="card-img" src="${cover}" onerror="this.src='${PLACEHOLDER}'" alt="${t}">
        <div class="card-overlay"><div class="card-play-icon"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div>
        <div class="card-info"><div class="card-title">${t}</div></div>
      </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    document.getElementById('backSeries')?.addEventListener('click', loadSeries);
    document.querySelectorAll('.movie-card').forEach(card => card.addEventListener('click', cardClickHandler));
  }

  // ═══════════════════════════════════════════
  // ANIME
  // ═══════════════════════════════════════════
  async function loadAnime(){
    let html = `<div class="row-header">${icon('anime')}<h3>Anime & Animated</h3></div>
      <div class="anime-search-box">
        <input type="text" id="animeSearchInput" placeholder="Naruto, Demon Slayer, Attack on Titan..." autocomplete="off">
        <button id="animeSearchBtn" class="btn-primary" style="flex:0 0 auto;padding:10px 18px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>Search
        </button>
      </div>
      <div id="animeResultsContainer"></div>`;
    container.innerHTML = html;

    const input      = document.getElementById('animeSearchInput');
    const btn        = document.getElementById('animeSearchBtn');
    const resultsDiv = document.getElementById('animeResultsContainer');

    showLoader(true);
    const [animeBrowse, topAnime] = await Promise.all([
      xcasper('/browse?subjectType=5&page=1&perPage=24&orderBy=hot'),
      xcasper('/browse?subjectType=5&page=1&perPage=12&orderBy=rating')
    ]);
    showLoader(false);

    const topItems   = extractArray(topAnime);
    const browseItems = extractArray(animeBrowse);
    let defaultHtml  = '';
    if(topItems?.length)    defaultHtml += renderRow('Top Rated Anime', topItems, 'trophy');
    if(browseItems?.length) defaultHtml += renderRow('Hot Anime',       browseItems, 'fire');

    resultsDiv.innerHTML = defaultHtml || `<div class="error-message"><p>Search for your favourite anime above ✦</p></div>`;
    attachCardListeners();

    const performAnimeSearch = debounce(async function(){
      const query = input.value.trim();
      if(!query){ showToast('Enter a title'); return; }
      showLoader(true);
      const res   = await xcasper(`/search?keyword=${encodeURIComponent(query)}&page=1&perPage=30&subjectType=5`);
      showLoader(false);
      const items = extractArray(res);
      if(!items?.length){
        resultsDiv.innerHTML = `<div class="error-message"><p>No anime found for "${query}"</p></div>`;
        return;
      }
      let grid = `<div class="row-header" style="margin-top:8px;">${icon('search')}<h3>"${query}"</h3></div><div class="grid-view">`;
      items.forEach(item => { grid += buildGridCard(item); });
      grid += '</div>';
      resultsDiv.innerHTML = grid;
      attachCardListeners();
    }, 350);

    btn.addEventListener('click', performAnimeSearch);
    input.addEventListener('keypress', e => { if(e.key === 'Enter') performAnimeSearch(); });
  }

  // ═══════════════════════════════════════════
  // LIVE SPORTS
  // ═══════════════════════════════════════════
  async function loadLiveSports(){
    showLoader(true);
    const liveData = await xcasper('/live');
    showLoader(false);

    if(!liveData?.data?.matchList?.length){
      container.innerHTML = `<div class="error-message">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-9.5 6.8L12 12l9.5-3.2A10 10 0 0 0 12 2z"/></svg>
        <p>No live sports right now.</p>
        <p style="margin-top:6px;font-size:.78rem;">Check back later for live matches</p>
      </div>`;
      return;
    }

    let html = `<div class="live-section-header">
      <div class="live-dot"></div>
      ${icon('futbol')}<h3>Live Sports</h3>
    </div><div class="live-grid">`;

    liveData.data.matchList.forEach(match => {
      const t1    = match.team1 || {};
      const t2    = match.team2 || {};
      const title = `${t1.name||'Team A'} vs ${t2.name||'Team B'}`;
      const stream = match.playPath || match.streamUrl || '';
      const thumb1 = t1.avatar || t1.logo || '';
      const thumb2 = t2.avatar || t2.logo || '';
      const score1 = t1.score ?? '';
      const score2 = t2.score ?? '';
      const scoreStr = (score1 !== '' && score2 !== '') ? `${score1} - ${score2}` : 'LIVE';

      html += `<div class="live-match" data-stream="${stream}" data-title="${title}">
        <div class="live-teams">
          <div class="live-team">
            ${thumb1 ? `<img class="live-team-img" src="${thumb1}" onerror="this.style.display='none'" alt="${t1.name||''}">` : ''}
            <div class="live-team-name">${t1.name||'Team A'}</div>
          </div>
          <div class="live-vs">
            <div class="live-score">${scoreStr}</div>
            <div class="live-vs-label">LIVE</div>
          </div>
          <div class="live-team">
            ${thumb2 ? `<img class="live-team-img" src="${thumb2}" onerror="this.style.display='none'" alt="${t2.name||''}">` : ''}
            <div class="live-team-name">${t2.name||'Team B'}</div>
          </div>
        </div>
        <div class="live-badge">● LIVE</div>
      </div>`;
    });

    html += `</div>`;
    container.innerHTML = html;

    document.querySelectorAll('.live-match').forEach(matchEl => {
      matchEl.addEventListener('click', () => {
        const streamUrl = matchEl.dataset.stream;
        const title     = matchEl.dataset.title;
        if(!streamUrl){ showToast('Stream not available'); return; }
        openModal();
        modalDynamic.innerHTML = `
          <div class="player-title-bar">
            <span>${title}</span>
            <span class="ep-info">● LIVE</span>
          </div>
          <div class="player-wrap">
            <video id="liveVid" class="video-player" controls autoplay playsinline></video>
          </div>`;
        const video = document.getElementById('liveVid');
        if(streamUrl.includes('.m3u8') && typeof Hls !== 'undefined' && Hls.isSupported()){
          const hls = new Hls({ enableWorker:true, lowLatencyMode:true });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        video.play().catch(()=>{});
      });
    });
  }

  // ═══════════════════════════════════════════
  // DISCOVER
  // ═══════════════════════════════════════════
  async function loadDiscover(){
    let html = `<div class="row-header">${icon('compass')}<h3>Discover</h3></div>
    <div class="filter-bar">
      <select id="typeFilter" class="filter-select">
        <option value="all">All Types</option>
        <option value="1">Movies</option>
        <option value="2">TV Series</option>
        <option value="5">Anime</option>
      </select>
      <select id="genreFilter" class="filter-select">
        <option value="">Any Genre</option>
        <option value="Action">Action</option>
        <option value="Adventure">Adventure</option>
        <option value="Animation">Animation</option>
        <option value="Comedy">Comedy</option>
        <option value="Crime">Crime</option>
        <option value="Drama">Drama</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Horror">Horror</option>
        <option value="Romance">Romance</option>
        <option value="Sci-Fi">Sci-Fi</option>
        <option value="Thriller">Thriller</option>
      </select>
      <select id="countryFilter" class="filter-select">
        <option value="">Any Country</option>
        <option value="United States">US</option>
        <option value="South Korea">Korea</option>
        <option value="United Kingdom">UK</option>
        <option value="Japan">Japan</option>
        <option value="Nigeria">Nigeria</option>
        <option value="France">France</option>
        <option value="India">India</option>
      </select>
      <select id="yearFilter" class="filter-select">
        <option value="">Any Year</option>
        <option value="2026">2026</option>
        <option value="2025">2025</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
      </select>
      <select id="orderFilter" class="filter-select">
        <option value="rating">Top Rated</option>
        <option value="releaseDate">Newest</option>
        <option value="hot">Trending</option>
      </select>
      <button id="applyFilters" class="btn-primary" style="flex:0 0 auto;padding:9px 18px;">Apply</button>
    </div>
    <div id="browseResults"></div>
    <div class="row-header">${icon('trophy')}<h3>Rankings</h3></div>
    <div id="rankingCategories" class="chips"></div>
    <div id="rankingResults"></div>`;

    container.innerHTML = html;

    // Rankings
    const rankingData = await xcasper('/ranking');
    if(rankingData?.data?.rankingList){
      let chipsHtml = '';
      rankingData.data.rankingList.forEach(cat => {
        chipsHtml += `<span class="chip" data-rankid="${cat.id}">${cat.name}</span>`;
      });
      document.getElementById('rankingCategories').innerHTML = chipsHtml;

      document.querySelectorAll('[data-rankid]').forEach(chip => {
        chip.addEventListener('click', async () => {
          document.querySelectorAll('[data-rankid]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const rankRes = await xcasper(`/ranking?id=${chip.dataset.rankid}&page=1&perPage=20`);
          const items   = extractArray(rankRes);
          const el      = document.getElementById('rankingResults');
          if(items?.length){
            let grid = '<div class="grid-view">';
            items.forEach(item => { grid += buildGridCard(item); });
            grid += '</div>';
            el.innerHTML = grid;
            attachCardListeners();
          } else {
            el.innerHTML = '<p style="color:var(--text3);font-size:.85rem;padding:12px 0;">No items found.</p>';
          }
        });
      });
    }

    async function fetchBrowse(){
      const type    = document.getElementById('typeFilter').value;
      const genre   = document.getElementById('genreFilter').value;
      const country = document.getElementById('countryFilter').value;
      const year    = document.getElementById('yearFilter').value;
      const order   = document.getElementById('orderFilter').value;
      let url = '/browse?page=1&perPage=24';
      if(type !== 'all') url += `&subjectType=${type}`;
      if(genre)   url += `&genre=${encodeURIComponent(genre)}`;
      if(country) url += `&countryName=${encodeURIComponent(country)}`;
      if(year)    url += `&year=${year}`;
      if(order)   url += `&orderBy=${order}`;

      const el = document.getElementById('browseResults');
      if(el) el.innerHTML = '<div class="loader"></div>';
      const res   = await xcasper(url);
      const items = extractArray(res);
      if(items?.length){
        let grid = '<div class="grid-view">';
        items.forEach(item => { grid += buildGridCard(item); });
        grid += '</div>';
        if(el) el.innerHTML = grid;
        attachCardListeners();
      } else {
        if(el) el.innerHTML = '<p style="color:var(--text3);font-size:.85rem;padding:12px 0;">No results found. Try different filters.</p>';
      }
    }

    document.getElementById('applyFilters')?.addEventListener('click', fetchBrowse);
    fetchBrowse();
  }

  // ═══════════════════════════════════════════
  // NAV ROUTING
  // ═══════════════════════════════════════════
  navItems.forEach(item => {
    item.addEventListener('click', async () => {
      const section = item.dataset.section;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      window.scrollTo({ top:0, behavior:'smooth' });

      if(section === 'home')           await loadHome();
      else if(section === 'trending'){
        showLoader(true);
        const res = await xcasper('/trending?page=0&perPage=30');
        showLoader(false);
        const arr = extractArray(res);
        container.innerHTML = arr?.length
          ? renderRow('Trending Now', arr, 'trend')
          : '<div class="error-message"><p>No trending data.</p></div>';
        attachCardListeners();
      }
      else if(section === 'series')   await loadSeries();
      else if(section === 'anime')    await loadAnime();
      else if(section === 'live')     await loadLiveSports();
      else if(section === 'discover') await loadDiscover();
    });
  });

  // ── Global search
  searchBtn?.addEventListener('click', () => {
    const kw = searchInput.value.trim();
    if(kw) performSearch(kw);
  });
  searchInput?.addEventListener('keyup', e => {
    if(e.key === 'Enter'){
      const kw = searchInput.value.trim();
      if(kw) performSearch(kw);
    }
  });

  // ── Init
  loadHome();

})();
