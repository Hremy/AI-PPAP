package com.ai.pat.backend.repository;

import com.ai.pat.backend.model.Keq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KeqRepository extends JpaRepository<Keq, Long> {
    boolean existsByTextIgnoreCase(String text);
}
