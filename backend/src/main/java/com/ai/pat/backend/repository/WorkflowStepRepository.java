package com.ai.pat.backend.repository;

import com.ai.pat.backend.model.WorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WorkflowStepRepository extends JpaRepository<WorkflowStep, Long> {
    
    @Query("SELECT w FROM WorkflowStep w WHERE w.active = true ORDER BY w.stepNumber ASC")
    List<WorkflowStep> findAllActiveOrderByStepNumber();
    
    List<WorkflowStep> findByActiveTrue();
    
    List<WorkflowStep> findByActiveTrueOrderByStepNumberAsc();
}

