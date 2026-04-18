(function(){
  function revert(){
    var a=document.querySelector('.logo');
    if(a&&a.innerText.trim()!=='ᴅᴀʀᴋɴᴏᴠᴀ')a.innerText='ᴅᴀʀᴋɴᴏᴠᴀ';
  }
  setInterval(revert,2000);revert();
})();

(function() {

  const API     = 'https://movieapi.xcasper.space/api';
  const TMDB_KEY = '8265bd1679663a7ea12ac168da84d2e8';
  const TMDB     = 'https://api.themoviedb.org/3';
  const IMG      = 'https://image.tmdb.org/t/p';

  const ANIME_BASE       = 'https://apis.prexzyvilla.site/anime/';
  const animeSearchUrl   = q => `${ANIME_BASE}animesearch?query=${encodeURIComponent(q)}`;
  const animeDetailUrl   = u => `${ANIME_BASE}animedetail?url=${encodeURIComponent(u)}`;
  const animeDownloadUrl = u => `${ANIME_BASE}animedownload?url=${encodeURIComponent(u)}`;

  const PROXY_LIST = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://proxy.cors.sh/',
    'https://thingproxy.freeboard.io/fetch/'
  ];
  let _proxyIdx = 0;

  const container      = document.getElementById('contentContainer');
  const globalLoader   = document.getElementById('globalLoader');
  const searchInput    = document.getElementById('searchInput');
  const searchBtn      = document.getElementById('searchBtn');
  const themeToggle    = document.getElementById('themeToggle');
  const navItems       = document.querySelectorAll('.nav-item');
  const modal          = document.getElementById('detailModal');
  const modalDynamic   = document.getElementById('modalDynamic');
  const closeModalBtn  = document.getElementById('closeModal');

  let currentSubjectId = null, currentDetailPath = null;
  let currentStreams = [], currentTitle = '', currentCover = '';

  function showLoader(show){ if(globalLoader) globalLoader.style.display = show ? 'block' : 'none'; }

  async function xcasper(endpoint){
    try{
      const res = await fetch(`${API}${endpoint}`);
      if(!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async function tmdbFetch(endpoint, params={}){
    try{
      const url = new URL(`${TMDB}/${endpoint}`);
      url.searchParams.set('api_key', TMDB_KEY);
      Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v));
      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
      if(!res.ok) return null;
      return res.json();
    } catch { return null; }
  }

  async function fetchWithProxy(rawUrl, attempt=0){
    if(attempt >= PROXY_LIST.length) throw new Error('All proxies exhausted');
    try{
      const res = await fetch(PROXY_LIST[attempt] + encodeURIComponent(rawUrl), {
        headers: { 'x-requested-with': 'XMLHttpRequest' },
        signal: AbortSignal.timeout(9000)
      });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      _proxyIdx = attempt;
      return res;
    } catch(e){
      return fetchWithProxy(rawUrl, attempt + 1);
    }
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

  function openModal(){ modal.classList.add('active'); document.body.style.overflow='hidden'; }
  function closeModal(){ modal.classList.remove('active'); document.body.style.overflow=''; modalDynamic.innerHTML=''; }

  closeModalBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if(e.target===modal) closeModal(); });
  document.addEventListener('keydown', e => { if(e.key==='Escape') closeModal(); });

  function initTheme(){
    const saved = localStorage.getItem('dn_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const moon = document.getElementById('iconMoon');
    const sun  = document.getElementById('iconSun');
    if(moon) moon.style.display = saved==='dark' ? 'block' : 'none';
    if(sun)  sun.style.display  = saved==='light'? 'block' : 'none';
  }
  themeToggle?.addEventListener('click', () => {
    const cur  = document.documentElement.getAttribute('data-theme')||'dark';
    const next = cur==='dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('dn_theme', next);
    const moon = document.getElementById('iconMoon');
    const sun  = document.getElementById('iconSun');
    if(moon) moon.style.display = next==='dark' ? 'block' : 'none';
    if(sun)  sun.style.display  = next==='light'? 'block' : 'none';
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
  function getRowIcon(icon){ return rowIcons[icon]||rowIcons['fa-film']; }

  function extractArray(data){
    if(!data) return null;
    if(Array.isArray(data)) return data;
    if(data.data){
      if(Array.isArray(data.data)) return data.data;
      if(data.data.items && Array.isArray(data.data.items)) return data.data.items;
      if(typeof data.data==='object') for(let k in data.data) if(Array.isArray(data.data[k])) return data.data[k];
    }
    if(data.items && Array.isArray(data.items)) return data.items;
    if(data.results && Array.isArray(data.results)) return data.results;
    if(data.animeList && Array.isArray(data.animeList)) return data.animeList;
    return null;
  }

  function getSubjectId(item){ return item.subjectId||item.id||item._id||item.movieId||item.showId||item.contentId||item.guid||'missing'; }

  function getCoverUrl(item){
    if(!item) return null;
    if(typeof item.cover==='string'&&item.cover) return item.cover;
    if(typeof item.poster==='string'&&item.poster) return item.poster;
    if(typeof item.thumbnail==='string'&&item.thumbnail) return item.thumbnail;
    if(typeof item.image==='string'&&item.image) return item.image;
    if(typeof item.backdrop==='string'&&item.backdrop) return item.backdrop;
    if(item.cover?.url) return item.cover.url;
    if(item.poster?.url) return item.poster.url;
    if(item.thumbnail?.url) return item.thumbnail.url;
    return null;
  }

  function getBackdropUrl(item){
    if(!item) return null;
    if(typeof item.backdrop==='string'&&item.backdrop) return item.backdrop;
    if(item.backdrop?.url) return item.backdrop.url;
    return getCoverUrl(item);
  }

  function renderRow(title, items, icon='fa-film'){
    if(!items?.length) return '';
    let html = `<div class="row-header">${getRowIcon(icon)}<h3>${title}</h3></div><div class="movie-row">`;
    items.slice(0,15).forEach(item => {
      const t          = item.title||item.name||item.originalTitle||'Untitled';
      const year       = item.releaseDate?item.releaseDate.slice(0,4):(item.year||'');
      const rating     = item.imdbRatingValue||item.imdbRating||item.rating||'N/A';
      const cover      = getCoverUrl(item)||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
      const subjectId  = getSubjectId(item);
      const detailPath = item.detailPath||item.path||'';
      const subType    = item.subjectType||0;
      html += `<div class="movie-card" data-source="main" data-subjectid="${subjectId}" data-detailpath="${detailPath}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}" data-rating="${rating}" data-year="${year}" data-subjecttype="${subType}">
        <img class="card-img" src="${cover}" loading="lazy" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'">
        <div class="card-info">
          <div class="card-title">${t}</div>
          <div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div>
        </div>
      </div>`;
    });
    html += '</div>';
    return html;
  }

  function attachCardListeners(){
    document.querySelectorAll('.movie-card').forEach(card => {
      card.removeEventListener('click', cardClickHandler);
      card.addEventListener('click', cardClickHandler);
    });
  }

  async function cardClickHandler(e){
    const card       = e.currentTarget;
    const source     = card.dataset.source||'main';
    const subjectId  = card.dataset.subjectid;
    const detailPath = card.dataset.detailpath;
    const title      = card.dataset.title;
    const cover      = card.dataset.cover;
    const subType    = parseInt(card.dataset.subjecttype)||0;
    if(source==='newtoxic'){
      if(!detailPath){ showToast('⚠️ No detail path'); return; }
      await openNtDetail(detailPath, title);
    } else {
      if(subjectId==='missing'){ showToast('⚠️ No details available'); return; }
      await openDetail(subjectId, detailPath, title, cover, subType);
    }
  }

  async function openDetail(subjectId, detailPath, fallbackTitle, fallbackCover, subjectType){
    if(!subjectId||subjectId==='missing'){ showToast('⚠️ No valid subject ID'); return; }
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
      let title       = fallbackTitle||'No title';
      let xcImdb      = 'N/A';
      let genre       = 'Unknown';
      let desc        = '';
      let streams     = [];
      let audioTracks = [];
      let isSeries    = subjectType===2;

      if(xcDetail?.data){
        const d = xcDetail.data;
        coverUrl    = getCoverUrl(d)||coverUrl;
        backdropImg = getBackdropUrl(d)||coverUrl;
        title       = d.title||title;
        xcImdb      = d.imdbRatingValue||d.imdbRating||xcImdb;
        genre       = Array.isArray(d.genre)?d.genre.join(', '):(d.genre||genre);
        desc        = d.description||d.storyline||d.overview||'';
        if(d.subjectType) isSeries = d.subjectType===2;
      }
      if(xcPlay?.data){
        streams     = xcPlay.data.streams||[];
        audioTracks = xcPlay.data.audioTracks||[];
      }

      currentSubjectId  = subjectId;
      currentDetailPath = detailPath;
      currentStreams     = streams;
      currentTitle      = title;
      currentCover      = coverUrl;

      let tmdbDesc   = '';
      let tmdbCast   = '';
      let tmdbTrailer= null;
      let tmdbRating = '';

      try{
        const tmdbSearch = await tmdbFetch('search/multi', { query:title, page:1 });
        const tmdbMatch  = (tmdbSearch?.results||[]).find(r => r.media_type!=='person');
        if(tmdbMatch){
          const tmdbType = tmdbMatch.media_type==='tv' ? 'tv' : 'movie';
          const [tmdbDetail, tmdbCredits, tmdbVideos] = await Promise.all([
            tmdbFetch(`${tmdbType}/${tmdbMatch.id}`),
            tmdbFetch(`${tmdbType}/${tmdbMatch.id}/credits`),
            tmdbFetch(`${tmdbType}/${tmdbMatch.id}/videos`),
          ]);
          if(tmdbDetail){
            tmdbDesc   = tmdbDetail.overview||'';
            tmdbRating = tmdbDetail.vote_average ? `${tmdbDetail.vote_average.toFixed(1)}/10` : '';
          }
          if(tmdbCredits){
            tmdbCast = (tmdbCredits.cast||[]).slice(0,5).map(c=>c.name).join(', ');
          }
          if(tmdbVideos){
            tmdbTrailer = (tmdbVideos.results||[]).find(v=>v.type==='Trailer'&&v.site==='YouTube')||tmdbVideos.results?.[0]||null;
          }
          if(!coverUrl&&tmdbDetail?.poster_path){
            coverUrl = `${IMG}/w342${tmdbDetail.poster_path}`;
          }
          if(!backdropImg&&tmdbDetail?.backdrop_path){
            backdropImg = `${IMG}/w1280${tmdbDetail.backdrop_path}`;
          }
        }
      } catch{}

      const finalDesc = desc || tmdbDesc || 'No description available.';

      let html = `<div class="info-backdrop">
        <img class="backdrop-img" src="${backdropImg||coverUrl||'https://placehold.co/500x750/0a0a10/9890b8?text='}" onerror="this.src='https://placehold.co/500x750/0a0a10/9890b8?text='">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,16,.98) 0%,rgba(10,10,16,.4) 100%);pointer-events:none;"></div>
        <div class="info-content">
          <img class="info-poster" src="${coverUrl||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'">
          <div class="info-text">
            <div class="imdb-row">
              <span class="imdb-badge">IMDb</span>
              <span>${xcImdb}</span>
              ${tmdbRating ? `<span style="opacity:.5">·</span><span style="color:var(--accent2);">${tmdbRating} TMDB</span>` : ''}
              <span style="opacity:.5">·</span>
              <span>${genre}</span>
            </div>
            <h2>${title}</h2>
            ${tmdbCast ? `<div class="imdb-row" style="margin-top:4px;flex-wrap:wrap;"><span style="color:var(--text3);font-family:var(--font-mono);font-size:.62rem;letter-spacing:.08em;">CAST:</span><span style="color:var(--text2);font-size:.7rem;">${tmdbCast}</span></div>` : ''}
            <p>${finalDesc}</p>
            <div class="button-group">
              <button class="btn-primary" id="playBtnInfo">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> PLAY
              </button>
              ${tmdbTrailer ? `<button class="btn-secondary" id="trailerBtn" style="background:linear-gradient(135deg,#ef4444,#dc2626);">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> TRAILER
              </button>` : ''}
              <button class="btn-secondary" id="downloadBtnInfo">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> DOWNLOAD
              </button>
            </div>
            <div id="downloadDropdownInfo" class="download-dropdown"></div>
          </div>
        </div>
      </div>`;

      if(isSeries && xcDetail?.data?.seasons){
        html += '<h3 class="season-header">Seasons & Episodes</h3>';
        xcDetail.data.seasons.forEach(season => {
          html += `<div class="nt-folder"><h4>${season.name||'Season '+(season.seasonNumber||'')}</h4>`;
          (season.episodes||[]).forEach(ep => {
            html += `<div class="nt-file"><span>${ep.name||'Episode '+ep.episodeNumber}</span><button class="play-episode" data-se="${season.seasonNumber||1}" data-ep="${ep.episodeNumber||1}">▶ Play</button></div>`;
          });
          html += '</div>';
        });
      }

      if(audioTracks.length){
        html += '<div class="player-toolbar"><div class="audio-selector" id="audioSelector">';
        audioTracks.forEach(track => { html += `<button class="audio-btn" data-lang="${track.languageCode||track.language}">${track.language}</button>`; });
        html += '</div></div>';
      }

      modalDynamic.innerHTML = html;

      const downloadBtn      = document.getElementById('downloadBtnInfo');
      const downloadDropdown = document.getElementById('downloadDropdownInfo');
      if(streams.length){
        let ddHtml = '';
        streams.forEach(s => {
          const dlUrl  = s.downloadUrl||`${API}/bff/stream?subjectId=${subjectId}&resolution=${s.resolutions}&download=1`;
          const sizeMB = s.size?(s.size/1024/1024).toFixed(1):'?';
          ddHtml += `<div class="download-item">
            <span style="font-family:var(--font-mono);font-size:.72rem;">${s.resolutions}p</span>
            <a href="${dlUrl}" target="_blank">
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

      document.getElementById('trailerBtn')?.addEventListener('click', () => {
        if(!tmdbTrailer){ showToast('No trailer available'); return; }
        modalDynamic.innerHTML = `
          <button id="backToDetail" style="display:flex;align-items:center;gap:8px;background:none;border:none;color:var(--accent2);font-family:var(--font-mono);font-size:.72rem;cursor:pointer;letter-spacing:.08em;padding:12px 0 8px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> BACK
          </button>
          <div style="background:#000;border-radius:var(--radius);overflow:hidden;position:relative;padding-top:56.25%;">
            <iframe src="https://www.youtube.com/embed/${tmdbTrailer.key}?autoplay=1" style="position:absolute;inset:0;width:100%;height:100%;border:none;" allowfullscreen allow="autoplay"></iframe>
          </div>`;
        document.getElementById('backToDetail')?.addEventListener('click', () => openDetail(subjectId, detailPath, title, coverUrl, subjectType));
      });

      if(audioTracks.length){
        document.querySelectorAll('.audio-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const lang = btn.dataset.lang;
            const newPlay = await xcasper(`/play?subjectId=${subjectId}&detailPath=${detailPath||''}&lang=${lang}`);
            if(newPlay?.data?.streams){ currentStreams=newPlay.data.streams; showPlayerView(); }
            else showToast('Audio track not available');
          });
        });
      }

      document.querySelectorAll('.play-episode').forEach(btn => {
        btn.addEventListener('click', async () => {
          const se=btn.dataset.se, ep=btn.dataset.ep;
          const epPlay = await xcasper(`/play?subjectId=${subjectId}&se=${se}&ep=${ep}`);
          if(epPlay?.data?.streams){ currentStreams=epPlay.data.streams; currentTitle=`${title} S${se}E${ep}`; showPlayerView(); }
          else showToast('Episode not available');
        });
      });

      if(xcRecommend){
        const recs = extractArray(xcRecommend);
        if(recs?.length){
          const recsHtml = `<h4 style="margin-top:20px;font-family:var(--font-display);letter-spacing:1px;font-size:1.1rem;color:var(--text2);">YOU MAY ALSO LIKE</h4><div class="movie-row" style="margin-bottom:10px;">` +
            recs.slice(0,6).map(rec => {
              const rCover=getCoverUrl(rec)||'https://placehold.co/200x300';
              const rTitle=rec.title||rec.name||'Untitled';
              const rSid=getSubjectId(rec); const rPath=rec.detailPath||rec.path||''; const rType=rec.subjectType||0;
              return `<div class="movie-card" style="flex:0 0 90px;" data-source="main" data-subjectid="${rSid}" data-detailpath="${rPath}" data-title="${rTitle.replace(/"/g,'&quot;')}" data-cover="${rCover}" data-subjecttype="${rType}"><img class="card-img" src="${rCover}" onerror="this.src='https://placehold.co/200x300'"><div class="card-info"><div class="card-title">${rTitle}</div></div></div>`;
            }).join('') + '</div>';
          modalDynamic.insertAdjacentHTML('beforeend', recsHtml);
          attachCardListeners();
        }
      }

    } catch(e){
      modalDynamic.innerHTML = `<div class="error-message"><p>Failed to load details: ${e.message}</p></div>`;
    }
  }

  function showPlayerView(){
    if(!currentStreams.length){ showToast('No streams available'); return; }
    const sorted  = [...currentStreams].sort((a,b)=>(parseInt(a.resolutions)||0)-(parseInt(b.resolutions)||0));
    const lowest  = sorted[0];
    const lowestUrl = lowest.proxyUrl||`${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${lowest.resolutions}`;
    let html = `<div class="back-to-info" id="backToInfo">
      <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      Back to details
    </div>
    <video id="playerVideo" class="video-player" controls autoplay muted src="${lowestUrl}"></video>
    <div class="player-toolbar"><div class="quality-selector" id="qualitySelector">`;
    sorted.forEach(s => {
      const q = s.resolutions||'auto';
      const sUrl = s.proxyUrl||`${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${q}`;
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
      const dlUrl  = s.downloadUrl||`${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${s.resolutions}&download=1`;
      const sizeMB = s.size?(s.size/1024/1024).toFixed(1):'?';
      ddHtml += `<div class="download-item"><span style="font-family:var(--font-mono);font-size:.72rem;">${s.resolutions}p</span><a href="${dlUrl}" target="_blank">${sizeMB} MB</a></div>`;
    });
    pdd.innerHTML = ddHtml;
    document.getElementById('playerDownloadBtn').addEventListener('click', e => { e.stopPropagation(); pdd.classList.toggle('show'); });

    const video = document.getElementById('playerVideo');
    document.querySelectorAll('.quality-btn').forEach(btn => btn.addEventListener('click', () => { video.src=btn.dataset.url; video.play(); }));
    document.getElementById('shareBtn').addEventListener('click', () => {
      if(navigator.share) navigator.share({ title:currentTitle, url:window.location.href }).catch(()=>{});
      else { navigator.clipboard.writeText(window.location.href); showToast('Link copied!'); }
    });
    document.getElementById('backToInfo').addEventListener('click', () => openDetail(currentSubjectId, currentDetailPath, currentTitle, currentCover, 0));

    (async () => {
      const rec = await xcasper(`/recommend?subjectId=${currentSubjectId}&page=1&perPage=8`);
      const recs = extractArray(rec);
      const row  = document.getElementById('similarMoviesRow');
      if(recs?.length){
        row.innerHTML = '';
        recs.slice(0,8).forEach(r => {
          const rCover=getCoverUrl(r)||'https://placehold.co/200x300';
          const rTitle=r.title||r.name||'Untitled';
          const rSid=getSubjectId(r); const rPath=r.detailPath||r.path||'';
          const card=document.createElement('div'); card.className='movie-card'; card.style.flex='0 0 90px';
          card.dataset.source='main'; card.dataset.subjectid=rSid; card.dataset.detailpath=rPath; card.dataset.title=rTitle;
          card.innerHTML=`<img class="card-img" src="${rCover}" onerror="this.src='https://placehold.co/200x300'"><div class="card-info"><div class="card-title">${rTitle}</div></div>`;
          card.addEventListener('click', () => openDetail(rSid, rPath, rTitle, rCover, 0));
          row.appendChild(card);
        });
      } else if(row){ row.innerHTML='<p style="font-size:.8rem;color:var(--text3);">No similar movies found.</p>'; }
    })();
  }

  async function loadHome(){
    showLoader(true);
    const [home, trending, hot, popular, randomAnime] = await Promise.all([
      xcasper('/homepage'),
      xcasper('/trending?page=0&perPage=18'),
      xcasper('/hot'),
      xcasper('/popular-search'),
      fetchRandomAnime(5)
    ]);
    showLoader(false);
    let html = '';
    const carouselItems = extractArray(trending)||extractArray(hot)||[];
    if(carouselItems.length){
      html += '<div class="hero-carousel" id="heroCarousel"><div class="carousel-track" id="carouselTrack">';
      carouselItems.slice(0,5).forEach(item => {
        const bg   = getBackdropUrl(item)||getCoverUrl(item)||'https://placehold.co/600x300/0a0a10/9890b8?text=';
        const t    = item.title||item.name||'Featured';
        const sid  = getSubjectId(item);
        const path = item.detailPath||item.path||'';
        html += `<div class="carousel-slide" data-subjectid="${sid}" data-detailpath="${path}" style="background-image:url('${bg}');"><span class="slide-title">${t}</span></div>`;
      });
      html += '</div><div class="carousel-indicators" id="carouselIndicators">';
      carouselItems.slice(0,5).forEach((_,i) => { html += `<span class="carousel-indicator ${i===0?'active':''}"></span>`; });
      html += '</div></div>';
      setTimeout(() => {
        const track = document.getElementById('carouselTrack');
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.carousel-indicator');
        if(!slides.length) return;
        let cur=0, total=slides.length;
        let interval = setInterval(() => go(cur+1), 4200);
        function go(n){ if(n<0)n=total-1; if(n>=total)n=0; cur=n; track.style.transform=`translateX(-${cur*100}%)`; indicators.forEach((d,i)=>d.classList.toggle('active',i===cur)); }
        let sx;
        track.addEventListener('touchstart', e=>{sx=e.touches[0].clientX; clearInterval(interval);},{passive:true});
        track.addEventListener('touchend', e=>{ const diff=e.changedTouches[0].clientX-sx; if(Math.abs(diff)>50) go(diff>0?cur-1:cur+1); interval=setInterval(()=>go(cur+1),4200);},{passive:true});
        slides.forEach(slide => slide.addEventListener('click', () => {
          const sid=slide.dataset.subjectid, path=slide.dataset.detailpath;
          if(sid&&sid!=='missing') openDetail(sid, path, slide.querySelector('.slide-title')?.textContent, '', 0);
        }));
      }, 100);
    }
    const homeArr    = extractArray(home);
    const trendArr   = extractArray(trending);
    const hotArr     = extractArray(hot);
    if(homeArr?.length)  html += renderRow('Recommended',   homeArr,  'fa-home');
    if(trendArr?.length) html += renderRow('Trending Now',  trendArr, 'fa-chart-line');
    if(hotArr?.length)   html += renderRow('Hot This Week', hotArr,   'fa-bolt');
    if(randomAnime?.length){
      html += `<div class="row-header">${getRowIcon('fa-dragon')}<h3>ANIME</h3></div><div class="movie-row">`;
      randomAnime.forEach(anime => {
        const cover = anime.image||anime.thumbnail||'https://placehold.co/300x450/0a0a10/9890b8?text=Anime';
        const t     = anime.title||'Unknown';
        const url   = anime.url||'';
        html += `<div class="movie-card anime-home-card" data-anime-url="${url}" data-anime-title="${t.replace(/"/g,'&quot;')}" style="flex:0 0 112px;">
          <img class="card-img" src="${cover}" loading="lazy" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=Anime'">
          <div class="card-info"><div class="card-title">${t}</div></div>
        </div>`;
      });
      html += '</div>';
    }
    if(popular?.data&&Array.isArray(popular.data)){
      html += `<div class="row-header">${getRowIcon('fa-search')}<h3>Popular Searches</h3></div><div class="chips">`;
      popular.data.slice(0,24).forEach(term => { html += `<span class="chip" data-keyword="${term.replace(/"/g,'&quot;')}">${term}</span>`; });
      html += '</div>';
    }
    if(!html) html = '<div class="error-message"><i class="fas fa-film fa-3x"></i><p>No content available. Try searching.</p></div>';
    container.innerHTML = html;
    document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', e => {
      const kw=e.target.dataset.keyword; if(kw){ searchInput.value=kw; performSearch(kw); }
    }));
    document.querySelectorAll('.anime-home-card').forEach(card => {
      card.addEventListener('click', async () => {
        const url=card.dataset.animeUrl, t=card.dataset.animeTitle;
        if(!url){ showToast('Detail URL missing'); return; }
        await showAnimeDetail(url, t, card.querySelector('img')?.src);
      });
    });
    attachCardListeners();
  }

  async function performSearch(keyword){
    showLoader(true);
    const [mainRes, ntRes] = await Promise.all([
      xcasper(`/search?keyword=${encodeURIComponent(keyword)}&page=1&perPage=30&subjectType=0`),
      xcasper(`/newtoxic/search?keyword=${encodeURIComponent(keyword)}`)
    ]);
    showLoader(false);
    let html = `<div class="row-header">${getRowIcon('fa-search')}<h3>"${keyword}"</h3><span class="results-back" id="backHome" style="margin-left:auto;">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Home</span></div><div class="grid-view">`;
    const mainItems = extractArray(mainRes);
    if(mainItems) mainItems.forEach(item => {
      const cover=getCoverUrl(item)||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
      const t=item.title||'Untitled'; const year=item.releaseDate?item.releaseDate.slice(0,4):(item.year||'');
      const rating=item.imdbRatingValue||item.imdbRating||item.rating||'N/A';
      const sid=getSubjectId(item); const path=item.detailPath||item.path||''; const stype=item.subjectType||0;
      html += `<div class="movie-card" data-source="main" data-subjectid="${sid}" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}" data-rating="${rating}" data-year="${year}" data-subjecttype="${stype}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${t}</div><div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div></div></div>`;
    });
    const ntItems = extractArray(ntRes);
    if(ntItems) ntItems.forEach(item => {
      const cover=item.thumbnail||item.image||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
      const t=item.title||item.name||'Untitled'; const path=item.path||'';
      html += `<div class="movie-card" data-source="newtoxic" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${t}</div></div></div>`;
    });
    html += '</div>';
    if(!mainItems?.length&&!ntItems?.length) html = `<div class="error-message"><p>No results for "${keyword}"</p></div>`;
    container.innerHTML = html;
    attachCardListeners();
    document.getElementById('backHome')?.addEventListener('click', loadHome);
  }

  async function loadSeries(){
    showLoader(true);
    const [featured, latest] = await Promise.all([xcasper('/newtoxic/featured'), xcasper('/newtoxic/latest?page=1')]);
    showLoader(false);
    let html = `<div class="nt-search-box"><input type="text" id="ntSearchInput" placeholder="Search TV/Series..."><button id="ntSearchBtn" class="btn-secondary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>Search</button></div>`;
    const fArr=extractArray(featured), lArr=extractArray(latest);
    if(fArr?.length) html += renderRow('Featured Series', fArr, 'fa-star');
    if(lArr?.length) html += renderRow('Latest Episodes', lArr, 'fa-download');
    container.innerHTML = html||'<div class="error-message">No series data</div>';
    document.getElementById('ntSearchBtn')?.addEventListener('click', () => { const kw=document.getElementById('ntSearchInput').value.trim(); if(kw) searchNewToxic(kw); });
    document.getElementById('ntSearchInput')?.addEventListener('keyup', e => { if(e.key==='Enter') document.getElementById('ntSearchBtn').click(); });
    document.querySelectorAll('.movie-card').forEach(card => { card.dataset.source='newtoxic'; card.removeEventListener('click', cardClickHandler); card.addEventListener('click', cardClickHandler); });
  }

  async function searchNewToxic(keyword){
    showLoader(true);
    const res = await xcasper(`/newtoxic/search?keyword=${encodeURIComponent(keyword)}`);
    showLoader(false);
    const items = extractArray(res);
    if(!items?.length){ container.innerHTML=`<div class="error-message">No results for "${keyword}"</div>`; return; }
    let html = `<div class="row-header">${getRowIcon('fa-search')}<h3>Series: "${keyword}"</h3><span class="results-back" id="backSeries" style="margin-left:auto;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back</span></div><div class="grid-view">`;
    items.forEach(item => {
      const cover=item.thumbnail||item.image||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
      const t=item.title||item.name||'Untitled'; const path=item.path||'';
      html += `<div class="movie-card" data-source="newtoxic" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${t}</div></div></div>`;
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
    if(!detail?.data){ modalDynamic.innerHTML='<p style="color:var(--text3);">Error loading details</p>'; return; }
    const data = detail.data;
    let html = `<h2 style="font-family:var(--font-display);font-size:1.5rem;letter-spacing:1px;margin-bottom:12px;">${data.title||title}</h2>`;
    if(data.thumbnail) html += `<img src="${data.thumbnail}" style="width:100%;border-radius:var(--radius);margin:10px 0;">`;
    if(data.storyline) html += `<p style="color:var(--text2);font-size:.85rem;margin-bottom:8px;">${data.storyline}</p>`;
    if(data.genre) html += `<p style="font-family:var(--font-mono);font-size:.72rem;color:var(--text3);margin-bottom:12px;">GENRE · ${data.genre}</p>`;
    if(data.seasons&&Array.isArray(data.seasons)){
      for(let season of data.seasons){
        html += `<div class="nt-folder"><h4>${season.name||'Season'}</h4>`;
        if(season.episodes){
          for(let ep of season.episodes){
            html += `<div class="nt-file" data-ep-path="${ep.path||''}"><span>${ep.name||'Episode'}</span><button class="nt-load-languages" data-ep-path="${ep.path||''}">Show langs</button></div><div class="episode-languages" id="languages-${(ep.path||'').replace(/[^a-zA-Z0-9]/g,'_')}" style="margin-left:14px;display:none;"></div>`;
          }
        } else if(season.path) html += `<button class="nt-get-files" data-path="${season.path}" style="font-family:var(--font-mono);font-size:.72rem;padding:6px 14px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
        html += '</div>';
      }
    } else if(data.qualities&&Array.isArray(data.qualities)){
      for(let q of data.qualities){
        html += `<div class="nt-folder"><h4>${q.quality||'Quality'}</h4>`;
        if(q.path) html += `<button class="nt-get-files" data-path="${q.path}" style="font-family:var(--font-mono);font-size:.72rem;padding:6px 14px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
        html += '</div>';
      }
    } else if(data.path) html += `<button class="nt-get-files" data-path="${data.path}" style="font-family:var(--font-mono);font-size:.72rem;padding:6px 14px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
    modalDynamic.innerHTML = html;
    document.querySelectorAll('.nt-load-languages').forEach(btn => {
      btn.addEventListener('click', async e => {
        const epPath = btn.dataset.epPath;
        const langDiv = btn.closest('.nt-file')?.nextElementSibling;
        if(!epPath||!langDiv) return;
        if(langDiv.innerHTML){ langDiv.style.display=langDiv.style.display==='none'?'block':'none'; return; }
        langDiv.innerHTML = '<div class="loader" style="width:24px;height:24px;margin:8px auto;"></div>';
        const filesRes = await xcasper(`/newtoxic/files?path=${encodeURIComponent(epPath)}`);
        if(!filesRes?.data){ langDiv.innerHTML='<p style="font-size:.78rem;color:var(--text3);padding:6px;">No files found</p>'; langDiv.style.display='block'; return; }
        const files = filesRes.data;
        let listHtml = '<div style="margin-top:8px;background:var(--bg3);border-radius:var(--radius);padding:8px;border:1px solid var(--border);">';
        files.forEach(f => {
          let lang='Unknown';
          if(f.name.match(/hindi/i)) lang='Hindi'; else if(f.name.match(/english/i)) lang='English';
          else if(f.name.match(/tamil/i)) lang='Tamil'; else if(f.name.match(/telugu/i)) lang='Telugu';
          else if(f.name.match(/malayalam/i)) lang='Malayalam'; else if(f.name.match(/kannada/i)) lang='Kannada';
          else if(f.name.match(/bengali/i)) lang='Bengali';
          listHtml += `<div class="download-item"><span>${lang} (${(f.size/1024/1024).toFixed(1)} MB)</span><div>${f.fid?`<button class="nt-watch" data-fid="${f.fid}" data-name="${f.name}" style="font-family:var(--font-mono);font-size:.62rem;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);padding:3px 10px;border-radius:100px;cursor:pointer;margin-right:4px;">Watch</button><a href="#" class="nt-download-link" data-fid="${f.fid}" style="font-family:var(--font-mono);font-size:.62rem;color:var(--cyan);">Download</a>`:''}</div></div>`;
        });
        listHtml += '</div>';
        langDiv.innerHTML = listHtml;
        langDiv.style.display = 'block';
        langDiv.querySelectorAll('.nt-watch').forEach(watchBtn => {
          watchBtn.addEventListener('click', async ev => {
            const fid = ev.target.dataset.fid;
            const resolve = await xcasper(`/newtoxic/resolve?fid=${fid}`);
            if(resolve?.data?.url){
              const url = resolve.data.url;
              if(url.includes('.m3u8')){
                modalDynamic.innerHTML = `<h2 style="font-family:var(--font-display);letter-spacing:1px;margin-bottom:12px;">${ev.target.dataset.name||'Video'}</h2><video id="liveVid" class="video-player" controls autoplay></video>`;
                const video = document.getElementById('liveVid');
                if(Hls.isSupported()){ const hls=new Hls(); hls.loadSource(url); hls.attachMedia(video); }
                else video.src = url;
              } else window.open(url,'_blank');
            } else showToast('Failed to get stream link');
          });
        });
        langDiv.querySelectorAll('.nt-download-link').forEach(dlLink => {
          dlLink.addEventListener('click', async ev => {
            ev.preventDefault();
            const fid = ev.target.dataset.fid;
            const resolve = await xcasper(`/newtoxic/resolve?fid=${fid}`);
            if(resolve?.data?.url) window.open(resolve.data.url,'_blank');
            else showToast('Download failed');
          });
        });
      });
    });
    document.querySelectorAll('.nt-get-files').forEach(btn => {
      btn.addEventListener('click', async e => {
        const folderPath = e.target.dataset.path;
        const filesRes = await xcasper(`/newtoxic/files?path=${encodeURIComponent(folderPath)}`);
        if(!filesRes?.data) return;
        const files = filesRes.data;
        let listHtml = '<div class="nt-folder"><h4>Files</h4>';
        files.forEach(f => {
          listHtml += `<div class="nt-file"><span>${f.name} (${(f.size/1024/1024).toFixed(1)} MB)</span>${f.fid?`<button class="nt-download" data-fid="${f.fid}" style="font-family:var(--font-mono);font-size:.62rem;background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;color:white;padding:4px 12px;border-radius:100px;cursor:pointer;">Download</button>`:''}</div>`;
        });
        listHtml += '</div>';
        e.target.insertAdjacentHTML('afterend', listHtml);
        e.target.disabled = true;
        document.querySelectorAll('.nt-download').forEach(dbtn => {
          dbtn.addEventListener('click', async ev => {
            const fid = ev.target.dataset.fid;
            const resolve = await xcasper(`/newtoxic/resolve?fid=${fid}`);
            if(resolve?.data?.url) window.open(resolve.data.url,'_blank');
            else showToast('Failed to resolve download link');
          });
        });
      });
    });
  }

  async function fetchRandomAnime(limit=5){
    try{
      const res  = await fetchWithProxy(animeSearchUrl('a'), _proxyIdx);
      const data = await res.json();
      let items = [];
      if(data?.data?.results&&Array.isArray(data.data.results)) items=data.data.results;
      else if(data?.results&&Array.isArray(data.results)) items=data.results;
      else if(data?.data&&Array.isArray(data.data)) items=data.data;
      else if(Array.isArray(data)) items=data;
      for(let i=items.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [items[i],items[j]]=[items[j],items[i]]; }
      return items.slice(0,limit);
    } catch { return []; }
  }

  async function loadAnime(){
    let html = `<div class="row-header">${getRowIcon('fa-dragon')}<h3>Anime Search</h3></div>
      <div class="anime-search-box">
        <input type="text" id="animeSearchInput" placeholder="Search anime... (e.g. Naruto, One Piece)" autocomplete="off">
        <button id="animeSearchBtn" class="btn-primary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>Search</button>
      </div>
      <div id="animeResultsContainer"><div class="error-message" style="border-style:solid;background:var(--glow2);border-color:rgba(124,92,252,0.2);"><p style="color:var(--accent3);">✦ Enter an anime title to start searching</p></div></div>`;
    container.innerHTML = html;
    const input = document.getElementById('animeSearchInput');
    const btn   = document.getElementById('animeSearchBtn');
    const resultsDiv = document.getElementById('animeResultsContainer');
    async function performAnimeSearch(){
      const query = input.value.trim();
      if(!query){ showToast('Enter an anime title'); return; }
      showLoader(true);
      try{
        const res  = await fetchWithProxy(animeSearchUrl(query), _proxyIdx);
        const data = await res.json();
        let items = [];
        if(data?.data?.results&&Array.isArray(data.data.results)) items=data.data.results;
        else if(data?.results&&Array.isArray(data.results)) items=data.results;
        else if(data?.data&&Array.isArray(data.data)) items=data.data;
        else if(Array.isArray(data)) items=data;
        if(!items.length){ resultsDiv.innerHTML=`<div class="error-message"><p>No anime found for "${query}"</p></div>`; return; }
        let gridHtml = '<div class="grid-view">';
        items.forEach(anime => {
          const t    = anime.title||'Unknown';
          const cover= anime.image||anime.thumbnail||'https://placehold.co/300x450/0a0a10/9890b8?text=Anime';
          const url  = anime.url||'';
          gridHtml += `<div class="movie-card anime-card" data-anime-url="${url}" data-anime-title="${t.replace(/"/g,'&quot;')}">
            <img class="card-img" src="${cover}" loading="lazy" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=Anime'">
            <div class="card-info"><div class="card-title">${t}</div></div>
          </div>`;
        });
        gridHtml += '</div>';
        resultsDiv.innerHTML = gridHtml;
        document.querySelectorAll('.anime-card').forEach(card => {
          card.addEventListener('click', async () => {
            const url=card.dataset.animeUrl, t=card.dataset.animeTitle;
            if(!url){ showToast('Detail URL missing'); return; }
            await showAnimeDetail(url, t, card.querySelector('img')?.src);
          });
        });
      } catch(err){
        resultsDiv.innerHTML = '<div class="error-message"><p>Failed to fetch anime. Try again.</p></div>';
        showToast('Network error — retrying with backup proxy…');
      } finally { showLoader(false); }
    }
    btn.addEventListener('click', performAnimeSearch);
    input.addEventListener('keypress', e => { if(e.key==='Enter') performAnimeSearch(); });
  }

  async function showAnimeDetail(detailUrl, title, cover){
    if(!detailUrl) return;
    openModal();
    modalDynamic.innerHTML = '<div class="loader"></div>';
    try{
      const res  = await fetchWithProxy(animeDetailUrl(detailUrl), _proxyIdx);
      const data = await res.json();
      const info = data.data||data;
      const animeTitle = info.title||title||'Anime';
      const description= (info.storyline||info.description||info.synopsis||'No description available.').substring(0,200);
      const poster     = info.image||cover||'https://placehold.co/300x450';
      let episodes = [];
      if(info.episodes&&Array.isArray(info.episodes)) episodes=info.episodes;
      else if(info.episodeList&&Array.isArray(info.episodeList)) episodes=info.episodeList;
      let html = `<div class="info-backdrop">
        <img class="backdrop-img" src="${poster}" style="opacity:.22;">
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(10,10,16,.98) 0%,rgba(10,10,16,.4) 100%);pointer-events:none;"></div>
        <div class="info-content">
          <img class="info-poster" src="${poster}">
          <div class="info-text"><h2>${animeTitle}</h2><p>${description}</p></div>
        </div>
      </div>`;
      if(episodes.length){
        html += `<h3 style="font-family:var(--font-display);font-size:1.1rem;letter-spacing:1px;margin:16px 0 10px;color:var(--text2);">Episodes (${episodes.length})</h3><div class="episode-list">`;
        episodes.forEach(ep => {
          const epTitle = ep.title||`Episode ${ep.number||''}`;
          const epUrl   = ep.url||'';
          html += `<div class="episode-item" data-ep-url="${epUrl}">
            <div class="episode-title"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>${epTitle}</div>
            <button class="episode-download-btn" data-ep-url="${epUrl}" data-ep-title="${epTitle.replace(/"/g,'&quot;')}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Get Links
            </button>
          </div>`;
        });
        html += '</div>';
      } else {
        html += '<p class="error-message" style="padding:20px;margin-top:12px;">No episodes listed for this anime.</p>';
      }
      modalDynamic.innerHTML = html;
      document.querySelectorAll('.episode-download-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          e.stopPropagation();
          const epUrl = btn.dataset.epUrl, epTitle = btn.dataset.epTitle;
          if(!epUrl){ showToast('No episode URL'); return; }
          showToast('Fetching download links…');
          try{
            const downRes = await fetchWithProxy(animeDownloadUrl(epUrl), _proxyIdx);
            if(!downRes.ok) throw new Error();
            const downloadData = await downRes.json();
            const links = downloadData?.data?.downloadLinks||[];
            if(!links.length){ showToast('No download links found'); return; }
            let linksHtml = `<div style="margin-top:10px;background:var(--bg3);border-radius:var(--radius);padding:12px;border:1px solid var(--border2);"><p style="font-family:var(--font-mono);font-size:.7rem;color:var(--accent2);margin-bottom:8px;letter-spacing:.04em;">✦ ${epTitle}</p>`;
            links.forEach(link => {
              const quality = link.quality||link.server||'Link';
              if(link.url) linksHtml += `<div class="download-item"><span style="font-family:var(--font-mono);font-size:.7rem;">${quality}</span><a href="${link.url}" target="_blank">Download</a></div>`;
            });
            linksHtml += '</div>';
            btn.insertAdjacentHTML('afterend', linksHtml);
            btn.disabled = true;
            btn.textContent = '✓ Links loaded';
          } catch { showToast('Failed to fetch download links'); }
        });
      });
      document.querySelectorAll('.episode-item').forEach(item => {
        item.addEventListener('click', e => {
          if(e.target.classList.contains('episode-download-btn')||e.target.closest('.episode-download-btn')) return;
          const epUrl = item.dataset.epUrl;
          if(epUrl) showAnimeDetail(epUrl, 'Episode', '');
        });
      });
    } catch(err){
      modalDynamic.innerHTML = '<div class="error-message"><p>Failed to load anime details. Check your connection.</p></div>';
    }
  }

  async function loadLiveSports(){
    showLoader(true);
    const liveData = await xcasper('/live');
    showLoader(false);
    if(!liveData?.data?.matchList?.length){ container.innerHTML='<div class="error-message"><p>No live sports available at the moment.</p></div>'; return; }
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
        const streamUrl=match.dataset.stream, title=match.dataset.title, score=match.dataset.score;
        if(!streamUrl){ showToast('Stream URL not available'); return; }
        openModal();
        modalDynamic.innerHTML = `<h2 style="font-family:var(--font-display);letter-spacing:1px;margin-bottom:8px;">${title}</h2><p style="font-family:var(--font-mono);color:var(--gold);font-size:1rem;margin-bottom:12px;">${score}</p><div style="background:#000;border-radius:var(--radius);overflow:hidden;position:relative;padding-top:56.25%;"><video id="liveVid" controls autoplay style="position:absolute;inset:0;width:100%;height:100%;"></video></div>`;
        const video = document.getElementById('liveVid');
        if(Hls.isSupported()){ const hls=new Hls(); hls.loadSource(streamUrl); hls.attachMedia(video); }
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
          const rankRes = await xcasper(`/ranking?id=${chip.dataset.rankid}&page=1&perPage=20`);
          const items = extractArray(rankRes);
          const resultsDiv = document.getElementById('rankingResults');
          if(items?.length){
            let grid = '<div class="grid-view">';
            items.forEach(item => {
              const cover=getCoverUrl(item)||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
              const t=item.title||'Untitled'; const rating=item.imdbRatingValue||'N/A';
              const year=item.releaseDate?item.releaseDate.slice(0,4):(item.year||'');
              const sid=getSubjectId(item); const path=item.detailPath||''; const stype=item.subjectType||0;
              grid += `<div class="movie-card" data-source="main" data-subjectid="${sid}" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}" data-subjecttype="${stype}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${t}</div><div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div></div></div>`;
            });
            grid += '</div>';
            resultsDiv.innerHTML = grid;
            attachCardListeners();
          } else resultsDiv.innerHTML = '<p style="color:var(--text3);font-size:.85rem;padding:12px 0;">No items found.</p>';
        });
      });
    }
    const applyBtn = document.getElementById('applyFilters');
    const browseResults = document.getElementById('browseResults');
    async function fetchBrowse(){
      const type=document.getElementById('typeFilter').value;
      const genre=document.getElementById('genreFilter').value;
      const country=document.getElementById('countryFilter').value;
      const year=document.getElementById('yearFilter').value;
      const order=document.getElementById('orderFilter').value;
      let url = `/browse?page=1&perPage=24`;
      if(type!=='all') url+=`&subjectType=${type}`;
      if(genre) url+=`&genre=${encodeURIComponent(genre)}`;
      if(country) url+=`&countryName=${encodeURIComponent(country)}`;
      if(year) url+=`&year=${year}`;
      if(order) url+=`&orderBy=${order}`;
      const res = await xcasper(url);
      const items = extractArray(res);
      if(items?.length){
        let grid = '<div class="grid-view">';
        items.forEach(item => {
          const cover=getCoverUrl(item)||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
          const t=item.title||'Untitled'; const rating=item.imdbRatingValue||'N/A';
          const year=item.releaseDate?item.releaseDate.slice(0,4):(item.year||'');
          const sid=getSubjectId(item); const path=item.detailPath||''; const stype=item.subjectType||0;
          grid += `<div class="movie-card" data-source="main" data-subjectid="${sid}" data-detailpath="${path}" data-title="${t.replace(/"/g,'&quot;')}" data-cover="${cover}" data-subjecttype="${stype}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${t}</div><div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div></div></div>`;
        });
        grid += '</div>';
        browseResults.innerHTML = grid;
        attachCardListeners();
      } else browseResults.innerHTML = '<p style="color:var(--text3);font-size:.85rem;padding:12px 0;">No results found.</p>';
    }
    applyBtn.addEventListener('click', fetchBrowse);
    fetchBrowse();
  }

  navItems.forEach(item => {
    item.addEventListener('click', async () => {
      const section = item.dataset.section;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if(section==='home')         await loadHome();
      else if(section==='trending'){
        showLoader(true);
        const res = await xcasper('/trending?page=0&perPage=24');
        showLoader(false);
        const arr = extractArray(res);
        container.innerHTML = arr?.length ? renderRow('Trending Now', arr, 'fa-chart-line') : '<div class="error-message"><p>No trending data</p></div>';
        attachCardListeners();
      }
      else if(section==='series')   await loadSeries();
      else if(section==='anime')    await loadAnime();
      else if(section==='live')     await loadLiveSports();
      else if(section==='discover') await loadDiscover();
    });
  });

  searchBtn?.addEventListener('click', () => { const kw=searchInput.value.trim(); if(kw) performSearch(kw); });
  searchInput?.addEventListener('keyup', e => { if(e.key==='Enter') searchBtn?.click(); });

  loadHome();

})();
