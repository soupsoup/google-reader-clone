# Foogle Reader on the VPS (off Vercel and Supabase)

Everything runs on the VPS at https://reader.antderosa.com (https://foogle.antderosa.com, the first address, redirects there):

| Was | On the VPS |
|---|---|
| Vercel (the React app) | nginx serves the Vite build from `/var/www/foogle/.releases/current`; a timer rebuilds when `main` changes |
| Supabase Postgres + row-level security | PostgreSQL 17, database `foogle`, same policies, grants and functions |
| Supabase REST (`/rest/v1`) | PostgREST v13 on 127.0.0.1:54372 |
| Supabase Auth (`/auth/v1`) | Supabase Auth (GoTrue) on 127.0.0.1:54371; existing accounts and passwords kept; sign-ups and password resets once email is set up (below) |
| Edge Function `fetch-feeds` (`/functions/v1`) | `server/fetch-feeds.mjs` as `foogle.service` on 127.0.0.1:4417 |

The browser talks only to reader.antderosa.com, and the app calls its own address for the API, so no domain is compiled into the build. Everyone signs in once after the move.

The feed fetcher now needs a signed-in user (Supabase's gateway let anyone
with the public key call it), subscribes only the signed-in user, and won't
fetch addresses on the server's own network.

Run every step as root on the VPS.

## 1. Clone and install

The repo is public, so no deploy key is needed.

```sh
id foogle >/dev/null 2>&1 || useradd --system --create-home --home-dir /var/lib/foogle --shell /usr/sbin/nologin foogle
install -d -o foogle -g foogle /var/www/foogle
sudo -u foogle git clone -q https://github.com/soupsoup/google-reader-clone.git /var/www/foogle
bash /var/www/foogle/deploy/vps/install.sh
certbot --nginx -d reader.antderosa.com -d foogle.antderosa.com
```

## 2. Database stack

```sh
bash /var/www/foogle/deploy/vps/database/setup.sh
read -rsp "Supabase session pooler URL: " SOURCE_URL; echo; export SOURCE_URL
bash /var/www/foogle/deploy/vps/database/migrate.sh; unset SOURCE_URL
systemctl start foogle-postgrest foogle-auth
```

The connection string is the Foogle project's **Session pooler** string
(Supabase → Connect). The project is the one in the Vercel project's
`VITE_SUPABASE_URL`.

## 3. Build and start

```sh
systemctl start foogle-deploy && systemctl enable --now foogle-deploy.timer foogle-db-backup.timer
systemctl restart foogle; systemctl is-active foogle foogle-auth foogle-postgrest
```

Open https://reader.antderosa.com, sign in, refresh a feed, add one.

## Sign-ups and password resets

Both need email: new accounts confirm their address by email, and a reset sends a link.
Without email settings, sign-ups stay off and resets can't be sent.

1. Add the mail account to `/etc/foogle.env` (root only, never commit it):

   ```sh
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_USER=reader@antderosa.com
   SMTP_PASSWORD=...
   SMTP_FROM=reader@antderosa.com   # optional, defaults to SMTP_USER
   # FOOGLE_SIGNUPS=off             # optional: resets only, no new accounts
   ```

2. Rewrite the auth settings and restart it:

   ```sh
   bash /var/www/foogle/deploy/vps/database/setup.sh
   systemctl restart foogle-auth
   ```

3. Check it: on https://reader.antderosa.com/auth, use "Forgot password?" with your own
   address and follow the link to `/reset-password`. Then create a test account and
   confirm it from the email. `journalctl -u foogle-auth -n 50` shows mail errors.

## Moving from foogle.antderosa.com to reader.antderosa.com (one time)

1. Add a DNS record for `reader.antderosa.com` with the same target as `foogle.antderosa.com`.
2. Once it resolves, run `bash /var/www/foogle/deploy/vps/move-to-reader-domain.sh` as root.
   It checks DNS, installs the nginx config (reader serves the app, foogle redirects),
   adds HTTPS for both names, points the sign-in service at the new address and rebuilds.
3. Sign in again at https://reader.antderosa.com.

To use another address later, set `FOOGLE_SITE` in `/etc/foogle.env`, update
`server_name` in the nginx site, rerun `database/setup.sh` and restart `foogle-auth`.
No rebuild is needed.

## Day to day

- Logs: `journalctl -u foogle` (feed fetcher), `journalctl -u foogle-auth`.
- Sign-ups are off. To allow them, fill `SMTP_*` in `/etc/foogle.env`, set
  `GOTRUE_DISABLE_SIGNUP=false` in `/etc/foogle-auth.env` (setup.sh writes it;
  rerunning setup.sh resets it to true), and restart `foogle-auth`.
- New migrations in `supabase/migrations/`:
  `sudo -u postgres psql -X -v ON_ERROR_STOP=1 -d foogle -f <file>.sql && systemctl reload foogle-postgrest`.
- Changes to `supabase/functions/fetch-feeds` need copying into
  `server/fetch-feeds.mjs`, which is what runs here.
- Backups: nightly dump at 04:20 to `/var/backups/foogle/`, 14 days.
- After a week or two, delete the Vercel project and pause, then delete, the
  Supabase project.
