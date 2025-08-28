package com.ai.pat.backend.repository;

import com.ai.pat.backend.model.Integration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IntegrationRepository extends JpaRepository<Integration, Long> {
    
    @Query("SELECT i FROM Integration i WHERE i.active = true ORDER BY i.displayOrder ASC, i.id ASC")
    List<Integration> findAllActiveOrderByDisplayOrder();
    
    List<Integration> findByActiveTrue();
    
    List<Integration> findByActiveTrueOrderByDisplayOrderAsc();
}

