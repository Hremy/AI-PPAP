-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department VARCHAR(100),
    position VARCHAR(100)
);

-- Create user_roles table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    overall_rating DECIMAL(3,1),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluation_employee FOREIGN KEY (employee_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluation_reviewer FOREIGN KEY (reviewer_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_evaluations_employee_id ON evaluations(employee_id);
CREATE INDEX idx_evaluations_reviewer_id ON evaluations(reviewer_id);
CREATE INDEX idx_evaluations_status ON evaluations(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on evaluations table
CREATE TRIGGER update_evaluations_updated_at
BEFORE UPDATE ON evaluations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to create a manager
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
    -- Insert the user
    INSERT INTO users (username, password, email, first_name, last_name, department, position)
    VALUES (p_username, p_password, p_email, p_first_name, p_last_name, p_department, 'Manager')
    RETURNING id INTO v_user_id;
    
    -- Assign manager role
    INSERT INTO user_roles (user_id, role)
    VALUES (v_user_id, 'ROLE_MANAGER');
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;
