package com.ai.pat.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeaturesPageDto {
    private List<FeatureDto> features;
    private List<IntegrationDto> integrations;
    private List<WorkflowStepDto> workflowSteps;
}

