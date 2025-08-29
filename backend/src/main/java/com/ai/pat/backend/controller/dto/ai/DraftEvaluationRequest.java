package com.ai.pat.backend.controller.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.Data;

@Data
public class DraftEvaluationRequest {
  @NotBlank
  private String employeeName;

  private String role;

  // competency -> rating (1-5)
  @NotNull
  private Map<String, Integer> competencyRatings;

  // Optional additional context/bullets provided by the user
  private String context;
}
