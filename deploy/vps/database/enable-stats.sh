#!/usr/bin/env bash
# Turns on the owner-only Usage stats page (supabase/migrations/002_admin_stats.sql)
# and makes one existing account its admin. Run as root on the VPS. Safe to rerun.
#
#   bash /var/www/foogle/deploy/vps/database/enable-stats.sh you@example.com
set -euo pipefail

EMAIL="${1:?usage: enable-stats.sh <email of your Foogle account>}"
APP=/var/www/foogle
psql_foogle() { sudo -u postgres psql -X -q -v ON_ERROR_STOP=1 -At -d foogle "$@"; }

echo "Adding the stats functions ..."
psql_foogle -f "$APP/supabase/migrations/002_admin_stats.sql"

echo "Making $EMAIL the admin ..."
added=$(psql_foogle -v email="$EMAIL" <<'SQL'
INSERT INTO public.app_admins(user_id)
SELECT id FROM auth.users WHERE lower(email) = lower(:'email')
ON CONFLICT (user_id) DO NOTHING
RETURNING user_id;
SQL
)
is_admin=$(psql_foogle -v email="$EMAIL" <<'SQL'
SELECT 1 FROM public.app_admins a JOIN auth.users u ON u.id = a.user_id WHERE lower(u.email) = lower(:'email');
SQL
)
if [ "$is_admin" != 1 ]; then
  echo "No Foogle account uses $EMAIL. Sign up or check the address, then run this again."
  exit 1
fi
[ -n "$added" ] && echo "Added." || echo "Already an admin."

systemctl reload foogle-postgrest 2>/dev/null || systemctl restart foogle-postgrest
echo "Done. Reload Reader; Usage stats is in the settings (gear) menu."
