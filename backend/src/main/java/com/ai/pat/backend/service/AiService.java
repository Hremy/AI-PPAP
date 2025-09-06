package com.ai.pat.backend.service;

import com.ai.pat.backend.controller.dto.ai.DraftEvaluationRequest;
import com.ai.pat.backend.controller.dto.ai.DraftEvaluationResponse;
import com.ai.pat.backend.controller.dto.ai.AnalyzeTextRequest;
import com.ai.pat.backend.controller.dto.ai.AnalyzeTextResponse;
import com.ai.pat.backend.controller.dto.ai.SummarizeRequest;
import com.ai.pat.backend.controller.dto.ai.SummarizeResponse;
import com.ai.pat.backend.controller.dto.ai.RecommendationsRequest;
import com.ai.pat.backend.controller.dto.ai.RecommendationsResponse;
import com.ai.pat.backend.controller.dto.ai.EvaluateRequest;
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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    public AnalyzeTextResponse analyzeText(AnalyzeTextRequest req) {
        // Simple heuristic sentiment if no provider configured
        List<AnalyzeTextResponse.Sentiment> sentiments = new ArrayList<>();
        List<String> keyPoints = new ArrayList<>();

        for (String text : req.getTexts()) {
            if (text == null || text.isBlank()) {
                sentiments.add(new AnalyzeTextResponse.Sentiment("neutral", 0.5));
                continue;
            }
            double pos = countMatches(text, new String[]{"excellent","great","good","outstanding","improved","effective","success"});
            double neg = countMatches(text, new String[]{"poor","bad","issue","problem","delay","risk","concern","lack"});
            double total = pos + neg;
            String label;
            double score;
            if (total == 0) {
                label = "neutral";
                score = 0.5;
            } else if (pos >= neg) {
                label = "positive";
                score = Math.min(1.0, 0.5 + (pos - neg) / Math.max(3.0, total * 2));
            } else {
                label = "negative";
                score = Math.min(1.0, 0.5 + (neg - pos) / Math.max(3.0, total * 2));
            }
            sentiments.add(new AnalyzeTextResponse.Sentiment(label, round(score)));

            // Extract a couple of key points (naive sentence split)
            keyPoints.addAll(extractKeyPoints(text, 2));
        }

        // Deduplicate and cap key points
        List<String> distinctKeyPoints = keyPoints.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .distinct()
                .limit(5)
                .collect(Collectors.toList());

        return new AnalyzeTextResponse(sentiments, distinctKeyPoints);
    }

    public SummarizeResponse summarize(SummarizeRequest req) {
        String text = req.getText();
        if (text == null || text.isBlank()) {
            return new SummarizeResponse("");
        }
        if (apiKey == null || apiKey.isBlank()) {
            // Simple heuristic summary: first 2 sentences or 60 words
            String summary = naiveSummarize(text, 2, 60);
            return new SummarizeResponse(summary);
        }
        try {
            String url = apiUrl.replaceAll("/$", "") + "/v1/chat";
            Map<String, Object> body = new HashMap<>();
            body.put("task", "summarize");
            body.put("text", text);
            body.put("maxTokens", req.getMaxTokens());

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
            String summary = (respBody != null && respBody.get("reply") instanceof String)
                    ? (String) respBody.get("reply")
                    : naiveSummarize(text, 2, 60);
            return new SummarizeResponse(summary);
        } catch (Exception ex) {
            log.error("AI summarize failed: {}", ex.getMessage(), ex);
            return new SummarizeResponse(naiveSummarize(text, 2, 60));
        }
    }

    public RecommendationsResponse recommendations(RecommendationsRequest req) {
        Map<String, Integer> ratings = req.getCompetencyRatings();
        if (ratings == null || ratings.isEmpty()) {
            return new RecommendationsResponse(List.of(), List.of(), List.of(), List.of());
        }

        // Sort competencies by rating
        List<Map.Entry<String, Integer>> sorted = ratings.entrySet().stream()
                .sorted(Map.Entry.comparingByValue())
                .collect(Collectors.toList());

        List<String> weaknesses = sorted.stream()
                .limit(Math.min(3, sorted.size()))
                .map(e -> e.getKey())
                .collect(Collectors.toList());

        List<String> strengths = sorted.stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(Math.min(3, sorted.size()))
                .map(e -> e.getKey())
                .collect(Collectors.toList());

        List<String> growthAreas = new ArrayList<>();
        for (String w : weaknesses) {
            growthAreas.add("Improve " + humanize(w) + " through targeted practice and feedback cycles.");
        }

        List<String> actions = new ArrayList<>();
        for (String w : weaknesses) {
            actions.add("Set a SMART goal for " + humanize(w) + ": attend training, pair with a mentor, and measure progress over 4-6 weeks.");
        }

        return new RecommendationsResponse(strengths, weaknesses, growthAreas, actions);
    }

    public Map<String, Object> evaluate(EvaluateRequest req) {
        Map<String, Object> result = new HashMap<>();
        // Basic performance score: average rating scaled to 100
        double score = 0.0;
        if (req.getCompetencyRatings() != null && !req.getCompetencyRatings().isEmpty()) {
            double sum = req.getCompetencyRatings().values().stream().mapToDouble(Integer::doubleValue).sum();
            score = (sum / (req.getCompetencyRatings().size() * 5.0)) * 100.0;
        }
        result.put("performanceScore", Math.round(score));

        // Sentiments for provided texts
        List<String> texts = new ArrayList<>();
        if (req.getSelfText() != null) texts.add(req.getSelfText());
        if (req.getManagerText() != null) texts.add(req.getManagerText());
        if (req.getPeerTexts() != null) texts.addAll(req.getPeerTexts());
        AnalyzeTextResponse sentiments = analyzeText(new AnalyzeTextRequest() {{ setTexts(texts); }});
        result.put("sentiments", sentiments.getSentiments());

        // Summary
        String combined = String.join("\n\n", texts);
        SummarizeResponse sum = summarize(new SummarizeRequest() {{ setText(combined); setMaxTokens(200); }});
        result.put("summary", sum.getSummary());

        // Recommendations
        RecommendationsResponse recs = recommendations(new RecommendationsRequest() {{
            setRole(req.getRole());
            setCompetencyRatings(req.getCompetencyRatings());
            setFeedbackText(combined);
        }});
        result.put("strengths", recs.getStrengths());
        result.put("weaknesses", recs.getWeaknesses());
        result.put("growthAreas", recs.getGrowthAreas());
        result.put("suggestedActions", recs.getSuggestedActions());

        return result;
    }

    // --- Helpers ---
    private static double countMatches(String text, String[] words) {
        if (text == null || text.isBlank()) return 0;
        String lower = text.toLowerCase();
        double count = 0;
        for (String w : words) {
            int idx = -1;
            while ((idx = lower.indexOf(w, idx + 1)) >= 0) {
                count += 1.0;
            }
        }
        return count;
    }

    private static double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private static List<String> extractKeyPoints(String text, int max) {
        List<String> sentences = new ArrayList<>();
        for (String s : text.split("(?<=[.!?])\\s+")) {
            String t = s.trim();
            if (t.length() > 10) sentences.add(t);
        }
        return sentences.stream().limit(max).collect(Collectors.toList());
    }

    private static String naiveSummarize(String text, int maxSentences, int maxWords) {
        if (text == null) return "";
        String[] sentences = text.split("(?<=[.!?])\\s+");
        StringBuilder sb = new StringBuilder();
        int count = 0;
        for (String s : sentences) {
            if (sb.length() + s.length() > 2000) break;
            sb.append(s.trim()).append(" ");
            if (++count >= maxSentences) break;
        }
        String candidate = sb.toString().trim();
        String[] words = candidate.split("\\s+");
        if (words.length > maxWords) {
            candidate = String.join(" ", java.util.Arrays.copyOfRange(words, 0, maxWords)) + "…";
        }
        return candidate;
    }

    private static String humanize(String key) {
        return key.replace('_', ' ').replace('-', ' ');
    }
}
