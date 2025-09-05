package com.ai.pat.backend.controller.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class EvaluateRequest {
  @NotBlank
  private String employeeName;
  private String role;

  @NotNull
  private Map<String, Integer> competencyRatings; // name -> 1..5

  // Optional textual inputs
  private String selfText;
  private String managerText;
  private List<String> peerTexts;
}
