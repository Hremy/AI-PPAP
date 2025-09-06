package com.ai.pat.backend.dto;

import java.util.Set;

public class UserSummaryDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String department;
    private Set<String> roles;

    // Getters
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getDepartment() { return department; }
    public Set<String> getRoles() { return roles; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUsername(String username) { this.username = username; }
    public void setEmail(String email) { this.email = email; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public void setDepartment(String department) { this.department = department; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
}
