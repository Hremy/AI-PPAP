package com.ai.pat.backend.controller;

import com.ai.pat.backend.model.User;
import com.ai.pat.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/users")
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
}
