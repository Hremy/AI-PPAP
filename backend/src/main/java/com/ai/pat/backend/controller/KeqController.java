package com.ai.pat.backend.controller;

import com.ai.pat.backend.model.Keq;
import com.ai.pat.backend.repository.EvaluationRepository;
import com.ai.pat.backend.service.KeqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/v1/keqs", "/api/v1/keqs", "/keqs"})
@RequiredArgsConstructor
public class KeqController {

    private final KeqService keqService;
    private final EvaluationRepository evaluationRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Keq>> list() {
        // Bootstrap from evaluations if empty
        try { keqService.bootstrapFromEvaluationsIfEmpty(evaluationRepository); } catch (Exception ignore) {}
        return ResponseEntity.ok(keqService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Keq> create(@RequestBody Keq payload) {
        return ResponseEntity.ok(keqService.create(payload));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Keq> update(@PathVariable("id") Long id, @RequestBody Keq payload) {
        return ResponseEntity.ok(keqService.update(id, payload));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable("id") Long id) {
        keqService.delete(id);
        Map<String, Object> body = new HashMap<>();
        body.put("success", true);
        body.put("id", id);
        return ResponseEntity.ok(body);
    }
}
