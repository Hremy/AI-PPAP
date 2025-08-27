package com.ai.pat.backend.model;

public enum Role {
    ROLE_EMPLOYEE("EMPLOYEE"),
    ROLE_MANAGER("MANAGER"),
    ROLE_ADMIN("ADMIN");

    private final String name;

    Role(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
