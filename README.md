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

## Important note

- The browser never sees `GITHUB_TOKEN`.
- Auth session is handled by secure `HttpOnly` cookie from the Worker.
