# AI-PPAP (AI-Powered Performance Analysis Platform)

- Frontend: React + Vite (port 5200)
- Backend: Spring Boot (Java 21, port 8084)

## Env & Base URLs
Frontend uses `VITE_API_BASE_URL`/`VITE_APP_BASE_URL`. Backend uses `FRONTEND_URL`. Do not hardcode localhost for deploy.

## Run locally
docker compose -f infrastructure/docker-compose.yml up -d
mvn -f backend spring-boot:run
npm run dev --prefix frontend

## Health
GET http://localhost:8084/api/health → { status: "ok" }
