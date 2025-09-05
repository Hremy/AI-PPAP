package com.ai.pat.backend.controller.dto.ai;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationsResponse {
  private List<String> strengths;
  private List<String> weaknesses;
  private List<String> growthAreas;
  private List<String> suggestedActions;
}
