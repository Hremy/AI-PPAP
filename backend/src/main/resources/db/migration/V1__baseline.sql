CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    team_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    manager_id UUID
);
CREATE TABLE IF NOT EXISTS kpis (
    id UUID PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.0
);
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    reviewer_id UUID,
    type VARCHAR(20) NOT NULL,
    text TEXT,
    ratings JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    period VARCHAR(20) NOT NULL,
    value NUMERIC(6,2) NOT NULL,
    breakdown JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
