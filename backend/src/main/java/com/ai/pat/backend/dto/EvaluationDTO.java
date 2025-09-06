package com.ai.pat.backend.dto;

import com.ai.pat.backend.model.Evaluation;
import com.ai.pat.backend.util.CompetencyNormalizer;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class EvaluationDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private Long projectId;
    private String projectName;
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
    // Timeline
    private Integer evaluationYear;
    private Integer evaluationMonth; // 1-based month; quarters are derived on the frontend

    public static EvaluationDTO fromEntity(Evaluation evaluation) {
        EvaluationDTO dto = new EvaluationDTO();
        dto.setId(evaluation.getId());
        
        // Always prefer the stored employee name/email; fallback to linked user if missing
        dto.setEmployeeName(evaluation.getEmployeeName());
        dto.setEmployeeEmail(evaluation.getEmployeeEmail());
        
        if (evaluation.getEmployee() != null) {
            dto.setEmployeeId(evaluation.getEmployee().getId());
            if (dto.getEmployeeName() == null || dto.getEmployeeName().isBlank()) {
                String derived = (
                        String.join(" ",
                                safe(evaluation.getEmployee().getFirstName()),
                                safe(evaluation.getEmployee().getLastName())
                        ).trim()
                );
                if (derived.isBlank()) {
                    // fallback: username, then email local-part
                    String uname = evaluation.getEmployee().getUsername();
                    if (uname != null && !uname.isBlank()) {
                        derived = uname.replace('.', ' ');
                    }
                    if (derived.isBlank()) {
                        String email = evaluation.getEmployee().getEmail();
                        if (email != null && !email.isBlank()) {
                            String local = email.split("@", 2)[0];
                            derived = local.replace('.', ' ');
                        }
                    }
                    if (!derived.isBlank()) {
                        // Capitalize words
                        final String fin = derived;
                        derived = java.util.Arrays.stream(fin.split("\\s+"))
                                .filter(s -> !s.isBlank())
                                .map(s -> s.substring(0,1).toUpperCase() + (s.length()>1 ? s.substring(1) : ""))
                                .reduce((a,b) -> a + " " + b)
                                .orElse(fin);
                    }
                }
                dto.setEmployeeName(derived);
            }
            if (dto.getEmployeeEmail() == null || dto.getEmployeeEmail().isBlank()) {
                dto.setEmployeeEmail(evaluation.getEmployee().getEmail());
            }
        }
        if (evaluation.getProject() != null) {
            dto.setProjectId(evaluation.getProject().getId());
            dto.setProjectName(evaluation.getProject().getName());
        }
        
        if (evaluation.getReviewer() != null) {
            dto.setReviewerId(evaluation.getReviewer().getId());
            dto.setReviewerName(evaluation.getReviewer().getFirstName() + " " + evaluation.getReviewer().getLastName());
        }
        
        dto.setOverallRating(evaluation.getOverallRating());
        // Normalize competency maps to canonical keys for consistent frontend display
        dto.setCompetencyRatings(CompetencyNormalizer.normalize(evaluation.getCompetencyRatings()));
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
        dto.setManagerCompetencyRatings(CompetencyNormalizer.normalize(evaluation.getManagerCompetencyRatings()));
        dto.setReviewedAt(evaluation.getReviewedAt());
        
        // Legacy support
        dto.setRatings(CompetencyNormalizer.normalize(evaluation.getCompetencyRatings()));
        dto.setFeedback(evaluation.getAdditionalFeedback());
        
        dto.setStatus(evaluation.getStatus());
        dto.setSubmittedAt(evaluation.getSubmittedAt());
        dto.setCreatedAt(evaluation.getCreatedAt());
        dto.setUpdatedAt(evaluation.getUpdatedAt());
        dto.setEvaluationYear(evaluation.getEvaluationYear());
        dto.setEvaluationMonth(evaluation.getEvaluationMonth());
        
        return dto;
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }
}

