package com.ai.pat.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "peer_reviews")
public class PeerReview {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "evaluation_id", nullable = false)
    private Long evaluationId;
    
    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;
    
    @Column(name = "reviewer_name", nullable = false)
    private String reviewerName;
    
    @Column(name = "reviewer_email", nullable = false)
    private String reviewerEmail;
    
    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;
    
    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private String weaknesses;
    
    @Column(name = "suggestions", columnDefinition = "TEXT")
    private String suggestions;
    
    @Column(name = "collaboration_rating")
    private Integer collaborationRating;
    
    @Column(name = "communication_rating")
    private Integer communicationRating;
    
    @Column(name = "technical_rating")
    private Integer technicalRating;
    
    @Column(name = "leadership_rating")
    private Integer leadershipRating;
    
    @Column(name = "overall_rating")
    private Integer overallRating;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public PeerReview() {}
    
    public PeerReview(Long evaluationId, Long reviewerId, String reviewerName, String reviewerEmail) {
        this.evaluationId = evaluationId;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.reviewerEmail = reviewerEmail;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getEvaluationId() {
        return evaluationId;
    }
    
    public void setEvaluationId(Long evaluationId) {
        this.evaluationId = evaluationId;
    }
    
    public Long getReviewerId() {
        return reviewerId;
    }
    
    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }
    
    public String getReviewerName() {
        return reviewerName;
    }
    
    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }
    
    public String getReviewerEmail() {
        return reviewerEmail;
    }
    
    public void setReviewerEmail(String reviewerEmail) {
        this.reviewerEmail = reviewerEmail;
    }
    
    public String getStrengths() {
        return strengths;
    }
    
    public void setStrengths(String strengths) {
        this.strengths = strengths;
    }
    
    public String getWeaknesses() {
        return weaknesses;
    }
    
    public void setWeaknesses(String weaknesses) {
        this.weaknesses = weaknesses;
    }
    
    public String getSuggestions() {
        return suggestions;
    }
    
    public void setSuggestions(String suggestions) {
        this.suggestions = suggestions;
    }
    
    public Integer getCollaborationRating() {
        return collaborationRating;
    }
    
    public void setCollaborationRating(Integer collaborationRating) {
        this.collaborationRating = collaborationRating;
    }
    
    public Integer getCommunicationRating() {
        return communicationRating;
    }
    
    public void setCommunicationRating(Integer communicationRating) {
        this.communicationRating = communicationRating;
    }
    
    public Integer getTechnicalRating() {
        return technicalRating;
    }
    
    public void setTechnicalRating(Integer technicalRating) {
        this.technicalRating = technicalRating;
    }
    
    public Integer getLeadershipRating() {
        return leadershipRating;
    }
    
    public void setLeadershipRating(Integer leadershipRating) {
        this.leadershipRating = leadershipRating;
    }
    
    public Integer getOverallRating() {
        return overallRating;
    }
    
    public void setOverallRating(Integer overallRating) {
        this.overallRating = overallRating;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
