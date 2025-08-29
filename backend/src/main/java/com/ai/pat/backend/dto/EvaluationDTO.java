package com.ai.pat.backend.dto;

import com.ai.pat.backend.model.Evaluation;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class EvaluationDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private Long reviewerId;
    private String reviewerName;
    private Integer overallRating;
    private Map<String, Integer> competencyRatings;
    private String achievements;
    private String challenges;
    private String learnings;
    private String nextPeriodGoals;
    private String additionalFeedback;
    private String managerFeedbackRequest;
    
    // Manager review fields
    private Integer managerRating;
    private String managerFeedback;
    private String recommendations;
    private Map<String, Integer> managerCompetencyRatings;
    private LocalDateTime reviewedAt;
    
    private Evaluation.EvaluationStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Legacy support
    private Map<String, Integer> ratings; // For backward compatibility
    private String feedback; // For backward compatibility

    public static EvaluationDTO fromEntity(Evaluation evaluation) {
        EvaluationDTO dto = new EvaluationDTO();
        dto.setId(evaluation.getId());
        
        // Always use the stored employee name and email from the evaluation
        dto.setEmployeeName(evaluation.getEmployeeName());
        dto.setEmployeeEmail(evaluation.getEmployeeEmail());
        
        if (evaluation.getEmployee() != null) {
            dto.setEmployeeId(evaluation.getEmployee().getId());
        }
        
        if (evaluation.getReviewer() != null) {
            dto.setReviewerId(evaluation.getReviewer().getId());
            dto.setReviewerName(evaluation.getReviewer().getFirstName() + " " + evaluation.getReviewer().getLastName());
        }
        
        dto.setOverallRating(evaluation.getOverallRating());
        dto.setCompetencyRatings(evaluation.getCompetencyRatings());
        dto.setAchievements(evaluation.getAchievements());
        dto.setChallenges(evaluation.getChallenges());
        dto.setLearnings(evaluation.getLearnings());
        dto.setNextPeriodGoals(evaluation.getNextPeriodGoals());
        dto.setAdditionalFeedback(evaluation.getAdditionalFeedback());
        dto.setManagerFeedbackRequest(evaluation.getManagerFeedbackRequest());
        
        // Manager review fields
        dto.setManagerRating(evaluation.getManagerRating());
        dto.setManagerFeedback(evaluation.getManagerFeedback());
        dto.setRecommendations(evaluation.getRecommendations());
        dto.setManagerCompetencyRatings(evaluation.getManagerCompetencyRatings());
        dto.setReviewedAt(evaluation.getReviewedAt());
        
        // Legacy support
        dto.setRatings(evaluation.getCompetencyRatings());
        dto.setFeedback(evaluation.getAdditionalFeedback());
        
        dto.setStatus(evaluation.getStatus());
        dto.setSubmittedAt(evaluation.getSubmittedAt());
        dto.setCreatedAt(evaluation.getCreatedAt());
        dto.setUpdatedAt(evaluation.getUpdatedAt());
        
        return dto;
    }
}
