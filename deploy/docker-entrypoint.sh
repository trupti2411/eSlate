#!/bin/sh
# Run on every Render deploy. Idempotent — safe to re-execute.
set -e

cd /app

# Wait for Postgres to be reachable before running migrations.
# Render's managed Postgres is usually instant, but in case the API
# container boots first we retry for up to 60s instead of crashing out.
echo "[entrypoint] waiting for database..."
i=0
until php -r "
  \$url = getenv('DB_URL');
  if (!\$url) { exit(1); }
  \$p = parse_url(\$url);
  \$dsn = sprintf('pgsql:host=%s;port=%d;dbname=%s', \$p['host'], \$p['port'] ?? 5432, ltrim(\$p['path'], '/'));
  try { new PDO(\$dsn, \$p['user'], \$p['pass'] ?? ''); exit(0); } catch (Throwable \$e) { exit(1); }
" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 12 ]; then
    echo "[entrypoint] database never became reachable (60s) — continuing anyway, expect failure"
    break
  fi
  echo "[entrypoint] still waiting for DB ($i/12)..."
  sleep 5
done

echo "[entrypoint] migrating + seeding"
# --force is required in production (Laravel refuses prompts).
# --seed runs DevUserSeeder — creates admin@eslate.com on first deploy,
# no-op afterwards because the seeder is idempotent on existing rows.
php artisan migrate --force --seed

echo "[entrypoint] storage:link (idempotent)"
php artisan storage:link 2>/dev/null || true

echo "[entrypoint] caching config + routes"
# Cache AFTER migrate so the DB connection is locked-in correctly.
php artisan config:cache
php artisan route:cache

echo "[entrypoint] starting FrankenPHP"
exec "$@"
