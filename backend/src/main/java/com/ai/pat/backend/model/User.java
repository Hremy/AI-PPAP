package com.ai.pat.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.*;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", nullable = false, unique = true)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String email;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column
    private String department;
    
    @Column
    private String position;
    
    @Column
    private String phone;
    
    // Temporarily removed roles field to fix persistence issue
    // @Column(name = "roles")
    // private String rolesColumn;
    
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<Evaluation> evaluations = new HashSet<>();
    
    @OneToMany(mappedBy = "reviewer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private Set<Evaluation> reviews = new HashSet<>();

    @ManyToMany(mappedBy = "users", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Project> projects = new HashSet<>();

    // Manager relationship - projects this user manages
    @ManyToMany
    @JoinTable(
        name = "manager_projects",
        joinColumns = @JoinColumn(name = "manager_id"),
        inverseJoinColumns = @JoinColumn(name = "project_id")
    )
    @JsonIgnore
    private Set<Project> managedProjects = new HashSet<>();
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public Set<String> getRoles() { 
        // Temporarily return empty set to fix persistence issue
        return new HashSet<>(); 
    }
    
    public void setRoles(Set<String> roleSet) { 
        // Temporarily do nothing to fix persistence issue
    }
    
    public String getRolesString() { return null; }
    public void setRolesString(String roles) { 
        // Temporarily do nothing to fix persistence issue
    }
    
    public Set<Evaluation> getEvaluations() { return evaluations; }
    public void setEvaluations(Set<Evaluation> evaluations) { this.evaluations = evaluations; }
    
    public Set<Evaluation> getReviews() { return reviews; }
    public void setReviews(Set<Evaluation> reviews) { this.reviews = reviews; }
    
    public Set<Project> getProjects() { return projects; }
    public void setProjects(Set<Project> projects) { this.projects = projects; }
    
    public Set<Project> getManagedProjects() { return managedProjects; }
    public void setManagedProjects(Set<Project> managedProjects) { this.managedProjects = managedProjects; }
    
    // Builder methods
    public static UserBuilder builder() { return new UserBuilder(); }
    
    public static class UserBuilder {
        private Long id;
        private String username;
        private String password;
        private String email;
        private String firstName;
        private String lastName;
        private String department;
        private String position;
        private String phone;
        // private String rolesColumn;
        private Set<Evaluation> evaluations = new HashSet<>();
        private Set<Evaluation> reviews = new HashSet<>();
        private Set<Project> projects = new HashSet<>();
        private Set<Project> managedProjects = new HashSet<>();
        
        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder username(String username) { this.username = username; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserBuilder department(String department) { this.department = department; return this; }
        public UserBuilder position(String position) { this.position = position; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder roles(String roles) { return this; }
        public UserBuilder roles(Set<String> roleSet) { 
            return this; 
        }
        public UserBuilder evaluations(Set<Evaluation> evaluations) { this.evaluations = evaluations; return this; }
        public UserBuilder reviews(Set<Evaluation> reviews) { this.reviews = reviews; return this; }
        public UserBuilder projects(Set<Project> projects) { this.projects = projects; return this; }
        public UserBuilder managedProjects(Set<Project> managedProjects) { this.managedProjects = managedProjects; return this; }
        
        public User build() {
            User user = new User();
            user.id = this.id;
            user.username = this.username;
            user.password = this.password;
            user.email = this.email;
            user.firstName = this.firstName;
            user.lastName = this.lastName;
            user.department = this.department;
            user.position = this.position;
            user.phone = this.phone;
            // user.rolesColumn = this.rolesColumn;
            user.evaluations = this.evaluations;
            user.reviews = this.reviews;
            user.projects = this.projects;
            user.managedProjects = this.managedProjects;
            return user;
        }
    }
    
    // Helper method to get full name
    public String getFullName() {
        return (firstName != null ? firstName + " " : "") + (lastName != null ? lastName : "");
    }
    
    // UserDetails methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .collect(Collectors.toList());
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
}
