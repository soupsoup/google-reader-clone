#!/usr/bin/env bash
# Nightly dump of Foogle Reader's database (foogle-db-backup.timer, as postgres).
# Keeps 14 days in /var/backups/foogle.
set -euo pipefail
dir=/var/backups/foogle
out="$dir/foogle-$(date +%Y%m%d-%H%M).dump"
pg_dump --format=custom --file="$out.tmp" foogle
mv "$out.tmp" "$out"; chmod 640 "$out"
find "$dir" -name 'foogle-*.dump' -mtime +14 -delete
echo "Backed up $(du -h "$out" | cut -f1) to $out"
