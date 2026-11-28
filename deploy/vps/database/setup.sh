#!/usr/bin/env bash
# One-time setup of Foogle Reader's own database stack on the VPS (what it used
# Supabase for). Run as root after install.sh. Safe to run again: keeps
# existing passwords and keys.
#
#   PostgreSQL 17 (already installed)  database `foogle` (created by migrate.sh)
#   Supabase Auth (GoTrue)  127.0.0.1:54371  sign-in (sign-ups off: a personal reader)
#   PostgREST v13           127.0.0.1:54372  the same /rest/v1 API, same RLS
#   nginx                   /auth/v1, /rest/v1 and /functions/v1 on the site (FOOGLE_SITE)
#                           (deploy/vps/nginx.conf); 127.0.0.1:54370 for the feed fetcher
set -euo pipefail

AUTH_VERSION="${AUTH_VERSION:-v2.197.0}"
POSTGREST_VERSION="${POSTGREST_VERSION:-v13.0.6}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS=/etc/foogle-db                 # root only
as_pg() { sudo -u postgres psql -X -q -v ON_ERROR_STOP=1 -At "$@"; }
secret() { [ -f "$SECRETS/$1" ] || (umask 077; openssl rand -hex 24 > "$SECRETS/$1"); cat "$SECRETS/$1"; }

