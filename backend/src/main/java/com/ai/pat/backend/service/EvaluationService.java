package com.ai.pat.backend.service;

import com.ai.pat.backend.dto.EvaluationDTO;
import com.ai.pat.backend.exception.ResourceNotFoundException;
import com.ai.pat.backend.model.Evaluation;
import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.EvaluationRepository;
import com.ai.pat.backend.repository.ProjectRepository;
import com.ai.pat.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public EvaluationDTO createEvaluation(EvaluationDTO evaluationDTO, Long employeeId, Long reviewerId, Long projectId) {
        // Try to find the employee, but don't fail if not found (for demo purposes)
        User employee = null;
        User reviewer = null;
        
        try {
            employee = userRepository.findById(employeeId).orElse(null);
        } catch (Exception e) {
            // Continue without employee relationship for demo
        }
        
        if (reviewerId != null) {
            try {
                reviewer = userRepository.findById(reviewerId).orElse(null);
            } catch (Exception e) {
                // Continue without reviewer relationship for demo
            }
        }

        Evaluation evaluation = new Evaluation();
        evaluation.setEmployee(employee);
        evaluation.setReviewer(reviewer);
        // Optional project association with validation that employee belongs to the project
        if (projectId != null) {
            try {
                Optional<Project> opt = projectRepository.findById(projectId);
                if (opt.isPresent()) {
                    Project project = opt.get();
                    // Validate only if we resolved an employee successfully
                    if (employee != null && employee.getProjects() != null && !employee.getProjects().isEmpty()) {
                        boolean isMember = employee.getProjects().stream().anyMatch(p -> p != null && project.getId().equals(p.getId()));
                        if (!isMember) {
                            throw new IllegalArgumentException("Selected project does not belong to the employee");
                        }
                    }
                    evaluation.setProject(project);
                }
            } catch (IllegalArgumentException ex) {
                throw ex;
            } catch (Exception e) {
                // Ignore if project lookup fails (demo resilience)
            }
        }
        // Persist competency ratings first
        evaluation.setCompetencyRatings(evaluationDTO.getCompetencyRatings());
        // Auto-calculate overall rating from competency ratings (average of values, rounded)
        Integer computedOverall = 0;
        Map<String, Integer> cr = evaluationDTO.getCompetencyRatings();
        if (cr != null && !cr.isEmpty()) {
            int sum = 0;
            int count = 0;
            for (Integer v : cr.values()) {
                if (v != null) {
                    sum += v;
                    count++;
                }
            }
            if (count > 0) {
                computedOverall = Math.toIntExact(Math.round((double) sum / (double) count));
            }
        } else if (evaluationDTO.getOverallRating() != null) {
            // Fallback to provided overall if no competencies sent (legacy support)
            computedOverall = evaluationDTO.getOverallRating();
        }
        evaluation.setOverallRating(computedOverall);
        
        // Use the provided employee name and email from the form (not from database)
        evaluation.setEmployeeName(evaluationDTO.getEmployeeName());
        evaluation.setEmployeeEmail(evaluationDTO.getEmployeeEmail());
        
        evaluation.setAchievements(evaluationDTO.getAchievements());
        evaluation.setChallenges(evaluationDTO.getChallenges());
        evaluation.setLearnings(evaluationDTO.getLearnings());
        evaluation.setNextPeriodGoals(evaluationDTO.getNextPeriodGoals());
        evaluation.setAdditionalFeedback(evaluationDTO.getAdditionalFeedback());
        evaluation.setManagerFeedbackRequest(evaluationDTO.getManagerFeedbackRequest());
        evaluation.setStatus(Evaluation.EvaluationStatus.SUBMITTED);
        evaluation.setSubmittedAt(LocalDateTime.now());

        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        return EvaluationDTO.fromEntity(savedEvaluation);
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getAllEvaluations() {
        return evaluationRepository.findAll().stream()
                .map(EvaluationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEmployeeEvaluations(Long employeeId) {
        try {
            return evaluationRepository.findByEmployeeId(employeeId).stream()
                    .map(EvaluationDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Return empty list if there's any database issue
            return List.of();
        }
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getAssignedEvaluations(Long reviewerId) {
        return evaluationRepository.findByReviewerId(reviewerId).stream()
                .map(EvaluationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getManagerVisibleEvaluations(Long managerId) {
        User manager = userRepository.findById(managerId)
                .orElse(null);
        if (manager == null || manager.getManagedProjects() == null || manager.getManagedProjects().isEmpty()) {
            return List.of();
        }
        List<Project> projects = manager.getManagedProjects().stream().toList();
        return evaluationRepository.findByEmployeeProjectsOrEvaluationProjectIn(projects).stream()
                .map(EvaluationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getDepartmentEvaluations(String department) {
        return evaluationRepository.findByDepartment(department).stream()
                .map(EvaluationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getEvaluationsByStatus(Evaluation.EvaluationStatus status) {
        return evaluationRepository.findByStatus(status).stream()
                .map(EvaluationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public EvaluationDTO updateEvaluationStatus(Long evaluationId, Evaluation.EvaluationStatus status) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found with id: " + evaluationId));
        
        evaluation.setStatus(status);
        Evaluation updatedEvaluation = evaluationRepository.save(evaluation);
        return EvaluationDTO.fromEntity(updatedEvaluation);
    }

    @Transactional
    public void deleteEvaluation(Long evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found with id: " + evaluationId));
        
        log.info("Evaluation with id {} deleted successfully", evaluationId);
        evaluationRepository.delete(evaluation);
    }

    @Transactional
    public void deleteEvaluationAuthorized(Long evaluationId, Long requesterId, boolean isAdmin) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found with id: " + evaluationId));
        if (!isAdmin) {
            if (requesterId == null || !isManagerAuthorizedForEmployee(requesterId, evaluation.getEmployee())) {
                throw new AccessDeniedException("You are not authorized to delete this evaluation");
            }
        }
        evaluationRepository.delete(evaluation);
        log.info("Evaluation with id {} deleted by {} (admin={})", evaluationId, requesterId, isAdmin);
    }

    public int createMonthlyEvaluations(Integer month, Integer year) {
        log.info("Creating monthly evaluations for {}/{}", month, year);
        
        // Get all employees (users with ROLE_EMPLOYEE)
        List<User> employees = userRepository.findAll().stream()
            .filter(user -> user.getRoles().contains("ROLE_EMPLOYEE"))
            .collect(Collectors.toList());
        int createdCount = 0;
        
        for (User employee : employees) {
            // Check if evaluation already exists for this employee in this month/year
            List<Evaluation> existingEvaluations = evaluationRepository.findByEmployeeId(employee.getId());
            boolean exists = existingEvaluations.stream()
                .anyMatch(eval -> month.equals(eval.getEvaluationMonth()) && year.equals(eval.getEvaluationYear()));
            
            if (!exists) {
                Evaluation evaluation = new Evaluation();
                evaluation.setEmployee(employee);
                evaluation.setEmployeeName(employee.getFirstName() + " " + employee.getLastName());
                evaluation.setEmployeeEmail(employee.getEmail());
                evaluation.setEvaluationMonth(month);
                evaluation.setEvaluationYear(year);
                evaluation.setStatus(Evaluation.EvaluationStatus.DRAFT);
                evaluation.setOverallRating(0); // Default rating
                
                evaluationRepository.save(evaluation);
                createdCount++;
                
                log.info("Created evaluation for employee: {} for {}/{}", 
                    employee.getEmail(), month, year);
            }
        }
        
        log.info("Created {} monthly evaluations for {}/{}", createdCount, month, year);
        return createdCount;
    }

    @Transactional
    public EvaluationDTO updateManagerOverallRating(Long evaluationId, Long managerId, Integer rating) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found with id: " + evaluationId));
        // Authorization: manager must manage at least one of employee's projects
        if (!isManagerAuthorizedForEmployee(managerId, evaluation.getEmployee())) {
            throw new AccessDeniedException("You are not authorized to grade this employee");
        }

        evaluation.setManagerRating(rating);
        evaluation.setReviewedAt(LocalDateTime.now());
        
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        log.info("Updated manager overall rating for evaluation {} to {}", evaluationId, rating);
        
        return EvaluationDTO.fromEntity(savedEvaluation);
    }

    public Map<String, Double> getEmployeeAverageRatings(Long employeeId) {
        try {
            List<Evaluation> evaluations = evaluationRepository.findByEmployeeId(employeeId);
            
            return evaluations.stream()
                    .filter(e -> e.getCompetencyRatings() != null)
                    .flatMap(e -> e.getCompetencyRatings().entrySet().stream())
                    .collect(Collectors.groupingBy(
                            Map.Entry::getKey,
                            Collectors.averagingInt(Map.Entry::getValue)
                    ));
        } catch (Exception e) {
            // Return empty map if there's any database issue
            return new HashMap<>();
        }
    }

    @Transactional
    public EvaluationDTO submitReview(Long evaluationId, Long reviewerId, Integer managerRating, 
                                    String managerFeedback, String recommendations, String status) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluation not found with id: " + evaluationId));
        
        // Find reviewer (optional for demo)
        User reviewer = null;
        if (reviewerId != null) {
            try {
                reviewer = userRepository.findById(reviewerId).orElse(null);
            } catch (Exception e) {
                // Continue without reviewer relationship for demo
            }
        }
        
        // Update evaluation with review data
        evaluation.setReviewer(reviewer);
        evaluation.setManagerRating(managerRating);
        evaluation.setManagerFeedback(managerFeedback);
        evaluation.setRecommendations(recommendations);
        
        // Update status
        if (status != null) {
            evaluation.setStatus(Evaluation.EvaluationStatus.valueOf(status));
        }
        
        evaluation.setReviewedAt(LocalDateTime.now());
        evaluation.setUpdatedAt(LocalDateTime.now());
        
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        return EvaluationDTO.fromEntity(savedEvaluation);
    }

    @Transactional
    public EvaluationDTO updateManagerCompetencyScore(Long evaluationId, Long managerId, String competency, Integer score) {
        log.info("=== Starting updateManagerCompetencyScore ===");
        log.info("Parameters - Evaluation ID: {}, Manager ID: {}, Competency: {}, Score: {}", 
                evaluationId, managerId, competency, score);
        
        try {
            log.info("1. Attempting to find evaluation with ID: {}", evaluationId);
            
            // Use standard findById to avoid potential issues with JOIN FETCH on element collections
            Optional<Evaluation> evaluationOpt = evaluationRepository.findById(evaluationId);
            log.info("2. After standard findById, found: {}", evaluationOpt.isPresent());
            
            Evaluation evaluation = evaluationOpt.orElseThrow(
                () -> new IllegalArgumentException("Evaluation not found with id: " + evaluationId)
            );
            
            log.info("5. Found evaluation with ID: {}, Status: {}", evaluation.getId(), evaluation.getStatus());
            
            // Ensure the manager is authorized to update this evaluation
            log.info("6. Checking if manager with ID {} exists", managerId);
            try {
                if (!userRepository.existsById(managerId)) {
                    log.warn("Manager not found with id: {}. Proceeding for demo purposes.", managerId);
                }
            } catch (Exception ex) {
                log.warn("Could not verify manager existence due to DB issue: {}. Proceeding.", ex.getMessage());
            }
            
            // Authorization: manager must manage at least one of employee's projects
            if (!isManagerAuthorizedForEmployee(managerId, evaluation.getEmployee())) {
                throw new AccessDeniedException("You are not authorized to grade this employee");
            }

            // Initialize the map if null
            if (evaluation.getManagerCompetencyRatings() == null) {
                log.info("7. Initializing managerCompetencyRatings map");
                evaluation.setManagerCompetencyRatings(new HashMap<>());
            } else {
                log.info("7. Existing managerCompetencyRatings size: {}", 
                        evaluation.getManagerCompetencyRatings().size());
            }
            
            // Update the score for the competency (mutate managed collection in place)
            log.info("8. Updating score for competency: {} to {}", competency, score);
            Map<String, Integer> existingRatings = evaluation.getManagerCompetencyRatings();
            existingRatings.put(competency, score);
            
            // Set the reviewed timestamp and status
            log.info("9. Updating review timestamp and status to REVIEWED");
            evaluation.setReviewedAt(LocalDateTime.now());
            evaluation.setStatus(Evaluation.EvaluationStatus.REVIEWED);
            
            // Save the evaluation and flush so exceptions surface here
            log.info("10. Attempting to save evaluation");
            Evaluation savedEvaluation = evaluationRepository.saveAndFlush(evaluation);
            log.info("11. Successfully saved evaluation with ID: {}", savedEvaluation.getId());
            
            EvaluationDTO result = EvaluationDTO.fromEntity(savedEvaluation);
            log.info("12. Successfully converted to DTO, returning result");
            
            return result;
            
        } catch (Exception e) {
            log.error("ERROR in updateManagerCompetencyScore: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to update manager competency score: " + e.getMessage(), e);
        } finally {
            log.info("=== Completed updateManagerCompetencyScore ===");
        }
    }

    private boolean isManagerAuthorizedForEmployee(Long managerId, User employee) {
        try {
            if (employee == null || employee.getId() == null) return false;
            User manager = userRepository.findById(managerId).orElse(null);
            if (manager == null) return false;
            if (manager.getManagedProjects() == null || manager.getManagedProjects().isEmpty()) return false;
            if (employee.getProjects() == null || employee.getProjects().isEmpty()) return false;
            // Check intersection
            java.util.Set<Long> employeeProjectIds = employee.getProjects().stream().map(Project::getId).collect(java.util.stream.Collectors.toSet());
            for (Project p : manager.getManagedProjects()) {
                if (p != null && employeeProjectIds.contains(p.getId())) {
                    return true;
                }
            }
            return false;
        } catch (Exception ex) {
            log.warn("Authorization check failed due to exception: {}", ex.getMessage());
            return false;
        }
    }

}
