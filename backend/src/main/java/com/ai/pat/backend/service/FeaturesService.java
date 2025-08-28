package com.ai.pat.backend.service;

import com.ai.pat.backend.dto.*;
import com.ai.pat.backend.model.Feature;
import com.ai.pat.backend.model.Integration;
import com.ai.pat.backend.model.WorkflowStep;
import com.ai.pat.backend.repository.FeatureRepository;
import com.ai.pat.backend.repository.IntegrationRepository;
import com.ai.pat.backend.repository.WorkflowStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeaturesService {
    
    private final FeatureRepository featureRepository;
    private final IntegrationRepository integrationRepository;
    private final WorkflowStepRepository workflowStepRepository;
    
    public FeaturesPageDto getFeaturesPageData() {
        return FeaturesPageDto.builder()
                .features(getAllFeatures())
                .integrations(getAllIntegrations())
                .workflowSteps(getAllWorkflowSteps())
                .build();
    }
    
    public List<FeatureDto> getAllFeatures() {
        return featureRepository.findAllActiveOrderByDisplayOrder()
                .stream()
                .map(this::convertToFeatureDto)
                .collect(Collectors.toList());
    }
    
    public List<IntegrationDto> getAllIntegrations() {
        return integrationRepository.findAllActiveOrderByDisplayOrder()
                .stream()
                .map(this::convertToIntegrationDto)
                .collect(Collectors.toList());
    }
    
    public List<WorkflowStepDto> getAllWorkflowSteps() {
        return workflowStepRepository.findAllActiveOrderByStepNumber()
                .stream()
                .map(this::convertToWorkflowStepDto)
                .collect(Collectors.toList());
    }
    
    private FeatureDto convertToFeatureDto(Feature feature) {
        return FeatureDto.builder()
                .id(feature.getId())
                .title(feature.getTitle())
                .description(feature.getDescription())
                .icon(feature.getIcon())
                .benefits(feature.getBenefits())
                .displayOrder(feature.getDisplayOrder())
                .build();
    }
    
    private IntegrationDto convertToIntegrationDto(Integration integration) {
        return IntegrationDto.builder()
                .id(integration.getId())
                .name(integration.getName())
                .logo(integration.getLogo())
                .description(integration.getDescription())
                .integrationUrl(integration.getIntegrationUrl())
                .displayOrder(integration.getDisplayOrder())
                .build();
    }
    
    private WorkflowStepDto convertToWorkflowStepDto(WorkflowStep workflowStep) {
        return WorkflowStepDto.builder()
                .id(workflowStep.getId())
                .title(workflowStep.getTitle())
                .description(workflowStep.getDescription())
                .stepNumber(workflowStep.getStepNumber())
                .build();
    }
}

