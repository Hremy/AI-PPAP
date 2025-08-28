package com.ai.pat.backend.service;

import com.ai.pat.backend.dto.EvaluationDTO;
import com.ai.pat.backend.exception.ResourceNotFoundException;
import com.ai.pat.backend.model.Evaluation;
import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.EvaluationRepository;
import com.ai.pat.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;

    @Transactional
    public EvaluationDTO createEvaluation(EvaluationDTO evaluationDTO, Long employeeId, Long reviewerId) {
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + employeeId));
        
        User reviewer = reviewerId != null ? 
                userRepository.findById(reviewerId)
                        .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found with id: " + reviewerId)) : 
                null;

        Evaluation evaluation = new Evaluation();
        evaluation.setEmployee(employee);
        evaluation.setReviewer(reviewer);
        evaluation.setRatings(evaluationDTO.getRatings());
        evaluation.setFeedback(evaluationDTO.getFeedback());
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
        return evaluationRepository.findByEmployeeId(employeeId).stream()
                .map(EvaluationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluationDTO> getAssignedEvaluations(Long reviewerId) {
        return evaluationRepository.findByReviewerId(reviewerId).stream()
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
        
        evaluationRepository.delete(evaluation);
    }

    public Map<String, Double> getEmployeeAverageRatings(Long employeeId) {
        List<Evaluation> evaluations = evaluationRepository.findByEmployeeId(employeeId);
        
        return evaluations.stream()
                .flatMap(e -> e.getRatings().entrySet().stream())
                .collect(Collectors.groupingBy(
                        Map.Entry::getKey,
                        Collectors.averagingInt(Map.Entry::getValue)
                ));
    }
}
