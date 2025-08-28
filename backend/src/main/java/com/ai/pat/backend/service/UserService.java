package com.ai.pat.backend.service;

import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public User createManager(String username, String email, String password, 
                            String firstName, String lastName, String department) {
        // Check if user already exists
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists");
        }
        
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        // Create and save the manager using the database function
        Long userId = (Long) entityManager
            .createNativeQuery(
                "SELECT create_manager(:username, :email, :password, :firstName, :lastName, :department)")
            .setParameter("username", username)
            .setParameter("email", email)
            .setParameter("password", passwordEncoder.encode(password))
            .setParameter("firstName", firstName)
            .setParameter("lastName", lastName)
            .setParameter("department", department)
            .getSingleResult();
        
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Failed to create manager"));
    }
    
    public List<User> getAllManagers() {
        return userRepository.findByRolesIn(Collections.singletonList("MANAGER"));
    }
    
    public User getManagerById(Long id) {
        return userRepository.findById(id)
            .filter(user -> user.getRoles().contains("MANAGER"))
            .orElseThrow(() -> new RuntimeException("Manager not found with id: " + id));
    }
    
    @Transactional
    public void deleteManager(Long id) {
        User manager = userRepository.findById(id)
            .filter(user -> user.getRoles().contains("MANAGER"))
            .orElseThrow(() -> new RuntimeException("Manager not found with id: " + id));
        userRepository.delete(manager);
    }
}
