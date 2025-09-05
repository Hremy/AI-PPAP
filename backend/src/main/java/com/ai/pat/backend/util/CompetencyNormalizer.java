package com.ai.pat.backend.util;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public final class CompetencyNormalizer {

    private static final Map<String, String> ALIASES = new HashMap<>();
    static {
        // Canonical mappings for common variants
        ALIASES.put("technical_skills", "Technical Skills");
        ALIASES.put("technical_excellence", "Technical Skills");
        ALIASES.put("problem_solving", "Problem Solving");
        ALIASES.put("quality_focus", "Quality Focus");
        ALIASES.put("quality", "Quality Focus");
        ALIASES.put("time_management", "Time Management");
        ALIASES.put("reliability", "Time Management");
        ALIASES.put("teamwork", "Teamwork");
        ALIASES.put("leadership", "Leadership");
        ALIASES.put("initiative", "Leadership");
        ALIASES.put("adaptability", "Adaptability");
        ALIASES.put("communication", "Communication");
        // Leave "reliability" as title-cased if present
    }

    private CompetencyNormalizer() {}

    public static Map<String, Integer> normalize(Map<String, Integer> input) {
        if (input == null || input.isEmpty()) return input;
        Map<String, Integer> out = new HashMap<>();
        Map<String, Integer> counts = new HashMap<>();
        for (Map.Entry<String, Integer> e : input.entrySet()) {
            if (e.getKey() == null || e.getValue() == null) continue;
            String key = e.getKey().trim();
            String canonical = canonicalize(key);
            // Merge duplicates by averaging
            int v = e.getValue();
            out.merge(canonical, v, Integer::sum);
            counts.merge(canonical, 1, Integer::sum);
        }
        // Average merged values and round to nearest int
        for (Map.Entry<String, Integer> en : out.entrySet()) {
            String k = en.getKey();
            int total = en.getValue();
            int c = counts.getOrDefault(k, 1);
            int avg = Math.toIntExact(Math.round((double) total / (double) c));
            en.setValue(avg);
        }
        return out;
    }

    public static String canonicalize(String key) {
        if (key == null) return null;
        String k = key.trim();
        String alias = ALIASES.get(k.toLowerCase(Locale.ROOT));
        if (alias != null) return alias;
        // Default: title-case by underscores/spaces
        String replaced = k.replace('_', ' ').replace('-', ' ').toLowerCase(Locale.ROOT);
        String[] parts = replaced.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String p : parts) {
            if (p.isBlank()) continue;
            sb.append(Character.toUpperCase(p.charAt(0))).append(p.substring(1)).append(' ');
        }
        String title = sb.toString().trim();
        return title.isEmpty() ? k : title;
    }
}
