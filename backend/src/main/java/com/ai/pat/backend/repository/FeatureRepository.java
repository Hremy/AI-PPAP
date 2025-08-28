package com.ai.pat.backend.repository;

import com.ai.pat.backend.model.Feature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeatureRepository extends JpaRepository<Feature, Long> {
    
    @Query("SELECT f FROM Feature f WHERE f.active = true ORDER BY f.displayOrder ASC, f.id ASC")
    List<Feature> findAllActiveOrderByDisplayOrder();
    
    List<Feature> findByActiveTrue();
    
    List<Feature> findByActiveTrueOrderByDisplayOrderAsc();
}

