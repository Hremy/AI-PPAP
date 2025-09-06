package com.ai.pat.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "keqs")
public class Keq {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String category;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Integer orderIndex = 1;

    @Column
    private Integer effectiveFromYear; // first year when this applies

    @Column
    private Integer effectiveFromQuarter; // 1-4

    @Column(nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Constructors
    public Keq() {}

    public Keq(Long id, String category, String description, Integer orderIndex, 
               Integer effectiveFromYear, Integer effectiveFromQuarter, Boolean isActive,
               LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.category = category;
        this.description = description;
        this.orderIndex = orderIndex != null ? orderIndex : 1;
        this.effectiveFromYear = effectiveFromYear;
        this.effectiveFromQuarter = effectiveFromQuarter;
        this.isActive = isActive != null ? isActive : true;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters
    public Long getId() { return id; }
    public String getCategory() { return category; }
    public String getDescription() { return description; }
    public Integer getOrderIndex() { return orderIndex; }
    public Integer getEffectiveFromYear() { return effectiveFromYear; }
    public Integer getEffectiveFromQuarter() { return effectiveFromQuarter; }
    public Boolean getIsActive() { return isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setCategory(String category) { this.category = category; }
    public void setDescription(String description) { this.description = description; }
    public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }
    public void setEffectiveFromYear(Integer effectiveFromYear) { this.effectiveFromYear = effectiveFromYear; }
    public void setEffectiveFromQuarter(Integer effectiveFromQuarter) { this.effectiveFromQuarter = effectiveFromQuarter; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder pattern
    public static KeqBuilder builder() {
        return new KeqBuilder();
    }

    public static class KeqBuilder {
        private Long id;
        private String category;
        private String description;
        private Integer orderIndex = 1;
        private Integer effectiveFromYear;
        private Integer effectiveFromQuarter;
        private Boolean isActive = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public KeqBuilder id(Long id) { this.id = id; return this; }
        public KeqBuilder category(String category) { this.category = category; return this; }
        public KeqBuilder description(String description) { this.description = description; return this; }
        public KeqBuilder orderIndex(Integer orderIndex) { this.orderIndex = orderIndex; return this; }
        public KeqBuilder effectiveFromYear(Integer effectiveFromYear) { this.effectiveFromYear = effectiveFromYear; return this; }
        public KeqBuilder effectiveFromQuarter(Integer effectiveFromQuarter) { this.effectiveFromQuarter = effectiveFromQuarter; return this; }
        public KeqBuilder isActive(Boolean isActive) { this.isActive = isActive; return this; }
        public KeqBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public KeqBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Keq build() {
            return new Keq(id, category, description, orderIndex, effectiveFromYear, effectiveFromQuarter, isActive, createdAt, updatedAt);
        }
    }
}
