package com.ai.pat.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "evaluations")
public class Evaluation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonBackReference
    private User employee;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    @JsonBackReference
    private User reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;
    
    @Column(nullable = false)
    private Integer overallRating;
    
    @ElementCollection
    @CollectionTable(name = "evaluation_ratings", 
        joinColumns = @JoinColumn(name = "evaluation_id"))
    @MapKeyColumn(name = "competency")
    @Column(name = "rating")
    private Map<String, Integer> competencyRatings = new HashMap<>();
    
    @Column(columnDefinition = "TEXT")
    private String achievements;
    
    @Column(columnDefinition = "TEXT")
    private String challenges;
    
    @Column(columnDefinition = "TEXT")
    private String learnings;
    
    @Column(columnDefinition = "TEXT")
    private String nextPeriodGoals;
    
    @Column(columnDefinition = "TEXT")
    private String additionalFeedback;
    
    @Column(columnDefinition = "TEXT")
    private String managerFeedbackRequest;
    
    @Column
    private String employeeName;
    
    @Column
    private String employeeEmail;
    
    // Monthly evaluation period
    @Column
    private Integer evaluationMonth; // 1-12
    
    @Column
    private Integer evaluationYear; // e.g., 2025
    
    // Manager review fields
    @Column
    private Integer managerRating;
    
    @Column(columnDefinition = "TEXT")
    private String managerFeedback;
    
    @Column(columnDefinition = "TEXT")
    private String recommendations;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "evaluation_manager_competency_ratings",
        joinColumns = @JoinColumn(name = "evaluation_id"),
        foreignKey = @ForeignKey(name = "fk_evaluation_manager_ratings"),
        uniqueConstraints = @UniqueConstraint(columnNames = {"evaluation_id", "competency"})
    )
    @MapKeyColumn(name = "competency", length = 100)
    @Column(name = "rating", nullable = false)
    private Map<String, Integer> managerCompetencyRatings = new HashMap<>();
    
    @Column
    private LocalDateTime reviewedAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationStatus status = EvaluationStatus.DRAFT;
    
    @Column(nullable = false)
    private LocalDateTime submittedAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime updatedAt;
    
    // No-args constructor
    public Evaluation() {
        this.competencyRatings = new HashMap<>();
        this.managerCompetencyRatings = new HashMap<>();
        this.status = EvaluationStatus.DRAFT;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getEmployee() { return employee; }
    public void setEmployee(User employee) { this.employee = employee; }
    
    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }
    
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    
    public Integer getOverallRating() { return overallRating; }
    public void setOverallRating(Integer overallRating) { this.overallRating = overallRating; }
    
    public Map<String, Integer> getCompetencyRatings() { return competencyRatings; }
    public void setCompetencyRatings(Map<String, Integer> competencyRatings) { this.competencyRatings = competencyRatings; }
    
    public String getAchievements() { return achievements; }
    public void setAchievements(String achievements) { this.achievements = achievements; }
    
    public String getChallenges() { return challenges; }
    public void setChallenges(String challenges) { this.challenges = challenges; }
    
    public String getLearnings() { return learnings; }
    public void setLearnings(String learnings) { this.learnings = learnings; }
    
    public String getNextPeriodGoals() { return nextPeriodGoals; }
    public void setNextPeriodGoals(String nextPeriodGoals) { this.nextPeriodGoals = nextPeriodGoals; }
    
    public String getAdditionalFeedback() { return additionalFeedback; }
    public void setAdditionalFeedback(String additionalFeedback) { this.additionalFeedback = additionalFeedback; }
    
    public String getManagerFeedbackRequest() { return managerFeedbackRequest; }
    public void setManagerFeedbackRequest(String managerFeedbackRequest) { this.managerFeedbackRequest = managerFeedbackRequest; }
    
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    
    public String getEmployeeEmail() { return employeeEmail; }
    public void setEmployeeEmail(String employeeEmail) { this.employeeEmail = employeeEmail; }
    
    public Integer getManagerRating() { return managerRating; }
    public void setManagerRating(Integer managerRating) { this.managerRating = managerRating; }
    
    public String getManagerFeedback() { return managerFeedback; }
    public void setManagerFeedback(String managerFeedback) { this.managerFeedback = managerFeedback; }
    
    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }
    
    public Map<String, Integer> getManagerCompetencyRatings() { return managerCompetencyRatings; }
    public void setManagerCompetencyRatings(Map<String, Integer> managerCompetencyRatings) { this.managerCompetencyRatings = managerCompetencyRatings; }
    
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    
    public EvaluationStatus getStatus() { return status; }
    public void setStatus(EvaluationStatus status) { this.status = status; }
    
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Integer getEvaluationMonth() { return evaluationMonth; }
    public void setEvaluationMonth(Integer evaluationMonth) { this.evaluationMonth = evaluationMonth; }
    
    public Integer getEvaluationYear() { return evaluationYear; }
    public void setEvaluationYear(Integer evaluationYear) { this.evaluationYear = evaluationYear; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum EvaluationStatus {
        DRAFT, SUBMITTED, REVIEWED, ARCHIVED
    }
}
