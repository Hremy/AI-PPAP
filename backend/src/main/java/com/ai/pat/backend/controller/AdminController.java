package com.ai.pat.backend.controller;

import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.*;
import com.ai.pat.backend.controller.dto.CreateManagerRequest;

@RestController
@RequestMapping({"/api/v1/admin", "/v1/admin"})
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/managers")
    public ResponseEntity<List<Map<String, Object>>> listManagers() {
        List<User> managers = userRepository.findByRolesContaining("ROLE_MANAGER");
        
        List<Map<String, Object>> managerList = managers.stream()
            .map(this::convertToManagerResponse)
            .toList();
            
        return ResponseEntity.ok(managerList);
    }

    @GetMapping("/admins")
    public ResponseEntity<List<Map<String, Object>>> listAdmins() {
        List<User> admins = userRepository.findByRolesContaining("ROLE_ADMIN");

        List<Map<String, Object>> adminList = admins.stream()
            .map(u -> {
                Map<String, Object> m = convertToManagerResponse(u);
                m.put("role", "ROLE_ADMIN");
                return m;
            })
            .toList();

        return ResponseEntity.ok(adminList);
    }

    @PostMapping("/managers")
    public ResponseEntity<Map<String, Object>> createManager(@RequestBody CreateManagerRequest request) {
        // Validate input
        if (request.email() == null || request.email().isBlank() || !request.email().contains("@")) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Valid email is required"
            ));
        }

        if (request.firstName() == null || request.firstName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "First name is required"
            ));
        }

        if (request.lastName() == null || request.lastName().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Last name is required"
            ));
        }

        // Check if user already exists
        if (userRepository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "A user with this email already exists"
            ));
        }

        // Generate random password for the manager
        String generatedPassword = generateRandomPassword();
        String username = extractUsernameFromEmail(request.email());
        
        // Ensure username is unique
        String finalUsername = username;
        int counter = 1;
        while (userRepository.existsByUsername(finalUsername)) {
            finalUsername = username + counter;
            counter++;
        }

        User manager = new User();
        manager.setUsername(finalUsername);
        manager.setEmail(request.email());
        manager.setFirstName(request.firstName());
        manager.setLastName(request.lastName());
        manager.setPassword(passwordEncoder.encode(generatedPassword));
        // Include a role flag to force password change at first login
        manager.setRoles(new java.util.HashSet<>(java.util.Arrays.asList("ROLE_MANAGER", "FORCE_PASSWORD_CHANGE")));
        // Set default department and position for new managers
        manager.setDepartment("Management");
        manager.setPosition("Manager");

        User savedManager = userRepository.save(manager);

        Map<String, Object> response = convertToManagerResponse(savedManager);
        response.put("generatedPassword", generatedPassword); // Show password to admin
        response.put("passwordGenerated", true);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/managers/{managerId}/reset-password")
    public ResponseEntity<Map<String, Object>> resetManagerPassword(@PathVariable Long managerId) {
        Optional<User> managerOpt = userRepository.findById(managerId);
        
        if (managerOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        User manager = managerOpt.get();
        
        if (!manager.getRoles().contains("ROLE_MANAGER")) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "User is not a manager"
            ));
        }
        
        // Generate new password
        String newPassword = generateRandomPassword();
        manager.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(manager);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Password reset successfully",
            "newPassword", newPassword
        ));
    }

    @DeleteMapping("/managers/{managerId}")
    public ResponseEntity<Map<String, Object>> deleteManager(@PathVariable Long managerId) {
        Optional<User> userOpt = userRepository.findById(managerId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        if (user.getRoles() == null || !user.getRoles().contains("ROLE_MANAGER")) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "User is not a manager"
            ));
        }
        try {
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Manager deleted successfully"
            ));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of(
                "success", false,
                "message", "Failed to delete manager: " + ex.getMessage()
            ));
        }
    }

    private Map<String, Object> convertToManagerResponse(User manager) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", manager.getId());
        response.put("email", manager.getEmail());
        response.put("firstName", manager.getFirstName());
        response.put("lastName", manager.getLastName());
        response.put("username", manager.getUsername());
        response.put("role", "ROLE_MANAGER");
        response.put("passwordSet", true);
        response.put("createdAt", new Date());
        
        return response;
    }

    private String generateRandomPassword() {
        // Generate a secure random password with 12 characters
        // Contains uppercase, lowercase, numbers, and special characters
        String upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lowerCase = "abcdefghijklmnopqrstuvwxyz";
        String numbers = "0123456789";
        String specialChars = "!@#$%^&*";
        String allChars = upperCase + lowerCase + numbers + specialChars;
        
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();
        
        // Ensure at least one character from each category
        password.append(upperCase.charAt(random.nextInt(upperCase.length())));
        password.append(lowerCase.charAt(random.nextInt(lowerCase.length())));
        password.append(numbers.charAt(random.nextInt(numbers.length())));
        password.append(specialChars.charAt(random.nextInt(specialChars.length())));
        
        // Fill the rest randomly
        for (int i = 4; i < 12; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }
        
        // Shuffle the password to avoid predictable patterns
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }
        
        return new String(passwordArray);
    }

    private String extractUsernameFromEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "user";
        }
        return email.substring(0, email.indexOf('@')).toLowerCase();
    }

}
