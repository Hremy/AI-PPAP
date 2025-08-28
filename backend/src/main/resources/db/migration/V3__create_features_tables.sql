-- Create features table
CREATE TABLE features (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    icon VARCHAR(255) NOT NULL,
    display_order INTEGER,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create feature_benefits table for storing benefits as a collection
CREATE TABLE feature_benefits (
    feature_id BIGINT NOT NULL,
    benefit VARCHAR(500) NOT NULL,
    FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE
);

-- Create integrations table
CREATE TABLE integrations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    integration_url VARCHAR(500),
    display_order INTEGER,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workflow_steps table
CREATE TABLE workflow_steps (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    step_number INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_features_active_display_order ON features(active, display_order);
CREATE INDEX idx_integrations_active_display_order ON integrations(active, display_order);
CREATE INDEX idx_workflow_steps_active_step_number ON workflow_steps(active, step_number);

-- Insert initial features data
INSERT INTO features (title, description, icon, display_order) VALUES
('Performance Analytics', 'Comprehensive performance tracking with real-time analytics and insights.', 'ChartBarIcon', 1),
('Smart Reviews', 'AI-powered review system with self, manager, and 360° peer reviews.', 'DocumentTextIcon', 2),
('AI Insights', 'Advanced AI analysis providing personalized recommendations and insights.', 'CpuChipIcon', 3),
('Team Management', 'Comprehensive team oversight with collaborative performance management.', 'UserGroupIcon', 4),
('Enterprise Security', 'Bank-level security with role-based access and data protection.', 'ShieldCheckIcon', 5),
('Goal Tracking', 'Smart goal setting and tracking with automated progress monitoring.', 'ArrowTrendingUpIcon', 6);

-- Insert feature benefits
INSERT INTO feature_benefits (feature_id, benefit) VALUES
-- Performance Analytics benefits
(1, 'Real-time performance metrics'),
(1, 'Historical trend analysis'),
(1, 'Customizable KPIs'),
(1, 'Interactive dashboards'),
-- Smart Reviews benefits
(2, 'Automated review workflows'),
(2, 'AI-assisted feedback'),
(2, 'Multi-source reviews'),
(2, 'Review templates'),
-- AI Insights benefits
(3, 'Sentiment analysis'),
(3, 'Performance predictions'),
(3, 'Growth recommendations'),
(3, 'Skill gap analysis'),
-- Team Management benefits
(4, 'Team performance tracking'),
(4, 'Collaborative goal setting'),
(4, 'Team comparisons'),
(4, 'Manager dashboards'),
-- Enterprise Security benefits
(5, 'Role-based permissions'),
(5, 'Data encryption'),
(5, 'Audit trails'),
(5, 'Compliance ready'),
-- Goal Tracking benefits
(6, 'SMART goal framework'),
(6, 'Progress tracking'),
(6, 'Milestone alerts'),
(6, 'Achievement analytics');

-- Insert integrations data
INSERT INTO integrations (name, logo, description, display_order) VALUES
('Slack', '💬', 'Connect with your team communication platform', 1),
('Microsoft Teams', '👥', 'Integrate with Microsoft Teams for seamless collaboration', 2),
('Google Workspace', '📧', 'Sync with Google Workspace tools and calendar', 3),
('Jira', '🎯', 'Track performance alongside project management', 4),
('Salesforce', '☁️', 'Connect customer success with employee performance', 5),
('Workday', '💼', 'Integrate with your HR management system', 6);

-- Insert workflow steps data
INSERT INTO workflow_steps (title, description, step_number) VALUES
('Collect Data', 'Gather performance data through self-reviews, manager evaluations, and peer feedback with our intelligent forms.', 1),
('AI Analysis', 'Our AI engine analyzes feedback, identifies patterns, and generates insights to understand performance trends.', 2),
('Drive Results', 'Get actionable recommendations, track progress, and make data-driven decisions to improve performance.', 3);

-- Create triggers to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_features_updated_at 
    BEFORE UPDATE ON features 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at 
    BEFORE UPDATE ON integrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at 
    BEFORE UPDATE ON workflow_steps 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

