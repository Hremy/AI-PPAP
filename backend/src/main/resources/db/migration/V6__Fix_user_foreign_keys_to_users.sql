-- V6: Fix FKs to point to users and backfill data from _user if necessary
 
 -- Note: We intentionally avoid copying from legacy table _user because
 -- environments may no longer have it or its columns may differ. Our goal here
 -- is solely to correct foreign key references on join tables.
 
  -- 1) user_projects.user_id should reference users(id)
  DO $$
  DECLARE r RECORD;
  BEGIN
    -- Drop known or legacy constraints if present
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'user_projects' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'fkme9ut9j2go3t1wfe4rsc7o8l1'
    ) THEN
      ALTER TABLE user_projects DROP CONSTRAINT fkme9ut9j2go3t1wfe4rsc7o8l1;
    END IF;

    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'user_projects' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'fk_user_projects_user'
    ) THEN
      ALTER TABLE user_projects DROP CONSTRAINT fk_user_projects_user;
    END IF;

    -- Drop any FK on user_projects(user_id) dynamically
    PERFORM 1 FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'user_projects'
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
     WHERE c.contype = 'f' AND a.attname = 'user_id';
    IF FOUND THEN
      -- Loop and drop all FKs on user_projects referencing user_id
      FOR r IN 
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'user_projects'
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
        WHERE c.contype = 'f' AND a.attname = 'user_id'
      LOOP
        EXECUTE format('ALTER TABLE user_projects DROP CONSTRAINT %I', r.conname);
      END LOOP;
    END IF;

    -- Recreate FK to users
    IF to_regclass('public.users') IS NOT NULL THEN
      ALTER TABLE user_projects
        ADD CONSTRAINT fk_user_projects_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
    END IF;
  END $$;

  -- 2) manager_projects.manager_id should reference users(id)
  DO $$
  DECLARE r RECORD;
  BEGIN
    -- Drop known or legacy constraints if present
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'manager_projects' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'fk_manager_projects_user'
    ) THEN
      ALTER TABLE manager_projects DROP CONSTRAINT fk_manager_projects_user;
    END IF;

    -- Drop any FK on manager_projects(manager_id) dynamically
    PERFORM 1 FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'manager_projects'
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
     WHERE c.contype = 'f' AND a.attname = 'manager_id';
    IF FOUND THEN
      FOR r IN 
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid AND t.relname = 'manager_projects'
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
        WHERE c.contype = 'f' AND a.attname = 'manager_id'
      LOOP
        EXECUTE format('ALTER TABLE manager_projects DROP CONSTRAINT %I', r.conname);
      END LOOP;
    END IF;

    -- Recreate FK to users
    IF to_regclass('public.users') IS NOT NULL THEN
      ALTER TABLE manager_projects
        ADD CONSTRAINT fk_manager_projects_user FOREIGN KEY (manager_id) REFERENCES users (id) ON DELETE CASCADE;
    END IF;
  END $$;
