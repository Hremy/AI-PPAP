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
    private Map<String, Integer> ratings;
    private String feedback;
    private Evaluation.EvaluationStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EvaluationDTO fromEntity(Evaluation evaluation) {
        EvaluationDTO dto = new EvaluationDTO();
        dto.setId(evaluation.getId());
        
        if (evaluation.getEmployee() != null) {
            dto.setEmployeeId(evaluation.getEmployee().getId());
            dto.setEmployeeName(evaluation.getEmployee().getFullName());
            dto.setEmployeeEmail(evaluation.getEmployee().getEmail());
        }
        
        if (evaluation.getReviewer() != null) {
            dto.setReviewerId(evaluation.getReviewer().getId());
            dto.setReviewerName(evaluation.getReviewer().getFullName());
        }
        
        dto.setRatings(evaluation.getRatings());
        dto.setFeedback(evaluation.getFeedback());
        dto.setStatus(evaluation.getStatus());
        dto.setSubmittedAt(evaluation.getSubmittedAt());
        dto.setCreatedAt(evaluation.getCreatedAt());
        dto.setUpdatedAt(evaluation.getUpdatedAt());
        
        return dto;
    }
}
