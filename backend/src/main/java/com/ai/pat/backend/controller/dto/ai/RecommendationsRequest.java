package com.ai.pat.backend.controller.dto.ai;

import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.Data;

@Data
public class RecommendationsRequest {
  private String role;

  @NotNull
  private Map<String, Integer> competencyRatings;

  // Optional: additional text to analyze for recommendations
  private String feedbackText;
}
