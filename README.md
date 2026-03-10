# Portfolio Site

Static portfolio on GitHub Pages with a Cloudflare Worker admin API.

## How content works

- Public site reads content from `public/data/content.json`.
- Admin panel sends password-authenticated requests to the Worker.
- Worker updates `public/data/content.json` by committing to GitHub via API.
- After save, GitHub Pages rebuilds and everyone sees updates.

## Deploy admin Worker

1. Install Wrangler and login:

```bash
npm i -g wrangler
wrangler login
```

2. Update `worker/wrangler.toml`:
   - `ALLOWED_ORIGIN` to your site origin
   - `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `CONTENT_PATH` (`public/data/content.json`)

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

5. Copy deployed URL and set it in `src/contentConfig.ts`:
   - `getCmsConfig` `workerBaseUrl`
   - Full quick-start is also in `worker/DEPLOY.md`

## Admin usage

1. Open `https://koushik.bd/admin.html`
2. Enter `ADMIN_PASSWORD`
3. Save/reset content

## Frontend development (React)

1. Install dependencies:

```bash
npm install
```

2. Start the dev server:

```bash
npm run dev
```

3. Open:
   - Public site: `http://localhost:5173/`
   - Admin: `http://localhost:5173/admin.html`

4. Build for production:

```bash
npm run build
```

The output goes to `dist/` (deploy that folder).

5. If GitHub Pages is set to serve `main` root, run on `main`:

```bash
npm run deploy:pages
```

Source locations:
- Public site: `src/App.tsx`, `src/styles/site.css`
- Admin: `src/AdminApp.tsx`, `src/adminLegacy.ts`, `src/styles/admin.css`
- Content defaults + CMS URL: `src/contentConfig.ts`

## Admin development workflow (recommended)

Use this flow when you are actively working on the admin panel for multiple days.

1. Start local API in one terminal:

```bash
cd /home/mezbaul/projects/portfolio/worker
wrangler dev --env develop
```

2. Start local frontend in another terminal:

```bash
npm install
npm run dev
```

3. Open the admin UI:
   - `http://localhost:5173/admin.html`

4. Build and test locally:
   - Edit `src/AdminApp.tsx`, `src/adminLegacy.ts`, `src/styles/admin.css`
   - Test sign in, save, reset, and logout

5. Commit in small units:
   - One logical change per commit (for easy rollback)

6. Ship to production:
   - If only frontend files changed, `git push` is enough (GitHub Pages)
   - If Worker code/config changed (`worker/src/index.js`, `worker/wrangler.toml`, secrets), run:

```bash
cd /home/mezbaul/projects/portfolio/worker
wrangler deploy
```

7. Verify production after deploy/push:
   - `https://koushik.bd/admin.html` login works
   - Save one small change
   - Confirm live site updates after Pages rebuild

### Notes for this repo

- `src/contentConfig.ts` now auto-selects API URL:
  - Localhost/127.0.0.1 -> `http://localhost:8787`
  - Other hosts -> production Worker URL
- Keep local origins in `worker/wrangler.toml` `ALLOWED_ORIGINS` for Vite dev testing.

## Important note

- The browser never sees `GITHUB_TOKEN`.
- Auth session is handled by secure `HttpOnly` cookie from the Worker.
