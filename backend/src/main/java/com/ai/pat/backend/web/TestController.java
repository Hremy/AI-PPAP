package com.ai.pat.backend.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/test")
public class TestController {

    @GetMapping("/public")
    public String publicEndpoint() {
        return "Public endpoint working!";
    }

    @GetMapping("/protected")
    public String protectedEndpoint() {
        return "Protected endpoint working!";
    }
}
