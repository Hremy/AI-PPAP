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
public class FeatureDto {
    private Long id;
    private String title;
    private String description;
    private String icon;
    private List<String> benefits;
    private Integer displayOrder;
}

