#!/bin/sh
# Run on every Render deploy. Idempotent — safe to re-execute.
set -e

cd /app

echo "[entrypoint] caching config + routes"
php artisan config:cache
php artisan route:cache

echo "[entrypoint] migrating + seeding"
# --force is required in production (Laravel refuses prompts).
# --seed runs DevUserSeeder — creates admin@eslate.com on first deploy,
# no-op afterwards because the seeder is idempotent on existing rows.
php artisan migrate --force --seed

echo "[entrypoint] storage:link (idempotent)"
php artisan storage:link || true

echo "[entrypoint] starting FrankenPHP"
exec "$@"
