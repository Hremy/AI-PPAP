package com.ai.pat.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "keqs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Keq {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String category;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer orderIndex = 1;

    @Column
    private Integer effectiveFromYear; // first year when this applies

    @Column
    private Integer effectiveFromQuarter; // 1-4

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
