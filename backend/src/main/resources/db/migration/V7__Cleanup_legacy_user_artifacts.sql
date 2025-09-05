-- V7: Cleanup legacy _user artifacts and stray FKs

-- 1) Drop any FKs that still reference _user
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN 
    SELECT c.conname AS conname,
           n.nspname AS schema_name,
           t.relname AS table_name
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_class rt ON rt.oid = c.confrelid
    WHERE c.contype = 'f'
      AND rt.relname = '_user'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I', r.schema_name, r.table_name, r.conname);
  END LOOP;
END $$;

-- 2) Drop legacy _user table if it still exists
DO $$
BEGIN
  IF to_regclass('public._user') IS NOT NULL THEN
    EXECUTE 'DROP TABLE _user CASCADE';
  END IF;
END $$;
