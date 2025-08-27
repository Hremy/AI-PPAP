# Security Information

## Default Credentials

### Development Environment
- **Username**: user
- **Password**: 57a53f27-a16b-417c-8e05-e64dc1326a47 (automatically generated for development)

> **Important**: This is a development password and should never be used in production. Always change the default credentials before deploying to production.

## Database Security
- **Database Name**: AI-PPAP
- **Database User**: ai_ppap
- **Database Password**: ai_ppap

## Security Best Practices

1. **Change Default Credentials**
   - Update the default security credentials before deploying to production.
   - Use strong, unique passwords for all accounts.

2. **Environment Variables**
   - Store sensitive information in environment variables, not in version control.
   - Use `.env` files (added to `.gitignore`) for local development.

3. **HTTPS**
   - Always use HTTPS in production.
   - Configure proper SSL/TLS certificates.

4. **Dependencies**
   - Regularly update all dependencies to their latest secure versions.
   - Use `mvn dependency:check-updates` to check for updates.

5. **CORS**
   - Configure CORS to allow requests only from trusted domains.
   - Current CORS configuration allows: `http://localhost:5200`

## Reporting Security Issues

If you discover any security issues, please report them to the project maintainers at [your-email@example.com].

## Security Updates

This document will be updated as security configurations change. Always refer to the latest version for the most current security information.
