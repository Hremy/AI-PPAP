package com.ai.pat.backend.controller;

import com.ai.pat.backend.controller.dto.ai.DraftEvaluationRequest;
import com.ai.pat.backend.controller.dto.ai.DraftEvaluationResponse;
import com.ai.pat.backend.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/draft-evaluation")
    public ResponseEntity<DraftEvaluationResponse> draft(@Valid @RequestBody DraftEvaluationRequest req) {
        return ResponseEntity.ok(aiService.draftEvaluation(req));
    }
}
