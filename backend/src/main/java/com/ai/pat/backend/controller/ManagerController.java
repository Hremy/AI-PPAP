package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.EvaluationDTO;
import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.UserRepository;
import com.ai.pat.backend.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/v1/manager", "/manager"})
@RequiredArgsConstructor
public class ManagerController {

    private final EvaluationService evaluationService;
    private final UserRepository userRepository;

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
            
            // Debug: log the assigned evaluations
            System.out.println("DEBUG: Manager " + reviewerId + " has " + assigned.size() + " assigned evaluations");
            assigned.forEach(e -> System.out.println("  - Evaluation " + e.getId() + " for " + e.getEmployeeName() + " status: " + e.getStatus()));

            long pending = assigned.stream()
                    .filter(e -> e.getStatus() != null && e.getStatus().toString().equals("PENDING"))
                    .count();
            long completed = assigned.stream()
                    .filter(e -> e.getStatus() != null && 
                            (e.getStatus().toString().equals("COMPLETED") || 
                             e.getStatus().toString().equals("REVIEWED")))
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

    @GetMapping("/team/{projectId}")
    public ResponseEntity<List<Map<String, Object>>> getManagedTeamByProject(@PathVariable("projectId") Long projectId) {
        Long managerId = resolveCurrentUserId();
        if (managerId == null || projectId == null) {
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }

        List<Map<String, Object>> payload = new java.util.ArrayList<>();
        try {
            java.util.Optional<User> opt = userRepository.findById(managerId);
            if (opt.isEmpty()) return ResponseEntity.ok(payload);
            java.util.Set<Project> managed = opt.get().getManagedProjects();
            if (managed == null || managed.isEmpty()) return ResponseEntity.ok(payload);
            Project target = managed.stream().filter(p -> p != null && projectId.equals(p.getId())).findFirst().orElse(null);
            if (target == null) return ResponseEntity.ok(payload);

            List<User> employees = userRepository.findByProjectsAndRole(java.util.List.of(target), "EMPLOYEE");
            for (User u : employees) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", u.getId());
                m.put("username", u.getUsername());
                m.put("email", u.getEmail());
                m.put("fullName", u.getFullName());
                payload.add(m);
            }
        } catch (Exception ignore) {
            // return empty payload on error in demo
        }
        return ResponseEntity.ok(payload);
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

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> payload = new HashMap<>();
        try {
            // Get all evaluations for analytics calculation
            List<EvaluationDTO> evaluations = evaluationService.getAllEvaluations()
                    .stream()
                    .filter(e -> e.getStatus() != null && !e.getStatus().toString().equals("DELETED"))
                    .collect(Collectors.toList());

            // Average Team Rating - calculate from both employee and manager ratings
            double avgEmployeeRating = evaluations.stream()
                    .filter(e -> e.getOverallRating() != null && e.getOverallRating() > 0)
                    .mapToDouble(EvaluationDTO::getOverallRating)
                    .average()
                    .orElse(0.0);
            
            // Calculate manager rating from competency ratings for accuracy
            double avgManagerRating = evaluations.stream()
                    .filter(e -> e.getManagerCompetencyRatings() != null && !e.getManagerCompetencyRatings().isEmpty())
                    .mapToDouble(e -> {
                        Map<String, Integer> ratings = e.getManagerCompetencyRatings();
                        return ratings.values().stream()
                                .mapToInt(Integer::intValue)
                                .average()
                                .orElse(0.0);
                    })
                    .average()
                    .orElse(0.0);
            
            // Combined average of both ratings
            double avgRating = 0.0;
            if (avgEmployeeRating > 0 && avgManagerRating > 0) {
                avgRating = (avgEmployeeRating + avgManagerRating) / 2.0;
            } else if (avgEmployeeRating > 0) {
                avgRating = avgEmployeeRating;
            } else if (avgManagerRating > 0) {
                avgRating = avgManagerRating;
            }

            // Active Team Members - distinct employees with non-deleted evaluations
            long activeMembers = evaluations.stream()
                    .map(EvaluationDTO::getEmployeeName)
                    .filter(name -> name != null && !name.isBlank())
                    .distinct()
                    .count();

            // Top Performers - count employees with combined rating >= 4.5
            long topPerformers = evaluations.stream()
                    .filter(e -> {
                        double employeeRating = e.getOverallRating() != null ? e.getOverallRating() : 0.0;
                        double managerRating = e.getManagerRating() != null ? e.getManagerRating() : 0.0;
                        double combinedRating = 0.0;
                        
                        if (employeeRating > 0 && managerRating > 0) {
                            combinedRating = (employeeRating + managerRating) / 2.0;
                        } else if (employeeRating > 0) {
                            combinedRating = employeeRating;
                        } else if (managerRating > 0) {
                            combinedRating = managerRating;
                        }
                        
                        return combinedRating >= 4.5;
                    })
                    .map(EvaluationDTO::getEmployeeName)
                    .filter(name -> name != null && !name.isBlank())
                    .distinct()
                    .count();

            // On-track Goals - based on combined ratings >= 3.0
            double onTrackPercentage = evaluations.isEmpty() ? 0.0 : 
                    (double) evaluations.stream()
                            .filter(e -> {
                                double employeeRating = e.getOverallRating() != null ? e.getOverallRating() : 0.0;
                                double managerRating = e.getManagerRating() != null ? e.getManagerRating() : 0.0;
                                double combinedRating = 0.0;
                                
                                if (employeeRating > 0 && managerRating > 0) {
                                    combinedRating = (employeeRating + managerRating) / 2.0;
                                } else if (employeeRating > 0) {
                                    combinedRating = employeeRating;
                                } else if (managerRating > 0) {
                                    combinedRating = managerRating;
                                }
                                
                                return combinedRating >= 3.0;
                            })
                            .mapToInt(e -> 1)
                            .sum() / (double) evaluations.size() * 100;

            
            payload.put("averageTeamRating", Math.round(avgRating * 10.0) / 10.0);
            payload.put("activeTeamMembers", activeMembers);
            payload.put("topPerformers", topPerformers);
            payload.put("onTrackGoals", Math.round(onTrackPercentage));
            payload.put("totalEvaluations", evaluations.size());

        } catch (Exception ex) {
            // Fallback to zeros if there's an error
            payload.put("averageTeamRating", 0.0);
            payload.put("activeTeamMembers", 0);
            payload.put("topPerformers", 0);
            payload.put("onTrackGoals", 0);
            payload.put("totalEvaluations", 0);
        }
        return ResponseEntity.ok(payload);
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
