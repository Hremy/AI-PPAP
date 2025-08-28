package com.ai.pat.backend.controller;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    public record AuthRequest(@Email String email, @NotBlank String password, String loginAs) {}
    public record RegisterRequest(@NotBlank String firstName, @NotBlank String lastName, @Email String email, @NotBlank String password) {}

    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, Object>> authenticate(@RequestBody AuthRequest request) {
        // DEV: Simulate server-side role belonging. We DO NOT trust loginAs.
        // In real backend, role comes from DB for the user.
        String role = deriveRoleFromEmail(request.email());
        return ResponseEntity.ok(Map.of(
                "token", "dev-token",
                "email", request.email(),
                "role", role
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(Map.of(
                "token", "dev-token",
                "email", request.email(),
                "role", "ROLE_EMPLOYEE"
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Logged out"
        ));
    }

    private String deriveRoleFromEmail(String email) {
        if (email == null) return "ROLE_EMPLOYEE";
        String lower = email.toLowerCase();
        if (lower.contains("admin")) return "ROLE_ADMIN";
        if (lower.contains("manager")) return "ROLE_MANAGER";
        return "ROLE_EMPLOYEE";
    }
}
