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

            // Team members: count employees assigned to projects managed by this manager
            long teamMembers = 0;
            try {
                java.util.Optional<User> opt = userRepository.findById(reviewerId);
                if (opt.isPresent() && opt.get().getManagedProjects() != null && !opt.get().getManagedProjects().isEmpty()) {
                    java.util.Set<Project> managed = opt.get().getManagedProjects();
                    java.util.List<User> employees = userRepository.findByProjectsAndRole(managed.stream().toList(), "EMPLOYEE");
                    teamMembers = employees == null ? 0 : employees.stream()
                            .filter(u -> u != null && u.getId() != null)
                            .map(User::getId)
                            .distinct()
                            .count();
                }
            } catch (Exception ignore) {}

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
            // Only include evaluations that belong to projects managed by the current manager
            Long managerId = resolveCurrentUserId();
            List<EvaluationDTO> evaluations = evaluationService.getManagerVisibleEvaluations(managerId)
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

            
            // Ratings distribution (1..5 buckets) based on combined ratings
            long[] buckets = new long[5];
            for (EvaluationDTO e : evaluations) {
                double employeeRating = e.getOverallRating() != null ? e.getOverallRating() : 0.0;
                double managerRating = 0.0;
                if (e.getManagerCompetencyRatings() != null && !e.getManagerCompetencyRatings().isEmpty()) {
                    managerRating = e.getManagerCompetencyRatings().values().stream().mapToInt(Integer::intValue).average().orElse(0.0);
                } else if (e.getManagerRating() != null) {
                    managerRating = e.getManagerRating();
                }
                double combined = (employeeRating > 0 && managerRating > 0)
                        ? (employeeRating + managerRating) / 2.0
                        : (employeeRating > 0 ? employeeRating : managerRating);
                int idx = (int)Math.round(Math.max(1, Math.min(5, combined)));
                // Map 1..5 -> 0..4
                buckets[idx-1]++;
            }
            java.util.List<java.util.Map<String, Object>> ratingsDist = new java.util.ArrayList<>();
            for (int i = 0; i < 5; i++) {
                ratingsDist.add(java.util.Map.of("label", (i+1) + "★", "count", buckets[i]));
            }

            // Competency averages heatmap: average per competency across visible evaluations (use managerCompetencyRatings if present, else employee competencyRatings)
            java.util.Map<String, java.util.List<Integer>> compMap = new java.util.HashMap<>();
            for (EvaluationDTO e : evaluations) {
                java.util.Map<String, Integer> source = (e.getManagerCompetencyRatings() != null && !e.getManagerCompetencyRatings().isEmpty())
                        ? e.getManagerCompetencyRatings()
                        : (e.getCompetencyRatings() != null ? e.getCompetencyRatings() : java.util.Collections.emptyMap());
                for (java.util.Map.Entry<String, Integer> entry : source.entrySet()) {
                    if (entry.getKey() == null || entry.getValue() == null) continue;
                    compMap.computeIfAbsent(entry.getKey(), k -> new java.util.ArrayList<>()).add(entry.getValue());
                }
            }
            java.util.List<java.util.Map<String, Object>> competencyAverages = new java.util.ArrayList<>();
            for (var e : compMap.entrySet()) {
                double avg = e.getValue().stream().mapToInt(Integer::intValue).average().orElse(0.0);
                competencyAverages.add(java.util.Map.of("competency", e.getKey(), "average", Math.round(avg * 10.0) / 10.0));
            }
            competencyAverages.sort(java.util.Comparator.comparing(m -> ((String)m.get("competency")).toLowerCase()));

            // Recent activity: latest up to 10 evaluations by updated/reviewed/submitted
            java.util.List<java.util.Map<String, Object>> recentActivity = new java.util.ArrayList<>();
            evaluations.stream()
                    .sorted((a,b) -> {
                        java.time.LocalDateTime ta = a.getUpdatedAt() != null ? a.getUpdatedAt() : (a.getReviewedAt() != null ? a.getReviewedAt() : a.getSubmittedAt());
                        java.time.LocalDateTime tb = b.getUpdatedAt() != null ? b.getUpdatedAt() : (b.getReviewedAt() != null ? b.getReviewedAt() : b.getSubmittedAt());
                        if (ta == null && tb == null) return 0;
                        if (ta == null) return 1;
                        if (tb == null) return -1;
                        return tb.compareTo(ta);
                    })
                    .limit(10)
                    .forEach(ev -> {
                        java.util.HashMap<String, Object> m = new java.util.HashMap<>();
                        m.put("id", ev.getId());
                        m.put("employeeName", ev.getEmployeeName());
                        m.put("projectName", ev.getProjectName());
                        m.put("status", ev.getStatus() != null ? ev.getStatus().toString() : "");
                        m.put("updatedAt", ev.getUpdatedAt());
                        m.put("reviewedAt", ev.getReviewedAt());
                        m.put("submittedAt", ev.getSubmittedAt());
                        recentActivity.add(m);
                    });

            payload.put("averageTeamRating", Math.round(avgRating * 10.0) / 10.0);
            payload.put("activeTeamMembers", activeMembers);
            payload.put("topPerformers", topPerformers);
            payload.put("onTrackGoals", Math.round(onTrackPercentage));
            payload.put("totalEvaluations", evaluations.size());
            payload.put("ratingsDistribution", ratingsDist);
            payload.put("competencyAverages", competencyAverages);
            payload.put("recentActivity", recentActivity);

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
