package com.ai.pat.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Entity
@Table(name = "evaluations")
@NoArgsConstructor
public class Evaluation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonBackReference
    private User employee;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    @JsonBackReference
    private User reviewer;
    
    @ElementCollection
    @CollectionTable(name = "evaluation_ratings", 
        joinColumns = @JoinColumn(name = "evaluation_id"))
    @MapKeyColumn(name = "competency")
    @Column(name = "rating")
    private Map<String, Integer> ratings = new HashMap<>();
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationStatus status = EvaluationStatus.DRAFT;
    
    @Column(nullable = false)
    private LocalDateTime submittedAt;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum EvaluationStatus {
        DRAFT, SUBMITTED, REVIEWED, ARCHIVED
    }
}
