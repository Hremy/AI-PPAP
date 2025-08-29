package com.ai.pat.backend.controller;

import com.ai.pat.backend.model.User;
import com.ai.pat.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/v1/users", "/users"})
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/managers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createManager(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam String department) {
        
        User manager = userService.createManager(
            username, email, password, firstName, lastName, department);
        
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(manager.getId())
            .toUri();
            
        return ResponseEntity.created(location).body(manager);
    }

    @GetMapping("/managers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<User>> getAllManagers() {
        return ResponseEntity.ok(userService.getAllManagers());
    }

    @GetMapping("/managers/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<User> getManagerById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getManagerById(id));
    }

    @DeleteMapping("/managers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteManager(@PathVariable Long id) {
        userService.deleteManager(id);
        return ResponseEntity.noContent().build();
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
