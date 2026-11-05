DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'uzex') THEN
    CREATE ROLE uzex LOGIN PASSWORD 'UzexInsight2026';
  END IF;
END
$$;

SELECT 'CREATE DATABASE uzex_insight OWNER uzex'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'uzex_insight')\gexec

\c uzex_insight

GRANT ALL ON SCHEMA public TO uzex;
ALTER SCHEMA public OWNER TO uzex;
