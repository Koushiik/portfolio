# Portfolio Site

Static portfolio on GitHub Pages with a Cloudflare Worker admin API.

## How content works

- Public site reads content from `data/content.json`.
- Admin panel sends password-authenticated requests to the Worker.
- Worker updates `data/content.json` by committing to GitHub via API.
- After save, GitHub Pages rebuilds and everyone sees updates.

## Deploy admin Worker

1. Install Wrangler and login:

```bash
npm i -g wrangler
wrangler login
```

2. Update `worker/wrangler.toml`:
   - `ALLOWED_ORIGIN` to your site origin
   - `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `CONTENT_PATH`

3. Set Worker secrets:

```bash
cd worker
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
wrangler secret put GITHUB_TOKEN
```

Secret guidance:
- `ADMIN_PASSWORD`: password you will share with the portfolio owner
- `SESSION_SECRET`: long random string (at least 32 chars)
- `GITHUB_TOKEN`: fine-grained token with `Contents: Read and write`, `Metadata: Read` on this repo

4. Deploy Worker:

```bash
wrangler deploy
```

5. Copy deployed URL and set it in `content-config.js`:
   - `PORTFOLIO_CMS_CONFIG.workerBaseUrl`
   - Full quick-start is also in `worker/DEPLOY.md`

## Admin usage

1. Open `https://koushik.bd/admin.html`
2. Enter `ADMIN_PASSWORD`
3. Save/reset content

## Admin development workflow (recommended)

Use this flow when you are actively working on the admin panel for multiple days.

1. Start local API in one terminal:

```bash
cd /home/mezbaul/projects/portfolio/worker
wrangler dev
```

2. Start local frontend (VS Code Go Live is fine) and open:
   - `http://127.0.0.1:5500/admin.html`

3. Build and test locally:
   - Edit `admin.html`, `admin.css`, `admin.js` (and `worker/src/index.js` if needed)
   - Test sign in, save, reset, and logout

4. Commit in small units:
   - One logical change per commit (for easy rollback)

5. Ship to production:
   - If only frontend files changed, `git push` is enough (GitHub Pages)
   - If Worker code/config changed (`worker/src/index.js`, `worker/wrangler.toml`, secrets), run:

```bash
cd /home/mezbaul/projects/portfolio/worker
wrangler deploy
```

6. Verify production after deploy/push:
   - `https://koushik.bd/admin.html` login works
   - Save one small change
   - Confirm live site updates after Pages rebuild

### Notes for this repo

- `content-config.js` now auto-selects API URL:
  - Localhost/127.0.0.1 -> `http://localhost:8787`
  - Other hosts -> production Worker URL
- Keep local origins in `worker/wrangler.toml` `ALLOWED_ORIGINS` for Go Live testing.

## Important note

- The browser never sees `GITHUB_TOKEN`.
- Auth session is handled by secure `HttpOnly` cookie from the Worker.
