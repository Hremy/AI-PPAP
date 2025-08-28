package com.ai.pat.backend.repository;

import com.ai.pat.backend.model.Evaluation;
import com.ai.pat.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

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
}
