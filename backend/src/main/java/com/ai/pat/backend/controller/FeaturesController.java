package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.*;
import com.ai.pat.backend.service.FeaturesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/features")
@RequiredArgsConstructor
public class FeaturesController {
    
    private final FeaturesService featuresService;
    
    /**
     * Get all features page data (features, integrations, workflow steps)
     */
    @GetMapping
    public ResponseEntity<FeaturesPageDto> getFeaturesPageData() {
        FeaturesPageDto data = featuresService.getFeaturesPageData();
        return ResponseEntity.ok(data);
    }
    
    /**
     * Get all active features
     */
    @GetMapping("/list")
    public ResponseEntity<List<FeatureDto>> getAllFeatures() {
        List<FeatureDto> features = featuresService.getAllFeatures();
        return ResponseEntity.ok(features);
    }
    
    /**
     * Get all active integrations
     */
    @GetMapping("/integrations")
    public ResponseEntity<List<IntegrationDto>> getAllIntegrations() {
        List<IntegrationDto> integrations = featuresService.getAllIntegrations();
        return ResponseEntity.ok(integrations);
    }
    
    /**
     * Get all workflow steps
     */
    @GetMapping("/workflow")
    public ResponseEntity<List<WorkflowStepDto>> getAllWorkflowSteps() {
        List<WorkflowStepDto> workflowSteps = featuresService.getAllWorkflowSteps();
        return ResponseEntity.ok(workflowSteps);
    }
}

