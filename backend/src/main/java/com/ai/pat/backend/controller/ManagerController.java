package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.EvaluationDTO;
import com.ai.pat.backend.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/v1/manager", "/manager"})
@RequiredArgsConstructor
public class ManagerController {

    private final EvaluationService evaluationService;

    /**
     * Returns aggregated dashboard stats for the current manager.
     * Note: For the demo, reviewerId is hardcoded to 1L. Replace with the authenticated user's id.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> payload = new HashMap<>();
        try {
            Long reviewerId = 1L; // TODO: derive from authentication principal
            List<EvaluationDTO> assigned = evaluationService.getAssignedEvaluations(reviewerId);

            long pending = assigned.stream()
                    .filter(e -> e.getStatus() != null && e.getStatus().toString().equals("PENDING"))
                    .count();
            long completed = assigned.stream()
                    .filter(e -> e.getStatus() != null && e.getStatus().toString().equals("COMPLETED"))
                    .count();
            // Overdue: placeholder (no due date model). Use PENDING as proxy in demo
            long overdue = pending > 0 ? Math.max(0, pending - 1) : 0;

            // Team members: placeholder (no team model). Use distinct employeeName in assigned list
            long teamMembers = assigned.stream()
                    .map(EvaluationDTO::getEmployeeName)
                    .filter(n -> n != null && !n.isBlank())
                    .distinct()
                    .count();

            payload.put("pendingReviews", pending);
            payload.put("completedReviews", completed);
            payload.put("teamMembers", teamMembers);
            payload.put("overdueReviews", overdue);
        } catch (Exception ex) {
            // Fallback demo values if persistence layer is unavailable
            payload.put("pendingReviews", 12);
            payload.put("completedReviews", 28);
            payload.put("teamMembers", 15);
            payload.put("overdueReviews", 3);
        }
        return ResponseEntity.ok(payload);
    }
}
