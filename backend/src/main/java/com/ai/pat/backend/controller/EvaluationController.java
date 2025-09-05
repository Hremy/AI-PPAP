package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.EvaluationDTO;
import com.ai.pat.backend.exception.ResourceNotFoundException;
import com.ai.pat.backend.model.Evaluation;
import com.ai.pat.backend.service.EvaluationService;
import com.ai.pat.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/v1/evaluations", "/evaluations", "/api/v1/evaluations", "/api/evaluations"})
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;
    private final UserRepository userRepository;

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
            Long projectId = null;
            Object projectIdObj = evaluationData.get("projectId");
            if (projectIdObj instanceof Number) {
                projectId = ((Number) projectIdObj).longValue();
            } else if (projectIdObj instanceof String str && !str.isBlank()) {
                try { projectId = Long.parseLong(str); } catch (NumberFormatException ignore) {}
            }
            
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
            
            EvaluationDTO createdEvaluation = evaluationService.createEvaluation(evaluationDTO, employeeId, null, projectId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Evaluation submitted successfully",
                "evaluationId", createdEvaluation.getId(),
                "submittedAt", createdEvaluation.getSubmittedAt()
            ));
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", iae.getMessage()
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
        Long projectId = null;
        Object projectIdObj = evaluationData.get("projectId");
        if (projectIdObj instanceof Number) {
            projectId = ((Number) projectIdObj).longValue();
        } else if (projectIdObj instanceof String str && !str.isBlank()) {
            try { projectId = Long.parseLong(str); } catch (NumberFormatException ignore) {}
        }
        // For demo purposes, use hardcoded employee ID
        Long employeeId = 1L;
        try {
            EvaluationDTO createdEvaluation = evaluationService.createEvaluation(evaluationDTO, employeeId, null, projectId);
            return ResponseEntity.ok(createdEvaluation);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(null);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<EvaluationDTO>> getAllEvaluations() {
        try {
            // If the caller is an authenticated Manager (and not an Admin),
            // return only evaluations for employees in projects they manage.
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();

            if (auth != null && auth.isAuthenticated()) {
                boolean isManager = auth.getAuthorities().stream()
                        .anyMatch(a -> "ROLE_MANAGER".equals(a.getAuthority()));
                boolean isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

                if (isManager && !isAdmin) {
                    String principal = auth.getName();
                    Long managerId = userRepository.findByUsername(principal)
                            .or(() -> userRepository.findByEmail(principal))
                            .map(com.ai.pat.backend.model.User::getId)
                            .orElse(null);
                    if (managerId != null) {
                        return ResponseEntity.ok(evaluationService.getManagerVisibleEvaluations(managerId));
                    }
                }
            }

            // Default: return all evaluations (e.g., Admins or unauthenticated in dev)
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
    @PreAuthorize("hasRole('ADMIN') or #reviewerId == authentication.principal.id")
    public ResponseEntity<List<EvaluationDTO>> getAssignedEvaluations(
            @PathVariable("reviewerId") Long reviewerId) {
        List<EvaluationDTO> evaluations = evaluationService.getAssignedEvaluations(reviewerId);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<EvaluationDTO>> getDepartmentEvaluations(
            @PathVariable("department") String department) {
        List<EvaluationDTO> evaluations = evaluationService.getDepartmentEvaluations(department);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<EvaluationDTO>> getEvaluationsByStatus(
            @PathVariable("status") Evaluation.EvaluationStatus status) {
        List<EvaluationDTO> evaluations = evaluationService.getEvaluationsByStatus(status);
        return ResponseEntity.ok(evaluations);
    }

    @PutMapping("/{evaluationId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<EvaluationDTO> updateEvaluationStatus(
            @PathVariable("evaluationId") Long evaluationId,
            @RequestParam Evaluation.EvaluationStatus status) {
        EvaluationDTO updatedEvaluation = evaluationService.updateEvaluationStatus(evaluationId, status);
        return ResponseEntity.ok(updatedEvaluation);
    }

    @DeleteMapping("/{evaluationId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<Map<String, Object>> deleteEvaluation(
            @PathVariable("evaluationId") Long evaluationId) {
        try {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = false;
            Long requesterId = null;
            if (auth != null && auth.isAuthenticated()) {
                isAdmin = auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
                String principal = auth.getName();
                requesterId = userRepository.findByUsername(principal)
                        .or(() -> userRepository.findByEmail(principal))
                        .map(com.ai.pat.backend.model.User::getId)
                        .orElse(null);
            }
            evaluationService.deleteEvaluationAuthorized(evaluationId, requesterId, isAdmin);
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
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", e.getMessage(),
                "error", "AccessDeniedException"
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<Map<String, Object>> submitReview(
            @PathVariable("evaluationId") Long evaluationId,
            @RequestBody Map<String, Object> reviewData) {
        try {
            Integer managerRating = (Integer) reviewData.get("managerRating");
            String managerFeedback = (String) reviewData.get("managerFeedback");
            String recommendations = (String) reviewData.get("recommendations");
            String status = (String) reviewData.get("status");
            
            // Resolve reviewer (manager) from authentication principal
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Unauthorized"
                ));
            }
            String principal = auth.getName();
            Long reviewerId = userRepository.findByUsername(principal)
                    .or(() -> userRepository.findByEmail(principal))
                    .map(com.ai.pat.backend.model.User::getId)
                    .orElse(null);
            if (reviewerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Authenticated user not found"
                ));
            }
            
            EvaluationDTO updatedEvaluation = evaluationService.submitReview(
                evaluationId, reviewerId, managerRating, managerFeedback, recommendations, status);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Review submitted successfully",
                "evaluation", updatedEvaluation
            ));
        } catch (AccessDeniedException ade) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", ade.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to submit review: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{evaluationId}/manager-score")
    @PreAuthorize("hasRole('MANAGER')")
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
            
            // Resolve manager from authentication principal
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Unauthorized"
                ));
            }
            String principal = auth.getName();
            Long managerId = userRepository.findByUsername(principal)
                    .or(() -> userRepository.findByEmail(principal))
                    .map(com.ai.pat.backend.model.User::getId)
                    .orElse(null);
            if (managerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Authenticated user not found"
                ));
            }
            
            EvaluationDTO updatedEvaluation;
            
            // Handle overall rating vs competency rating
            if ("overall".equals(competency)) {
                updatedEvaluation = evaluationService.updateManagerOverallRating(evaluationId, managerId, score);
            } else {
                updatedEvaluation = evaluationService.updateManagerCompetencyScore(
                        evaluationId, managerId, competency, score);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Manager score updated successfully",
                "evaluation", updatedEvaluation
            ));
        } catch (AccessDeniedException ade) {
            return ResponseEntity.status(403).body(Map.of(
                "success", false,
                "message", ade.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to update manager score: " + e.getMessage()
            ));
        }
    }
}