pg_lsclusters | grep -qE '^17 +main .* online' || { echo "PostgreSQL 17 isn't running."; exit 1; }
ENV=/etc/foogle.env
[ -f "$ENV" ] || { echo "$ENV is missing; run deploy/vps/install.sh first."; exit 1; }
envval() { grep -E "^$1=" "$ENV" | tail -1 | cut -d= -f2- | sed -E 's/^"(.*)"$/\1/'; }
# The address people use. FOOGLE_SITE in $ENV overrides it. Earlier addresses stay valid
# for links already sent by email (password resets, confirmations).
site=$(envval FOOGLE_SITE || true); site=${site:-https://reader.antderosa.com}
old_sites="https://foogle.antderosa.com"
# SMTP_* in $ENV turn on email: sign-up confirmations and password resets. Without
# them sign-ups stay off (nobody could confirm an account) and resets can't be sent.
# FOOGLE_SIGNUPS=off in $ENV keeps sign-ups off even with SMTP set (resets still work).
if [ -n "$(envval SMTP_HOST || true)" ] && [ "$(envval FOOGLE_SIGNUPS || true)" != "off" ]; then
  disable_signup=false
else
  disable_signup=true
fi

echo "Roles ..."
install -d -m 700 "$SECRETS"
auth_pw=$(secret auth_admin.password)
rest_pw=$(secret authenticator.password)
as_pg <<SQL
DO \$\$ BEGIN CREATE ROLE anon NOLOGIN NOINHERIT; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE ROLE authenticated NOLOGIN NOINHERIT; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE ROLE foogle_authenticator LOGIN NOINHERIT; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE ROLE foogle_auth LOGIN NOINHERIT; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
DO \$\$ BEGIN CREATE ROLE supabase_auth_admin NOLOGIN NOINHERIT; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$;
ALTER ROLE foogle_authenticator LOGIN PASSWORD '$rest_pw';
ALTER ROLE foogle_auth LOGIN PASSWORD '$auth_pw';
ALTER ROLE foogle_auth SET search_path = auth;
GRANT anon, authenticated, service_role TO foogle_authenticator;
SQL

echo "Keys ..."
[ -f "$SECRETS/jwt.secret" ] || (umask 077; openssl rand -base64 48 | tr -d '\n=' | tr '+/' '-_' > "$SECRETS/jwt.secret")
mint() {
  JWT_SECRET=$(cat "$SECRETS/jwt.secret") ROLE="$1" node -e '
    const { createHmac } = require("node:crypto")
    const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url")
    const now = Math.floor(Date.now() / 1000)
    const body = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ role: process.env.ROLE, iss: "foogle-vps", iat: now, exp: now + 10 * 365 * 86400 })}`
    process.stdout.write(`${body}.${createHmac("sha256", process.env.JWT_SECRET).update(body).digest("base64url")}`)'
}
[ -f "$SECRETS/anon.key" ] || (umask 077; mint anon > "$SECRETS/anon.key")
[ -f "$SECRETS/service.key" ] || (umask 077; mint service_role > "$SECRETS/service.key")
# The app reads VITE_* at build time; the feed fetcher reads the rest.
setenv() { if grep -qE "^$1=" "$ENV"; then sed -i "s|^$1=.*|$1=$2|" "$ENV"; else echo "$1=$2" >> "$ENV"; fi; }
setenv VITE_SUPABASE_URL same-origin
setenv VITE_SUPABASE_ANON_KEY "$(cat "$SECRETS/anon.key")"
setenv SUPABASE_URL "http://127.0.0.1:54370"
setenv SUPABASE_SERVICE_ROLE_KEY "$(cat "$SECRETS/service.key")"
setenv FOOGLE_JWT_SECRET "$(cat "$SECRETS/jwt.secret")"

echo "Supabase Auth $AUTH_VERSION ..."
id gotrue >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin gotrue
if [ ! -x "/opt/supabase-auth/$AUTH_VERSION/auth" ]; then
  tmp=$(mktemp -d)
  curl -fsSL -o "$tmp/a.tgz" "https://github.com/supabase/auth/releases/download/$AUTH_VERSION/auth-$AUTH_VERSION-x86.tar.gz"
  install -d "/opt/supabase-auth/$AUTH_VERSION"
  tar -xzf "$tmp/a.tgz" -C "/opt/supabase-auth/$AUTH_VERSION"
  rm -rf "$tmp"
fi
ln -sfn "/opt/supabase-auth/$AUTH_VERSION" /opt/supabase-auth/current

install -m 640 -o root -g gotrue /dev/null /etc/foogle-auth.env
cat > /etc/foogle-auth.env <<CONF
# Written by deploy/vps/database/setup.sh
GOTRUE_API_HOST=127.0.0.1
PORT=54371
API_EXTERNAL_URL=$site
GOTRUE_DB_DRIVER=postgres
DATABASE_URL=postgres://foogle_auth:$auth_pw@127.0.0.1:5432/foogle?search_path=auth
GOTRUE_DB_MIGRATIONS_PATH=/opt/supabase-auth/current/migrations
GOTRUE_SITE_URL=$site
GOTRUE_URI_ALLOW_LIST=$site,$site/**,$old_sites,$old_sites/**
# false only when SMTP_* is set in /etc/foogle.env (see the top of this script).
GOTRUE_DISABLE_SIGNUP=$disable_signup
GOTRUE_JWT_SECRET=$(cat "$SECRETS/jwt.secret")
GOTRUE_JWT_EXP=3600
GOTRUE_JWT_AUD=authenticated
GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated
GOTRUE_JWT_ADMIN_ROLES=service_role
GOTRUE_EXTERNAL_EMAIL_ENABLED=true
GOTRUE_EXTERNAL_PHONE_ENABLED=false
GOTRUE_MAILER_AUTOCONFIRM=false
GOTRUE_MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify
GOTRUE_MAILER_URLPATHS_INVITE=/auth/v1/verify
GOTRUE_MAILER_URLPATHS_RECOVERY=/auth/v1/verify
GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE=/auth/v1/verify
GOTRUE_RATE_LIMIT_HEADER=X-Forwarded-For
GOTRUE_LOG_LEVEL=info
CONF
if [ -n "$(envval SMTP_HOST)" ]; then
  smtp_from=$(envval SMTP_FROM || true)
  [ -n "$smtp_from" ] || smtp_from=$(envval SMTP_USER)
  cat >> /etc/foogle-auth.env <<CONF
GOTRUE_SMTP_HOST=$(envval SMTP_HOST)
GOTRUE_SMTP_PORT=$(envval SMTP_PORT)
GOTRUE_SMTP_USER=$(envval SMTP_USER)
GOTRUE_SMTP_PASS=$(envval SMTP_PASSWORD)
GOTRUE_SMTP_ADMIN_EMAIL=$smtp_from
GOTRUE_SMTP_SENDER_NAME=Foogle Reader
CONF
fi

echo "PostgREST $POSTGREST_VERSION ..."
if ! /usr/local/bin/postgrest --version 2>/dev/null | grep -q "${POSTGREST_VERSION#v}"; then
  tmp=$(mktemp -d)
  curl -fsSL -o "$tmp/p.tar.xz" "https://github.com/PostgREST/postgrest/releases/download/$POSTGREST_VERSION/postgrest-$POSTGREST_VERSION-linux-static-x86-64.tar.xz"
  tar -xJf "$tmp/p.tar.xz" -C "$tmp" && install -m 755 "$tmp/postgrest" /usr/local/bin/postgrest && rm -rf "$tmp"
fi
id postgrest >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin postgrest
install -m 640 -o root -g postgrest /dev/null /etc/foogle-postgrest.conf
cat > /etc/foogle-postgrest.conf <<CONF
# Written by deploy/vps/database/setup.sh
db-uri = "postgres://foogle_authenticator:$rest_pw@127.0.0.1:5432/foogle"
db-schemas = "public"
db-anon-role = "anon"
db-extra-search-path = "public, extensions"
jwt-secret = "$(cat "$SECRETS/jwt.secret")"
db-max-rows = 1000
db-pool = 10
server-host = "127.0.0.1"
server-port = 54372
log-level = "warn"
CONF

echo "Services, backups and nginx ..."
install -d -m 750 -o postgres -g postgres /var/backups/foogle
cp "$HERE"/foogle-auth.service "$HERE"/foogle-postgrest.service "$HERE"/foogle-db-backup.service "$HERE"/foogle-db-backup.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable foogle-auth foogle-postgrest >/dev/null 2>&1
cp "$HERE/nginx-foogle-db-gateway.conf" /etc/nginx/sites-available/foogle-db-gateway
ln -sf /etc/nginx/sites-available/foogle-db-gateway /etc/nginx/sites-enabled/foogle-db-gateway
nginx -t && systemctl reload nginx

echo
echo "Set up. Next: copy the data (deploy/vps/README.md step 2)."
