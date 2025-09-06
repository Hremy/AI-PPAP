package com.ai.pat.backend.controller;

import com.ai.pat.backend.controller.dto.ai.DraftEvaluationRequest;
import com.ai.pat.backend.controller.dto.ai.DraftEvaluationResponse;
import com.ai.pat.backend.controller.dto.ai.AnalyzeTextRequest;
import com.ai.pat.backend.controller.dto.ai.AnalyzeTextResponse;
import com.ai.pat.backend.controller.dto.ai.SummarizeRequest;
import com.ai.pat.backend.controller.dto.ai.SummarizeResponse;
import com.ai.pat.backend.controller.dto.ai.RecommendationsRequest;
import com.ai.pat.backend.controller.dto.ai.RecommendationsResponse;
import com.ai.pat.backend.controller.dto.ai.EvaluateRequest;
import com.ai.pat.backend.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/draft-evaluation")
    public ResponseEntity<DraftEvaluationResponse> draft(@Valid @RequestBody DraftEvaluationRequest req) {
        return ResponseEntity.ok(aiService.draftEvaluation(req));
    }

    @PostMapping("/analyze-text")
    public ResponseEntity<AnalyzeTextResponse> analyzeText(@Valid @RequestBody AnalyzeTextRequest req) {
        return ResponseEntity.ok(aiService.analyzeText(req));
    }

    @PostMapping("/summarize")
    public ResponseEntity<SummarizeResponse> summarize(@Valid @RequestBody SummarizeRequest req) {
        return ResponseEntity.ok(aiService.summarize(req));
    }

    @PostMapping("/recommendations")
    public ResponseEntity<RecommendationsResponse> recommendations(@Valid @RequestBody RecommendationsRequest req) {
        return ResponseEntity.ok(aiService.recommendations(req));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> evaluate(@Valid @RequestBody EvaluateRequest req) {
        return ResponseEntity.ok(aiService.evaluate(req));
    }
}
