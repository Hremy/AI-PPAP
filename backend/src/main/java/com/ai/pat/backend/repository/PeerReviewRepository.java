package com.ai.pat.backend.repository;

import com.ai.pat.backend.entity.PeerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeerReviewRepository extends JpaRepository<PeerReview, Long> {
    
    List<PeerReview> findByEvaluationId(Long evaluationId);
    
    List<PeerReview> findByReviewerId(Long reviewerId);
    
    Optional<PeerReview> findByEvaluationIdAndReviewerId(Long evaluationId, Long reviewerId);
    
    @Query("SELECT pr FROM PeerReview pr WHERE pr.evaluationId IN :evaluationIds")
    List<PeerReview> findByEvaluationIdIn(@Param("evaluationIds") List<Long> evaluationIds);
    
    @Query("SELECT COUNT(pr) FROM PeerReview pr WHERE pr.evaluationId = :evaluationId")
    Long countByEvaluationId(@Param("evaluationId") Long evaluationId);
    
    @Query("SELECT AVG(pr.overallRating) FROM PeerReview pr WHERE pr.evaluationId = :evaluationId AND pr.overallRating IS NOT NULL")
    Double getAverageOverallRatingByEvaluationId(@Param("evaluationId") Long evaluationId);
}
