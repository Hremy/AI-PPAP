package com.ai.pat.backend.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UserSummaryDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String department;
    private Set<String> roles;
}
