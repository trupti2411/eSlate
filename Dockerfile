# syntax=docker/dockerfile:1.6
#
# Render deploy target for the eSlate Laravel API.
# The React frontend is a separate Render service (static site) — see render.yaml.
# Production runtime is FrankenPHP (Caddy + PHP-FPM in one binary).

FROM dunglas/frankenphp:1-php8.3-alpine

WORKDIR /app

# Postgres driver + opcache + bcmath are all Laravel needs in prod.
# (gd / zip / intl / pcntl are heavier and not used by the API.)
RUN install-php-extensions pdo_pgsql bcmath opcache

# Composer binary (multi-stage copy, no full composer image needed at runtime).
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Composer deps first so Docker can cache them across code-only rebuilds.
COPY api/composer.json api/composer.lock /app/
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-scripts

# Then the actual app code.
COPY api/ /app/
RUN composer dump-autoload --optimize

# Storage + bootstrap/cache must be writeable by the runtime user.
RUN chmod -R 775 storage bootstrap/cache \
 && chown -R www-data:www-data storage bootstrap/cache

# Caddy config — see Caddyfile at repo root.
COPY Caddyfile /etc/caddy/Caddyfile

# Entrypoint: runs migrate + seed on every deploy (idempotent), then exec's CMD.
COPY deploy/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    SERVER_NAME=:${PORT:-8080}

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
