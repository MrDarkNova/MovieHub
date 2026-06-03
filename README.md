#l Nexus — Modular Project Structure

## Folder Layout

```
nexus/
├── index.html                        ← App shell (boots modules → then app)
├── assets/                           ← Compiled app (DO NOT EDIT)
│   ├── js/
│   │   └── index-DYgi9BK6.js        ← React app bundle (untouched)
│   ├── css/
│   │   └── index-D1uNnejf.css       ← App styles (untouched)
│   └── img/
│       └── 95f15a270_logo.png       ← App logo
└── modules/                          ← Custom modular layer (editable)
    ├── main.js                       ← Bootstrap: loads all modules in order
    ├── adblocker/
    │   ├── blocker.js                ← Core blocker (popup / redirect / XHR / fetch)
    │   └── adDomains.js             ← Blocked domain list (add new domains here)
    ├── player/
    │   └── sandbox.js               ← Hardens stream iframes after React renders
    ├── router/
    │   └── router.js                ← SPA route tracker / middleware hook
    └── utils/
        └── helpers.js               ← Shared utility functions
```

## Load Order (critical)

1. `modules/main.js` — imported first in `index.html`
2. → `adblocker/blocker.js` — patches `window.open`, `fetch`, `XHR`, `location`
3. → `router/router.js` — wraps History API
4. → `player/sandbox.js` — starts MutationObserver for iframes
5. `assets/js/index-DYgi9BK6.js` — React app loads **after** all patches are active

## Ad Blocker Coverage

| Attack Vector       | Blocked By                          |
|---------------------|-------------------------------------|
| Popup windows       | `window.open` override              |
| Page redirects      | `location.href/assign/replace` patch|
| Ad network requests | `fetch` + `XHR` intercept           |
| Injected ad iframes | MutationObserver + iframe.remove()  |
| Unload redirects    | `beforeunload` capture listener     |
| Stream iframe abuse | `sandbox.js` attribute enforcement  |

## Adding Blocked Domains

Open `modules/adblocker/adDomains.js` and add to the `BLOCKED_DOMAINS` array:

```js
"your-new-ad-domain.com",
```

No other changes needed — `blocker.js` imports the list automatically.

## Deployment

Serve the root folder as a static site. No build step required.

```bash
# Local testing (Python)
python3 -m http.server 8080

# Or with Node
npx serve .
```

Requires a web server (not `file://`) because ES modules use `type="module"`.
