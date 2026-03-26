(function() {
    const API = 'https://movieapi.xcasper.space/api';

    const PROXY_LIST = [
        'https://corsproxy.io/?',
        'https://api.allorigins.win/raw?url=',
        'https://proxy.cors.sh/',
        'https://thingproxy.freeboard.io/fetch/'
    ];
    let _proxyIdx = 0;

    async function fetchWithProxy(rawUrl, attempt = 0) {
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
        } catch (e) {
            console.warn(`Proxy ${attempt} failed (${proxy}):`, e.message);
            return fetchWithProxy(rawUrl, attempt + 1);
        }
    }

    const ANIME_BASE   = 'https://apis.prexzyvilla.site/anime/';
    const animeSearchUrl   = q  => `${ANIME_BASE}animesearch?query=${encodeURIComponent(q)}`;
    const animeDetailUrl   = u  => `${ANIME_BASE}animedetail?url=${encodeURIComponent(u)}`;
    const animeDownloadUrl = u  => `${ANIME_BASE}animedownload?url=${encodeURIComponent(u)}`;

    const container      = document.getElementById('contentContainer');
    const loader         = document.getElementById('globalLoader');
    const searchInput    = document.getElementById('searchInput');
    const searchBtn      = document.getElementById('searchBtn');
    const themeToggle    = document.getElementById('themeToggle');
    const navItems       = document.querySelectorAll('.nav-item');
    const modal          = document.getElementById('detailModal');
    const modalDynamic   = document.getElementById('modalDynamic');
    const closeModal     = document.getElementById('closeModal');
    const ntModal        = document.getElementById('ntDetailModal');
    const ntModalDynamic = document.getElementById('ntModalDynamic');
    const closeNtModal   = document.getElementById('closeNtModal');
    const liveModal      = document.getElementById('liveModal');
    const liveModalDynamic = document.getElementById('liveModalDynamic');
    const closeLiveModal = document.getElementById('closeLiveModal');
    const actorModal     = document.getElementById('actorModal');
    const actorModalDynamic = document.getElementById('actorModalDynamic');
    const closeActorModal= document.getElementById('closeActorModal');
    const animeModal     = document.getElementById('animeModal');
    const animeModalDynamic = document.getElementById('animeModalDynamic');
    const closeAnimeModal= document.getElementById('closeAnimeModal');
    const toast          = document.getElementById('toast');
    const backToTop      = document.getElementById('backToTop');

    let currentSubjectId = null, currentDetailPath = null;
    let currentStreams = [], currentTitle = '', currentCover = '', currentBackdrop = '';
    let currentAudioTracks = [], currentSubtitles = [], currentStreamId = null;

    window.addEventListener('scroll', () => backToTop.classList.toggle('show', window.scrollY > 200));
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    function showToast(msg = '✦ ᴅᴀʀᴋɴᴏᴠᴀ', dur = 2200) {
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), dur);
    }

    const particleCount = window.innerWidth < 500 ? 22 : 45;
    particlesJS('particles-js', {
        particles: {
            number: { value: particleCount },
            color: { value: ['#7c5cfc', '#22d3ee', '#fbbf24', '#a78bfa'] },
            shape: { type: 'circle' },
            opacity: { value: 0.25, random: true },
            size: { value: 2, random: true },
            line_linked: { enable: true, distance: 130, color: '#7c5cfc', opacity: 0.12 },
            move: { enable: true, speed: 0.9 }
        }
    });

    function initTheme() {
        const saved = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', saved);
        applyThemeIcons(saved);
    }
    function applyThemeIcons(theme) {
        document.getElementById('iconMoon').style.display = theme === 'dark' ? 'block' : 'none';
        document.getElementById('iconSun').style.display  = theme === 'light' ? 'block' : 'none';
    }
    themeToggle.addEventListener('click', () => {
        const cur  = document.documentElement.getAttribute('data-theme');
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        applyThemeIcons(next);
    });
    initTheme();

    function closeModals() {
        [modal, ntModal, liveModal, actorModal, animeModal].forEach(m => m.classList.remove('active'));
    }
    closeModal.addEventListener('click',      () => modal.classList.remove('active'));
    closeNtModal.addEventListener('click',    () => ntModal.classList.remove('active'));
    closeLiveModal.addEventListener('click',  () => liveModal.classList.remove('active'));
    closeActorModal.addEventListener('click', () => actorModal.classList.remove('active'));
    closeAnimeModal.addEventListener('click', () => animeModal.classList.remove('active'));
    window.addEventListener('click', e => {
        if (e.target === modal)      modal.classList.remove('active');
        if (e.target === ntModal)    ntModal.classList.remove('active');
        if (e.target === liveModal)  liveModal.classList.remove('active');
        if (e.target === actorModal) actorModal.classList.remove('active');
        if (e.target === animeModal) animeModal.classList.remove('active');
    });

    async function fetchApi(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch(e) {
            console.error('API fetch error:', e, url);
            showToast(`⚠️ ${e.message}`);
            return null;
        }
    }

    function extractArray(data) {
        if (!data) return null;
        if (Array.isArray(data)) return data;
        if (data.data) {
            if (Array.isArray(data.data)) return data.data;
            if (data.data.items && Array.isArray(data.data.items)) return data.data.items;
            if (typeof data.data === 'object') for (let k in data.data) if (Array.isArray(data.data[k])) return data.data[k];
        }
        if (data.items && Array.isArray(data.items)) return data.items;
        if (data.results && Array.isArray(data.results)) return data.results;
        if (data.animeList && Array.isArray(data.animeList)) return data.animeList;
        return null;
    }
    function showLoader(show) { loader.style.display = show ? 'block' : 'none'; }
    function getSubjectId(item) { return item.subjectId||item.id||item._id||item.movieId||item.showId||item.contentId||item.guid||'missing'; }
    function getCoverUrl(item) {
        if (!item) return null;
        if (typeof item.cover==='string'&&item.cover) return item.cover;
        if (typeof item.poster==='string'&&item.poster) return item.poster;
        if (typeof item.thumbnail==='string'&&item.thumbnail) return item.thumbnail;
        if (typeof item.image==='string'&&item.image) return item.image;
        if (typeof item.backdrop==='string'&&item.backdrop) return item.backdrop;
        if (item.poster_path) return item.poster_path.startsWith('http')?item.poster_path:`https://image.tmdb.org/t/p/w500${item.poster_path}`;
        if (item.backdrop_path) return item.backdrop_path.startsWith('http')?item.backdrop_path:`https://image.tmdb.org/t/p/w500${item.backdrop_path}`;
        if (item.cover?.url) return item.cover.url;
        if (item.poster?.url) return item.poster.url;
        if (item.thumbnail?.url) return item.thumbnail.url;
        if (item.image?.url) return item.image.url;
        if (item.backdrop?.url) return item.backdrop.url;
        return null;
    }
    function getBackdropUrl(item) {
        if (!item) return null;
        if (typeof item.backdrop==='string'&&item.backdrop) return item.backdrop;
        if (item.backdrop_path) return item.backdrop_path.startsWith('http')?item.backdrop_path:`https://image.tmdb.org/t/p/original${item.backdrop_path}`;
        if (item.backdrop?.url) return item.backdrop.url;
        return getCoverUrl(item);
    }

    const rowIcons = {
        'fa-home':       '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        'fa-chart-line': '<svg class="row-header-icon" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        'fa-bolt':       '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
        'fa-dragon':     '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'fa-search':     '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>',
        'fa-star':       '<svg class="row-header-icon" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'fa-download':   '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        'fa-trophy':     '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 5h12v7a6 6 0 0 1-12 0V5z"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>',
        'fa-fire':       '<svg class="row-header-icon" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10 0-4.478-5-10-10-16C7 6 2 7.522 2 12c0 5.523 4.477 10 10 10z"/></svg>',
        'fa-compass':    '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
        'fa-futbol':     '<svg class="row-header-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-9.5 6.8L12 12l9.5-3.2A10 10 0 0 0 12 2z"/></svg>',
        'fa-film':       '<svg class="row-header-icon" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>',
    };
    function getRowIcon(icon) { return rowIcons[icon] || rowIcons['fa-film']; }

    function renderRow(title, items, icon='fa-film') {
        if (!items?.length) return '';
        let html = `<div class="row-header">${getRowIcon(icon)}<h3>${title}</h3></div><div class="movie-row">`;
        items.slice(0,15).forEach(item => {
            let cover = getCoverUrl(item) || 'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
            const titleText = item.title||item.name||item.originalTitle||'Untitled';
            const rating    = item.imdbRatingValue||item.imdbRating||item.rating||'N/A';
            const year      = item.releaseDate?item.releaseDate.slice(0,4):(item.year||'');
            const subjectId = getSubjectId(item);
            const detailPath= item.detailPath||item.path||'';
            const subjectType=item.subjectType||0;
            html += `<div class="movie-card" data-source="main" data-subjectid="${subjectId}" data-detailpath="${detailPath}" data-title="${titleText.replace(/"/g,'&quot;')}" data-cover="${cover}" data-rating="${rating}" data-year="${year}" data-subjecttype="${subjectType}">
                <img class="card-img" src="${cover}" loading="lazy" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'">
                <div class="card-info">
                    <div class="card-title">${titleText}</div>
                    <div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div>
                </div>
            </div>`;
        });
        html += `</div>`;
        return html;
    }

    function attachCardListeners() {
        document.querySelectorAll('.movie-card').forEach(card => {
            card.removeEventListener('click', cardClickHandler);
            card.addEventListener('click', cardClickHandler);
        });
    }
    async function cardClickHandler(e) {
        const card = e.currentTarget;
        const source     = card.dataset.source || 'main';
        const subjectId  = card.dataset.subjectid;
        const detailPath = card.dataset.detailpath;
        const title      = card.dataset.title;
        const cover      = card.dataset.cover;
        const subjectType= parseInt(card.dataset.subjecttype);
        if (source === 'newtoxic') {
            if (!detailPath) { showToast('⚠️ No detail path'); return; }
            await openNtDetail(detailPath, title);
        } else {
            if (subjectId === 'missing') { showToast('⚠️ No details available'); return; }
            await openDetail(subjectId, detailPath, title, cover, subjectType);
        }
    }

    async function fetchRandomAnime(limit = 5) {
        try {
            const res  = await fetchWithProxy(animeSearchUrl('a'), _proxyIdx);
            const data = await res.json();
            let items  = [];
            if (data?.data?.results && Array.isArray(data.data.results)) items = data.data.results;
            else if (data?.results && Array.isArray(data.results))       items = data.results;
            else if (data?.data && Array.isArray(data.data))             items = data.data;
            else if (Array.isArray(data))                                items = data;
            for (let i = items.length-1; i > 0; i--) {
                const j = Math.floor(Math.random()*(i+1));
                [items[i], items[j]] = [items[j], items[i]];
            }
            return items.slice(0, limit);
        } catch(e) {
            console.error('Random anime error:', e);
            return [];
        }
    }

    async function loadHome() {
        showLoader(true);
        const [home, trending, hot, popular, randomAnime] = await Promise.all([
            fetchApi(`${API}/homepage`),
            fetchApi(`${API}/trending?page=0&perPage=18`),
            fetchApi(`${API}/hot`),
            fetchApi(`${API}/popular-search`),
            fetchRandomAnime(5)
        ]);
        showLoader(false);
        let html = '';
        const carouselItems = extractArray(trending) || extractArray(hot) || [];
        if (carouselItems.length) {
            html += `<div class="hero-carousel" id="heroCarousel"><div class="carousel-track" id="carouselTrack">`;
            carouselItems.slice(0,5).forEach(item => {
                const backdrop = getBackdropUrl(item)||getCoverUrl(item)||'https://placehold.co/600x300/0a0a10/9890b8?text=';
                const title    = item.title||item.name||'Featured';
                const subjectId= getSubjectId(item);
                const detailPath=item.detailPath||item.path||'';
                html += `<div class="carousel-slide" data-subjectid="${subjectId}" data-detailpath="${detailPath}" style="background-image:url('${backdrop}');"><span class="slide-title">${title}</span></div>`;
            });
            html += `</div><div class="carousel-indicators" id="carouselIndicators">`;
            carouselItems.slice(0,5).forEach((_,i) => {
                html += `<span class="carousel-indicator ${i===0?'active':''}"></span>`;
            });
            html += `</div></div>`;
            setTimeout(() => {
                const track      = document.getElementById('carouselTrack');
                const slides     = document.querySelectorAll('.carousel-slide');
                const indicators = document.querySelectorAll('.carousel-indicator');
                if (!slides.length) return;
                let cur = 0, total = slides.length;
                let interval = setInterval(() => go(cur+1), 4200);
                function go(index) {
                    if (index < 0) index = total-1;
                    if (index >= total) index = 0;
                    cur = index;
                    track.style.transform = `translateX(-${cur*100}%)`;
                    indicators.forEach((ind,i) => ind.classList.toggle('active', i===cur));
                }
                let startX;
                track.addEventListener('touchstart', e => { startX=e.touches[0].clientX; clearInterval(interval); }, {passive:true});
                track.addEventListener('touchend',   e => { const diff=e.changedTouches[0].clientX-startX; if (Math.abs(diff)>50) go(diff>0?cur-1:cur+1); interval=setInterval(()=>go(cur+1),4200); }, {passive:true});
                slides.forEach(slide => slide.addEventListener('click', () => {
                    const subj=slide.dataset.subjectid, path=slide.dataset.detailpath;
                    if (subj && subj!=='missing') openDetail(subj, path, slide.querySelector('.slide-title')?.textContent, '', 0);
                }));
            }, 100);
        }
        const homeArr     = extractArray(home);
        const trendingArr = extractArray(trending);
        const hotArr      = extractArray(hot);
        if (homeArr?.length)     html += renderRow('Recommended', homeArr, 'fa-home');
        if (trendingArr?.length) html += renderRow('Trending Now', trendingArr, 'fa-chart-line');
        if (hotArr?.length)      html += renderRow('Hot This Week', hotArr, 'fa-bolt');
        if (randomAnime?.length) {
            html += `<div class="row-header">${getRowIcon('fa-dragon')}<h3>ANIME</h3></div><div class="movie-row">`;
            randomAnime.forEach(anime => {
                const cover = anime.image||anime.thumbnail||'https://placehold.co/300x450/0a0a10/9890b8?text=Anime';
                const title = anime.title||'Unknown';
                const url   = anime.url||'';
                html += `<div class="movie-card anime-home-card" data-anime-url="${url}" data-anime-title="${title.replace(/"/g,'&quot;')}" style="flex:0 0 112px;">
                    <img class="card-img" src="${cover}" loading="lazy" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=Anime'">
                    <div class="card-info"><div class="card-title">${title}</div></div>
                </div>`;
            });
            html += `</div>`;
        }
        if (popular?.data && Array.isArray(popular.data)) {
            html += `<div class="row-header">${getRowIcon('fa-search')}<h3>Popular Searches</h3></div><div class="chips">`;
            popular.data.slice(0,24).forEach(term => {
                html += `<span class="chip" data-keyword="${term.replace(/"/g,'&quot;')}">${term}</span>`;
            });
            html += `</div>`;
        }
        if (!html) html = `<div class="error-message"><i class="fas fa-film fa-3x"></i><p>No content available. Try searching.</p></div>`;
        container.innerHTML = html;
        document.querySelectorAll('.chip').forEach(c => c.addEventListener('click', e => {
            const kw = e.target.dataset.keyword; if (kw) { searchInput.value = kw; performSearch(kw); }
        }));
        document.querySelectorAll('.anime-home-card').forEach(card => {
            card.addEventListener('click', async () => {
                const url = card.dataset.animeUrl, title = card.dataset.animeTitle;
                if (!url) { showToast('Detail URL missing'); return; }
                await showAnimeDetail(url, title, card.querySelector('img')?.src);
            });
        });
        attachCardListeners();
    }

    async function performSearch(keyword) {
        showLoader(true);
        const [mainRes, ntRes] = await Promise.all([
            fetchApi(`${API}/search?keyword=${encodeURIComponent(keyword)}&page=1&perPage=30&subjectType=0`),
            fetchApi(`${API}/newtoxic/search?keyword=${encodeURIComponent(keyword)}`)
        ]);
        showLoader(false);
        let html = `<div class="row-header">${getRowIcon('fa-search')}<h3>"${keyword}"</h3><span class="results-back" id="backHome" style="margin-left:auto;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Home</span></div><div class="grid-view">`;
        const mainItems = extractArray(mainRes);
        if (mainItems) mainItems.forEach(item => {
            const cover = getCoverUrl(item)||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
            const title = item.title||'Untitled'; const year = item.releaseDate?item.releaseDate.slice(0,4):(item.year||'');
            const rating = item.imdbRatingValue||item.imdbRating||item.rating||'N/A';
            const subjectId = getSubjectId(item); const detailPath = item.detailPath||item.path||''; const subjectType = item.subjectType||0;
            html += `<div class="movie-card" data-source="main" data-subjectid="${subjectId}" data-detailpath="${detailPath}" data-title="${title.replace(/"/g,'&quot;')}" data-cover="${cover}" data-rating="${rating}" data-year="${year}" data-subjecttype="${subjectType}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${title}</div><div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div></div></div>`;
        });
        const ntItems = extractArray(ntRes);
        if (ntItems) ntItems.forEach(item => {
            const cover = item.thumbnail||item.image||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
            const title = item.title||item.name||'Untitled'; const path = item.path||'';
            html += `<div class="movie-card" data-source="newtoxic" data-detailpath="${path}" data-title="${title.replace(/"/g,'&quot;')}" data-cover="${cover}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${title}</div></div></div>`;
        });
        html += `</div>`;
        if (!mainItems?.length && !ntItems?.length) html = `<div class="error-message"><p>No results for "${keyword}"</p></div>`;
        container.innerHTML = html;
        attachCardListeners();
        document.getElementById('backHome')?.addEventListener('click', loadHome);
    }

    async function openDetail(subjectId, detailPath, fallbackTitle, fallbackCover, subjectType) {
        if (!subjectId||subjectId==='missing') { showToast('⚠️ No valid subject ID'); return; }
        modal.classList.add('active');
        modalDynamic.innerHTML = '<div class="loader"></div>';
        const [detail, play, recommend] = await Promise.all([
            fetchApi(`${API}/detail?subjectId=${subjectId}`),
            detailPath ? fetchApi(`${API}/play?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}`) : fetchApi(`${API}/play?subjectId=${subjectId}`),
            fetchApi(`${API}/recommend?subjectId=${subjectId}&page=1&perPage=8`)
        ]);
        let coverUrl=fallbackCover, backdropUrl=coverUrl, title=fallbackTitle||'No title',
            imdb='N/A', genre='Unknown', desc='No description available.',
            streams=[], audioTracks=[], subtitles=[],
            isSeries=(subjectType===2);
        if (detail?.data) {
            const d=detail.data;
            coverUrl=getCoverUrl(d)||coverUrl; backdropUrl=getBackdropUrl(d)||coverUrl;
            title=d.title||title; imdb=d.imdbRatingValue||d.imdbRating||imdb;
            genre=Array.isArray(d.genre)?d.genre.join(', '):(d.genre||genre);
            desc=d.description||d.storyline||d.overview||desc;
            if (d.subjectType) isSeries=(d.subjectType===2);
        }
        if (play?.data) { streams=play.data.streams||[]; audioTracks=play.data.audioTracks||[]; subtitles=play.data.subtitles||[]; currentStreamId=streams[0]?.id; }
        currentSubjectId=subjectId; currentDetailPath=detailPath; currentStreams=streams;
        currentAudioTracks=audioTracks; currentSubtitles=subtitles;
        currentTitle=title; currentCover=coverUrl; currentBackdrop=backdropUrl;
        let html = `<div class="info-backdrop">
            <img class="backdrop-img" src="${backdropUrl||coverUrl||'https://placehold.co/500x750/0a0a10/9890b8?text='}" onerror="this.src='https://placehold.co/500x750/0a0a10/9890b8?text='">
            <div class="info-content">
                <img class="info-poster" src="${coverUrl||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'">
                <div class="info-text">
                    <div class="imdb-row"><span class="imdb-badge">IMDb</span><span>${imdb}</span><span style="opacity:0.5">·</span><span>${genre}</span></div>
                    <h2>${title}</h2>
                    <p>${desc}</p>
                    <div class="button-group">
                        <button class="btn-primary" id="playBtnInfo"><svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg> PLAY</button>
                        <button class="btn-secondary" id="downloadBtnInfo"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> DOWNLOAD</button>
                    </div>
                    <div id="downloadDropdownInfo" class="download-dropdown"></div>
                </div>
            </div>
        </div>`;
        if (isSeries && detail?.data?.seasons) {
            html += `<h3 class="season-header">Seasons & Episodes</h3>`;
            detail.data.seasons.forEach(season => {
                html += `<div class="nt-folder"><h4>${season.name||'Season '+(season.seasonNumber||'')}</h4>`;
                (season.episodes||[]).forEach(ep => {
                    html += `<div class="nt-file"><span>${ep.name||'Episode '+ep.episodeNumber}</span><button class="play-episode" data-se="${season.seasonNumber||1}" data-ep="${ep.episodeNumber||1}">▶ Play</button></div>`;
                });
                html += `</div>`;
            });
        }
        if (audioTracks.length) {
            html += `<div class="player-toolbar"><div class="audio-selector" id="audioSelector">`;
            audioTracks.forEach(track => { html += `<button class="audio-btn" data-lang="${track.languageCode||track.language}">${track.language}</button>`; });
            html += `</div></div>`;
        }
        modalDynamic.innerHTML = html;
        const downloadBtn      = document.getElementById('downloadBtnInfo');
        const downloadDropdown = document.getElementById('downloadDropdownInfo');
        if (streams.length) {
            let ddHtml = '';
            streams.forEach(s => {
                const downloadUrl = s.downloadUrl||`${API}/bff/stream?subjectId=${subjectId}&resolution=${s.resolutions}&download=1`;
                const sizeMB = s.size?(s.size/1024/1024).toFixed(1):'?';
                ddHtml += `<div class="download-item"><span style="font-family:var(--font-mono);font-size:0.72rem;">${s.resolutions}p</span><a href="${downloadUrl}" target="_blank"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>${sizeMB} MB</a></div>`;
            });
            downloadDropdown.innerHTML = ddHtml;
            downloadBtn.addEventListener('click', e => { e.stopPropagation(); downloadDropdown.classList.toggle('show'); });
        } else downloadBtn.style.display = 'none';
        document.getElementById('playBtnInfo').addEventListener('click', () => {
            if (!streams.length) { showToast('No streams available'); return; } showPlayerView();
        });
        if (audioTracks.length) {
            document.querySelectorAll('.audio-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const lang = btn.dataset.lang;
                    const newStreams = await fetchApi(`${API}/play?subjectId=${subjectId}&detailPath=${detailPath||''}&lang=${lang}`);
                    if (newStreams?.data?.streams) { currentStreams=newStreams.data.streams; showPlayerView(); }
                    else showToast('Audio track not available');
                });
            });
        }
        document.querySelectorAll('.play-episode').forEach(btn => {
            btn.addEventListener('click', async () => {
                const se=btn.dataset.se, ep=btn.dataset.ep;
                const epPlay = await fetchApi(`${API}/play?subjectId=${subjectId}&se=${se}&ep=${ep}`);
                if (epPlay?.data?.streams) { currentStreams=epPlay.data.streams; currentTitle=`${title} S${se}E${ep}`; showPlayerView(); }
                else showToast('Episode not available');
            });
        });
        if (recommend) {
            const recs = extractArray(recommend);
            if (recs?.length) {
                html += `<h4 style="margin-top:20px;font-family:var(--font-display);letter-spacing:1px;font-size:1.1rem;color:var(--text2);">You May Also Like</h4><div class="movie-row" style="margin-bottom:10px;">`;
                recs.slice(0,6).forEach(rec => {
                    const rCover=getCoverUrl(rec)||'https://placehold.co/200x300'; const rTitle=rec.title||rec.name||'Untitled';
                    const rSubjectId=getSubjectId(rec); const rDetailPath=rec.detailPath||rec.path||''; const rSubjectType=rec.subjectType||0;
                    html += `<div class="movie-card" style="flex:0 0 90px;" data-source="main" data-subjectid="${rSubjectId}" data-detailpath="${rDetailPath}" data-title="${rTitle.replace(/"/g,'&quot;')}" data-subjecttype="${rSubjectType}"><img class="card-img" src="${rCover}" onerror="this.src='https://placehold.co/200x300'"><div class="card-info"><div class="card-title">${rTitle}</div></div></div>`;
                });
                html += `</div>`;
                modalDynamic.insertAdjacentHTML('beforeend', html.slice(html.indexOf('<h4')));
                attachCardListeners();
            }
        }
        attachCardListeners();
    }

    function showPlayerView() {
        if (!currentStreams.length) { showToast('No streams available'); return; }
        const sorted = [...currentStreams].sort((a,b)=>(parseInt(a.resolutions)||0)-(parseInt(b.resolutions)||0));
        const lowest = sorted[0];
        const lowestUrl = lowest.proxyUrl||`${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${lowest.resolutions}`;
        let html = `<div class="back-to-info" id="backToInfo">
            <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to details
        </div>
        <video id="playerVideo" class="video-player" controls autoplay muted src="${lowestUrl}"></video>
        <div class="player-toolbar"><div class="quality-selector" id="qualitySelector">`;
        sorted.forEach(s => {
            const q = s.resolutions||'auto';
            const streamUrl = s.proxyUrl||`${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${q}`;
            html += `<button class="quality-btn" data-url="${streamUrl}">${q}p</button>`;
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
        <h4 style="margin-top:16px;font-family:var(--font-display);letter-spacing:1px;font-size:1.1rem;color:var(--text2);">Similar Movies</h4>
        <div class="movie-row" id="similarMoviesRow"></div>`;
        modalDynamic.innerHTML = html;
        const playerDownloadDropdown = document.getElementById('playerDownloadDropdown');
        let ddHtml = '';
        sorted.forEach(s => {
            const downloadUrl = s.downloadUrl||`${API}/bff/stream?subjectId=${currentSubjectId}&resolution=${s.resolutions}&download=1`;
            const sizeMB = s.size?(s.size/1024/1024).toFixed(1):'?';
            ddHtml += `<div class="download-item"><span style="font-family:var(--font-mono);font-size:0.72rem;">${s.resolutions}p</span><a href="${downloadUrl}" target="_blank">${sizeMB} MB</a></div>`;
        });
        playerDownloadDropdown.innerHTML = ddHtml;
        document.getElementById('playerDownloadBtn').addEventListener('click', e => { e.stopPropagation(); playerDownloadDropdown.classList.toggle('show'); });
        const video = document.getElementById('playerVideo');
        document.querySelectorAll('.quality-btn').forEach(btn => btn.addEventListener('click', () => { video.src=btn.dataset.url; video.play(); }));
        document.getElementById('shareBtn').addEventListener('click', () => {
            if (navigator.share) navigator.share({ title: currentTitle, text: `Check out ${currentTitle} on ᴅᴀʀᴋɴᴏᴠᴀ`, url: window.location.href }).catch(()=>{});
            else { navigator.clipboard.writeText(window.location.href); showToast('Link copied!'); }
        });
        document.getElementById('backToInfo').addEventListener('click', () => openDetail(currentSubjectId, currentDetailPath, currentTitle, currentCover, 0));
        (async () => {
            const recommend = await fetchApi(`${API}/recommend?subjectId=${currentSubjectId}&page=1&perPage=8`);
            const recs = extractArray(recommend);
            const row  = document.getElementById('similarMoviesRow');
            if (recs?.length) {
                row.innerHTML = '';
                recs.slice(0,8).forEach(rec => {
                    const rCover=getCoverUrl(rec)||'https://placehold.co/200x300';
                    const rTitle=rec.title||rec.name||'Untitled';
                    const rSubjectId=getSubjectId(rec); const rDetailPath=rec.detailPath||rec.path||'';
                    const card=document.createElement('div'); card.className='movie-card'; card.style.flex='0 0 90px';
                    card.dataset.source='main'; card.dataset.subjectid=rSubjectId; card.dataset.detailpath=rDetailPath; card.dataset.title=rTitle;
                    card.innerHTML=`<img class="card-img" src="${rCover}" onerror="this.src='https://placehold.co/200x300'"><div class="card-info"><div class="card-title">${rTitle}</div></div>`;
                    card.addEventListener('click', () => openDetail(rSubjectId, rDetailPath, rTitle, rCover, 0));
                    row.appendChild(card);
                });
            } else row.innerHTML = '<p style="font-size:0.8rem;color:var(--text3);">No similar movies found.</p>';
        })();
    }

    async function loadSeries() {
        showLoader(true);
        const [featured, latest] = await Promise.all([fetchApi(`${API}/newtoxic/featured`), fetchApi(`${API}/newtoxic/latest?page=1`)]);
        showLoader(false);
        let html = `<div class="nt-search-box"><input type="text" id="ntSearchInput" placeholder="Search TV/Series..."><button id="ntSearchBtn" class="btn-secondary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>Search</button></div>`;
        const featuredArr=extractArray(featured), latestArr=extractArray(latest);
        if (featuredArr?.length) html += renderRow('Featured Series', featuredArr, 'fa-star');
        if (latestArr?.length)   html += renderRow('Latest Episodes', latestArr, 'fa-download');
        container.innerHTML = html || '<div class="error-message">No series data</div>';
        document.getElementById('ntSearchBtn').addEventListener('click', () => { const kw=document.getElementById('ntSearchInput').value.trim(); if (kw) searchNewToxic(kw); });
        document.getElementById('ntSearchInput').addEventListener('keyup', e => { if (e.key==='Enter') document.getElementById('ntSearchBtn').click(); });
        document.querySelectorAll('.movie-card').forEach(card => { card.dataset.source='newtoxic'; card.removeEventListener('click', cardClickHandler); card.addEventListener('click', cardClickHandler); });
    }
    async function searchNewToxic(keyword) {
        showLoader(true);
        const res = await fetchApi(`${API}/newtoxic/search?keyword=${encodeURIComponent(keyword)}`);
        showLoader(false);
        const items = extractArray(res);
        if (!items?.length) { container.innerHTML=`<div class="error-message">No results for "${keyword}"</div>`; return; }
        let html = `<div class="row-header">${getRowIcon('fa-search')}<h3>Series: "${keyword}"</h3><span class="results-back" id="backSeries" style="margin-left:auto;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> Back</span></div><div class="grid-view">`;
        items.forEach(item => {
            const cover=item.thumbnail||item.image||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
            const title=item.title||item.name||'Untitled'; const path=item.path||'';
            html += `<div class="movie-card" data-source="newtoxic" data-detailpath="${path}" data-title="${title.replace(/"/g,'&quot;')}" data-cover="${cover}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${title}</div></div></div>`;
        });
        html += `</div>`;
        container.innerHTML = html;
        document.getElementById('backSeries')?.addEventListener('click', loadSeries);
        document.querySelectorAll('.movie-card').forEach(card => card.addEventListener('click', cardClickHandler));
    }
    async function openNtDetail(path, title) {
        ntModal.classList.add('active');
        ntModalDynamic.innerHTML = '<div class="loader"></div>';
        const detail = await fetchApi(`${API}/newtoxic/detail?path=${encodeURIComponent(path)}`);
        if (!detail?.data) { ntModalDynamic.innerHTML='<p style="color:var(--text3);">Error loading details</p>'; return; }
        const data = detail.data;
        let html = `<h2 style="font-family:var(--font-display);font-size:1.5rem;letter-spacing:1px;margin-bottom:12px;">${data.title||title}</h2>`;
        if (data.thumbnail) html += `<img src="${data.thumbnail}" style="width:100%;border-radius:var(--radius);margin:10px 0;">`;
        if (data.storyline) html += `<p style="color:var(--text2);font-size:0.85rem;margin-bottom:8px;">${data.storyline}</p>`;
        if (data.genre) html += `<p style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text3);margin-bottom:12px;">GENRE · ${data.genre}</p>`;
        if (data.seasons && Array.isArray(data.seasons)) {
            for (let season of data.seasons) {
                html += `<div class="nt-folder"><h4>${season.name||'Season'}</h4>`;
                if (season.episodes) {
                    for (let ep of season.episodes) {
                        html += `<div class="nt-file" data-ep-path="${ep.path||''}"><span>${ep.name||'Episode'}</span><button class="nt-load-languages" data-ep-path="${ep.path||''}">Show langs</button></div><div class="episode-languages" id="languages-${(ep.path||'').replace(/[^a-zA-Z0-9]/g,'_')}" style="margin-left:14px;display:none;"></div>`;
                    }
                } else if (season.path) html += `<button class="nt-get-files" data-path="${season.path}" style="font-family:var(--font-mono);font-size:0.72rem;padding:6px 14px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
                html += `</div>`;
            }
        } else if (data.qualities && Array.isArray(data.qualities)) {
            for (let q of data.qualities) {
                html += `<div class="nt-folder"><h4>${q.quality||'Quality'}</h4>`;
                if (q.path) html += `<button class="nt-get-files" data-path="${q.path}" style="font-family:var(--font-mono);font-size:0.72rem;padding:6px 14px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
                html += `</div>`;
            }
        } else if (data.path) html += `<button class="nt-get-files" data-path="${data.path}" style="font-family:var(--font-mono);font-size:0.72rem;padding:6px 14px;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);border-radius:100px;cursor:pointer;">Show files</button>`;
        ntModalDynamic.innerHTML = html;
        document.querySelectorAll('.nt-load-languages').forEach(btn => {
            btn.addEventListener('click', async e => {
                const epPath = btn.dataset.epPath;
                const langDiv = btn.closest('.nt-file')?.nextElementSibling;
                if (!epPath||!langDiv) return;
                if (langDiv.innerHTML) { langDiv.style.display=langDiv.style.display==='none'?'block':'none'; return; }
                langDiv.innerHTML = '<div class="loader" style="width:24px;height:24px;margin:8px auto;"></div>';
                const filesRes = await fetchApi(`${API}/newtoxic/files?path=${encodeURIComponent(epPath)}`);
                if (!filesRes?.data) { langDiv.innerHTML='<p style="font-size:0.78rem;color:var(--text3);padding:6px;">No files found</p>'; langDiv.style.display='block'; return; }
                const files = filesRes.data;
                let listHtml = '<div style="margin-top:8px;background:var(--bg3);border-radius:var(--radius);padding:8px;border:1px solid var(--border);">';
                files.forEach(f => {
                    let lang='Unknown';
                    if (f.name.match(/hindi/i)) lang='Hindi'; else if (f.name.match(/english/i)) lang='English';
                    else if (f.name.match(/tamil/i)) lang='Tamil'; else if (f.name.match(/telugu/i)) lang='Telugu';
                    else if (f.name.match(/malayalam/i)) lang='Malayalam'; else if (f.name.match(/kannada/i)) lang='Kannada';
                    else if (f.name.match(/bengali/i)) lang='Bengali';
                    listHtml += `<div class="download-item"><span>${lang} (${(f.size/1024/1024).toFixed(1)} MB)</span><div>${f.fid?`<button class="nt-watch" data-fid="${f.fid}" data-name="${f.name}" style="font-family:var(--font-mono);font-size:0.62rem;background:var(--glow2);border:1px solid var(--accent);color:var(--accent2);padding:3px 10px;border-radius:100px;cursor:pointer;margin-right:4px;">Watch</button><a href="#" class="nt-download-link" data-fid="${f.fid}" style="font-family:var(--font-mono);font-size:0.62rem;color:var(--cyan);">Download</a>`:''}</div></div>`;
                });
                listHtml += `</div>`;
                langDiv.innerHTML = listHtml;
                langDiv.style.display = 'block';
                langDiv.querySelectorAll('.nt-watch').forEach(watchBtn => {
                    watchBtn.addEventListener('click', async ev => {
                        const fid = ev.target.dataset.fid;
                        const resolve = await fetchApi(`${API}/newtoxic/resolve?fid=${fid}`);
                        if (resolve?.data?.url) {
                            const url = resolve.data.url;
                            if (url.includes('.m3u8')) {
                                liveModal.classList.add('active');
                                liveModalDynamic.innerHTML = `<h2 style="font-family:var(--font-display);letter-spacing:1px;margin-bottom:12px;">${ev.target.dataset.name||'Video'}</h2><video id="liveVideo" class="video-player" controls autoplay></video><div class="player-toolbar"><button class="btn-secondary" id="closeLivePlayer">Close</button></div>`;
                                const video = document.getElementById('liveVideo');
                                if (Hls.isSupported()) { const hls=new Hls(); hls.loadSource(url); hls.attachMedia(video); }
                                else if (video.canPlayType('application/vnd.apple.mpegurl')) video.src = url;
                                else video.src = url;
                                document.getElementById('closeLivePlayer').addEventListener('click', () => liveModal.classList.remove('active'));
                            } else window.open(url, '_blank');
                        } else showToast('Failed to get stream link');
                    });
                });
                langDiv.querySelectorAll('.nt-download-link').forEach(dlLink => {
                    dlLink.addEventListener('click', async ev => {
                        ev.preventDefault();
                        const fid = ev.target.dataset.fid;
                        const resolve = await fetchApi(`${API}/newtoxic/resolve?fid=${fid}`);
                        if (resolve?.data?.url) window.open(resolve.data.url, '_blank');
                        else showToast('Download failed');
                    });
                });
            });
        });
        document.querySelectorAll('.nt-get-files').forEach(btn => {
            btn.addEventListener('click', async e => {
                const folderPath = e.target.dataset.path;
                const filesRes = await fetchApi(`${API}/newtoxic/files?path=${encodeURIComponent(folderPath)}`);
                if (!filesRes?.data) return;
                const files = filesRes.data;
                let listHtml = '<div class="nt-folder"><h4>Files</h4>';
                files.forEach(f => {
                    listHtml += `<div class="nt-file"><span>${f.name} (${(f.size/1024/1024).toFixed(1)} MB)</span>${f.fid?`<button class="nt-download" data-fid="${f.fid}" style="font-family:var(--font-mono);font-size:0.62rem;background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;color:white;padding:4px 12px;border-radius:100px;cursor:pointer;">Download</button>`:''}</div>`;
                });
                listHtml += `</div>`;
                e.target.insertAdjacentHTML('afterend', listHtml);
                e.target.disabled = true;
                document.querySelectorAll('.nt-download').forEach(dbtn => {
                    dbtn.addEventListener('click', async ev => {
                        const fid = ev.target.dataset.fid;
                        const resolve = await fetchApi(`${API}/newtoxic/resolve?fid=${fid}`);
                        if (resolve?.data?.url) window.open(resolve.data.url, '_blank');
                        else showToast('Failed to resolve download link');
                    });
                });
            });
        });
    }

    async function loadLiveSports() {
        showLoader(true);
        const liveData = await fetchApi(`${API}/live`);
        showLoader(false);
        if (!liveData?.data?.matchList?.length) { container.innerHTML='<div class="error-message"><p>No live sports available at the moment.</p></div>'; return; }
        let html = `<div class="row-header">${getRowIcon('fa-futbol')}<h3>Live Matches</h3></div>`;
        liveData.data.matchList.forEach(match => {
            const title     = `${match.team1.name} vs ${match.team2.name}`;
            const score     = `${match.team1.score} - ${match.team2.score}`;
            const thumbnail = match.team1.avatar||match.team2.avatar||'https://placehold.co/600x400/0a0a10/9890b8?text=Live';
            const streamUrl = match.playPath;
            html += `<div class="live-match" data-stream="${streamUrl}" data-title="${title}" data-score="${score}"><img class="live-match-img" src="${thumbnail}" onerror="this.src='https://placehold.co/600x400/0a0a10/9890b8?text=Live'"><div class="live-match-info"><div class="live-match-title">${title}</div><div class="live-match-score">Score: ${score}</div></div><div class="live-badge">LIVE</div></div>`;
        });
        container.innerHTML = html;
        document.querySelectorAll('.live-match').forEach(match => {
            match.addEventListener('click', () => {
                const streamUrl=match.dataset.stream, title=match.dataset.title, score=match.dataset.score;
                if (!streamUrl) { showToast('Stream URL not available'); return; }
                liveModal.classList.add('active');
                liveModalDynamic.innerHTML = `<h2 style="font-family:var(--font-display);letter-spacing:1px;margin-bottom:8px;">${title}</h2><p style="font-family:var(--font-mono);color:var(--gold);font-size:1rem;margin-bottom:12px;">${score}</p><video id="liveVideo" class="video-player" controls autoplay></video><div class="player-toolbar"><button class="btn-secondary" id="closeLivePlayer">Close</button></div>`;
                const video = document.getElementById('liveVideo');
                if (Hls.isSupported()) { const hls=new Hls(); hls.loadSource(streamUrl); hls.attachMedia(video); }
                else if (video.canPlayType('application/vnd.apple.mpegurl')) video.src=streamUrl;
                else video.src=streamUrl;
                document.getElementById('closeLivePlayer').addEventListener('click', () => liveModal.classList.remove('active'));
            });
        });
    }

    async function loadDiscover() {
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
        const rankingData = await fetchApi(`${API}/ranking`);
        if (rankingData?.data?.rankingList) {
            let chipsHtml = '';
            rankingData.data.rankingList.forEach(cat => { chipsHtml += `<span class="chip" data-rankid="${cat.id}">${cat.name}</span>`; });
            document.getElementById('rankingCategories').innerHTML = chipsHtml;
            document.querySelectorAll('[data-rankid]').forEach(chip => {
                chip.addEventListener('click', async () => {
                    document.querySelectorAll('[data-rankid]').forEach(c => c.classList.remove('active'));
                    chip.classList.add('active');
                    const rankId = chip.dataset.rankid;
                    const rankRes = await fetchApi(`${API}/ranking?id=${rankId}&page=1&perPage=20`);
                    const items = extractArray(rankRes);
                    const resultsDiv = document.getElementById('rankingResults');
                    if (items?.length) {
                        let grid = '<div class="grid-view">';
                        items.forEach(item => {
                            const cover=getCoverUrl(item)||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
                            const title=item.title||'Untitled'; const rating=item.imdbRatingValue||'N/A';
                            const year=item.releaseDate?item.releaseDate.slice(0,4):(item.year||'');
                            const subjectId=getSubjectId(item); const detailPath=item.detailPath||''; const subjectType=item.subjectType||0;
                            grid += `<div class="movie-card" data-source="main" data-subjectid="${subjectId}" data-detailpath="${detailPath}" data-title="${title.replace(/"/g,'&quot;')}" data-cover="${cover}" data-subjecttype="${subjectType}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${title}</div><div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div></div></div>`;
                        });
                        grid += `</div>`;
                        resultsDiv.innerHTML = grid;
                        attachCardListeners();
                    } else resultsDiv.innerHTML = '<p style="color:var(--text3);font-size:0.85rem;padding:12px 0;">No items found.</p>';
                });
            });
        }
        const applyBtn = document.getElementById('applyFilters');
        const browseResults = document.getElementById('browseResults');
        async function fetchBrowse() {
            const type=document.getElementById('typeFilter').value, genre=document.getElementById('genreFilter').value;
            const country=document.getElementById('countryFilter').value, year=document.getElementById('yearFilter').value;
            const order=document.getElementById('orderFilter').value;
            let url = `${API}/browse?page=1&perPage=24`;
            if (type!=='all') url+=`&subjectType=${type}`; if (genre) url+=`&genre=${encodeURIComponent(genre)}`;
            if (country) url+=`&countryName=${encodeURIComponent(country)}`; if (year) url+=`&year=${year}`;
            if (order) url+=`&orderBy=${order}`;
            const res = await fetchApi(url); const items = extractArray(res);
            if (items?.length) {
                let grid = '<div class="grid-view">';
                items.forEach(item => {
                    const cover=getCoverUrl(item)||'https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster';
                    const title=item.title||'Untitled'; const rating=item.imdbRatingValue||'N/A';
                    const year=item.releaseDate?item.releaseDate.slice(0,4):(item.year||'');
                    const subjectId=getSubjectId(item); const detailPath=item.detailPath||''; const subjectType=item.subjectType||0;
                    grid += `<div class="movie-card" data-source="main" data-subjectid="${subjectId}" data-detailpath="${detailPath}" data-title="${title.replace(/"/g,'&quot;')}" data-cover="${cover}" data-subjecttype="${subjectType}"><img class="card-img" src="${cover}" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=No+Poster'"><div class="card-info"><div class="card-title">${title}</div><div class="card-meta"><span>${year}</span><span class="rating">★ ${rating}</span></div></div></div>`;
                });
                grid += `</div>`;
                browseResults.innerHTML = grid;
                attachCardListeners();
            } else browseResults.innerHTML = '<p style="color:var(--text3);font-size:0.85rem;padding:12px 0;">No results found.</p>';
        }
        applyBtn.addEventListener('click', fetchBrowse);
        fetchBrowse();
    }

    async function loadAnime() {
        let html = `<div class="row-header">${getRowIcon('fa-dragon')}<h3>Anime Search</h3></div>
            <div class="anime-search-box">
                <input type="text" id="animeSearchInput" placeholder="Search anime... (e.g. Naruto, One Piece)" autocomplete="off">
                <button id="animeSearchBtn" class="btn-primary"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:4px;"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>Search</button>
            </div>
            <div id="animeResultsContainer"></div>`;
        container.innerHTML = html;
        const input = document.getElementById('animeSearchInput');
        const btn   = document.getElementById('animeSearchBtn');
        const resultsDiv = document.getElementById('animeResultsContainer');

        async function performAnimeSearch() {
            const query = input.value.trim();
            if (!query) { showToast('Enter an anime title'); return; }
            showLoader(true);
            try {
                const res  = await fetchWithProxy(animeSearchUrl(query), _proxyIdx);
                const data = await res.json();
                let items = [];
                if (data?.data?.results && Array.isArray(data.data.results)) items = data.data.results;
                else if (data?.results && Array.isArray(data.results))       items = data.results;
                else if (data?.data && Array.isArray(data.data))             items = data.data;
                else if (Array.isArray(data))                                items = data;
                if (!items.length) { resultsDiv.innerHTML=`<div class="error-message"><p>No anime found for "${query}"</p></div>`; return; }
                let gridHtml = `<div class="grid-view">`;
                items.forEach(anime => {
                    const title = anime.title||'Unknown';
                    const cover = anime.image||anime.thumbnail||'https://placehold.co/300x450/0a0a10/9890b8?text=Anime';
                    const url   = anime.url||'';
                    gridHtml += `<div class="movie-card anime-card" data-anime-url="${url}" data-anime-title="${title.replace(/"/g,'&quot;')}">
                        <img class="card-img" src="${cover}" loading="lazy" onerror="this.src='https://placehold.co/300x450/0a0a10/9890b8?text=Anime'">
                        <div class="card-info"><div class="card-title">${title}</div></div>
                    </div>`;
                });
                gridHtml += `</div>`;
                resultsDiv.innerHTML = gridHtml;
                document.querySelectorAll('.anime-card').forEach(card => {
                    card.addEventListener('click', async () => {
                        const url = card.dataset.animeUrl, title = card.dataset.animeTitle;
                        if (!url) { showToast('Detail URL missing'); return; }
                        await showAnimeDetail(url, title, card.querySelector('img')?.src);
                    });
                });
            } catch (err) {
                console.error('Anime search error:', err);
                resultsDiv.innerHTML = `<div class="error-message"><p>Failed to fetch anime. Try again.</p></div>`;
                showToast('Network error — retrying with backup proxy…');
            } finally {
                showLoader(false);
            }
        }
        btn.addEventListener('click', performAnimeSearch);
        input.addEventListener('keypress', e => { if (e.key==='Enter') performAnimeSearch(); });
        resultsDiv.innerHTML = `<div class="error-message" style="border-style:solid;background:var(--glow2);border-color:rgba(124,92,252,0.2);"><p style="color:var(--accent3);">✦ Enter an anime title to start searching</p></div>`;
    }

    async function showAnimeDetail(detailUrl, title, cover) {
        if (!detailUrl) return;
        animeModal.classList.add('active');
        animeModalDynamic.innerHTML = '<div class="loader"></div>';
        try {
            const res  = await fetchWithProxy(animeDetailUrl(detailUrl), _proxyIdx);
            const data = await res.json();
            const info = data.data||data;
            const animeTitle = info.title||title||'Anime';
            const description= (info.storyline||info.description||info.synopsis||'No description available.').substring(0, 200);
            const poster     = info.image||cover||'https://placehold.co/300x450';
            let episodes     = [];
            if (info.episodes && Array.isArray(info.episodes))           episodes = info.episodes;
            else if (info.episodeList && Array.isArray(info.episodeList)) episodes = info.episodeList;
            let html = `<div class="info-backdrop">
                <img class="backdrop-img" src="${poster}" style="opacity:0.22;">
                <div class="info-content">
                    <img class="info-poster" src="${poster}">
                    <div class="info-text">
                        <h2>${animeTitle}</h2>
                        <p>${description}</p>
                    </div>
                </div>
            </div>`;
            if (episodes.length) {
                html += `<h3 style="font-family:var(--font-display);font-size:1.1rem;letter-spacing:1px;margin:16px 0 10px;color:var(--text2);">Episodes (${episodes.length})</h3><div class="episode-list">`;
                episodes.forEach(ep => {
                    const epTitle = ep.title||`Episode ${ep.number||''}`;
                    const epUrl   = ep.url||'';
                    html += `<div class="episode-item" data-ep-url="${epUrl}">
                        <div class="episode-title">
                            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            ${epTitle}
                        </div>
                        <button class="episode-download-btn" data-ep-url="${epUrl}" data-ep-title="${epTitle.replace(/"/g,'&quot;')}">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" style="display:inline;vertical-align:middle;margin-right:3px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Get Links
                        </button>
                    </div>`;
                });
                html += `</div>`;
            } else {
                html += `<p class="error-message" style="padding:20px;margin-top:12px;">No episodes listed for this anime.</p>`;
            }
            animeModalDynamic.innerHTML = html;
            document.querySelectorAll('.episode-download-btn').forEach(btn => {
                btn.addEventListener('click', async e => {
                    e.stopPropagation();
                    const epUrl   = btn.dataset.epUrl;
                    const epTitle = btn.dataset.epTitle;
                    if (!epUrl) { showToast('No episode URL'); return; }
                    showToast('Fetching download links…');
                    try {
                        const downRes = await fetchWithProxy(animeDownloadUrl(epUrl), _proxyIdx);
                        if (!downRes.ok) throw new Error();
                        const downloadData = await downRes.json();
                        const links = downloadData?.data?.downloadLinks||[];
                        if (!links.length) { showToast('No download links found'); return; }
                        let linksHtml = `<div style="margin-top:10px;background:var(--bg3);border-radius:var(--radius);padding:12px;border:1px solid var(--border2);">
                            <p style="font-family:var(--font-mono);font-size:0.7rem;color:var(--accent2);margin-bottom:8px;letter-spacing:0.04em;">✦ ${epTitle}</p>`;
                        links.forEach(link => {
                            const quality = link.quality||link.server||'Link';
                            const url = link.url;
                            if (url) linksHtml += `<div class="download-item"><span style="font-family:var(--font-mono);font-size:0.7rem;">${quality}</span><a href="${url}" target="_blank">Download</a></div>`;
                        });
                        linksHtml += `</div>`;
                        btn.insertAdjacentHTML('afterend', linksHtml);
                        btn.disabled = true;
                        btn.textContent = '✓ Links loaded';
                    } catch(err) {
                        showToast('Failed to fetch download links');
                    }
                });
            });
            document.querySelectorAll('.episode-item').forEach(item => {
                item.addEventListener('click', e => {
                    if (e.target.classList.contains('episode-download-btn')||e.target.closest('.episode-download-btn')) return;
                    const epUrl = item.dataset.epUrl;
                    if (epUrl) showAnimeDetail(epUrl, 'Episode', '');
                });
            });
        } catch(err) {
            console.error('Anime detail error:', err);
            animeModalDynamic.innerHTML = '<div class="error-message"><p>Failed to load anime details. Check your connection.</p></div>';
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', async () => {
            const section = item.dataset.section;
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            if (section==='home')      await loadHome();
            else if (section==='trending') {
                showLoader(true);
                const res = await fetchApi(`${API}/trending?page=0&perPage=24`);
                showLoader(false);
                const arr = extractArray(res);
                container.innerHTML = arr?.length ? renderRow('Trending Now', arr, 'fa-chart-line') : '<div class="error-message"><p>No trending data</p></div>';
                attachCardListeners();
            }
            else if (section==='series')   await loadSeries();
            else if (section==='anime')    await loadAnime();
            else if (section==='live')     await loadLiveSports();
            else if (section==='discover') await loadDiscover();
        });
    });

    searchBtn.addEventListener('click', () => { const kw=searchInput.value.trim(); if (kw) performSearch(kw); });
    searchInput.addEventListener('keyup', e => { if (e.key==='Enter') searchBtn.click(); });

    loadHome();
})();
