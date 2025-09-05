package com.ai.pat.backend.service;

import com.ai.pat.backend.model.Keq;
import com.ai.pat.backend.repository.KeqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.LinkedHashSet;

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
        existing.setText(payload.getText());
        existing.setCategory(payload.getCategory());
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
        if (keqRepository.count() > 0) return 0;
        int q = (int) (Math.floor((java.time.LocalDate.now().getMonthValue() - 1) / 3.0) + 1);
        int y = java.time.LocalDate.now().getYear();
        String[] defaults = new String[] {
                "Communication",
                "Teamwork",
                "Problem Solving",
                "Initiative",
                "Quality",
                "Adaptability",
                "Leadership",
                "Time Management"
        };
        int created = 0;
        for (int i = 0; i < defaults.length; i++) {
            String text = defaults[i];
            if (keqRepository.existsByTextIgnoreCase(text)) continue;
            Keq k = Keq.builder()
                    .text(text)
                    .category("Core")
                    .orderIndex(i)
                    .effectiveFromYear(y)
                    .effectiveFromQuarter(q)
                    .isActive(true)
                    .build();
            keqRepository.save(k);
            created++;
        }
        return created;
    }

    @Transactional
    public int bootstrapFromEvaluationsIfEmpty(com.ai.pat.backend.repository.EvaluationRepository evaluationRepository) {
        if (keqRepository.count() > 0) return 0;
        // Collect distinct competency keys from existing evaluations
        List<com.ai.pat.backend.model.Evaluation> evals;
        try { evals = evaluationRepository.findAll(); } catch (Exception e) { evals = java.util.List.of(); }
        Set<String> names = new LinkedHashSet<>();
        for (var e : evals) {
            if (e.getCompetencyRatings() != null) names.addAll(e.getCompetencyRatings().keySet());
            if (e.getManagerCompetencyRatings() != null) names.addAll(e.getManagerCompetencyRatings().keySet());
        }
        if (names.isEmpty()) {
            return bootstrapDefaultsIfEmpty();
        }
        int q = (int) (Math.floor((java.time.LocalDate.now().getMonthValue() - 1) / 3.0) + 1);
        int y = java.time.LocalDate.now().getYear();
        int i = 0, created = 0;
        for (String n : names) {
            if (n == null || n.isBlank()) continue;
            if (keqRepository.existsByTextIgnoreCase(n)) continue;
            Keq k = Keq.builder()
                    .text(n)
                    .category("Imported")
                    .orderIndex(i++)
                    .effectiveFromYear(y)
                    .effectiveFromQuarter(q)
                    .isActive(true)
                    .build();
            keqRepository.save(k);
            created++;
        }
        return created;
    }
}
