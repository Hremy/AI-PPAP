package com.ai.pat.backend.service;

import com.ai.pat.backend.dto.PeerReviewDTO;
import com.ai.pat.backend.entity.PeerReview;
import com.ai.pat.backend.repository.PeerReviewRepository;
import com.ai.pat.backend.controller.dto.ai.SummarizeRequest;
import com.ai.pat.backend.controller.dto.ai.SummarizeResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PeerReviewService {
    
    @Autowired
    private PeerReviewRepository peerReviewRepository;
    
    @Autowired
    private AiService aiService;
    
    public List<PeerReviewDTO> getPeerReviewsByEvaluationId(Long evaluationId) {
        return peerReviewRepository.findByEvaluationId(evaluationId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public List<PeerReviewDTO> getPeerReviewsByReviewerId(Long reviewerId) {
        return peerReviewRepository.findByReviewerId(reviewerId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public Optional<PeerReviewDTO> getPeerReview(Long evaluationId, Long reviewerId) {
        return peerReviewRepository.findByEvaluationIdAndReviewerId(evaluationId, reviewerId)
                .map(this::convertToDTO);
    }
    
    public PeerReviewDTO createPeerReview(PeerReviewDTO peerReviewDTO) {
        PeerReview peerReview = convertToEntity(peerReviewDTO);
        
        // Calculate overall rating from individual ratings
        if (peerReview.getCollaborationRating() != null && peerReview.getCommunicationRating() != null &&
            peerReview.getTechnicalRating() != null && peerReview.getLeadershipRating() != null) {
            
            double average = (peerReview.getCollaborationRating() + peerReview.getCommunicationRating() +
                            peerReview.getTechnicalRating() + peerReview.getLeadershipRating()) / 4.0;
            peerReview.setOverallRating((int) Math.round(average));
        }
        
        PeerReview saved = peerReviewRepository.save(peerReview);
        return convertToDTO(saved);
    }
    
    public PeerReviewDTO updatePeerReview(Long id, PeerReviewDTO peerReviewDTO) {
        Optional<PeerReview> existingReview = peerReviewRepository.findById(id);
        if (existingReview.isPresent()) {
            PeerReview peerReview = existingReview.get();
            updateEntityFromDTO(peerReview, peerReviewDTO);
            
            // Recalculate overall rating
            if (peerReview.getCollaborationRating() != null && peerReview.getCommunicationRating() != null &&
                peerReview.getTechnicalRating() != null && peerReview.getLeadershipRating() != null) {
                
                double average = (peerReview.getCollaborationRating() + peerReview.getCommunicationRating() +
                                peerReview.getTechnicalRating() + peerReview.getLeadershipRating()) / 4.0;
                peerReview.setOverallRating((int) Math.round(average));
            }
            
            PeerReview saved = peerReviewRepository.save(peerReview);
            return convertToDTO(saved);
        }
        throw new RuntimeException("Peer review not found with id: " + id);
    }
    
    public void deletePeerReview(Long id) {
        peerReviewRepository.deleteById(id);
    }
    
    public String generatePeerReviewSummary(Long evaluationId) {
        List<PeerReview> peerReviews = peerReviewRepository.findByEvaluationId(evaluationId);
        
        if (peerReviews.isEmpty()) {
            return "No peer reviews available for this evaluation.";
        }
        
        // Collect all feedback text
        StringBuilder allFeedback = new StringBuilder();
        allFeedback.append("Peer Review Summary:\n\n");
        
        // Collect strengths
        allFeedback.append("STRENGTHS:\n");
        peerReviews.stream()
                .filter(pr -> pr.getStrengths() != null && !pr.getStrengths().trim().isEmpty())
                .forEach(pr -> allFeedback.append("- ").append(pr.getStrengths()).append("\n"));
        
        // Collect weaknesses
        allFeedback.append("\nWEAKNESSES:\n");
        peerReviews.stream()
                .filter(pr -> pr.getWeaknesses() != null && !pr.getWeaknesses().trim().isEmpty())
                .forEach(pr -> allFeedback.append("- ").append(pr.getWeaknesses()).append("\n"));
        
        // Collect suggestions
        allFeedback.append("\nSUGGESTIONS:\n");
        peerReviews.stream()
                .filter(pr -> pr.getSuggestions() != null && !pr.getSuggestions().trim().isEmpty())
                .forEach(pr -> allFeedback.append("- ").append(pr.getSuggestions()).append("\n"));
        
        // Try to use AI summarization, fall back to basic summary if it fails
        try {
            SummarizeRequest request = new SummarizeRequest();
            request.setText(allFeedback.toString());
            request.setMaxTokens(300);
            SummarizeResponse response = aiService.summarize(request);
            return response.getSummary();
        } catch (Exception e) {
            System.err.println("AI summarization failed, using basic summary: " + e.getMessage());
            return generateBasicSummary(peerReviews);
        }
    }
    
    private String generateBasicSummary(List<PeerReview> peerReviews) {
        StringBuilder summary = new StringBuilder();
        summary.append("Peer Review Summary (").append(peerReviews.size()).append(" reviews):\n\n");
        
        // Calculate average ratings
        double avgCollaboration = peerReviews.stream()
                .filter(pr -> pr.getCollaborationRating() != null)
                .mapToInt(PeerReview::getCollaborationRating)
                .average().orElse(0.0);
        
        double avgCommunication = peerReviews.stream()
                .filter(pr -> pr.getCommunicationRating() != null)
                .mapToInt(PeerReview::getCommunicationRating)
                .average().orElse(0.0);
        
        double avgTechnical = peerReviews.stream()
                .filter(pr -> pr.getTechnicalRating() != null)
                .mapToInt(PeerReview::getTechnicalRating)
                .average().orElse(0.0);
        
        double avgLeadership = peerReviews.stream()
                .filter(pr -> pr.getLeadershipRating() != null)
                .mapToInt(PeerReview::getLeadershipRating)
                .average().orElse(0.0);
        
        summary.append("Average Ratings:\n");
        summary.append("- Collaboration: ").append(String.format("%.1f", avgCollaboration)).append("/5\n");
        summary.append("- Communication: ").append(String.format("%.1f", avgCommunication)).append("/5\n");
        summary.append("- Technical Skills: ").append(String.format("%.1f", avgTechnical)).append("/5\n");
        summary.append("- Leadership: ").append(String.format("%.1f", avgLeadership)).append("/5\n");
        
        return summary.toString();
    }
    
    private PeerReviewDTO convertToDTO(PeerReview peerReview) {
        return new PeerReviewDTO(
                peerReview.getId(),
                peerReview.getEvaluationId(),
                peerReview.getReviewerId(),
                peerReview.getReviewerName(),
                peerReview.getReviewerEmail(),
                peerReview.getStrengths(),
                peerReview.getWeaknesses(),
                peerReview.getSuggestions(),
                peerReview.getCollaborationRating(),
                peerReview.getCommunicationRating(),
                peerReview.getTechnicalRating(),
                peerReview.getLeadershipRating(),
                peerReview.getOverallRating(),
                peerReview.getCreatedAt(),
                peerReview.getUpdatedAt()
        );
    }
    
    private PeerReview convertToEntity(PeerReviewDTO dto) {
        PeerReview peerReview = new PeerReview();
        peerReview.setEvaluationId(dto.getEvaluationId());
        peerReview.setReviewerId(dto.getReviewerId());
        peerReview.setReviewerName(dto.getReviewerName());
        peerReview.setReviewerEmail(dto.getReviewerEmail());
        peerReview.setStrengths(dto.getStrengths());
        peerReview.setWeaknesses(dto.getWeaknesses());
        peerReview.setSuggestions(dto.getSuggestions());
        peerReview.setCollaborationRating(dto.getCollaborationRating());
        peerReview.setCommunicationRating(dto.getCommunicationRating());
        peerReview.setTechnicalRating(dto.getTechnicalRating());
        peerReview.setLeadershipRating(dto.getLeadershipRating());
        peerReview.setOverallRating(dto.getOverallRating());
        return peerReview;
    }
    
    private void updateEntityFromDTO(PeerReview peerReview, PeerReviewDTO dto) {
        if (dto.getStrengths() != null) peerReview.setStrengths(dto.getStrengths());
        if (dto.getWeaknesses() != null) peerReview.setWeaknesses(dto.getWeaknesses());
        if (dto.getSuggestions() != null) peerReview.setSuggestions(dto.getSuggestions());
        if (dto.getCollaborationRating() != null) peerReview.setCollaborationRating(dto.getCollaborationRating());
        if (dto.getCommunicationRating() != null) peerReview.setCommunicationRating(dto.getCommunicationRating());
        if (dto.getTechnicalRating() != null) peerReview.setTechnicalRating(dto.getTechnicalRating());
        if (dto.getLeadershipRating() != null) peerReview.setLeadershipRating(dto.getLeadershipRating());
    }
}
