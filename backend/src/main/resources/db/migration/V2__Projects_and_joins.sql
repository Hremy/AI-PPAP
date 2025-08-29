-- V2: Create projects and join tables

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Join table for user -> projects (employee memberships)
CREATE TABLE IF NOT EXISTS user_projects (
    user_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, project_id),
    CONSTRAINT fk_user_projects_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_projects_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_project_id ON user_projects(project_id);

-- Join table for manager -> projects (manager assignments)
CREATE TABLE IF NOT EXISTS manager_projects (
    manager_id BIGINT NOT NULL,
    project_id BIGINT NOT NULL,
    PRIMARY KEY (manager_id, project_id),
    CONSTRAINT fk_manager_projects_user FOREIGN KEY (manager_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_manager_projects_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_manager_projects_manager_id ON manager_projects(manager_id);
CREATE INDEX IF NOT EXISTS idx_manager_projects_project_id ON manager_projects(project_id);
