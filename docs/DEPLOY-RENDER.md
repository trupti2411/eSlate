# Deploy `trupti-dev` → `dev.eslate.com.au` via Render

**Target:** the new Laravel + Vite stack on `trupti-dev`, auto-deploying on every push.
**Cost:** $0 — Render free tier + GoDaddy DNS (already paid for the domain).
**Total time:** ~10 minutes of clicking, once.

Production `eslate.com.au` (the legacy Express app on Google App Engine, last deployed April 10) is **untouched** by this. Two parallel deployments share the `eslate.com.au` domain via DNS.

---

## 1. Sign up at Render

1. Open https://dashboard.render.com/register
2. Click **"GitHub"** → authorise Render to read your repos.
3. When prompted to install Render's GitHub App, grant it access to **`trupti2411/eSlate`** (or "All repositories" if easier).

---

## 2. Create the Blueprint (provisions API + frontend + DB in one go)

1. In Render dashboard top-right: **New +** → **Blueprint**.
2. Pick the `trupti2411/eSlate` repo.
3. Render reads `render.yaml` from the repo root and previews three resources:
   - `eslate-api` (Web Service, Docker, free)
   - `eslate-frontend` (Static Site, free)
   - `eslate-db` (Postgres, free 90-day tier)
4. Confirm the branch is **`trupti-dev`**.
5. Click **Apply** at the bottom.

Render now does the first deploy. Watch the logs in the dashboard:
- `eslate-api` build will take ~5 min first time (Docker layers).
- `eslate-frontend` build will take ~2 min (vite build).
- `eslate-db` is instant.

When all three show **"Live"** (green), move on.

---

## 3. Verify the API is up

In your terminal (no need to wait for the DNS step):

```bash
curl https://eslate-api.onrender.com/healthz
# Expect: ok

curl -X POST https://eslate-api.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@eslate.com","password":"password"}'
# Expect: {"token":"...","user":{"email":"admin@eslate.com",...}}
```

If you get a token back, the API + database + seeder are all working.

---

## 4. Verify the frontend renders

Open https://eslate-frontend.onrender.com — you should see the eSlate login page. Log in with `admin@eslate.com / password`. You should land on the admin dashboard.

> If you see the login UI but get a CORS error in the browser console: the frontend deployed before `api/config/cors.php` shipped — push another commit (anything) to retrigger the Render build.

---

## 5. Wire `dev.eslate.com.au` to point at Render

This step uses GoDaddy DNS + Render's custom domain feature.

### 5a. In Render → eslate-frontend → Settings → Custom Domains
1. Click **Add Custom Domain**.
2. Enter `dev.eslate.com.au` → **Save**.
3. Render shows you a CNAME value, e.g. `eslate-frontend.onrender.com`. **Copy it.**

### 5b. In GoDaddy DNS
1. Log in to GoDaddy → My Products → next to `eslate.com.au` click **DNS**.
2. Scroll to **Records** → click **Add New Record**.
3. Fill in:
   - **Type:** `CNAME`
   - **Name:** `dev`
   - **Value:** the Render CNAME you copied (e.g. `eslate-frontend.onrender.com`)
   - **TTL:** `1 Hour` (default is fine)
4. **Save**.

DNS propagates in 5–60 minutes. Check progress with:
```bash
nslookup dev.eslate.com.au
```
When it resolves to a Render IP, you're done.

### 5c. (Optional but recommended) Custom domain for the API too
Repeat 5a + 5b but for `eslate-api`:
- In Render → eslate-api → Settings → Custom Domains → add `api.dev.eslate.com.au`.
- In GoDaddy DNS → add CNAME `api.dev` → `eslate-api.onrender.com`.
- **Then update `render.yaml`** — change `VITE_API_BASE` from `https://eslate-api.onrender.com` to `https://api.dev.eslate.com.au` and push. Frontend rebuild will pick it up.

---

## 6. Continuous deploy is now wired

Every push to `trupti-dev` triggers:
1. Render rebuilds the Docker image for `eslate-api` (if `api/` or `Dockerfile` changed)
2. Render rebuilds the static bundle for `eslate-frontend` (if `client/` or `vite.config.ts` changed)
3. Both go live automatically — no manual intervention needed.

Watch deploys at https://dashboard.render.com/.

---

## Operating notes

- **Free Postgres expires every 90 days.** Render emails a reminder. To extend, you either upgrade ($7/mo) or click "Create new Free DB" and update the linked service. For dev that's fine.
- **Cold starts:** free Web Services sleep after 15 min idle. First request takes ~30s to wake. Static frontend doesn't sleep.
- **Logs:** Render dashboard → service → "Logs" tab. The Laravel app writes to stderr so everything shows up there.
- **Reset the DB:** Render dashboard → eslate-db → "Connect" tab gives you a psql URL. Or just delete + recreate via Blueprint.
- **Rollback:** Render dashboard → service → "Manual Deploy" → pick a previous successful build.

## When to call me back

After step 5 finishes, ping me and I'll `curl https://dev.eslate.com.au/api/login` to confirm the full stack is reachable from the custom domain.
