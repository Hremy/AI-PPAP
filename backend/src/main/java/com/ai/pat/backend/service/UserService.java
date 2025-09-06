package com.ai.pat.backend.service;

import com.ai.pat.backend.model.Project;
import com.ai.pat.backend.model.User;
import com.ai.pat.backend.repository.ProjectRepository;
import com.ai.pat.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
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

        // Create and save manager via JPA (no DB function required)
        User manager = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .department(department)
                .build();

        // Ensure MANAGER role
        Set<String> roles = manager.getRoles();
        if (roles == null) {
            roles = new HashSet<>();
            manager.setRoles(roles);
        }
        roles.add("MANAGER");

        return userRepository.save(manager);
    }
    
    public List<User> getAllManagers() {
        return userRepository.findByRolesIn(java.util.Arrays.asList("MANAGER", "ROLE_MANAGER"));
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

    @Transactional
    public User assignProjectsToUser(Long userId, List<Long> projectIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Set<Project> projects = new HashSet<>(projectRepository.findAllById(projectIds));
        user.setProjects(projects);
        return userRepository.save(user);
    }

    @Transactional
    public User assignProjectsToCurrentUser(String usernameOrEmail, List<Long> projectIds) {
        // Resolve by username first, then email; if not found, create a minimal EMPLOYEE user (dev-friendly)
        User user = getOrCreateUserByUsernameOrEmail(usernameOrEmail);

        Set<Project> projects = new HashSet<>(projectRepository.findAllById(projectIds));
        user.setProjects(projects);
        User saved = userRepository.save(user);
        entityManager.flush();
        return saved;
    }

    @Transactional
    public User assignManagedProjectsToManager(Long managerId, List<Long> projectIds) {
        User manager = userRepository.findById(managerId)
                .filter(u -> u.getRoles().contains("MANAGER") || u.getRoles().contains("ROLE_MANAGER"))
                .orElseThrow(() -> new RuntimeException("Manager not found with id: " + managerId));

        Set<Project> projects = new HashSet<>(projectRepository.findAllById(projectIds));

        // Enforce uniqueness STRICTLY: if any selected project is already managed by a different manager, reject
        java.util.List<String> conflicts = new java.util.ArrayList<>();
        for (Project p : projects) {
            if (p == null || p.getId() == null) continue;
            List<User> currentManagers = userRepository.findManagersByManagedProjectIds(java.util.List.of(p.getId()));
            for (User m : currentManagers) {
                if (m == null || m.getId() == null) continue;
                if (!m.getId().equals(managerId)) {
                    conflicts.add(p.getName() == null ? ("Project#" + p.getId()) : p.getName());
                }
            }
        }
        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Cannot assign projects already managed by another manager: " + String.join(", ", conflicts));
        }

        // Assign the projects to the target manager
        manager.setManagedProjects(projects);
        return userRepository.save(manager);
    }

    @Transactional(readOnly = true)
    public Set<Project> getProjectsForUser(String usernameOrEmail) {
        // Read-only: do NOT create user here; if not found, return empty set for dev-friendly GET
        return userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .map(u -> {
                    u.getProjects().size(); // initialize
                    return u.getProjects();
                })
                .orElseGet(java.util.Collections::emptySet);
    }

    @Transactional(readOnly = true)
    public List<User> getManagersForProjects(List<Project> projects) {
        if (projects == null || projects.isEmpty()) return java.util.Collections.emptyList();
        // Primary: by managedProjects using IDs to be robust across persistence contexts
        java.util.List<Long> ids = projects.stream()
                .filter(java.util.Objects::nonNull)
                .map(Project::getId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .toList();
        List<User> managers = userRepository.findManagersByManagedProjectIds(ids);
        if (managers != null && !managers.isEmpty()) return managers;
        // Fallback: by projects + role (tolerant to role value variants in dev data)
        managers = userRepository.findByProjectsAndRole(projects, "MANAGER");
        if (managers == null || managers.isEmpty()) {
            managers = userRepository.findByProjectsAndRole(projects, "ROLE_MANAGER");
        }
        return managers;
    }

    private User getOrCreateUserByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseGet(() -> {
                    // Create a minimal user to support dev flows where users are not pre-seeded
                    String username = usernameOrEmail;
                    String email = usernameOrEmail;
                    if (usernameOrEmail != null && usernameOrEmail.contains("@")) {
                        String[] parts = usernameOrEmail.split("@", 2);
                        if (parts.length > 0 && !parts[0].isBlank()) {
                            username = parts[0];
                        }
                    } else {
                        // If no '@', synthesize an email
                        email = usernameOrEmail + "@example.com";
                    }

                    // Extract first and last name from username/email
                    String firstName = null;
                    String lastName = null;
                    
                    // Try to parse name from username (e.g., "john.doe" -> "John Doe")
                    if (username != null && username.contains(".")) {
                        String[] nameParts = username.split("\\.", 2);
                        if (nameParts.length >= 2) {
                            firstName = capitalize(nameParts[0]);
                            lastName = capitalize(nameParts[1]);
                        }
                    }
                    
                    // If no name parts found, use username as first name
                    if (firstName == null && username != null && !username.isBlank()) {
                        firstName = capitalize(username);
                    }

                    User u = User.builder()
                            .username(username)
                            .email(email)
                            .firstName(firstName)
                            .lastName(lastName)
                            .password(passwordEncoder.encode("changeme"))
                            .build();
                    // Ensure EMPLOYEE role
                    Set<String> roles = u.getRoles();
                    if (roles == null) {
                        roles = new HashSet<>();
                        u.setRoles(roles);
                    }
                    roles.add("EMPLOYEE");
                    User created = userRepository.save(u);
                    entityManager.flush(); // Ensure PK exists before any join table writes
                    return created;
                });
    }

    @Transactional
    public Long resolveOrCreateUserId(String usernameOrEmail) {
        if (usernameOrEmail == null || usernameOrEmail.isBlank()) return null;
        User u = getOrCreateUserByUsernameOrEmail(usernameOrEmail);
        return u != null ? u.getId() : null;
    }
    
    @Transactional
    public void updateMissingUserNames() {
        List<User> usersWithoutNames = userRepository.findAll().stream()
            .filter(user -> (user.getFirstName() == null || user.getFirstName().isBlank()) 
                         && (user.getLastName() == null || user.getLastName().isBlank()))
            .toList();
            
        for (User user : usersWithoutNames) {
            String username = user.getUsername();
            String firstName = null;
            String lastName = null;
            
            // Try to parse name from username (e.g., "john.doe" -> "John Doe")
            if (username != null && username.contains(".")) {
                String[] nameParts = username.split("\\.", 2);
                if (nameParts.length >= 2) {
                    firstName = capitalize(nameParts[0]);
                    lastName = capitalize(nameParts[1]);
                }
            }
            
            // If no name parts found, use username as first name
            if (firstName == null && username != null && !username.isBlank()) {
                firstName = capitalize(username);
            }
            
            user.setFirstName(firstName);
            user.setLastName(lastName);
            userRepository.save(user);
        }
    }
    
    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
    
    @Transactional(readOnly = true)
    public User findByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElse(null);
    }
    
    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }
}
