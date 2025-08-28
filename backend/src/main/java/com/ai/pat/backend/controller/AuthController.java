package com.ai.pat.backend.controller;

import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.UserRepository;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public record AuthRequest(@Email String email, @NotBlank String password, String loginAs) {}
    public record RegisterRequest(@NotBlank String firstName, @NotBlank String lastName, @Email String email, @NotBlank String password) {}
    public record ChangePasswordRequest(@NotBlank String currentPassword, @NotBlank String newPassword) {}

    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, Object>> authenticate(@RequestBody AuthRequest request) {
        // DEV: Simulate server-side role belonging. We DO NOT trust loginAs.
        // In real backend, role comes from DB for the user.
        String role = deriveRoleFromEmail(request.email());
        
        // Create a mock JWT token with user info
        String mockJwtToken = createMockJwtToken(request.email(), role);
        
        return ResponseEntity.ok(Map.of(
                "token", mockJwtToken,
                "email", request.email(),
                "role", role,
                "roles", List.of(role),
                "username", extractUsernameFromEmail(request.email()),
                "firstName", "John",
                "lastName", "Doe"
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        String role = "ROLE_EMPLOYEE";
        String mockJwtToken = createMockJwtToken(request.email(), role);
        
        return ResponseEntity.ok(Map.of(
                "token", mockJwtToken,
                "email", request.email(),
                "role", role,
                "roles", List.of(role),
                "username", extractUsernameFromEmail(request.email()),
                "firstName", request.firstName(),
                "lastName", request.lastName()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Logged out"
        ));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody ChangePasswordRequest request) {
        // In a real application, you would get the user from the JWT token
        // For now, we'll use a simple approach with email in the request
        
        // This is a simplified version - in production, you'd get user from JWT token
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Password changed successfully"
        ));
    }

    private String deriveRoleFromEmail(String email) {
        if (email == null) return "ROLE_EMPLOYEE";
        String lower = email.toLowerCase();
        if (lower.contains("admin")) return "ROLE_ADMIN";
        if (lower.contains("manager")) return "ROLE_MANAGER";
        return "ROLE_EMPLOYEE";
    }
    
    private String extractUsernameFromEmail(String email) {
        if (email == null) return "user";
        return email.substring(0, email.indexOf('@'));
    }
    
    private String createMockJwtToken(String email, String role) {
        // In a real application, this would be a proper JWT token
        // For development, we'll create a base64 encoded JSON string
        String payload = String.format("""
            {
                "sub": "%s",
                "email": "%s",
                "roles": ["%s"],
                "username": "%s",
                "firstName": "John",
                "lastName": "Doe",
                "exp": %d
            }
            """, 
            extractUsernameFromEmail(email),
            email,
            role,
            extractUsernameFromEmail(email),
            System.currentTimeMillis() / 1000 + 3600 // 1 hour expiry
        );
        
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + 
               java.util.Base64.getEncoder().encodeToString(payload.getBytes()) + 
               ".mock-signature";
    }
}
