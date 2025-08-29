-- V4: Revert _user back to users and fix dependent objects

-- 1) Rename table back to users if needed
DO $$
BEGIN
  IF to_regclass('public.users') IS NULL AND to_regclass('public._user') IS NOT NULL THEN
    ALTER TABLE _user RENAME TO users;
  END IF;
END $$;

-- 2) Ensure FKs on evaluations reference users (drop if exist and recreate)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'evaluations'
      AND tc.constraint_name = 'fk_evaluation_employee'
  ) THEN
    ALTER TABLE evaluations DROP CONSTRAINT fk_evaluation_employee;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'evaluations'
      AND tc.constraint_name = 'fk_evaluation_reviewer'
  ) THEN
    ALTER TABLE evaluations DROP CONSTRAINT fk_evaluation_reviewer;
  END IF;

  -- Recreate constraints pointing to users
  IF to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE evaluations
      ADD CONSTRAINT fk_evaluation_employee FOREIGN KEY (employee_id) REFERENCES users (id) ON DELETE CASCADE;

    ALTER TABLE evaluations
      ADD CONSTRAINT fk_evaluation_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3) Ensure function create_manager inserts into users
CREATE OR REPLACE FUNCTION create_manager(
    p_username VARCHAR(255),
    p_email VARCHAR(255),
    p_password VARCHAR(255),
    p_first_name VARCHAR(100),
    p_last_name VARCHAR(100),
    p_department VARCHAR(100)
) RETURNS BIGINT AS $$
DECLARE
    v_user_id BIGINT;
BEGIN
    INSERT INTO users (username, password, email, first_name, last_name, department, position)
    VALUES (p_username, p_password, p_email, p_first_name, p_last_name, p_department, 'Manager')
    RETURNING id INTO v_user_id;

    -- store role name consistent with app logic
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'ROLE_MANAGER');

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;
