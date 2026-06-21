#!/usr/bin/env bash
# Run a .sql migration file from this folder against the configured database.
# Usage: ./run-migration.sh migrate-attendance-session-qr-expiry-nullable.sql
#
# Connection defaults to this project's DB (see ../src/main/resources/application-prod.yaml).
# Override via env vars if pointing at a different database:
#   DB_HOST DB_PORT DB_NAME DB_USER DB_PASSWORD

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <migration-file.sql>" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/$1"

if [ ! -f "$SQL_FILE" ]; then
  echo "Migration file not found: $SQL_FILE" >&2
  exit 1
fi

DB_HOST="${DB_HOST:-167.172.88.194}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ks_it_school}"
DB_USER="${DB_USER:-postgres}"
: "${DB_PASSWORD:?Set DB_PASSWORD env var before running}"

if command -v psql >/dev/null 2>&1; then
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"
else
  python3 - "$SQL_FILE" <<'PYEOF'
import sys
import psycopg2
import os

sql_file = sys.argv[1]
conn = psycopg2.connect(
    host=os.environ.get("DB_HOST", "167.172.88.194"),
    port=os.environ.get("DB_PORT", "5432"),
    dbname=os.environ.get("DB_NAME", "ks_it_school"),
    user=os.environ.get("DB_USER", "postgres"),
    password=os.environ["DB_PASSWORD"],
)
conn.autocommit = True
with open(sql_file) as f:
    sql = f.read()
with conn.cursor() as cur:
    cur.execute(sql)
print(f"✔ Ran {sql_file}")
conn.close()
PYEOF
fi
