# Backend Architecture (AI-PAT)
- Java 21, Spring Boot 3.
- Port: 8082 (overridable with PORT).
- Layers: controller → service → repository.
- Security: JWT, roles EMPLOYEE/MANAGER/ADMIN.
- DB: Postgres, migrations via Flyway.
