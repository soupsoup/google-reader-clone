#!/usr/bin/env bash
# One-time move of the reader from foogle.antderosa.com to reader.antderosa.com.
# Run as root on the VPS after DNS for reader.antderosa.com points at this server.
# Safe to run again. foogle.antderosa.com keeps working as a permanent redirect.
set -euo pipefail

NEW=reader.antderosa.com
OLD=foogle.antderosa.com
APP=/var/www/foogle
HERE="$APP/deploy/vps"
SITE_CONF=/etc/nginx/sites-available/foogle

echo "1/5 Checking DNS ..."
new_ip=$(getent ahostsv4 "$NEW" | awk 'NR==1{print $1}')
old_ip=$(getent ahostsv4 "$OLD" | awk 'NR==1{print $1}')
if [ -z "$new_ip" ]; then
  echo "$NEW doesn't resolve yet. Add the DNS record (same target as $OLD), wait a few minutes, then run this again."
  exit 1
fi
if [ "$new_ip" != "$old_ip" ]; then
  echo "$NEW points at $new_ip but $OLD points at $old_ip. Fix the DNS record, then run this again."
  exit 1
fi

echo "2/5 Updating the code ..."
systemctl start foogle-deploy   # same job the timer runs: fetches main if it moved
grep -q 'same-origin' "$HERE/database/setup.sh" || { echo "This checkout is older than the domain change. Merge it first."; exit 1; }

echo "3/5 nginx and HTTPS for $NEW (and the $OLD redirect) ..."
cp "$SITE_CONF" "$SITE_CONF.bak-$(date +%Y%m%d-%H%M%S)"
cp "$HERE/nginx.conf" "$SITE_CONF"
nginx -t
systemctl reload nginx
certbot --nginx --non-interactive --expand --redirect -d "$NEW" -d "$OLD"

echo "4/5 Sign-in service at the new address ..."
ENV=/etc/foogle.env
if grep -q '^FOOGLE_SITE=' "$ENV"; then sed -i "s|^FOOGLE_SITE=.*|FOOGLE_SITE=https://$NEW|" "$ENV"; else echo "FOOGLE_SITE=https://$NEW" >> "$ENV"; fi
bash "$HERE/database/setup.sh" >/dev/null
systemctl restart foogle-auth

echo "5/5 Rebuilding the app without a built-in address (about 20 seconds) ..."
# Earlier builds have https://$OLD compiled in. Rebuild now that /etc/foogle.env says same-origin.
systemd-run --wait --quiet --uid=foogle --gid=foogle -p EnvironmentFile="$ENV" \
  -p Environment=NODE_OPTIONS=--max-old-space-size=1024 \
  -p WorkingDirectory="$APP" "$APP/deploy/vps/deploy.sh" --force

echo
grep -E '^(GOTRUE_SITE_URL|API_EXTERNAL_URL|GOTRUE_DISABLE_SIGNUP)=' /etc/foogle-auth.env
curl -sI "https://$OLD/" | grep -i '^location' || true
curl -s -o /dev/null -w "https://$NEW/ answers %{http_code}\n" "https://$NEW/"
echo "Done. Open https://$NEW and sign in again (sign-ins don't carry over between addresses)."
