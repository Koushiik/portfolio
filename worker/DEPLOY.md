# Cloudflare Worker Deploy Steps

Run these on your machine:

1. Install Wrangler and login

```bash
npm i -g wrangler
wrangler login
```

2. From repo root, go to worker

```bash
cd worker
```

3. Set secrets (you choose values)

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
wrangler secret put GITHUB_TOKEN
```

4. Deploy

```bash
wrangler deploy
```

5. Copy deployed URL and set it in `content-config.js`:

```js
window.PORTFOLIO_CMS_CONFIG = {
  workerBaseUrl: "https://portfolio-admin-api.<your-subdomain>.workers.dev"
};
```

6. Commit and push site changes to GitHub Pages.
