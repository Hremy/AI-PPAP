# Backend Architecture (AI-PPAP)
- Java 21, Spring Boot 3.
- Port: 8084 (overridable with PORT).
- Layers: controller → service → repository.
- Security: JWT, roles EMPLOYEE/MANAGER/ADMIN.
- DB: Postgres, migrations via Flyway.
