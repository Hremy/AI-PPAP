# AI-PPAP Backend

A Spring Boot 3 application providing authentication and authorization services for the AI-PPAP platform.

## Features

- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Authorization**: Support for EMPLOYEE, MANAGER, and ADMIN roles
- **User Management**: Registration and authentication endpoints
- **Database Integration**: PostgreSQL with Flyway migrations
- **Security**: Spring Security with CORS configuration
- **API Documentation**: RESTful API endpoints

## Technology Stack

- **Java**: 17
- **Spring Boot**: 3.3.4
- **Spring Security**: 6.x
- **JWT**: 0.11.5
- **PostgreSQL**: 42.7.4
- **Flyway**: 9.22.3
- **Maven**: 3.11.0

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+

## Setup

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE ai_ppap;
CREATE USER ai_ppap WITH PASSWORD 'ai_ppap';
GRANT ALL PRIVILEGES ON DATABASE ai_ppap TO ai_ppap;
```

### 2. Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DB_URL=jdbc:postgresql://localhost:5432/ai_ppap
DB_USER=ai_ppap
DB_PASS=ai_ppap

# JWT
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000

# Frontend URL
FRONTEND_URL=http://localhost:5200

# Server Port
PORT=8082
```

### 3. Build and Run

```bash
# Build the project
mvn clean compile

# Run tests
mvn test

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8082`

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "role": "ROLE_EMPLOYEE"
}
```

#### Authenticate User
```http
POST /api/v1/auth/authenticate
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "role": "ROLE_EMPLOYEE"
}
```

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "UP",
  "timestamp": "2024-01-01T12:00:00",
  "service": "AI-PPAP Backend",
  "version": "1.0.0"
}
```

## Security

### JWT Token Usage

Include the JWT token in the Authorization header for protected endpoints:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-based Access Control

- **ROLE_EMPLOYEE**: Access to `/api/v1/employee/**`
- **ROLE_MANAGER**: Access to `/api/v1/employee/**` and `/api/v1/manager/**`
- **ROLE_ADMIN**: Access to all endpoints

### Default Admin User

A default admin user is created during database migration:

- **Email**: admin@ai-ppap.com
- **Password**: admin123
- **Role**: ROLE_ADMIN

## Database Schema

### Users Table
```sql
CREATE TABLE _user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_EMPLOYEE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Project Structure

```
src/main/java/com/ai/pat/backend/
├── config/           # Configuration classes
├── controller/       # REST controllers
├── dto/             # Data Transfer Objects
├── model/           # Entity models
├── repository/      # Data access layer
├── security/        # Security components
└── service/         # Business logic
```

### Running Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AuthenticationServiceTest

# Run with coverage
mvn test jacoco:report
```

### Database Migrations

Flyway migrations are located in `src/main/resources/db/migration/`:

- `V1__baseline.sql`: Initial database setup
- `V2__create_users_table.sql`: User table creation

## Configuration

### Application Properties

Key configuration options in `application.yml`:

- **Server Port**: 8082 (configurable via PORT env var)
- **Database**: PostgreSQL with connection pooling
- **JWT**: Configurable secret and expiration times
- **CORS**: Configurable allowed origins and methods
- **Logging**: Debug level for development

### CORS Configuration

The application supports cross-origin requests from the frontend:

- **Allowed Origins**: Configurable via FRONTEND_URL env var
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: All headers
- **Credentials**: Enabled

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and accessible
2. **Port Conflicts**: Change PORT environment variable if 8082 is in use
3. **JWT Issues**: Verify JWT_SECRET is properly set
4. **CORS Issues**: Check FRONTEND_URL configuration

### Logs

Enable debug logging by setting:
```yaml
logging:
  level:
    com.ai.pat: DEBUG
    org.springframework.security: DEBUG
```

## Contributing

1. Follow the existing code style
2. Add tests for new functionality
3. Update documentation for API changes
4. Use meaningful commit messages

## License

This project is part of the AI-PPAP platform.
