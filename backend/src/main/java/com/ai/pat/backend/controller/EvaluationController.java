package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.EvaluationDTO;
import com.ai.pat.backend.model.Evaluation;
import com.ai.pat.backend.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<EvaluationDTO> submitEvaluation(
            @RequestBody EvaluationDTO evaluationDTO) {
        // For now, we'll use hardcoded IDs - in production this would come from authentication
        Long employeeId = 1L; // This would come from the authenticated user
        Long reviewerId = null; // Self-evaluation doesn't need a reviewer initially
        
        EvaluationDTO createdEvaluation = evaluationService.createEvaluation(evaluationDTO, employeeId, reviewerId);
        return ResponseEntity.ok(createdEvaluation);
    }
    
    @PostMapping("/self")
    public ResponseEntity<EvaluationDTO> submitSelfEvaluation(
            @RequestBody Map<String, Object> evaluationData) {
        // Create evaluation DTO from the form data
        EvaluationDTO evaluationDTO = new EvaluationDTO();
        evaluationDTO.setRatings((Map<String, Integer>) evaluationData.get("ratings"));
        evaluationDTO.setFeedback((String) evaluationData.get("feedback"));
        
        // For demo purposes, use hardcoded employee ID
        Long employeeId = 1L;
        
        EvaluationDTO createdEvaluation = evaluationService.createEvaluation(evaluationDTO, employeeId, null);
        return ResponseEntity.ok(createdEvaluation);
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<EvaluationDTO>> getAllEvaluations() {
        List<EvaluationDTO> evaluations = evaluationService.getAllEvaluations();
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER') or #employeeId == authentication.principal.id")
    public ResponseEntity<List<EvaluationDTO>> getEmployeeEvaluations(
            @PathVariable Long employeeId) {
        List<EvaluationDTO> evaluations = evaluationService.getEmployeeEvaluations(employeeId);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/reviewer/{reviewerId}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or #reviewerId == authentication.principal.id")
    public ResponseEntity<List<EvaluationDTO>> getAssignedEvaluations(
            @PathVariable Long reviewerId) {
        List<EvaluationDTO> evaluations = evaluationService.getAssignedEvaluations(reviewerId);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<EvaluationDTO>> getDepartmentEvaluations(
            @PathVariable String department) {
        List<EvaluationDTO> evaluations = evaluationService.getDepartmentEvaluations(department);
        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<EvaluationDTO>> getEvaluationsByStatus(
            @PathVariable Evaluation.EvaluationStatus status) {
        List<EvaluationDTO> evaluations = evaluationService.getEvaluationsByStatus(status);
        return ResponseEntity.ok(evaluations);
    }

    @PutMapping("/{evaluationId}/status")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<EvaluationDTO> updateEvaluationStatus(
            @PathVariable Long evaluationId,
            @RequestParam Evaluation.EvaluationStatus status) {
        EvaluationDTO updatedEvaluation = evaluationService.updateEvaluationStatus(evaluationId, status);
        return ResponseEntity.ok(updatedEvaluation);
    }

    @DeleteMapping("/{evaluationId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteEvaluation(
            @PathVariable Long evaluationId) {
        evaluationService.deleteEvaluation(evaluationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/employee/{employeeId}/averages")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER') or #employeeId == authentication.principal.id")
    public ResponseEntity<Map<String, Double>> getEmployeeAverageRatings(
            @PathVariable Long employeeId) {
        Map<String, Double> averageRatings = evaluationService.getEmployeeAverageRatings(employeeId);
        return ResponseEntity.ok(averageRatings);
    }
}
