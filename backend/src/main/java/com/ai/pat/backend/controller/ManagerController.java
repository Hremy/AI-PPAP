package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.EvaluationDTO;
import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.ProjectRepository;
import com.ai.pat.backend.repository.UserRepository;
import com.ai.pat.backend.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/v1/manager", "/manager"})
@RequiredArgsConstructor
public class ManagerController {

    private final EvaluationService evaluationService;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    /**
     * Returns aggregated dashboard stats for the current manager.
     * Note: For the demo, reviewerId is hardcoded to 1L. Replace with the authenticated user's id.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        Map<String, Object> payload = new HashMap<>();
        try {
            Long reviewerId = resolveCurrentUserId();
            List<EvaluationDTO> assigned = evaluationService.getManagerVisibleEvaluations(reviewerId);

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

    @GetMapping("/projects")
    public ResponseEntity<List<Map<String, Object>>> getManagedProjects() {
        Long managerId = resolveCurrentUserId();
        if (managerId == null) {
            return ResponseEntity.ok(List.of());
        }

        return userRepository.findById(managerId)
                .map(User::getManagedProjects)
                .map(projects -> projects.stream()
                        .map(p -> {
                            Map<String, Object> m = new HashMap<>();
                            m.put("id", p.getId());
                            m.put("name", p.getName());
                            return m;
                        })
                        .collect(Collectors.toList()))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(List.of()));
    }

    @GetMapping("/team")
    public ResponseEntity<List<Map<String, Object>>> getManagedTeam() {
        Long managerId = resolveCurrentUserId();
        if (managerId == null) {
            return ResponseEntity.ok(List.of());
        }

        return userRepository.findById(managerId)
                .map(User::getManagedProjects)
                .map(projects -> {
                    List<User> employees = userRepository.findByProjectsAndRole(projects.stream().toList(), "EMPLOYEE");
                    return employees.stream().map(u -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", u.getId());
                        m.put("username", u.getUsername());
                        m.put("email", u.getEmail());
                        m.put("fullName", u.getFullName());
                        return m;
                    }).collect(Collectors.toList());
                })
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(List.of()));
    }

    private Long resolveCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return 1L; // fallback to demo data
            String principal = auth.getName();
            return userRepository.findByUsername(principal)
                    .or(() -> userRepository.findByEmail(principal))
                    .map(User::getId)
                    .orElse(1L);
        } catch (Exception e) {
            return 1L;
        }
    }
}
