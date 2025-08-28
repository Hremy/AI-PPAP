package com.ai.pat.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/features")
public class FeaturesController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFeaturesPage() {
        return ResponseEntity.ok(Map.of(
                "title", "AI-PPAP Features",
                "description", "Explore AI-Powered Performance Analysis Platform features",
                "sections", List.of("overview", "integrations", "workflow")
        ));
    }

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, String>>> listFeatures() {
        return ResponseEntity.ok(List.of(
                Map.of("key", "analytics", "name", "Analytics"),
                Map.of("key", "scoring", "name", "Scoring"),
                Map.of("key", "reviews", "name", "Reviews")
        ));
    }

    @GetMapping("/integrations")
    public ResponseEntity<List<Map<String, String>>> listIntegrations() {
        return ResponseEntity.ok(List.of(
                Map.of("name", "Slack"),
                Map.of("name", "Jira"),
                Map.of("name", "GitHub")
        ));
    }

    @GetMapping("/workflow")
    public ResponseEntity<List<Map<String, String>>> listWorkflow() {
        return ResponseEntity.ok(List.of(
                Map.of("step", "Ingest"),
                Map.of("step", "Analyze"),
                Map.of("step", "Score"),
                Map.of("step", "Review")
        ));
    }
}
