package com.ai.pat.backend.controller.dto.ai;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DraftEvaluationResponse {
  private String summary; // AI-generated narrative summary
  private Map<String, String> competencyNotes; // competency -> short note
}
