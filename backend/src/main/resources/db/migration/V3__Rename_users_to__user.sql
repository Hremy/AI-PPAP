-- V3: Rename users table to _user and update function

-- Safely rename table if needed (PostgreSQL)
DO $$
BEGIN
  IF to_regclass('public._user') IS NULL AND to_regclass('public.users') IS NOT NULL THEN
    ALTER TABLE users RENAME TO _user;
  END IF;
END $$;

-- Ensure manager creation function inserts into _user
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
    INSERT INTO _user (username, password, email, first_name, last_name, department, position)
    VALUES (p_username, p_password, p_email, p_first_name, p_last_name, p_department, 'Manager')
    RETURNING id INTO v_user_id;

    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'ROLE_MANAGER');

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;
