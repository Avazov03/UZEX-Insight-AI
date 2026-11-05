#!/usr/bin/env bash
set -euo pipefail

sudo -u postgres psql -v ON_ERROR_STOP=0 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'uzex') THEN
    CREATE ROLE uzex LOGIN PASSWORD 'UzexInsight2026';
  END IF;
END
$$;
SQL

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='uzex_insight'" | grep -q 1; then
  sudo -u postgres psql -c "CREATE DATABASE uzex_insight OWNER uzex;"
fi

sudo -u postgres psql -d uzex_insight <<'SQL'
GRANT ALL ON SCHEMA public TO uzex;
ALTER SCHEMA public OWNER TO uzex;
SQL

echo "DB_OK"
