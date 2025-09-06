package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.UserSummaryDTO;
import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.model.User;
import com.ai.pat.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/v1/users", "/users", "/api/v1/users", "/api/users"})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/managers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserSummaryDTO> createManager(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("department") String department) {
        
        User manager = userService.createManager(
            username, email, password, firstName, lastName, department);
        
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(manager.getId())
            .toUri();
            
        return ResponseEntity.created(location).body(toDto(manager));
    }

    @GetMapping("/managers")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<Map<String, Object>>> getAllManagers() {
        List<Map<String, Object>> dtos = userService.getAllManagers()
                .stream()
                .map(u -> {
                    Map<String, Object> m = new java.util.HashMap<>();
                    m.put("id", u.getId());
                    m.put("username", u.getUsername());
                    m.put("email", u.getEmail());
                    m.put("firstName", u.getFirstName());
                    m.put("lastName", u.getLastName());
                    m.put("department", u.getDepartment());
                    m.put("roles", u.getRoles() == null ? null : new java.util.HashSet<>(u.getRoles()));
                    // Add managedProjects slim DTO
                    List<Map<String, Object>> mps = new java.util.ArrayList<>();
                    if (u.getManagedProjects() != null) {
                        for (com.ai.pat.backend.model.Project p : u.getManagedProjects()) {
                            if (p == null) continue;
                            Map<String, Object> mp = new java.util.HashMap<>();
                            mp.put("id", p.getId());
                            mp.put("name", p.getName());
                            mps.add(mp);
                        }
                    }
                    m.put("managedProjects", mps);
                    return m;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/managers/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<UserSummaryDTO> getManagerById(@PathVariable Map<String, String> pathVars) {
        Long id = Long.parseLong(pathVars.get("userId"));
        return ResponseEntity.ok(toDto(userService.getManagerById(id)));
    }

    @DeleteMapping("/managers/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteManager(@PathVariable Map<String, String> pathVars) {
        Long id = Long.parseLong(pathVars.get("userId"));
        userService.deleteManager(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{userId:\\d+}/projects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> assignProjectsToUser(
            @PathVariable Map<String, String> pathVars,
            @RequestBody List<Long> projectIds) {
        Long id = Long.parseLong(pathVars.get("userId"));
        User u = userService.assignProjectsToUser(id, projectIds);
        List<Map<String, Object>> projDtos = new ArrayList<>();
        if (u != null && u.getProjects() != null) {
            for (Project p : u.getProjects()) {
                if (p == null) continue;
                Map<String, Object> pm = new java.util.HashMap<>();
                pm.put("id", p.getId());
                pm.put("name", p.getName());
                projDtos.add(pm);
            }
        }
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("id", u != null ? u.getId() : id);
        body.put("projects", projDtos);
        return ResponseEntity.ok(body);
    }

    @PutMapping("/me/projects")
    public ResponseEntity<Map<String, Object>> assignProjectsToCurrentUser(
            @RequestHeader(value = "X-User", required = false) String xUser,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "email", required = false) String email,
            @RequestBody List<Long> projectIds) {
        String key = xUser != null && !xUser.isBlank() ? xUser
                : (username != null && !username.isBlank() ? username : email);

        if (key == null || key.isBlank()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().isBlank()) {
                key = auth.getName();
            }
        }

        if (key == null || key.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "success", false,
                    "message", "Missing user key"
            ));
        }
        User u = userService.assignProjectsToCurrentUser(key, projectIds);
        List<Map<String, Object>> projDtos = new ArrayList<>();
        if (u != null && u.getProjects() != null) {
            for (Project p : u.getProjects()) {
                if (p == null) continue;
                Map<String, Object> pm = new java.util.HashMap<>();
                pm.put("id", p.getId());
                pm.put("name", p.getName());
                projDtos.add(pm);
            }
        }
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("id", u != null ? u.getId() : null);
        body.put("projects", projDtos);
        return ResponseEntity.ok(body);
    }

    @GetMapping("/me/projects")
    public ResponseEntity<Set<com.ai.pat.backend.model.Project>> getProjectsForCurrentUser(
            @RequestHeader(value = "X-User", required = false) String xUser,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "email", required = false) String email) {
        String key = xUser != null && !xUser.isBlank() ? xUser
                : (username != null && !username.isBlank() ? username : email);

        if (key == null || key.isBlank()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().isBlank()) {
                key = auth.getName();
            }
        }

        if (key == null || key.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Collections.emptySet());
        }
        return ResponseEntity.ok(userService.getProjectsForUser(key));
    }

    @GetMapping("/me/projects-with-managers")
    public ResponseEntity<Object> getProjectsWithManagersForCurrentUser(
            @RequestHeader(value = "X-User", required = false) String xUser,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "email", required = false) String email) {
        String key = xUser != null && !xUser.isBlank() ? xUser
                : (username != null && !username.isBlank() ? username : email);

        if (key == null || key.isBlank()) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getName() != null && !auth.getName().isBlank()) {
                key = auth.getName();
            }
        }

        if (key == null || key.isBlank()) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }

        Set<Project> projects = userService.getProjectsForUser(key);
        if (projects == null || projects.isEmpty()) {
            return ResponseEntity.ok(new ArrayList<>());
        }

        // Find managers per project
        List<Map<String, Object>> result = new ArrayList<>();
        for (Project p : projects) {
            if (p == null) continue;
            List<User> managers = userService.getManagersForProjects(java.util.List.of(p));
            List<Map<String, Object>> mgrDtos = new ArrayList<>();
            for (User m : managers) {
                java.util.HashMap<String, Object> mm = new java.util.HashMap<>();
                mm.put("id", m.getId());
                mm.put("username", m.getUsername());
                mm.put("email", m.getEmail());
                mm.put("fullName", m.getFullName());
                mgrDtos.add(mm);
            }
            java.util.HashMap<String, Object> pMap = new java.util.HashMap<>();
            pMap.put("projectId", p.getId());
            pMap.put("projectName", p.getName());
            pMap.put("managers", mgrDtos);
            result.add(pMap);
        }

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{userId:\\d+}/managed-projects")
    @PreAuthorize("permitAll()")
    public ResponseEntity<User> assignManagedProjectsToManager(
            @PathVariable Map<String, String> pathVars,
            @RequestBody List<Long> projectIds) {
        Long id = Long.parseLong(pathVars.get("userId"));
        return ResponseEntity.ok(userService.assignManagedProjectsToManager(id, projectIds));
    }

    private UserSummaryDTO toDto(User u) {
        if (u == null) return null;
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(u.getId());
        dto.setUsername(u.getUsername());
        dto.setEmail(u.getEmail());
        dto.setFirstName(u.getFirstName());
        dto.setLastName(u.getLastName());
        dto.setDepartment(u.getDepartment());
        dto.setRoles(u.getRoles() == null ? null : new HashSet<>(u.getRoles()));
        return dto;
    }

    // Profile management endpoints
    public record UpdateProfileRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email String email
    ) {}

    public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank String newPassword
    ) {}

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            // In a real application, you would get the user ID from the JWT token
            // For now, we'll use a mock approach
            
            // Mock user update - replace with actual service call
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Profile updated successfully",
                "user", Map.of(
                    "firstName", request.firstName(),
                    "lastName", request.lastName(),
                    "email", request.email(),
                    "role", "ROLE_EMPLOYEE" // This would come from the actual user
                )
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to update profile: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            // In a real application, you would:
            // 1. Get the user ID from the JWT token
            // 2. Verify the current password
            // 3. Hash and save the new password
            
            // Mock password change - replace with actual service call
            // For demo purposes, we'll simulate validation
            if (!"current123".equals(request.currentPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Current password is incorrect"
                ));
            }
            
            if (request.newPassword().length() < 6) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "New password must be at least 6 characters"
                ));
            }
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Password changed successfully"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to change password: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        try {
            // In a real application, you would get the user from the JWT token
            // For now, we'll return mock data
            
            Map<String, Object> user = Map.of(
                "firstName", "John",
                "lastName", "Doe",
                "email", "john.doe@example.com",
                "role", "ROLE_EMPLOYEE"
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "user", user
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to get profile: " + e.getMessage()
            ));
        }
    }
}
