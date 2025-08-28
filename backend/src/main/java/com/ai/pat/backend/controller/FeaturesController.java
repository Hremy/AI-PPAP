package com.ai.pat.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/features")
public class FeaturesController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getFeaturesPage() {
        // Provide combined page data so the frontend can render without extra calls
        return ResponseEntity.ok(Map.of(
                "title", "AI-PPAP Features",
                "description", "Explore AI-Powered Performance Analysis Platform features",
                "sections", List.of("overview", "integrations", "workflow"),
                "features", List.of(
                        Map.of(
                                "icon", "ChartBarIcon",
                                "title", "Performance Analytics",
                                "description", "Comprehensive performance tracking with real-time analytics and insights.",
                                "benefits", List.of("Real-time performance metrics", "Historical trend analysis", "Customizable KPIs", "Interactive dashboards")
                        ),
                        Map.of(
                                "icon", "DocumentTextIcon",
                                "title", "Smart Reviews",
                                "description", "AI-powered review system with self, manager, and 360° peer reviews.",
                                "benefits", List.of("Automated review workflows", "AI-assisted feedback", "Multi-source reviews", "Review templates")
                        ),
                        Map.of(
                                "icon", "CpuChipIcon",
                                "title", "AI Insights",
                                "description", "Advanced AI analysis providing personalized recommendations and insights.",
                                "benefits", List.of("Sentiment analysis", "Performance predictions", "Growth recommendations", "Skill gap analysis")
                        ),
                        Map.of(
                                "icon", "UserGroupIcon",
                                "title", "Team Management",
                                "description", "Comprehensive team oversight with collaborative performance management.",
                                "benefits", List.of("Team performance tracking", "Collaborative goal setting", "Team comparisons", "Manager dashboards")
                        ),
                        Map.of(
                                "icon", "ShieldCheckIcon",
                                "title", "Enterprise Security",
                                "description", "Bank-level security with role-based access and data protection.",
                                "benefits", List.of("Role-based permissions", "Data encryption", "Audit trails", "Compliance ready")
                        ),
                        Map.of(
                                "icon", "ArrowTrendingUpIcon",
                                "title", "Goal Tracking",
                                "description", "Smart goal setting and tracking with automated progress monitoring.",
                                "benefits", List.of("SMART goal framework", "Progress tracking", "Milestone alerts", "Achievement analytics")
                        )
                ),
                "integrations", List.of(
                        Map.of("name", "Slack", "logo", "\uD83D\uDCAC"),
                        Map.of("name", "Microsoft Teams", "logo", "\uD83D\uDC65"),
                        Map.of("name", "Google Workspace", "logo", "\uD83D\uDCEC"),
                        Map.of("name", "Jira", "logo", "\uD83C\uDFAF"),
                        Map.of("name", "Salesforce", "logo", "\u2601\uFE0F"),
                        Map.of("name", "Workday", "logo", "\uD83D\uDCBC")
                ),
                "workflowSteps", List.of(
                        Map.of(
                                "stepNumber", 1,
                                "title", "Collect Data",
                                "description", "Gather performance data through self-reviews, manager evaluations, and peer feedback with our intelligent forms."
                        ),
                        Map.of(
                                "stepNumber", 2,
                                "title", "AI Analysis",
                                "description", "Our AI engine analyzes feedback, identifies patterns, and generates insights to understand performance trends."
                        ),
                        Map.of(
                                "stepNumber", 3,
                                "title", "Drive Results",
                                "description", "Get actionable recommendations, track progress, and make data-driven decisions to improve performance."
                        )
                )
        ));
    }

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, String>>> listFeatures() {
        return ResponseEntity.ok(List.of(
                Map.of("key", "analytics", "name", "Analytics"),
                Map.of("key", "scoring", "name", "Scoring"),
                Map.of("key", "reviews", "name", "Reviews")
        ));
    }

    @GetMapping("/integrations")
    public ResponseEntity<List<Map<String, String>>> listIntegrations() {
        return ResponseEntity.ok(List.of(
                Map.of("name", "Slack"),
                Map.of("name", "Jira"),
                Map.of("name", "GitHub")
        ));
    }

    @GetMapping("/workflow")
    public ResponseEntity<List<Map<String, String>>> listWorkflow() {
        return ResponseEntity.ok(List.of(
                Map.of("step", "Ingest"),
                Map.of("step", "Analyze"),
                Map.of("step", "Score"),
                Map.of("step", "Review")
        ));
    }
}
