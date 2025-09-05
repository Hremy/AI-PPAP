package com.ai.pat.backend.controller.dto.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SummarizeRequest {
  @NotBlank
  private String text;
  private Integer maxTokens; // optional hint
}
