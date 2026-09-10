#!/usr/bin/env bash
set -euo pipefail

DATA_DIR="${A4G_DATA_DIR:-/var/lib/alliance4growth}"
BACKUP_DIR="${A4G_BACKUP_DIR:-/var/backups/alliance4growth}"
DB="$DATA_DIR/a4g_database.sqlite"
TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="$BACKUP_DIR/$TIMESTAMP"

mkdir -p "$DEST"

if [[ ! -f "$DB" ]]; then
  echo "Database not found: $DB" >&2
  exit 1
fi

# SQLite-safe backup, including WAL state.
sqlite3 "$DB" ".backup '$DEST/a4g_database.sqlite'"
if [[ -d "$DATA_DIR/uploads" ]]; then
  tar -C "$DATA_DIR" -czf "$DEST/uploads.tar.gz" uploads
fi

find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +
echo "Backup created: $DEST"
