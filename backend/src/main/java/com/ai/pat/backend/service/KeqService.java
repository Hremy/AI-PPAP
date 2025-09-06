package com.ai.pat.backend.service;

import com.ai.pat.backend.model.Keq;
import com.ai.pat.backend.repository.KeqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KeqService {
    private final KeqRepository keqRepository;

    @Transactional(readOnly = true)
    public List<Keq> findAll() {
        return keqRepository.findAll();
    }

    @Transactional
    public Keq create(Keq keq) {
        return keqRepository.save(keq);
    }

    @Transactional
    public Keq update(Long id, Keq payload) {
        Keq existing = keqRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("KEQ not found"));
        existing.setCategory(payload.getCategory());
        existing.setDescription(payload.getDescription());
        existing.setOrderIndex(payload.getOrderIndex() == null ? 0 : payload.getOrderIndex());
        existing.setEffectiveFromYear(payload.getEffectiveFromYear());
        existing.setEffectiveFromQuarter(payload.getEffectiveFromQuarter());
        existing.setIsActive(payload.getIsActive() == null ? Boolean.TRUE : payload.getIsActive());
        return keqRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        keqRepository.deleteById(id);
    }

    @Transactional
    public int bootstrapDefaultsIfEmpty() {
        // No default KEQs - admin must create all KEQs manually
        return 0;
    }

    @Transactional
    public int bootstrapFromEvaluationsIfEmpty(com.ai.pat.backend.repository.EvaluationRepository evaluationRepository) {
        // No automatic bootstrapping - admin must create all KEQs manually
        return 0;
    }
}
