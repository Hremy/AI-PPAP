-- Create peer_reviews table for 360-degree feedback
CREATE TABLE peer_reviews (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id BIGINT NOT NULL,
    reviewer_id BIGINT NOT NULL,
    reviewer_name VARCHAR(255) NOT NULL,
    reviewer_email VARCHAR(255) NOT NULL,
    strengths TEXT,
    weaknesses TEXT,
    suggestions TEXT,
    collaboration_rating INTEGER CHECK (collaboration_rating >= 1 AND collaboration_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    technical_rating INTEGER CHECK (technical_rating >= 1 AND technical_rating <= 5),
    leadership_rating INTEGER CHECK (leadership_rating >= 1 AND leadership_rating <= 5),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_peer_reviews_evaluation FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
    CONSTRAINT fk_peer_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_peer_reviews_evaluation_id ON peer_reviews(evaluation_id);
CREATE INDEX idx_peer_reviews_reviewer_id ON peer_reviews(reviewer_id);
CREATE INDEX idx_peer_reviews_created_at ON peer_reviews(created_at);

-- Ensure one review per reviewer per evaluation
CREATE UNIQUE INDEX idx_peer_reviews_unique_reviewer_evaluation ON peer_reviews(evaluation_id, reviewer_id);
