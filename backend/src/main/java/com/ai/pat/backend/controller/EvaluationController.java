package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.EvaluationDTO;
import com.ai.pat.backend.exception.ResourceNotFoundException;
import com.ai.pat.backend.model.Evaluation;
import com.ai.pat.backend.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/v1/evaluations", "/evaluations"})
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitEvaluation(
            @RequestBody Map<String, Object> evaluationData) {
        try {
            // Extract data from the enhanced evaluation form
            Integer overallRating = (Integer) evaluationData.get("overallRating");
            @SuppressWarnings("unchecked")
            Map<String, Integer> competencyRatings = (Map<String, Integer>) evaluationData.get("competencyRatings");
            String employeeName = (String) evaluationData.get("employeeName");
            String employeeEmail = (String) evaluationData.get("employeeEmail");
            String achievements = (String) evaluationData.get("achievements");
            String challenges = (String) evaluationData.get("challenges");
            String learnings = (String) evaluationData.get("learnings");
            String nextPeriodGoals = (String) evaluationData.get("nextPeriodGoals");
            String additionalFeedback = (String) evaluationData.get("additionalFeedback");
            String managerFeedbackRequest = (String) evaluationData.get("managerFeedbackRequest");
            
            // Create evaluation DTO
            EvaluationDTO evaluationDTO = new EvaluationDTO();
            evaluationDTO.setOverallRating(overallRating);
            evaluationDTO.setCompetencyRatings(competencyRatings);
            evaluationDTO.setEmployeeName(employeeName);
            evaluationDTO.setEmployeeEmail(employeeEmail);
            evaluationDTO.setAchievements(achievements);
            evaluationDTO.setChallenges(challenges);
            evaluationDTO.setLearnings(learnings);
            evaluationDTO.setNextPeriodGoals(nextPeriodGoals);
            evaluationDTO.setAdditionalFeedback(additionalFeedback);
            evaluationDTO.setManagerFeedbackRequest(managerFeedbackRequest);
            
            // For now, use hardcoded employee ID - in production this would come from JWT
            Long employeeId = 3L; // Use Alice Employee ID
            
            EvaluationDTO createdEvaluation = evaluationService.createEvaluation(evaluationDTO, employeeId, null);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Evaluation submitted successfully",
                "evaluationId", createdEvaluation.getId(),
                "submittedAt", createdEvaluation.getSubmittedAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to submit evaluation: " + e.getMessage()
            ));
        }
    }
    
    @PostMapping("/self")
    public ResponseEntity<EvaluationDTO> submitSelfEvaluation(
            @RequestBody Map<String, Object> evaluationData) {
        // Create evaluation DTO from the form data
        EvaluationDTO evaluationDTO = new EvaluationDTO();
        @SuppressWarnings("unchecked")
        Map<String, Integer> ratings = (Map<String, Integer>) evaluationData.get("ratings");
        evaluationDTO.setRatings(ratings);
        evaluationDTO.setFeedback((String) evaluationData.get("feedback"));
        
        // For demo purposes, use hardcoded employee ID
        Long employeeId = 1L;
        
        EvaluationDTO createdEvaluation = evaluationService.createEvaluation(evaluationDTO, employeeId, null);
        return ResponseEntity.ok(createdEvaluation);
    }
    
    @GetMapping
    public ResponseEntity<List<EvaluationDTO>> getAllEvaluations() {
        try {
            List<EvaluationDTO> evaluations = evaluationService.getAllEvaluations();
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            // Return empty list if database is not available
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/employee/{employeeId}")
    // @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER') or #employeeId == authentication.principal.id")
    public ResponseEntity<List<EvaluationDTO>> getEmployeeEvaluations(
            @PathVariable("employeeId") Long employeeId) {
        try {
            List<EvaluationDTO> evaluations = evaluationService.getEmployeeEvaluations(employeeId);
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            // Return mock data for demo purposes
            return ResponseEntity.ok(createMockEvaluations(employeeId));
        }
    }
    
    private List<EvaluationDTO> createMockEvaluations(Long employeeId) {
        // Return empty list for now - can be populated with mock data if needed
        return List.of();
    }

    @GetMapping("/reviewer/{reviewerId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #reviewerId == authentication.principal.id")
    public ResponseEntity<List<EvaluationDTO>> getAssignedEvaluations(
            @PathVariable("reviewerId") Long reviewerId) {
        List<EvaluationDTO> evaluations = evaluationService.getAssignedEvaluations(reviewerId);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<EvaluationDTO>> getDepartmentEvaluations(
            @PathVariable("department") String department) {
        List<EvaluationDTO> evaluations = evaluationService.getDepartmentEvaluations(department);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<EvaluationDTO>> getEvaluationsByStatus(
            @PathVariable("status") Evaluation.EvaluationStatus status) {
        List<EvaluationDTO> evaluations = evaluationService.getEvaluationsByStatus(status);
        return ResponseEntity.ok(evaluations);
    }

    @PutMapping("/{evaluationId}/status")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<EvaluationDTO> updateEvaluationStatus(
            @PathVariable("evaluationId") Long evaluationId,
            @RequestParam Evaluation.EvaluationStatus status) {
        EvaluationDTO updatedEvaluation = evaluationService.updateEvaluationStatus(evaluationId, status);
        return ResponseEntity.ok(updatedEvaluation);
    }

    @DeleteMapping("/{evaluationId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> deleteEvaluation(
            @PathVariable("evaluationId") Long evaluationId) {
        try {
            evaluationService.deleteEvaluation(evaluationId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Evaluation deleted successfully",
                "evaluationId", evaluationId
            ));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", e.getMessage(),
                "error", "ResourceNotFoundException"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Failed to delete evaluation: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }

    @PostMapping("/monthly/create")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> createMonthlyEvaluations(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        try {
            int createdCount = evaluationService.createMonthlyEvaluations(month, year);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Monthly evaluations created successfully",
                "month", month,
                "year", year,
                "createdCount", createdCount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Failed to create monthly evaluations: " + e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }

    @GetMapping("/employee/{employeeId}/averages")
    // @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER') or #employeeId == authentication.principal.id")
    public ResponseEntity<Map<String, Double>> getEmployeeAverageRatings(
            @PathVariable("employeeId") Long employeeId) {
        try {
            Map<String, Double> averageRatings = evaluationService.getEmployeeAverageRatings(employeeId);
            return ResponseEntity.ok(averageRatings);
        } catch (Exception e) {
            // Return empty map for demo purposes
            return ResponseEntity.ok(Map.of());
        }
    }

    @PostMapping("/{evaluationId}/review")
    public ResponseEntity<Map<String, Object>> submitReview(
            @PathVariable("evaluationId") Long evaluationId,
            @RequestBody Map<String, Object> reviewData) {
        try {
            Integer managerRating = (Integer) reviewData.get("managerRating");
            String managerFeedback = (String) reviewData.get("managerFeedback");
            String recommendations = (String) reviewData.get("recommendations");
            String status = (String) reviewData.get("status");
            
            // For now, use hardcoded reviewer ID - in production this would come from JWT
            Long reviewerId = 1L; // This should be the manager's ID from authentication
            
            EvaluationDTO updatedEvaluation = evaluationService.submitReview(
                evaluationId, reviewerId, managerRating, managerFeedback, recommendations, status);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Review submitted successfully",
                "evaluation", updatedEvaluation
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to submit review: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{evaluationId}/manager-score")
    public ResponseEntity<Map<String, Object>> submitManagerScore(
            @PathVariable("evaluationId") Long evaluationId,
            @RequestBody Map<String, Object> scoreData) {
        try {
            // Basic request logging
            System.out.println("[submitManagerScore] evaluationId=" + evaluationId + ", payload=" + scoreData);

            String competency = (String) scoreData.get("competency");
            Integer score = (Integer) scoreData.get("score");
            
            if (competency == null || score == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Competency and score are required"
                ));
            }
            
            if (score < 1 || score > 5) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Score must be between 1 and 5"
                ));
            }
            
            // For now, use hardcoded manager ID - in production this would come from JWT
            Long managerId = 1L;
            
            EvaluationDTO updatedEvaluation;
            
            // Handle overall rating vs competency rating
            if ("overall".equals(competency)) {
                updatedEvaluation = evaluationService.updateManagerOverallRating(evaluationId, managerId, score);
            } else {
                updatedEvaluation = evaluationService.updateManagerCompetencyScore(
                    evaluationId, managerId, competency, score);
            }
            
            // Return only minimal info to avoid any serialization edge cases
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Manager score updated successfully",
                "evaluationId", updatedEvaluation.getId()
            ));
        } catch (Exception e) {
            System.err.println("[submitManagerScore][ERROR] " + e.getClass().getName() + ": " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to update manager score: " + e.getMessage()
            ));
        }
    }

}
