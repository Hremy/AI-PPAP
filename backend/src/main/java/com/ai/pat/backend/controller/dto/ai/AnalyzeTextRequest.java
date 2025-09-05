package com.ai.pat.backend.controller.dto.ai;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.Data;

@Data
public class AnalyzeTextRequest {
  @NotEmpty
  private List<String> texts;
}
