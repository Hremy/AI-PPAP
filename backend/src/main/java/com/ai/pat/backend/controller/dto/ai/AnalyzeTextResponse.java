package com.ai.pat.backend.controller.dto.ai;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyzeTextResponse {
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Sentiment {
    private String label; // positive | neutral | negative
    private double score; // 0..1
  }

  private List<Sentiment> sentiments;
  private List<String> keyPoints; // optional extracted key points
}
