package com.ai.pat.backend.repository;

import com.ai.pat.backend.model.Evaluation;
import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    
    List<Evaluation> findByEmployeeId(Long employeeId);
    
    List<Evaluation> findByReviewerId(Long reviewerId);
    
    List<Evaluation> findByStatus(Evaluation.EvaluationStatus status);
    
    @Query("SELECT e FROM Evaluation e WHERE e.employee.id = :userId OR e.reviewer.id = :userId")
    List<Evaluation> findRelatedEvaluations(@Param("userId") Long userId);
    
    @Query("SELECT e FROM Evaluation e WHERE e.submittedAt BETWEEN :startDate AND :endDate")
    List<Evaluation> findBySubmissionDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT e FROM Evaluation e WHERE e.employee.department = :department")
    List<Evaluation> findByDepartment(@Param("department") String department);
    
    @Query("SELECT DISTINCT e FROM Evaluation e LEFT JOIN FETCH e.managerCompetencyRatings WHERE e.id = :id")
    Optional<Evaluation> findByIdWithManagerCompetencyRatings(@Param("id") Long id);

    @Query("SELECT DISTINCT e FROM Evaluation e JOIN e.employee emp LEFT JOIN emp.projects ep WHERE ep IN :projects OR e.project IN :projects")
    List<Evaluation> findByEmployeeProjectsOrEvaluationProjectIn(@Param("projects") List<Project> projects);
}
