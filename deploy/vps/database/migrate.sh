#!/usr/bin/env bash
# Copies Foogle Reader's control-plane database from Supabase to the VPS.
# Run as root after setup.sh.
#
#   read -rsp "Supabase session pooler URL: " SOURCE_URL; echo; export SOURCE_URL
#   bash deploy/vps/database/migrate.sh
#
# Copies the public and auth schemas with their row-level security policies
# and grants, so accounts and passwords carry over. Never writes to Supabase.
#
# Rerunning rebuilds the local copy from scratch, so it refuses while the app
# is running on it (FORCE=1 overrides; that would discard everything since).
set -euo pipefail

: "${SOURCE_URL:?Set SOURCE_URL to the Supabase session pooler connection string}"
DB="${DB:-foogle}"
BACKUPS="${BACKUPS:-/var/backups/foogle}"
SCHEMAS="public auth"
if [ "$(systemctl is-active foogle 2>/dev/null)" = active ] && [ "${FORCE:-0}" != 1 ]; then
  echo "foogle is running on the local database. Rerunning would discard everything written since."
  exit 1
fi

as_pg() { sudo -u postgres "$@"; }
local_sql() { as_pg psql -X -q -v ON_ERROR_STOP=1 -At -d "$DB" "$@"; }
src_sql() { psql -X -q -v ON_ERROR_STOP=1 -At "$SOURCE_URL" "$@"; }

install -d -m 750 -o postgres -g postgres "$BACKUPS"
dump="$BACKUPS/supabase-$(date +%Y%m%d-%H%M%S).dump"
echo "1/4 Dumping Supabase ($SCHEMAS) ..."
pg_dump --format=custom $(printf -- '--schema=%s ' $SCHEMAS) --file="$dump" "$SOURCE_URL"
chown postgres:postgres "$dump"; chmod 640 "$dump"
echo "    $dump ($(du -h "$dump" | cut -f1))"

echo "2/4 Rebuilding the local '$DB' database ..."
as_pg psql -X -q -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB' AND pid <> pg_backend_pid()" >/dev/null
as_pg psql -X -q -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS $DB" -c "CREATE DATABASE $DB"
as_pg psql -X -q -v ON_ERROR_STOP=1 -c "ALTER DATABASE $DB SET search_path = \"\$user\", public, extensions"

# Grants in the dump name Supabase's own roles (supabase_admin, dashboard_user,
# ...). Create any that don't exist yet, without login, so the grants restore.
for role in $(pg_restore --schema-only --file=- "$dump" | grep -oE '(TO|FROM) [a-z_][a-z0-9_]*' | awk '{print $2}' | sort -u); do
  case "$role" in public|current_user|session_user|pg_*) continue ;; esac
  as_pg psql -X -q -c "DO \$\$ BEGIN CREATE ROLE \"$role\" NOLOGIN; EXCEPTION WHEN duplicate_object THEN NULL; END \$\$"
done

local_sql -c "CREATE SCHEMA extensions" -c "GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role, foogle_auth"
for ext in $(src_sql -c "SELECT e.extname || ':' || n.nspname FROM pg_extension e JOIN pg_namespace n ON n.oid = e.extnamespace
    WHERE n.nspname IN ('public', 'extensions') AND e.extname NOT IN ('plpgsql', 'pg_stat_statements', 'pg_graphql', 'supabase_vault', 'pgsodium', 'pgjwt', 'pg_net')"); do
  name=${ext%%:*}; schema=${ext#*:}
  if [ "$(local_sql -c "SELECT count(*) FROM pg_available_extensions WHERE name = '$name'")" = 1 ]; then
    local_sql -c "CREATE EXTENSION IF NOT EXISTS \"$name\" SCHEMA $schema"
    echo "    extension $name ($schema)"
  else
    echo "    extension $name isn't installed on this server; the restore will stop if the app needs it"
  fi
done

list=$(mktemp); chmod 644 "$list"
# Leave out the realtime publication and the CREATE SCHEMA for public, which
# every new database already has. Policies and grants stay.
pg_restore --list "$dump" | grep -vE ' (PUBLICATION|PUBLICATION TABLE|SCHEMA - public|COMMENT - SCHEMA public) ' > "$list"
as_pg pg_restore --dbname="$DB" --no-owner --exit-on-error --single-transaction --use-list="$list" "$dump"
rm -f "$list"

# Supabase Auth runs its own migrations as foogle_auth, so it must own
# its schema. Everything else stays with postgres, as on Supabase.
local_sql <<'SQL'
ALTER SCHEMA auth OWNER TO foogle_auth;
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT c.oid::regclass AS obj, c.relkind FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = 'auth' AND c.relkind IN ('r', 'p', 'v', 'm', 'S', 'f')
             -- sequences owned by a column move with their table
             AND NOT (c.relkind = 'S' AND EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = c.oid AND d.deptype IN ('a', 'i'))) LOOP
    EXECUTE format('ALTER %s %s OWNER TO foogle_auth',
      CASE r.relkind WHEN 'S' THEN 'SEQUENCE' WHEN 'v' THEN 'VIEW' WHEN 'm' THEN 'MATERIALIZED VIEW' WHEN 'f' THEN 'FOREIGN TABLE' ELSE 'TABLE' END, r.obj);
  END LOOP;
  FOR r IN SELECT p.oid::regprocedure AS obj FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'auth' LOOP
    EXECUTE format('ALTER ROUTINE %s OWNER TO foogle_auth', r.obj);
  END LOOP;
  FOR r IN SELECT t.oid::regtype AS obj FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace
           WHERE n.nspname = 'auth' AND t.typtype IN ('e', 'd', 'c') AND NOT EXISTS (SELECT 1 FROM pg_class c WHERE c.reltype = t.oid) LOOP
    EXECUTE format('ALTER TYPE %s OWNER TO foogle_auth', r.obj);
  END LOOP;
END $$;
GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT CONNECT ON DATABASE foogle TO foogle_authenticator, foogle_auth;
SQL

echo "3/4 Comparing row counts ..."
bad=0; n=0
for t in $(local_sql -c "SELECT schemaname || '.' || tablename FROM pg_tables WHERE schemaname IN ('public', 'auth') ORDER BY 1"); do
  s=$(src_sql -c "SELECT count(*) FROM $t"); d=$(local_sql -c "SELECT count(*) FROM $t"); n=$((n + 1))
  [ "$s" = "$d" ] || { bad=1; printf '    %-40s supabase %9s   vps %9s  MISMATCH\n' "$t" "$s" "$d"; }
done
[ "$bad" = 0 ] || { echo "Row counts differ; stopping. Supabase is untouched."; exit 1; }
echo "    all $n tables match ($(local_sql -c 'SELECT count(*) FROM auth.users') accounts)"

# Sessions signed by Supabase's key can't be used here anyway; start clean so
# everyone signs in once on the new server.
echo "4/4 Clearing old sign-in sessions ..."
local_sql -c "TRUNCATE auth.sessions, auth.refresh_tokens CASCADE"

echo
echo "Done. Local database '$DB' matches Supabase as of this run."
echo "Next: deploy/vps/README.md step 3."
