# AI-PPAP Backend API Documentation

## Base URL
```
http://localhost:8082/api
```

## Authentication

All API requests (except authentication endpoints) require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Health Check

#### GET /health
Check if the backend service is running.

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2024-01-01T12:00:00",
  "service": "AI-PPAP Backend",
  "version": "1.0.0"
}
```

### 2. Authentication

#### POST /v1/auth/register
Register a new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `firstName`: Required, non-blank
- `lastName`: Required, non-blank
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "role": "ROLE_EMPLOYEE"
}
```

**Status Codes:**
- `200 OK`: Registration successful
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

#### POST /v1/auth/authenticate
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, non-blank

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "role": "ROLE_EMPLOYEE"
}
```

**Status Codes:**
- `200 OK`: Authentication successful
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials

## User Roles

The system supports three user roles with different access levels:

### ROLE_EMPLOYEE
- Access to `/v1/employee/**` endpoints
- Basic user functionality

### ROLE_MANAGER
- Access to `/v1/employee/**` endpoints
- Access to `/v1/manager/**` endpoints
- Management functionality

### ROLE_ADMIN
- Access to all endpoints
- Full system administration

## Error Responses

### Validation Error (400 Bad Request)
```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email should be valid"
    }
  ]
}
```

### Authentication Error (401 Unauthorized)
```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

### Forbidden Error (403 Forbidden)
```json
{
  "timestamp": "2024-01-01T12:00:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied"
}
```

## JWT Token

### Token Structure
The JWT token contains:
- **Subject**: User email
- **Issued At**: Token creation time
- **Expiration**: Token expiration time (24 hours by default)
- **Claims**: User information

### Token Usage
1. Include in Authorization header for all protected requests
2. Token expires after 24 hours (configurable)
3. Refresh token functionality can be implemented for longer sessions

### Token Validation
The backend validates:
- Token signature
- Token expiration
- User existence and status

## CORS Configuration

The backend is configured to accept requests from:
- **Origin**: `http://localhost:5200` (configurable)
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: All headers
- **Credentials**: Enabled

## Frontend Integration Example

### JavaScript/TypeScript

```typescript
interface AuthRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

class AuthService {
  private baseUrl = 'http://localhost:8082/api';
  private token: string | null = null;

  async login(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/v1/auth/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Authentication failed');
    }

    const data: AuthResponse = await response.json();
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }

  async register(userData: any): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const data: AuthResponse = await response.json();
    this.token = data.token;
    localStorage.setItem('token', data.token);
    return data;
  }

  async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    const token = this.token || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      this.token = null;
      throw new Error('Authentication token expired');
    }

    return response;
  }
}
```

### React Hook Example

```typescript
import { useState, useEffect } from 'react';

interface User {
  email: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({
        email: payload.sub,
        role: payload.role,
      });
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const authService = new AuthService();
    const response = await authService.login({ email, password });
    setUser({
      email: response.email,
      role: response.role,
    });
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

## Testing

### Default Admin User
For testing purposes, a default admin user is created:

- **Email**: admin@ai-ppap.com
- **Password**: admin123
- **Role**: ROLE_ADMIN

### Test Credentials
```bash
# Admin login
curl -X POST http://localhost:8082/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ai-ppap.com","password":"admin123"}'

# Register new user
curl -X POST http://localhost:8082/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'
```

## Security Considerations

1. **HTTPS**: Use HTTPS in production
2. **Token Storage**: Store tokens securely (httpOnly cookies recommended)
3. **Token Expiration**: Implement token refresh mechanism
4. **Input Validation**: Always validate user input
5. **Rate Limiting**: Implement rate limiting for authentication endpoints
6. **Password Policy**: Enforce strong password requirements
7. **Account Lockout**: Implement account lockout after failed attempts

## Future Enhancements

- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Social login integration
- [ ] User profile management
- [ ] Role-based UI components
- [ ] Audit logging
- [ ] Session management
