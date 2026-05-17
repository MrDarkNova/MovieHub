(function(){
  function revert(){
    var a=document.querySelector('.logo');
    if(a&&a.innerText.trim()!=='ᴅᴀʀᴋɴᴏᴠᴀ')a.innerText='ᴅᴀʀᴋɴᴏᴠᴀ';
  }
  setInterval(revert,2000);revert();
})();

(function(){

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

  let currentSubjectId = null, currentDetailPath = null;
  let currentStreams = [], currentTitle = '', currentCover = '';

  const _cache = new Map();
  const CACHE_TTL = 5 * 60 * 1000;

  function showLoader(show){
    if(globalLoader) globalLoader.style.display = show ? 'block' : 'none';
  }

  async function xcasper(endpoint){
    const cached = _cache.get(endpoint);
    if(cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;
    try{
      const res = await fetch(`${API}${endpoint}`);
      if(!res.ok) return null;
      const data = await res.json();
      _cache.set(endpoint, { data, ts: Date.now() });
      return data;
    } catch { return null; }
  }

  function debounce(fn, ms){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  let toastTimer;
  function showToast(msg='✦ ᴅᴀʀᴋɴᴏᴠᴀ', dur=2400){
    const el = document.getElementById('toast');
    if(!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), dur);
  }

  function openModal(){ modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function closeModal(){ modal.classList.remove('active'); document.body.style.overflow = ''; modalDynamic.innerHTML = ''; }

  closeModalBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

  function initTheme(){
    const saved = localStorage.getItem('dn_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const moon = document.getElementById('iconMoon');
    const sun  = document.getElementById('iconSun');
    if(moon) moon.style.display = saved === 'dark'  ? 'block' : 'none';
    if(sun)  sun.style.display  = saved === 'light' ? 'block' : 'none';
  }
  themeToggle?.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dn_theme', next);
    const moon = document.getElementById('iconMoon');
    const sun  = document.getElementById('iconSun');
    if(moon) moon.style.display = next === 'dark'  ? 'block' : 'none';
    if(sun)  sun.style.display  = next === 'light' ? 'block' : 'none';
  });
  initTheme();

  const btt = document.getElementById('backToTop');
  window.addEventListener('scroll', () => { if(btt) btt.classList.toggle('show', window.scrollY > 400); }, { passive:true });
  btt?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

  const rowIcons = {
    'fa-home':      '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'fa-chart-line':'<svg class="row-header-icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    'fa-bolt':      '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'fa-dragon':    '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'fa-search':    '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>',
    'fa-star':      '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    'fa-download':  '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    'fa-trophy':    '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 5h12v7a6 6 0 0 1-12 0V5z"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>',
    'fa-fire':      '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M13 2C6 8 6 14 12 14c-2 3-7 4-7 4s8 4 12-2c1-2 1-4 0-6-1 2-3 3-4 2 2-2 3-6 0-10z"/></svg>',
    'fa-compass':   '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    'fa-futbol':    '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-9.5 6.8L12 12l9.5-3.2A10 10 0 0 0 12 2z"/></svg>',
    'fa-film':      '<svg class="row-header-icon" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
  };
  function getRowIcon(icon){ return rowIcons[icon] || rowIcons['fa-film']; }

  function extractArray(data){
    if(!data) return null;
    if(Array.isArray(data)) return data;
    if(data.data){
      if(Array.isArray(data.data)) return data.data;
      if(data.data.items && Array.isArray(data.data.items)) return data.data.items;
      if(typeof data.data === 'object') for(let k in data.data) if(Array.isArray(data.data[k])) return data.data[k];
    }
    if(data.items   && Array.isArray(data.items))   return data.items;
    if(data.results && Array.isArray(data.results)) return data.results;
    return null;
  }

  function getSubjectId(item){ return item.subjectId||item.id||item._id||item.movieId||item.showId||item.contentId||item.guid||'missing'; }

  function getCoverUrl(item){
    if(!item) return null;
    if(typeof item.cover      === 'string' && item.cover)      return item.cover;
    if(typeof item.poster     === 'string' && item.poster)     return item.poster;
    if(typeof item.thumbnail  === 'string' && item.thumbnail)  return item.thumbnail;
    if(typeof item.image      === 'string' && item.image)      return item.image;
    if(typeof item.backdrop   === 'string' && item.backdrop)   return item.backdrop;
    if(item.cover?.url)     return item.cover.url;
    if(item.poster?.url)    return item.poster.url;
    if(item.thumbnail?.url) return item.thumbnail.url;
    return null;
  }

  function getBackdropUrl(item){
    if(!item) return null;
    if(typeof item.backdrop === 'string' && item.backdrop) return item.backdrop;
    if(item.backdrop?.url) return item.backdrop.url;
    return getCoverUrl(item);
  }

  const PLACEHOLDER = 'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
  const PLACEHOLDER_W = 'https://placehold.co/500x750/0a0a10/9890b8?text=';

  function renderRow(title, items, icon='fa-film'){
    if(!items?.length) return '';
    let html = `<div class="row-header">${getRowIcon(icon)}<h3>${title}</h3></div><div class="movie-row">`;
    items.slice(0,15).forEach(item => {
      const t         = item.title||item.name||item.originalTitle||'Untitled';
      const year      = item.releaseDate ? item.releaseDate.slice(0,4) : (item.year||'');
      const rating    = item.imdbRatingValue||item.imdbRating||item.rating||'N/A';
      const cover     = getCoverUrl(item) || PLACEHOLDER;
      const subjectId = getSubjectId(item);
      const path      = item.detailPath||item.path||'';
      const subType   = item.subjectType||0;
      html += `<div class="movie-card" data-source="main" data-subjectid="${subjectId}" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}" data-rating="${rating}" data-year="${year}" data-subjecttype="${subType}">
        <img class="card-img" src="${cover}" loading="lazy" onerror="this.src='${PLACEHOLDER}'">
        <div class="card-info">
          <div class="card-title">${t}</div>
          <div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div>
        </div>
      </div>`;
    });
    html += '</div>';
    return html;
  }

  function buildGridCard(item){
    const cover   = getCoverUrl(item) || PLACEHOLDER;
    const t       = item.title||item.name||'Untitled';
    const year    = item.releaseDate ? item.releaseDate.slice(0,4) : (item.year||'');
    const rating  = item.imdbRatingValue||item.imdbRating||item.rating||'N/A';
    const sid     = getSubjectId(item);
    const path    = item.detailPath||item.path||'';
    const stype   = item.subjectType||0;
    return `<div class="movie-card" data-source="main" data-subjectid="${sid}" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}" data-rating="${rating}" data-year="${year}" data-subjecttype="${stype}">
      <img class="card-img" src="${cover}" loading="lazy" onerror="this.src='${PLACEHOLDER}'">
      <div class="card-info">
        <div class="card-title">${t}</div>
        <div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div>
      </div>
    </div>`;
  }

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
      if(!path){ showToast('⚠️ No detail path'); return; }
      await openNtDetail(path, title);
    } else {
      if(subjectId === 'missing'){ showToast('⚠️ No details available'); return; }
      await openDetail(subjectId, path, title, cover, subType);
    }
  }

  async function openDetail(subjectId, detailPath, fallbackTitle, fallbackCover, subjectType){
    if(!subjectId || subjectId === 'missing'){ showToast('⚠️ No valid subject ID'); return; }
    openModal();
    modalDynamic.innerHTML = '<div class="loader"></div>';
    try{
      const [xcDetail, xcPlay, xcRecommend] = await Promise.all([
        xcasper(`/detail?subjectId=${subjectId}`),
        detailPath
          ? xcasper(`/play?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}`)
          : xcasper(`/play?subjectId=${subjectId}`),
        xcasper(`/recommend?subjectId=${subjectId}&page=1&perPage=8`)
      ]);

      let coverUrl    = fallbackCover;
      let backdropImg = fallbackCover;
      let title       = fallbackTitle || 'No title';
      let xcImdb      = 'N/A';
      let genre       = 'Unknown';
      let desc        = '';
      let streams     = [];
      let audioTracks = [];
      let isSeries    = subjectType === 2;

      if(xcDetail?.data){
        const d   = xcDetail.data;
        coverUrl    = getCoverUrl(d) || coverUrl;
        backdropImg = getBackdropUrl(d) || coverUrl;
        title       = d.title || title;
        xcImdb      = d.imdbRatingValue || d.imdbRating || xcImdb;
        genre       = Array.isArray(d.genre) ? d.genre.join(', ') : (d.genre || genre);
        desc        = d.description || d.storyline || d.overview || '';
        if(d.subjectType) isSeries = d.subjectType === 2;
      }
      if(xcPlay?.data){
        streams     = xcPlay.data.streams || [];
        audioTracks = xcPlay.data.audioTracks || [];
      }

      // The main API returns seasons=[] always (no episode list in any endpoint).
      // For series we use rich-detail which has max_season/max_episode from ShowBox.
      // We build the season/episode UI from those numbers and stream via /play?se=&ep=
      let maxSeason  = 0;
      let maxEpisode = 0;
      if(isSeries){
        // Try to get max_season from rich-detail (has ShowBox data)
        const richRes = await xcasper(`/rich-detail?subjectId=${subjectId}`);
        if(richRes?.data){
          maxSeason  = richRes.data.max_season  || 0;
          maxEpisode = richRes.data.max_episode  || 0;
        }
      }

      currentSubjectId  = subjectId;
      currentDetailPath = detailPath;
      currentStreams     = streams;
      currentTitle      = title;
      currentCover      = coverUrl;

      const finalDesc = desc || 'No description available.';

      let html = `<div class="info-backdrop">
        <img class="backdrop-img" src="${backdropImg||coverUrl||PLACEHOLDER_W}" onerror="this.src='${PLACEHOLDER_W}'">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,16,.98) 0%,rgba(10,10,16,.4) 100%);pointer-events:none;"></div>
        <div class="info-content">
          <img class="info-poster" src="${coverUrl||PLACEHOLDER}" onerror="this.src='${PLACEHOLDER}'">
          <div class="info-text">
            <div class="imdb-row">
              <span class="imdb-badge">IMDb</span>
              <span>${xcImdb}</span>
              <span style="opacity:.5">·</span>
              <span>${genre}</span>
            </div>
            <h2>${title}</h2>
            <p>${finalDesc}</p>
            <div class="button-group">
              <button class="btn-primary" id="playBtnInfo">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> PLAY
              </button>
              <button class="btn-secondary" id="downloadBtnInfo">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> DOWNLOAD
              </button>
            </div>
            <div id="downloadDropdownInfo" class="download-dropdown"></div>
          </div>
        </div>
      </div>`;

      if(isSeries){
        html += '<h3 class="season-header">Seasons &amp; Episodes</h3>';
        if(maxSeason > 0){
          // Season tabs built from max_season
          html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">';
          for(let s=1; s<=maxSeason; s++){
            html += `<button class="chip ${s===1?'active':''}" data-stab="${s}" style="font-size:.65rem;">Season ${s}</button>`;
          }
          html += '</div>';
          // Episode list for active season (Season 1 default, max_episode episodes)
          // Episodes are fetched on demand when user clicks Play
          const epCount = maxEpisode > 0 ? maxEpisode : 24;
          html += `<div id="epListWrap">`;
          for(let e=1; e<=epCount; e++){
            html += `<div class="nt-file">
              <span style="font-family:var(--font-mono);font-size:.7rem;">S<span class="cur-season">1</span>E${String(e).padStart(2,'0')}</span>
              <div style="display:flex;gap:5px;">
                <button class="play-episode" data-se="1" data-ep="${e}" style="font-size:.65rem;padding:4px 12px;">▶ Play</button>
                <button class="dl-episode" data-se="1" data-ep="${e}" style="font-size:.65rem;padding:4px 10px;background:var(--bg3);border:1px solid var(--border);color:var(--text2);border-radius:100px;cursor:pointer;">⬇</button>
              </div>
            </div>`;
          }
          html += `</div>`;
        } else {
          // No max_season info — show simple picker
          html += `<p style="font-size:.75rem;color:var(--text3);margin:8px 0;">Select season and episode to stream:</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin:10px 0;">
            <div>
              <div style="font-size:.62rem;color:var(--text3);font-family:var(--font-mono);margin-bottom:4px;">SEASON</div>
              <select id="manualSeason" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-family:var(--font-mono);font-size:.72rem;outline:none;">
                ${Array.from({length:20},(_,i)=>`<option value="${i+1}">Season ${i+1}</option>`).join('')}
              </select>
            </div>
            <div>
              <div style="font-size:.62rem;color:var(--text3);font-family:var(--font-mono);margin-bottom:4px;">EPISODE</div>
              <select id="manualEpisode" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--text);font-family:var(--font-mono);font-size:.72rem;outline:none;">
                ${Array.from({length:50},(_,i)=>`<option value="${i+1}">Episode ${i+1}</option>`).join('')}
              </select>
            </div>
            <button id="manualPlayBtn" class="btn-primary" style="flex:1;min-width:100px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> STREAM
            </button>
            <button id="manualDlBtn" class="btn-secondary" style="flex:1;min-width:100px;">⬇ DOWNLOAD</button>
          </div>
          <div id="epStatus" style="font-family:var(--font-mono);font-size:.65rem;color:var(--text3);min-height:18px;"></div>`;
        }
      }

      if(audioTracks.length){
        html += '<div class="player-toolbar"><div class="audio-selector" id="audioSelector">';
        audioTracks.forEach(track => {
          html += `<button class="audio-btn" data-lang="${track.languageCode||track.language}">${track.language}</button>`;
        });
        html += '</div></div>';
      }

      modalDynamic.innerHTML = html;

      const downloadBtn      = document.getElementById('downloadBtnInfo');
      const downloadDropdown = document.getElementById('downloadDropdownInfo');
      if(streams.length){
        let ddHtml = '';
        streams.forEach(s => {
          const dlUrl  = s.downloadUrl || `${API}/bff/stream?subjectId=${subjectId}&resolution=${s.resolutions}&download=1`;
          const sizeMB = s.size ? (s.size/1024/1024).toFixed(1) : '?';
          ddHtml += `<div class="download-item">
            <span style="font-family:var(--font-mono);font-size:.72rem;">${s.resolutions}p</span>
            <a href="${dlUrl}" target="_blank" rel="noopener noreferrer">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>${sizeMB} MB
            </a>
          </div>`;
        });
        downloadDropdown.innerHTML = ddHtml;
        downloadBtn.addEventListener('click', e => { e.stopPropagation(); downloadDropdown.classList.toggle('show'); });
      } else {
        downloadBtn.style.display = 'none';
      }

      document.getElementById('playBtnInfo')?.addEventListener('click', () => {
        if(!streams.length){ showToast('No streams available'); return; }
        showPlayerView();
      });

      if(audioTracks.length){
        document.querySelectorAll('.audio-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const lang   = btn.dataset.lang;
            const newPlay = await xcasper(`/play?subjectId=${subjectId}&detailPath=${detailPath||''}&lang=${lang}`);
            if(newPlay?.data?.streams){ currentStreams = newPlay.data.streams; showPlayerView(); }
            else showToast('Audio track not available');
          });
        });
      }

      document.querySelectorAll('.play-episode').forEach(btn => {
        btn.addEventListener('click', async () => {
          const se = btn.dataset.se, ep = btn.dataset.ep;
          btn.textContent = '⏳'; btn.disabled = true;
          const epPlay = await xcasper(`/play?subjectId=${subjectId}&se=${se}&ep=${ep}`);
          btn.textContent = '▶ Play'; btn.disabled = false;
          if(epPlay?.data?.streams?.length){ currentStreams = epPlay.data.streams; currentTitle = `${title} S${se}E${ep}`; showPlayerView(); }
          else showToast(`S${se}E${ep} not available`);
        });
      });

      document.querySelectorAll('.dl-episode').forEach(btn => {
        btn.addEventListener('click', async () => {
          const se = btn.dataset.se, ep = btn.dataset.ep;
          btn.textContent = '⏳'; btn.disabled = true;
          const epPlay = await xcasper(`/play?subjectId=${subjectId}&se=${se}&ep=${ep}`);
          btn.textContent = '⬇'; btn.disabled = false;
          const streams = epPlay?.data?.streams;
          if(streams?.length){
            const best = streams.sort((a,b)=>(parseInt(b.resolutions)||0)-(parseInt(a.resolutions)||0))[0];
            window.open(best.downloadUrl || `${API}/bff/stream?subjectId=${subjectId}&resolution=${best.resolutions}&download=1`, '_blank');
          } else showToast(`No download for S${se}E${ep}`);
        });
      });

      // Season tab switching — updates all episode buttons' data-se
      document.querySelectorAll('[data-stab]').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('[data-stab]').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const sNum = tab.dataset.stab;
          // Update all play/dl buttons to the selected season
          document.querySelectorAll('.play-episode').forEach(b => b.dataset.se = sNum);
          document.querySelectorAll('.dl-episode').forEach(b => b.dataset.se = sNum);
          document.querySelectorAll('.cur-season').forEach(el => el.textContent = sNum);
        });
      });

      // Manual season/episode picker
      async function runManual(mode){
        const se  = document.getElementById('manualSeason')?.value;
        const ep  = document.getElementById('manualEpisode')?.value;
        const status = document.getElementById('epStatus');
        if(!se || !ep) return;
        if(status) status.textContent = `Loading S${se}E${ep}...`;
        const epPlay = await xcasper(`/play?subjectId=${subjectId}&se=${se}&ep=${ep}`);
        const streams = epPlay?.data?.streams;
        if(!streams?.length){ if(status) status.textContent = `⚠ S${se}E${ep} not available`; return; }
        if(status) status.textContent = '';
        if(mode === 'play'){ currentStreams = streams; currentTitle = `${title} S${se}E${ep}`; showPlayerView(); }
        else {
          const best = streams.sort((a,b)=>(parseInt(b.resolutions)||0)-(parseInt(a.resolutions)||0))[0];
          window.open(best.downloadUrl || `${API}/bff/stream?subjectId=${subjectId}&resolution=${best.resolutions}&download=1`, '_blank');
        }
      }
      document.getElementById('manualPlayBtn')?.addEventListener('click', () => runManual('play'));
      document.getElementById('manualDlBtn')?.addEventListener('click',   () => runManual('dl'));

      if(xcRecommend){
        const recs = extractArray(xcRecommend);
        if(recs?.length){
          const recsHtml = `<h4 style="margin-top:20px;font-family:var(--font-display);letter-spacing:1px;font-size:1.1rem;color:var(--text2);">YOU MAY ALSO LIKE</h4><div class="movie-row" style="margin-bottom:10px;">` +
            recs.slice(0,6).map(rec => {
              const rCover = getCoverUrl(rec) || PLACEHOLDER;
              const rTitle = rec.title||rec.name||'Untitled';
              const rSid   = getSubjectId(rec);
              const rPath  = rec.detailPath||rec.path||'';
              const rType  = rec.subjectType||0;
              return `<div class="movie-card" style="flex:0 0 90px;" data-source="main" data-subjectid="${rSid}" data-detailpath="${rPath}" data-title="${rTitle.replace(/"/g,'&quot;')}" data-cover="${rCover}" data-subjecttype="${rType}"><img class="card-img" src="${rCover}" onerror="this.src='${PLACEHOLDER}'"><div class="card-info"><div class="card-title">${rTitle}</div></div></div>`;
            }).join('') + '</div>';
          modalDynamic.insertAdjacentHTML('beforeend', recsHtml);
          attachCardListeners();
        }
      }

    } catch(e){
      modalDynamic.innerHTML = `<div class="error-message"><p>Failed to load details. Please try again.</p></div>`;
    }
  }

  function showPlayerView(){
    if(!currentStreams.length){ showToast('No streams available'); return; }
    const sorted    = [...currentStreams].sort((a,b) => (parseInt(a.resolutions)||0) - (parseInt(b.resolutions)||0));
    const lowest    = sorted[0];
    const lowestUrl = lowest.proxyUrl || `${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${lowest.resolutions}`;

    let html = `<div class="back-to-info" id="backToInfo">
      <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      Back to details
    </div>
    <video id="playerVideo" class="video-player" controls autoplay muted src="${lowestUrl}"></video>
    <div class="player-toolbar"><div class="quality-selector" id="qualitySelector">`;
    sorted.forEach(s => {
      const q    = s.resolutions || 'auto';
      const sUrl = s.proxyUrl || `${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${q}`;
      html += `<button class="quality-btn" data-url="${sUrl}">${q}p</button>`;
    });
    html += `</div>
      <div style="position:relative;">
        <button class="player-btn" id="playerDownloadBtn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download
        </button>
        <div id="playerDownloadDropdown" class="download-dropdown" style="position:absolute;bottom:100%;left:0;width:220px;"></div>
      </div>
      <button class="player-btn" id="shareBtn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share
      </button>
    </div>
    <h4 style="margin-top:16px;font-family:var(--font-display);letter-spacing:1px;font-size:1.1rem;color:var(--text2);">SIMILAR</h4>
    <div class="movie-row" id="similarMoviesRow"></div>`;
    modalDynamic.innerHTML = html;

    const pdd = document.getElementById('playerDownloadDropdown');
    let ddHtml = '';
    sorted.forEach(s => {
      const dlUrl  = s.downloadUrl || `${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${s.resolutions}&download=1`;
      const sizeMB = s.size ? (s.size/1024/1024).toFixed(1) : '?';
      ddHtml += `<div class="download-item"><span style="font-family:var(--font-mono);font-size:.72rem;">${s.resolutions}p</span><a href="${dlUrl}" target="_blank" rel="noopener noreferrer">${sizeMB} MB</a></div>`;
    });
    pdd.innerHTML = ddHtml;
    document.getElementById('playerDownloadBtn').addEventListener('click', e => { e.stopPropagation(); pdd.classList.toggle('show'); });

    const video = document.getElementById('playerVideo');
    document.querySelectorAll('.quality-btn').forEach(btn => btn.addEventListener('click', () => { video.src = btn.dataset.url; video.play(); }));
    document.getElementById('shareBtn').addEventListener('click', () => {
      if(navigator.share) navigator.share({ title:currentTitle, url:window.location.href }).catch(()=>{});
      else { navigator.clipboard.writeText(window.location.href); showToast('Link copied!'); }
    });
    document.getElementById('backToInfo').addEventListener('click', () => openDetail(currentSubjectId, currentDetailPath, currentTitle, currentCover, 0));

    (async () => {
      const rec  = await xcasper(`/recommend?subjectId=${currentSubjectId}&page=1&perPage=8`);
      const recs = extractArray(rec);
      const row  = document.getElementById('similarMoviesRow');
      if(recs?.length && row){
        row.innerHTML = '';
        recs.slice(0,8).forEach(r => {
          const rCover = getCoverUrl(r) || PLACEHOLDER;
          const rTitle = r.title||r.name||'Untitled';
          const rSid   = getSubjectId(r);
          const rPath  = r.detailPath||r.path||'';
          const card   = document.createElement('div');
          card.className     = 'movie-card';
          card.style.flex    = '0 0 90px';
          card.dataset.source     = 'main';
          card.dataset.subjectid  = rSid;
          card.dataset.detailpath = rPath;
          card.dataset.title      = rTitle;
          card.innerHTML = `<img class="card-img" src="${rCover}" onerror="this.src='${PLACEHOLDER}'"><div class="card-info"><div class="card-title">${rTitle}</div></div>`;
          card.addEventListener('click', () => openDetail(rSid, rPath, rTitle, rCover, 0));
          row.appendChild(card);
        });
      } else if(row){
        row.innerHTML = '<p style="font-size:.8rem;color:var(--text3);">No similar titles found.</p>';
      }
    })();
  }

  async function loadHome(){
    showLoader(true);
    const [home, trending, hot, popular] = await Promise.all([
      xcasper('/homepage'),
      xcasper('/trending?page=0&perPage=18'),
      xcasper('/hot'),
      xcasper('/popular-search')
    ]);
    showLoader(false);
    let html = '';

    const carouselItems = extractArray(trending) || extractArray(hot) || [];
    if(carouselItems.length){
      html += '<div class="hero-carousel" id="heroCarousel"><div class="carousel-track" id="carouselTrack">';
      carouselItems.slice(0,5).forEach(item => {
        const bg   = getBackdropUrl(item) || getCoverUrl(item) || 'https://placehold.co/600x300/0a0a10/9890b8?text=';
        const t    = item.title||item.name||'Featured';
        const sid  = getSubjectId(item);
        const path = item.detailPath||item.path||'';
        html += `<div class="carousel-slide" data-subjectid="${sid}" data-detailpath="${path}" style="background-image:url('${bg}');"><span class="slide-title">${t}</span></div>`;
      });
      html += '</div><div class="carousel-indicators" id="carouselIndicators">';
      carouselItems.slice(0,5).forEach((_,i) => { html += `<span class="carousel-indicator ${i===0?'active':''}"></span>`; });
      html += '</div></div>';
      setTimeout(() => {
        const track      = document.getElementById('carouselTrack');
        const slides     = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.carousel-indicator');
        if(!slides.length) return;
        let cur = 0;
        const total = slides.length;
        let interval = setInterval(() => go(cur+1), 4200);
        function go(n){
          if(n < 0) n = total-1;
          if(n >= total) n = 0;
          cur = n;
          track.style.transform = `translateX(-${cur*100}%)`;
          indicators.forEach((d,i) => d.classList.toggle('active', i===cur));
        }
        let sx;
        track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; clearInterval(interval); }, { passive:true });
        track.addEventListener('touchend',   e => { const diff = e.changedTouches[0].clientX - sx; if(Math.abs(diff)>50) go(diff>0?cur-1:cur+1); interval = setInterval(()=>go(cur+1),4200); }, { passive:true });
        slides.forEach(slide => slide.addEventListener('click', () => {
          const sid = slide.dataset.subjectid, path = slide.dataset.detailpath;
          if(sid && sid !== 'missing') openDetail(sid, path, slide.querySelector('.slide-title')?.textContent, '', 0);
        }));
      }, 100);
    }

    const homeArr  = extractArray(home);
    const trendArr = extractArray(trending);
    const hotArr   = extractArray(hot);
    if(homeArr?.length)  html += renderRow('Recommended',   homeArr,  'fa-home');
    if(trendArr?.length) html += renderRow('Trending Now',  trendArr, 'fa-chart-line');
    if(hotArr?.length)   html += renderRow('Hot This Week', hotArr,   'fa-bolt');

    if(popular?.data && Array.isArray(popular.data)){
      html += `<div class="row-header">${getRowIcon('fa-search')}<h3>Popular Searches</h3></div><div class="chips">`;
      popular.data.slice(0,24).forEach(term => { html += `<span class="chip" data-keyword="${term.replace(/"/g,'&quot;')}">${term}</span>`; });
      html += '</div>';
    }

    if(!html) html = '<div class="error-message"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin-bottom:12px;opacity:.4"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg><p>No content available. Try searching.</p></div>';
    container.innerHTML = html;

    document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', e => {
      const kw = e.target.dataset.keyword;
      if(kw){ searchInput.value = kw; performSearch(kw); }
    }));
    attachCardListeners();
  }

  const performSearch = debounce(async function(keyword){
    if(!keyword) return;
    showLoader(true);
    const [mainRes, ntRes] = await Promise.all([
      xcasper(`/search?keyword=${encodeURIComponent(keyword)}&page=1&perPage=30&subjectType=0`),
      xcasper(`/newtoxic/search?keyword=${encodeURIComponent(keyword)}`)
    ]);
    showLoader(false);

    let html = `<div class="row-header">${getRowIcon('fa-search')}<h3>"${keyword}"</h3><span class="results-back" id="backHome" style="margin-left:auto;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Home</span></div><div class="grid-view">`;

    const mainItems = extractArray(mainRes);
    if(mainItems) mainItems.forEach(item => { html += buildGridCard(item); });

    const ntItems = extractArray(ntRes);
    if(ntItems) ntItems.forEach(item => {
      const cover = item.thumbnail||item.image||PLACEHOLDER;
      const t     = item.title||item.name||'Untitled';
      const path  = item.path||'';
      html += `<div class="movie-card" data-source="newtoxic" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}"><img class="card-img" src="${cover}" onerror="this.src='${PLACEHOLDER}'"><div class="card-info"><div class="card-title">${t}</div></div></div>`;
    });
    html += '</div>';

    if(!mainItems?.length && !ntItems?.length) html = `<div class="error-message"><p>No results for "${keyword}"</p></div>`;
    container.innerHTML = html;
    attachCardListeners();
    document.getElementById('backHome')?.addEventListener('click', loadHome);
  }, 350);

  async function loadSeries(){
    showLoader(true);
    const [featured, latest] = await Promise.all([
      xcasper('/newtoxic/featured'),
      xcasper('/newtoxic/latest?page=1')
    ]);
    showLoader(false);

    let html = `<div class="nt-search-box"><input type="text" id="ntSearchInput" placeholder="Search TV/Series..."><button id="ntSearchBtn" class="btn-secondary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>Search</button></div>`;
    const fArr = extractArray(featured), lArr = extractArray(latest);
    if(fArr?.length) html += renderRow('Featured Series', fArr, 'fa-star');
    if(lArr?.length) html += renderRow('Latest Episodes', lArr, 'fa-download');
    container.innerHTML = html || '<div class="error-message">No series data available.</div>';

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
    if(!items?.length){ container.innerHTML = `<div class="error-message"><p>No results for "${keyword}"</p></div>`; return; }

    let html = `<div class="row-header">${getRowIcon('fa-search')}<h3>Series: "${keyword}"</h3><span class="results-back" id="backSeries" style="margin-left:auto;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back</span></div><div class="grid-view">`;
    items.forEach(item => {
      const cover = item.thumbnail||item.image||PLACEHOLDER;
      const t     = item.title||item.name||'Untitled';
      const path  = item.path||'';
      html += `<div class="movie-card" data-source="newtoxic" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}"><img class="card-img" src="${cover}" onerror="this.src='${PLACEHOLDER}'"><div class="card-info"><div class="card-title">${t}</div></div></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    document.getElementById('backSeries')?.addEventListener('click', loadSeries);
    document.querySelectorAll('.movie-card').forEach(card => card.addEventListener('click', cardClickHandler));
  }

  async function openNtDetail(path, title){
    openModal();
    modalDynamic.innerHTML = '<div class="loader"></div>';
    const detail = await xcasper(`/newtoxic/detail?path=${encodeURIComponent(path)}`);
    if(!detail?.data){ modalDynamic.innerHTML = '<p style="color:var(--text3);padding:20px;">Error loading details.</p>'; return; }
    const data = detail.data;

    let html = `<h2 style="font-family:var(--font-display);font-size:1.5rem;letter-spacing:1px;margin-bottom:12px;">${data.title||title}</h2>`;
    if(data.thumbnail) html += `<img src="${data.thumbnail}" style="width:100%;border-radius:var(--radius);margin:10px 0;">`;
    if(data.storyline) html += `<p style="color:var(--text2);font-size:.85rem;margin-bottom:8px;">${data.storyline}</p>`;
    if(data.genre)     html += `<p style="font-family:var(--font-mono);font-size:.72rem;color:var(--text3);margin-bottom:12px;">GENRE · ${data.genre}</p>`;

    if(data.seasons && Array.isArray(data.seasons)){
      for(let season of data.seasons){
        html += `<div class="nt-folder"><h4>${season.name||'Season'}</h4>`;
        if(season.episodes){
          for(let ep of season.episodes){
            const epId = (ep.path||'').replace(/[^a-zA-Z0-9]/g,'_');
            html += `<div class="nt-file" data-ep-path="${ep.path||''}"><span>${ep.name||'Episode'}</span><button class="nt-load-languages" data-ep-path="${ep.path||''}">Show langs</button></div><div class="episode-languages" id="languages-${epId}" style="margin-left:14px;display:none;"></div>`;
          }
        } else if(season.path){
          html += `<button class="nt-get-files" data-path="${season.path}" style="font-family:var(--font-mono);font-size:.72rem;padding:6px 14px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
        }
        html += '</div>';
      }
    } else if(data.qualities && Array.isArray(data.qualities)){
      for(let q of data.qualities){
        html += `<div class="nt-folder"><h4>${q.quality||'Quality'}</h4>`;
        if(q.path) html += `<button class="nt-get-files" data-path="${q.path}" style="font-family:var(--font-mono);font-size:.72rem;padding:6px 14px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
        html += '</div>';
      }
    } else if(data.path){
      html += `<button class="nt-get-files" data-path="${data.path}" style="font-family:var(--font-mono);font-size:.72rem;padding:6px 14px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
    }
    modalDynamic.innerHTML = html;

    document.querySelectorAll('.nt-load-languages').forEach(btn => {
      btn.addEventListener('click', async () => {
        const epPath = btn.dataset.epPath;
        const langDiv = btn.closest('.nt-file')?.nextElementSibling;
        if(!epPath || !langDiv) return;
        if(langDiv.innerHTML){ langDiv.style.display = langDiv.style.display === 'none' ? 'block' : 'none'; return; }
        langDiv.innerHTML = '<div class="loader" style="width:24px;height:24px;margin:8px auto;"></div>';
        const filesRes = await xcasper(`/newtoxic/files?path=${encodeURIComponent(epPath)}`);
        if(!filesRes?.data){ langDiv.innerHTML = '<p style="font-size:.78rem;color:var(--text3);padding:6px;">No files found</p>'; langDiv.style.display = 'block'; return; }
        const files = filesRes.data;
        let listHtml = '<div style="margin-top:8px;background:var(--bg3);border-radius:var(--radius);padding:8px;border:1px solid var(--border);">';
        files.forEach(f => {
          let lang = 'Unknown';
          if(f.name.match(/hindi/i))     lang = 'Hindi';
          else if(f.name.match(/english/i)) lang = 'English';
          else if(f.name.match(/tamil/i))   lang = 'Tamil';
          else if(f.name.match(/telugu/i))  lang = 'Telugu';
          else if(f.name.match(/malayalam/i)) lang = 'Malayalam';
          else if(f.name.match(/kannada/i))   lang = 'Kannada';
          else if(f.name.match(/bengali/i))   lang = 'Bengali';
          const sizeMB = (f.size/1024/1024).toFixed(1);
          listHtml += `<div class="download-item"><span>${lang} (${sizeMB} MB)</span><div>${f.fid
            ? `<button class="nt-watch" data-fid="${f.fid}" data-name="${f.name}" style="font-family:var(--font-mono);font-size:.62rem;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);padding:3px 10px;border-radius:100px;cursor:pointer;margin-right:4px;">Watch</button><a href="#" class="nt-download-link" data-fid="${f.fid}" style="font-family:var(--font-mono);font-size:.62rem;color:var(--cyan);">Download</a>`
            : ''}</div></div>`;
        });
        listHtml += '</div>';
        langDiv.innerHTML = listHtml;
        langDiv.style.display = 'block';
        langDiv.querySelectorAll('.nt-watch').forEach(watchBtn => {
          watchBtn.addEventListener('click', async ev => {
            const fid     = ev.target.dataset.fid;
            const resolve = await xcasper(`/newtoxic/resolve?fid=${fid}`);
            if(resolve?.data?.url){
              const url = resolve.data.url;
              if(url.includes('.m3u8')){
                modalDynamic.innerHTML = `<h2 style="font-family:var(--font-display);letter-spacing:1px;margin-bottom:12px;">${ev.target.dataset.name||'Video'}</h2><video id="liveVid" class="video-player" controls autoplay></video>`;
                const video = document.getElementById('liveVid');
                if(Hls.isSupported()){ const hls = new Hls(); hls.loadSource(url); hls.attachMedia(video); }
                else video.src = url;
              } else window.open(url, '_blank');
            } else showToast('Failed to get stream link');
          });
        });
        langDiv.querySelectorAll('.nt-download-link').forEach(dlLink => {
          dlLink.addEventListener('click', async ev => {
            ev.preventDefault();
            const fid     = ev.target.dataset.fid;
            const resolve = await xcasper(`/newtoxic/resolve?fid=${fid}`);
            if(resolve?.data?.url) window.open(resolve.data.url, '_blank');
            else showToast('Download failed');
          });
        });
      });
    });

    document.querySelectorAll('.nt-get-files').forEach(btn => {
      btn.addEventListener('click', async e => {
        const folderPath = e.target.dataset.path;
        const filesRes   = await xcasper(`/newtoxic/files?path=${encodeURIComponent(folderPath)}`);
        if(!filesRes?.data) return;
        const files = filesRes.data;
        let listHtml = '<div class="nt-folder"><h4>Files</h4>';
        files.forEach(f => {
          const sizeMB = (f.size/1024/1024).toFixed(1);
          listHtml += `<div class="nt-file"><span>${f.name} (${sizeMB} MB)</span>${f.fid
            ? `<button class="nt-download" data-fid="${f.fid}" style="font-family:var(--font-mono);font-size:.62rem;background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;color:white;padding:4px 12px;border-radius:100px;cursor:pointer;">Download</button>`
            : ''}</div>`;
        });
        listHtml += '</div>';
        e.target.insertAdjacentHTML('afterend', listHtml);
        e.target.disabled = true;
        document.querySelectorAll('.nt-download').forEach(dbtn => {
          dbtn.addEventListener('click', async ev => {
            const fid     = ev.target.dataset.fid;
            const resolve = await xcasper(`/newtoxic/resolve?fid=${fid}`);
            if(resolve?.data?.url) window.open(resolve.data.url, '_blank');
            else showToast('Failed to resolve download link');
          });
        });
      });
    });
  }

  async function loadAnime(){
    let html = `<div class="row-header">${getRowIcon('fa-dragon')}<h3>Anime & Animated</h3></div>
      <div class="anime-search-box">
        <input type="text" id="animeSearchInput" placeholder="Search anime, cartoons... (e.g. Naruto, Demon Slayer)" autocomplete="off">
        <button id="animeSearchBtn" class="btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>Search
        </button>
      </div>
      <div id="animeResultsContainer"></div>`;
    container.innerHTML = html;

    const input      = document.getElementById('animeSearchInput');
    const btn        = document.getElementById('animeSearchBtn');
    const resultsDiv = document.getElementById('animeResultsContainer');

    showLoader(true);
    const res   = await xcasper('/browse?subjectType=5&page=1&perPage=24&orderBy=rating');
    showLoader(false);
    const items = extractArray(res);
    if(items?.length){
      let grid = `<div class="row-header" style="margin-top:8px;">${getRowIcon('fa-star')}<h3>Top Animated</h3></div><div class="grid-view">`;
      items.forEach(item => { grid += buildGridCard(item); });
      grid += '</div>';
      resultsDiv.innerHTML = grid;
      attachCardListeners();
    } else {
      resultsDiv.innerHTML = '<div class="error-message" style="border-style:solid;background:var(--glow2);border-color:rgba(124,92,252,0.2);"><p style="color:var(--accent3);">✦ Search for your favourite anime title above</p></div>';
    }

    const performAnimeSearch = debounce(async function(){
      const query = input.value.trim();
      if(!query){ showToast('Enter a title to search'); return; }
      showLoader(true);
      const res   = await xcasper(`/search?keyword=${encodeURIComponent(query)}&page=1&perPage=30&subjectType=5`);
      showLoader(false);
      const items = extractArray(res);
      if(!items?.length){ resultsDiv.innerHTML = `<div class="error-message"><p>No results for "${query}"</p></div>`; return; }
      let grid = `<div class="row-header" style="margin-top:8px;">${getRowIcon('fa-search')}<h3>"${query}"</h3></div><div class="grid-view">`;
      items.forEach(item => { grid += buildGridCard(item); });
      grid += '</div>';
      resultsDiv.innerHTML = grid;
      attachCardListeners();
    }, 350);

    btn.addEventListener('click', performAnimeSearch);
    input.addEventListener('keypress', e => { if(e.key === 'Enter') performAnimeSearch(); });
  }

  async function loadLiveSports(){
    showLoader(true);
    const liveData = await xcasper('/live');
    showLoader(false);
    if(!liveData?.data?.matchList?.length){
      container.innerHTML = '<div class="error-message"><p>No live sports available at the moment.</p></div>';
      return;
    }
    let html = `<div class="row-header">${getRowIcon('fa-futbol')}<h3>Live Matches</h3></div>`;
    liveData.data.matchList.forEach(match => {
      const title  = `${match.team1.name} vs ${match.team2.name}`;
      const score  = `${match.team1.score} - ${match.team2.score}`;
      const thumb  = match.team1.avatar||match.team2.avatar||'https://placehold.co/600x400/0a0a10/9890b8?text=Live';
      const stream = match.playPath;
      html += `<div class="live-match" data-stream="${stream}" data-title="${title}" data-score="${score}"><img class="live-match-img" src="${thumb}" onerror="this.src='https://placehold.co/600x400/0a0a10/9890b8?text=Live'"><div class="live-match-info"><div class="live-match-title">${title}</div><div class="live-match-score">Score: ${score}</div></div><div class="live-badge">LIVE</div></div>`;
    });
    container.innerHTML = html;
    document.querySelectorAll('.live-match').forEach(match => {
      match.addEventListener('click', () => {
        const streamUrl = match.dataset.stream;
        const title     = match.dataset.title;
        const score     = match.dataset.score;
        if(!streamUrl){ showToast('Stream URL not available'); return; }
        openModal();
        modalDynamic.innerHTML = `<h2 style="font-family:var(--font-display);letter-spacing:1px;margin-bottom:8px;">${title}</h2><p style="font-family:var(--font-mono);color:var(--gold);font-size:1rem;margin-bottom:12px;">${score}</p><div style="background:#000;border-radius:var(--radius);overflow:hidden;position:relative;padding-top:56.25%;"><video id="liveVid" controls autoplay style="position:absolute;inset:0;width:100%;height:100%;"></video></div>`;
        const video = document.getElementById('liveVid');
        if(Hls.isSupported()){ const hls = new Hls(); hls.loadSource(streamUrl); hls.attachMedia(video); }
        else video.src = streamUrl;
      });
    });
  }

  async function loadDiscover(){
    let html = `<div class="row-header">${getRowIcon('fa-compass')}<h3>Discover</h3></div>
    <div class="filter-bar">
      <select id="typeFilter" class="filter-select"><option value="all">All Types</option><option value="1">Movies</option><option value="2">TV Series</option><option value="5">Animated</option></select>
      <select id="genreFilter" class="filter-select"><option value="">Any Genre</option><option value="Action">Action</option><option value="Comedy">Comedy</option><option value="Drama">Drama</option><option value="Horror">Horror</option><option value="Sci-Fi">Sci-Fi</option><option value="Thriller">Thriller</option></select>
      <select id="countryFilter" class="filter-select"><option value="">Any Country</option><option value="United States">US</option><option value="South Korea">Korea</option><option value="United Kingdom">UK</option><option value="Nigeria">Nigeria</option><option value="Japan">Japan</option></select>
      <select id="yearFilter" class="filter-select"><option value="">Any Year</option><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option></select>
      <select id="orderFilter" class="filter-select"><option value="rating">Top Rated</option><option value="releaseDate">Newest</option><option value="hot">Trending</option></select>
      <button id="applyFilters" class="btn-primary" style="flex:unset;padding:7px 18px;">Apply</button>
    </div>
    <div id="browseResults"></div>
    <div class="row-header">${getRowIcon('fa-trophy')}<h3>Rankings</h3></div>
    <div id="rankingCategories" class="chips"></div>
    <div id="rankingResults"></div>`;
    container.innerHTML = html;

    const rankingData = await xcasper('/ranking');
    if(rankingData?.data?.rankingList){
      let chipsHtml = '';
      rankingData.data.rankingList.forEach(cat => { chipsHtml += `<span class="chip" data-rankid="${cat.id}">${cat.name}</span>`; });
      document.getElementById('rankingCategories').innerHTML = chipsHtml;
      document.querySelectorAll('[data-rankid]').forEach(chip => {
        chip.addEventListener('click', async () => {
          document.querySelectorAll('[data-rankid]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          const rankRes    = await xcasper(`/ranking?id=${chip.dataset.rankid}&page=1&perPage=20`);
          const items      = extractArray(rankRes);
          const resultsDiv = document.getElementById('rankingResults');
          if(items?.length){
            let grid = '<div class="grid-view">';
            items.forEach(item => { grid += buildGridCard(item); });
            grid += '</div>';
            resultsDiv.innerHTML = grid;
            attachCardListeners();
          } else {
            resultsDiv.innerHTML = '<p style="color:var(--text3);font-size:.85rem;padding:12px 0;">No items found.</p>';
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
      const res   = await xcasper(url);
      const items = extractArray(res);
      const browseResults = document.getElementById('browseResults');
      if(items?.length){
        let grid = '<div class="grid-view">';
        items.forEach(item => { grid += buildGridCard(item); });
        grid += '</div>';
        browseResults.innerHTML = grid;
        attachCardListeners();
      } else {
        browseResults.innerHTML = '<p style="color:var(--text3);font-size:.85rem;padding:12px 0;">No results found.</p>';
      }
    }

    document.getElementById('applyFilters').addEventListener('click', fetchBrowse);
    fetchBrowse();
  }

  navItems.forEach(item => {
    item.addEventListener('click', async () => {
      const section = item.dataset.section;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if(section === 'home')           await loadHome();
      else if(section === 'trending'){
        showLoader(true);
        const res = await xcasper('/trending?page=0&perPage=24');
        showLoader(false);
        const arr = extractArray(res);
        container.innerHTML = arr?.length
          ? renderRow('Trending Now', arr, 'fa-chart-line')
          : '<div class="error-message"><p>No trending data available.</p></div>';
        attachCardListeners();
      }
      else if(section === 'series')   await loadSeries();
      else if(section === 'anime')    await loadAnime();
      else if(section === 'live')     await loadLiveSports();
      else if(section === 'discover') await loadDiscover();
    });
  });

  searchBtn?.addEventListener('click', () => {
    const kw = searchInput.value.trim();
    if(kw) performSearch(kw);
  });
  searchInput?.addEventListener('keyup', e => { if(e.key === 'Enter') searchBtn?.click(); });

  loadHome();

})();
