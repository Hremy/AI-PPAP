package com.ai.pat.backend.controller;

import com.ai.pat.backend.dto.PeerReviewDTO;
import com.ai.pat.backend.service.PeerReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/peer-reviews")
@CrossOrigin(origins = "*")
public class PeerReviewController {
    
    @Autowired
    private PeerReviewService peerReviewService;
    
    @GetMapping("/evaluation/{evaluationId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<List<PeerReviewDTO>> getPeerReviewsByEvaluation(@PathVariable Long evaluationId) {
        List<PeerReviewDTO> peerReviews = peerReviewService.getPeerReviewsByEvaluationId(evaluationId);
        return ResponseEntity.ok(peerReviews);
    }
    
    @GetMapping("/reviewer/{reviewerId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<List<PeerReviewDTO>> getPeerReviewsByReviewer(@PathVariable Long reviewerId) {
        List<PeerReviewDTO> peerReviews = peerReviewService.getPeerReviewsByReviewerId(reviewerId);
        return ResponseEntity.ok(peerReviews);
    }
    
    @GetMapping("/evaluation/{evaluationId}/reviewer/{reviewerId}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<PeerReviewDTO> getPeerReview(@PathVariable Long evaluationId, @PathVariable Long reviewerId) {
        Optional<PeerReviewDTO> peerReview = peerReviewService.getPeerReview(evaluationId, reviewerId);
        return peerReview.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER')")
    public ResponseEntity<PeerReviewDTO> createPeerReview(@RequestBody PeerReviewDTO peerReviewDTO) {
        try {
            PeerReviewDTO created = peerReviewService.createPeerReview(peerReviewDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER')")
    public ResponseEntity<PeerReviewDTO> updatePeerReview(@PathVariable Long id, @RequestBody PeerReviewDTO peerReviewDTO) {
        try {
            PeerReviewDTO updated = peerReviewService.updatePeerReview(id, peerReviewDTO);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deletePeerReview(@PathVariable Long id) {
        try {
            peerReviewService.deletePeerReview(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/evaluation/{evaluationId}/summary")
    @PreAuthorize("hasRole('EMPLOYEE') or hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getPeerReviewSummary(@PathVariable Long evaluationId) {
        try {
            String summary = peerReviewService.generatePeerReviewSummary(evaluationId);
            return ResponseEntity.ok(Map.of("summary", summary));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("summary", "Unable to generate peer review summary at this time."));
        }
    }
}
