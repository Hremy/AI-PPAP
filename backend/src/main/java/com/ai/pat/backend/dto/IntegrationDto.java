package com.ai.pat.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationDto {
    private Long id;
    private String name;
    private String logo;
    private String description;
    private String integrationUrl;
    private Integer displayOrder;
}

