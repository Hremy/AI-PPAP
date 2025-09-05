-- V5: Normalize role names by removing leading 'ROLE_' prefix
-- This aligns DB-stored roles with application expectation where
-- authorities are built as 'ROLE_' || role

UPDATE user_roles SET role = 'ADMIN' WHERE role = 'ROLE_ADMIN';
UPDATE user_roles SET role = 'MANAGER' WHERE role = 'ROLE_MANAGER';
UPDATE user_roles SET role = 'EMPLOYEE' WHERE role = 'ROLE_EMPLOYEE';

-- Optional: enforce uppercase consistency
UPDATE user_roles SET role = UPPER(role);
