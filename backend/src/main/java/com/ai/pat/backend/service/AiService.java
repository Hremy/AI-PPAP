package com.ai.pat.backend.service;

import com.ai.pat.backend.controller.dto.ai.DraftEvaluationRequest;
import com.ai.pat.backend.controller.dto.ai.DraftEvaluationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${ai.windsurf.api-url:https://api.windsurf.ai}")
    private String apiUrl;

    @Value("${ai.windsurf.api-key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public DraftEvaluationResponse draftEvaluation(DraftEvaluationRequest req) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("AI API key is not configured; returning a placeholder draft.");
            return new DraftEvaluationResponse(
                    "This is a placeholder draft because the AI API key is not configured.",
                    Map.of()
            );
        }

        try {
            String url = apiUrl.replaceAll("/$", "") + "/v1/chat"; // Adjust path to your provider

            Map<String, Object> body = new HashMap<>();
            body.put("task", "draft_evaluation");
            body.put("employeeName", req.getEmployeeName());
            body.put("role", req.getRole());
            body.put("competencyRatings", req.getCompetencyRatings());
            body.put("context", req.getContext());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            Map<?, ?> respBody = resp.getBody();
            if (!resp.getStatusCode().is2xxSuccessful() || respBody == null) {
                throw new RestClientException("Non-200 from AI API");
            }

            // Very flexible parsing: expect either {reply: "..."} or OpenAI-style choices
            String summary = null;
            Map<String, String> competencyNotes = new HashMap<>();
            Object reply = respBody.get("reply");
            if (reply instanceof String s) {
                summary = s;
            } else {
                Object choices = respBody.get("choices");
                if (choices instanceof java.util.List<?> list && !list.isEmpty()) {
                    Object first = list.get(0);
                    if (first instanceof Map<?, ?> choice) {
                        Object message = choice.get("message");
                        if (message instanceof Map<?, ?> msg) {
                            Object content = msg.get("content");
                            if (content instanceof String cs) summary = cs;
                        }
                    }
                }
            }
            if (summary == null) summary = "AI draft generated, but no textual content returned.";
            return new DraftEvaluationResponse(summary, competencyNotes);
        } catch (Exception ex) {
            log.error("AI draft request failed: {}", ex.getMessage(), ex);
            throw new RuntimeException("AI drafting failed: " + ex.getMessage(), ex);
        }
    }
}
