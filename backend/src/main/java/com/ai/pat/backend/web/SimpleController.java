package com.ai.pat.backend.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SimpleController {

    @GetMapping("/simple")
    public String simple() {
        return "Simple endpoint working!";
    }
}
