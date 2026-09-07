# eSlate Dev Environment — Deployment Summary

## Overview

Deployed the eSlate Node.js app to **https://dev.eslate.com.au** on Hostinger Business hosting.

---

## 1. Problem: GoDaddy Hosting Doesn't Support Node.js

**What we tried:** Deploy eSlate (Node.js/Express app) to GoDaddy cPanel shared hosting using `.cpanel.yml` auto-deployment.

**Issues found:**
- GoDaddy shared hosting has no Node.js runtime — confirmed by GoDaddy support
- `nohup: failed to run command 'node': Permission denied` — node binary doesn't exist
- `.cpanel.yml` deployment only supports static file copying, not running server processes

**Decision:** Abandon GoDaddy hosting, move to Hostinger Business plan which supports Node.js Web Apps natively.

---

## 2. Move to Hostinger

**Plan purchased:** Hostinger Business (A$294 / 48 months, promo code COUPONSPAGE)

**Key facts:**
- Hostinger Business supports up to 5 Node.js Web Apps
- GitHub auto-deployment built in (pushes to a branch trigger redeploy)
- MySQL database included
- SSH access available
- Domain registration stays on GoDaddy (3-year subscription already paid)

---

## 3. Hostinger Setup

### 3.1 Create Node.js Web App
- Website: `dev.eslate.com.au`
- Connected GitHub repo: `trupti2411/eSlate`, branch: `dev`
- Entry file: `dist/index.js`
- Node version: 22.x

### 3.2 Environment Variables Set
| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | `eslate-jwt-secret-dev-2026` |
| `SESSION_SECRET` | `eslate-session-secret-dev-2026` |
| `DATABASE_URL` | `mysql://u655971446_eslate_dev:ESlateD3v2026@127.0.0.1:3306/u655971446_eslate_dev` |

> **Note:** `127.0.0.1` must be used instead of `localhost` — on this server, `localhost` resolves to IPv6 (`::1`) which MySQL rejects.

### 3.3 MySQL Database
- Created via Hostinger hPanel → Databases → Management
- Database: `u655971446_eslate_dev`
- User: `u655971446_eslate_dev`
- Password: `ESlateD3v2026`
- Host (internal): `127.0.0.1`
- Host (external/remote): `srv1786.hstgr.io:3306`

### 3.4 Schema & Seed
Run locally against remote database:
```bash
DATABASE_URL="mysql://u655971446_eslate_dev:ESlateD3v2026@srv1786.hstgr.io:3306/u655971446_eslate_dev" npm run db:push
DATABASE_URL="mysql://u655971446_eslate_dev:ESlateD3v2026@srv1786.hstgr.io:3306/u655971446_eslate_dev" npm run db:seed
```

### 3.5 DNS (GoDaddy)
Updated the `dev` A record in GoDaddy DNS:
- Name: `dev`
- Type: `A`
- Value: `46.202.138.76` (Hostinger server IP)

---

## 4. Deployment Issues & Fixes

### Issue 1: `vite: command not found` during build
**Cause:** Hostinger runs `npm run build`, but `vite` is a devDependency not installed in production.  
**Fix:** Changed `build` script in `package.json` to skip building since `dist/` is pre-built and committed:
```json
"build": "echo 'Using pre-built dist'"
```

### Issue 2: `canvas` package native build failure
**Cause:** `canvas` npm package requires Python/gcc to compile native bindings on Hostinger.  
**Fix:** Removed `canvas` from `package.json` (it was unused in the codebase).

### Issue 3: `Error: Dynamic require of "path" is not supported`
**Cause:** Bundle was built as ESM (`--format=esm`) but some npm packages use CommonJS `require()` dynamically.  
**Fix:**
- Changed esbuild output format to CJS (`--format=cjs`)
- Added `dist/package.json` with `{"type": "commonjs"}` so Node.js treats `dist/index.js` as CJS
- Externalized `vite` and `../vite.config` from the bundle (dev-only, never runs in production)
- Fixed `import.meta.dirname` in `server/vite.ts` for CJS compatibility

### Issue 4: Server bound to `localhost` — Hostinger reverse proxy can't reach it
**Cause:** `server.listen({ host: "localhost" })` binds to `127.0.0.1` only, blocking Hostinger's reverse proxy.  
**Fix:** Changed to `host: "0.0.0.0"` in `server/index.ts`.

### Issue 5: `Access denied for user '@::1'` — MySQL IPv6 rejection
**Cause:** `localhost` in `DATABASE_URL` resolved to `::1` (IPv6), but MySQL only allows `127.0.0.1`.  
**Fix:** Updated `DATABASE_URL` env var to use `127.0.0.1` explicitly.

### Issue 6: Sign In button hidden on landing page
**Cause:** `{!import.meta.env.PROD && <SignIn />}` — button was intentionally hidden in production builds.  
**Fix:** Removed the condition so the Sign In button always shows.

---

## 5. Build Process

The `dist/` folder is pre-built locally and committed to the repo. Hostinger skips the build step entirely.

### To rebuild after server code changes:
```bash
# Rebuild server bundle (CJS)
npx esbuild server/index.ts --platform=node --bundle --format=cjs --minify \
  --outfile=dist/index.js \
  --external:fsevents --external:"*.node" --external:@babel/preset-typescript \
  --external:lightningcss --external:vite --external:"../vite.config"
```

### To rebuild after frontend changes:
```bash
npx vite build
```

### To rebuild everything:
```bash
npm run build:local
```

Then commit `dist/` and push to `dev` branch — Hostinger auto-deploys.

---

## 6. Final State

| Item | Value |
|------|-------|
| URL | https://dev.eslate.com.au |
| Platform admin | admin@eslate.com / password |
| Hosting | Hostinger Business |
| Server IP | 46.202.138.76 |
| MySQL host (external) | srv1786.hstgr.io:3306 |
| GitHub branch | dev |
| Node version | 22.x |
| SSH | `ssh -p 65002 u655971446@46.202.138.76` |

---

## 7. Test Data

5 companies seeded, each with a company admin, tutor, 3 subjects, 3 students per subject, and 2 assignments per student.

| Company | Admin Login | State |
|---------|-------------|-------|
| BrightMinds Tutoring | admin@brightminds.com.au / password | NSW |
| EduEdge Academy | admin@eduedge.com.au / password | VIC |
| SmartPath Learning | admin@smartpath.com.au / password | QLD |
| Pinnacle Tutors | admin@pinnacle.com.au / password | WA |
| NextGen Education | admin@nextgen.com.au / password | SA |

To re-run test seed:
```bash
DATABASE_URL="mysql://u655971446_eslate_dev:ESlateD3v2026@srv1786.hstgr.io:3306/u655971446_eslate_dev" npx tsx server/seed-test-data.ts
```

---

## 8. Next Steps

- [ ] Set up `test` environment on Hostinger (same process, new website + database)
- [ ] Set up `prod` environment on Hostinger (same process, point eslate.com.au)
- [ ] Cancel GoDaddy hosting plan (keep domain registration)
