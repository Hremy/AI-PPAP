package com.ai.pat.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping({"/api/v1/admin", "/v1/admin"})
public class AdminController {

    private static final List<Map<String, Object>> MANAGERS = new ArrayList<>();
    private static final AtomicLong ID_SEQ = new AtomicLong(1);

    @GetMapping("/managers")
    public ResponseEntity<List<Map<String, Object>>> listManagers() {
        return ResponseEntity.ok(MANAGERS);
    }

    @PostMapping("/managers")
    public ResponseEntity<Map<String, Object>> createManager(@RequestBody Map<String, Object> body) {
        String email = String.valueOf(body.getOrDefault("email", ""));
        String firstName = String.valueOf(body.getOrDefault("firstName", ""));
        String lastName = String.valueOf(body.getOrDefault("lastName", ""));

        if (email.isBlank() || !email.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Valid email is required"
            ));
        }

        Map<String, Object> manager = new LinkedHashMap<>();
        manager.put("id", ID_SEQ.getAndIncrement());
        manager.put("email", email);
        manager.put("firstName", firstName);
        manager.put("lastName", lastName);
        manager.put("role", "ROLE_MANAGER");
        manager.put("createdAt", new Date());
        MANAGERS.add(manager);

        return ResponseEntity.ok(manager);
    }
}
