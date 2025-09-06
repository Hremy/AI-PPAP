package com.ai.pat.backend.config;

import com.ai.pat.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;

// @Configuration
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final ProjectService projectService;

    @Override
    public void run(ApplicationArguments args) {
        String[] defaults = new String[] {
            "MSC-Explora",
            "MG",
            "Support Team",
            "TTT",
            "Frattelli Carli",
            "UniCredit"
        };
        for (String name : defaults) {
            try {
                projectService.createIfNotExists(name);
            } catch (Exception ignored) {
            }
        }
    }
}
