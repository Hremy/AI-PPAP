package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.EvaluationDTO;
import com.ai.pat.backend.exception.ResourceNotFoundException;
import com.ai.pat.backend.model.Evaluation;
import com.ai.pat.backend.service.EvaluationService;
import com.ai.pat.backend.repository.EvaluationRepository;
import com.ai.pat.backend.service.UserService;
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
    private final EvaluationRepository evaluationRepository;
    private final UserService userService;

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
            
            // Resolve employeeId from auth principal or provided email (dev-friendly)
            Long employeeId = null;
            try {
                String xUser = null;
                // Try to obtain X-User header via RequestContext (fallback to SecurityContext principal)
                org.springframework.web.context.request.RequestAttributes ra = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
                if (ra instanceof org.springframework.web.context.request.ServletRequestAttributes sra) {
                    xUser = sra.getRequest().getHeader("X-User");
                }
                String key = (xUser != null && !xUser.isBlank()) ? xUser : employeeEmail;
                if (key == null || key.isBlank()) {
                    org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().isBlank()) {
                        key = auth.getName();
                    }
                }
                if (key != null && !key.isBlank()) {
                    final String finalKey = key;
                    employeeId = userRepository.findByUsername(finalKey)
                            .or(() -> userRepository.findByEmail(finalKey))
                            .map(com.ai.pat.backend.model.User::getId)
                            .orElse(null);
                }
            } catch (Exception ignore) {}
            // If still null, create a minimal user using email/principal to avoid null employee_id
            if (employeeId == null) {
                String createKey = (employeeEmail != null && !employeeEmail.isBlank()) ? employeeEmail : null;
                if (createKey == null) {
                    // fallback to xUser/auth principal used above
                    org.springframework.web.context.request.RequestAttributes ra2 = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
                    if (ra2 instanceof org.springframework.web.context.request.ServletRequestAttributes sra2) {
                        String xu = sra2.getRequest().getHeader("X-User");
                        if (xu != null && !xu.isBlank()) createKey = xu;
                    }
                    if (createKey == null) {
                        org.springframework.security.core.Authentication a = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                        if (a != null && a.isAuthenticated() && a.getName() != null && !a.getName().isBlank()) createKey = a.getName();
                    }
                }
                if (createKey != null && !createKey.isBlank()) {
                    employeeId = userService.resolveOrCreateUserId(createKey);
                }
            }
            
            // Resolve reviewer (manager) for the selected project so the manager receives this evaluation
            Long reviewerId = null;
            try {
                if (projectId != null) {
                    var projectOpt = java.util.Optional.ofNullable(projectId)
                            .flatMap(id -> java.util.Optional.ofNullable(
                                    com.ai.pat.backend.model.Project.builder().id(id).build()
                            ));
                    java.util.List<com.ai.pat.backend.model.Project> prjs = new java.util.ArrayList<>();
                    projectOpt.ifPresent(prjs::add);
                    java.util.List<com.ai.pat.backend.model.User> managers = userService.getManagersForProjects(prjs);
                    if (managers != null && !managers.isEmpty()) {
                        // Prefer Jake if present, else first manager
                        reviewerId = managers.stream()
                                .filter(m -> "jake.manager@corp.com".equalsIgnoreCase(m.getEmail()))
                                .findFirst()
                                .map(com.ai.pat.backend.model.User::getId)
                                .orElse(managers.get(0).getId());
                    }
                }
            } catch (Exception ignore) {}

            EvaluationDTO createdEvaluation = evaluationService.createEvaluation(evaluationDTO, employeeId, reviewerId, projectId);
            
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

    // Admin utility: rebind evaluations from one email to another (fix AnonymousUser rows)
    @PostMapping("/admin/rebind-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> rebindEvaluations(
            @RequestParam("fromEmail") String fromEmail,
            @RequestParam("toEmail") String toEmail) {
        if (fromEmail == null || fromEmail.isBlank() || toEmail == null || toEmail.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "fromEmail and toEmail are required"
            ));
        }
        try {
            Long toUserId = userService.resolveOrCreateUserId(toEmail);
            var toUser = userRepository.findById(toUserId).orElse(null);
            if (toUser == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Target user not found"
                ));
            }
            var evals = evaluationRepository.findByEmployeeEmail(fromEmail);
            int updated = 0;
            for (var e : evals) {
                try {
                    e.setEmployee(toUser);
                    // Update denormalized fields for display
                    String fn = toUser.getFirstName() != null ? toUser.getFirstName() : "";
                    String ln = toUser.getLastName() != null ? toUser.getLastName() : "";
                    String full = (fn + " " + ln).trim();
                    if (!full.isBlank()) e.setEmployeeName(full);
                    if (toUser.getEmail() != null) e.setEmployeeEmail(toUser.getEmail());
                    evaluationRepository.save(e);
                    updated++;
                } catch (Exception ignore) {}
            }
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "updated", updated
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
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
        // Persist ratings as competencyRatings so overall is computed server-side
        evaluationDTO.setCompetencyRatings(ratings);
        // Persist free-text feedback as additionalFeedback
        evaluationDTO.setAdditionalFeedback((String) evaluationData.get("feedback"));
        Long projectId = null;
        Object projectIdObj = evaluationData.get("projectId");
        if (projectIdObj instanceof Number) {
            projectId = ((Number) projectIdObj).longValue();
        } else if (projectIdObj instanceof String str && !str.isBlank()) {
            try { projectId = Long.parseLong(str); } catch (NumberFormatException ignore) {}
        }
        if (projectId == null) {
            throw new IllegalArgumentException("Project is required for evaluation submission");
        }
        // Timeline: evaluationYear and evaluationQuarter -> map to year and month
        Integer evaluationYear = null;
        Integer evaluationQuarter = null;
        Object yObj = evaluationData.get("evaluationYear");
        if (yObj instanceof Number) evaluationYear = ((Number) yObj).intValue();
        else if (yObj instanceof String ys && !ys.isBlank()) { try { evaluationYear = Integer.parseInt(ys); } catch (NumberFormatException ignore) {} }
        Object qObj = evaluationData.get("evaluationQuarter");
        if (qObj instanceof Number) evaluationQuarter = ((Number) qObj).intValue();
        else if (qObj instanceof String qs && !qs.isBlank()) { try { evaluationQuarter = Integer.parseInt(qs); } catch (NumberFormatException ignore) {} }
        if (evaluationYear != null) {
            try { evaluationDTO.setEvaluationYear(evaluationYear); } catch (Exception ignore) {}
        }
        if (evaluationQuarter != null && evaluationQuarter >= 1 && evaluationQuarter <= 4) {
            int month = switch (evaluationQuarter) { case 1 -> 1; case 2 -> 4; case 3 -> 7; default -> 10; };
            try { evaluationDTO.setEvaluationMonth(month); } catch (Exception ignore) {}
        }

        // Resolve employeeId from X-User or SecurityContext principal
        Long employeeId = null;
        try {
            String xUser = null;
            org.springframework.web.context.request.RequestAttributes ra = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
            if (ra instanceof org.springframework.web.context.request.ServletRequestAttributes sra) {
                xUser = sra.getRequest().getHeader("X-User");
            }
            String key = (xUser != null && !xUser.isBlank()) ? xUser : null;
            if (key == null || key.isBlank()) {
                org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().isBlank()) {
                    key = auth.getName();
                }
            }
            if (key != null && !key.isBlank()) {
                final String finalKey2 = key;
                employeeId = userRepository.findByUsername(finalKey2)
                        .or(() -> userRepository.findByEmail(finalKey2))
                        .map(com.ai.pat.backend.model.User::getId)
                        .orElse(null);
            }
        } catch (Exception ignore) {}
        // If still null, create a minimal user using principal to avoid null employee_id
        if (employeeId == null) {
            String createKey = null;
            try {
                org.springframework.web.context.request.RequestAttributes ra2 = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
                if (ra2 instanceof org.springframework.web.context.request.ServletRequestAttributes sra2) {
                    String xu = sra2.getRequest().getHeader("X-User");
                    if (xu != null && !xu.isBlank()) createKey = xu;
                }
            } catch (Exception ignore) {}
            if (createKey == null) {
                org.springframework.security.core.Authentication a = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (a != null && a.isAuthenticated() && a.getName() != null && !a.getName().isBlank()) createKey = a.getName();
            }
            // Reject anonymousUser principals instead of creating minimal users
            if (createKey != null) {
                String lk = createKey.toLowerCase();
                if ("anonymoususer".equals(lk) || lk.contains("anonymoususer@")) {
                    return ResponseEntity.status(401).build();
                }
            }
            if (createKey != null && !createKey.isBlank()) {
                employeeId = userService.resolveOrCreateUserId(createKey);
            }
        }

        // Resolve reviewer (manager) for the selected project
        Long reviewerId = null;
        try {
            if (projectId != null) {
                java.util.List<com.ai.pat.backend.model.Project> prjs = new java.util.ArrayList<>();
                prjs.add(com.ai.pat.backend.model.Project.builder().id(projectId).build());
                java.util.List<com.ai.pat.backend.model.User> managers = userService.getManagersForProjects(prjs);
                if (managers != null && !managers.isEmpty()) {
                    reviewerId = managers.get(0).getId();
                }
            }
        } catch (Exception ignore) {}

        // Duplicate guard: if an evaluation already exists for (employee, project, quarter), return 409 with a friendly message and the existing evaluation
        Integer yy = evaluationDTO.getEvaluationYear();
        Integer mm = evaluationDTO.getEvaluationMonth();
        if (employeeId != null && projectId != null && yy != null && mm != null) {
            boolean exists = evaluationRepository.existsByEmployeeIdAndProjectIdAndEvaluationYearAndEvaluationMonth(
                    employeeId, projectId, yy, mm
            );
            if (exists) {
                var existing = evaluationRepository
                        .findFirstByEmployeeIdAndProjectIdAndEvaluationYearAndEvaluationMonthOrderByCreatedAtDesc(employeeId, projectId, yy, mm)
                        .map(EvaluationDTO::fromEntity)
                        .orElse(null);
                // Wrap as 409 with body via ResponseEntity.status
                org.springframework.http.ResponseEntity.BodyBuilder bb = org.springframework.http.ResponseEntity.status(409);
                if (existing != null) {
                    // Use a header to convey message (UI can also read body if needed)
                    return bb.body(existing);
                }
                return bb.body(null);
            }
        }

        try {
            EvaluationDTO createdEvaluation = evaluationService.createEvaluation(evaluationDTO, employeeId, reviewerId, projectId);
            if (createdEvaluation != null) return ResponseEntity.ok(createdEvaluation);
            // Fallback: service returned null in idempotent path; try to resolve existing and return it
            if (employeeId != null && projectId != null && yy != null && mm != null) {
                var existing = evaluationRepository
                        .findFirstByEmployeeIdAndProjectIdAndEvaluationYearAndEvaluationMonthOrderByCreatedAtDesc(employeeId, projectId, yy, mm)
                        .map(EvaluationDTO::fromEntity)
                        .orElse(null);
                if (existing != null) return ResponseEntity.ok(existing);
            }
            return ResponseEntity.ok(createdEvaluation); // will be null but shouldn't happen
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Pre-submit duplicate check endpoint so UI can warn early
    @GetMapping("/self/check")
    public ResponseEntity<Map<String, Object>> checkSelfEvaluationExists(
            @RequestParam("projectId") Long projectId,
            @RequestParam("evaluationYear") Integer evaluationYear,
            @RequestParam("evaluationQuarter") Integer evaluationQuarter,
            @RequestHeader(value = "X-User", required = false) String xUser) {
        try {
            // Resolve employeeId
            Long employeeId = null;
            String key = xUser;
            if (key == null || key.isBlank()) {
                var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().isBlank()) {
                    key = auth.getName();
                }
            }
            if (key != null && !key.isBlank()) {
                final String finalKey = key;
                employeeId = userRepository.findByUsername(finalKey)
                        .or(() -> userRepository.findByEmail(finalKey))
                        .map(com.ai.pat.backend.model.User::getId)
                        .orElse(null);
            }
            if (employeeId == null || projectId == null || evaluationYear == null || evaluationQuarter == null) {
                return ResponseEntity.badRequest().body(java.util.Map.of(
                        "success", false,
                        "message", "Missing required parameters"
                ));
            }
            int month = switch (evaluationQuarter) { case 1 -> 1; case 2 -> 4; case 3 -> 7; default -> 10; };
            boolean exists = evaluationRepository.existsByEmployeeIdAndProjectIdAndEvaluationYearAndEvaluationMonth(
                    employeeId, projectId, evaluationYear, month
            );
            java.util.Map<String, Object> resp = new java.util.HashMap<>();
            resp.put("exists", exists);
            if (exists) {
                var existing = evaluationRepository
                        .findFirstByEmployeeIdAndProjectIdAndEvaluationYearAndEvaluationMonthOrderByCreatedAtDesc(employeeId, projectId, evaluationYear, month)
                        .map(EvaluationDTO::fromEntity)
                        .orElse(null);
                if (existing != null) {
                    resp.put("evaluationId", existing.getId());
                    resp.put("status", existing.getStatus());
                    resp.put("submittedAt", existing.getSubmittedAt());
                }
            }
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
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
    public ResponseEntity<Map<String, Object>> deleteEvaluation(
            @PathVariable("evaluationId") Long evaluationId) {
        try {
            // Dev-friendly: bypass complex auth and allow deletion
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
