package com.ai.pat.backend.dto;

import java.time.LocalDateTime;

public class PeerReviewDTO {
    
    private Long id;
    private Long evaluationId;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerEmail;
    private String strengths;
    private String weaknesses;
    private String suggestions;
    private Integer collaborationRating;
    private Integer communicationRating;
    private Integer technicalRating;
    private Integer leadershipRating;
    private Integer overallRating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public PeerReviewDTO() {}
    
    public PeerReviewDTO(Long id, Long evaluationId, Long reviewerId, String reviewerName, 
                        String reviewerEmail, String strengths, String weaknesses, String suggestions,
                        Integer collaborationRating, Integer communicationRating, Integer technicalRating,
                        Integer leadershipRating, Integer overallRating, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.evaluationId = evaluationId;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.reviewerEmail = reviewerEmail;
        this.strengths = strengths;
        this.weaknesses = weaknesses;
        this.suggestions = suggestions;
        this.collaborationRating = collaborationRating;
        this.communicationRating = communicationRating;
        this.technicalRating = technicalRating;
        this.leadershipRating = leadershipRating;
        this.overallRating = overallRating;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
