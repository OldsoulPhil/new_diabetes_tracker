# Security Implementation Guide

## 🔒 Security Features Implemented

This application now includes enterprise-grade security features to protect sensitive user health data.

### 1. Password Security

- **Bcrypt Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- **Never Stored in Plain Text**: Passwords are NEVER stored or transmitted in plain text

### 2. Authentication & Authorization

- **JWT (JSON Web Tokens)**: Secure token-based authentication
  - Access tokens (15-minute expiration) for API requests
  - Refresh tokens (7-day expiration) for maintaining sessions
- **Protected Routes**: All user data endpoints require valid JWT tokens
- **Automatic Token Refresh**: Seamless session management without user interruption
- **Secure Logout**: Invalidates refresh tokens on server

### 3. API Security

- **Rate Limiting**:
  - General: 100 requests per 15 minutes
  - Authentication endpoints: 5 attempts per 15 minutes (prevents brute-force)
- **CORS Protection**: Only allows requests from whitelisted origins
- **Helmet**: Sets secure HTTP headers automatically
- **Input Validation**: All user inputs validated using express-validator
- **No Data Leakage**: Passwords never returned in API responses

### 4. Data Protection

- **User Isolation**: Users can only access their own data
- **Ownership Verification**: All operations verify resource ownership
- **Cascade Deletion**: When user deletes account, all associated data is removed
- **Database Indexing**: Optimized queries for better performance

### 5. Frontend Security

- **Token Storage**:
  - Access tokens in sessionStorage (cleared when browser closes)
  - Refresh tokens in localStorage (persists across sessions)
- **Automatic Token Attachment**: Axios interceptors add tokens to all requests
- **XSS Protection**: Input sanitization and validation
- **Error Handling**: No sensitive information leaked in error messages

---

## 🚀 Getting Started

### Prerequisites

1. Node.js installed
2. Database setup (SQLite via Prisma)

### Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Configure Environment Variables**

```bash
# Copy .env.example to .env
cp .env.example .env

# IMPORTANT: Generate secure JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output to JWT_SECRET in .env

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output to JWT_REFRESH_SECRET in .env
```

3. **Setup Database**

```bash
npx prisma migrate dev
```

4. **Start the Server**

```bash
npm run server
```

5. **Start the Frontend**

```bash
npm run dev
```

---

## 🔐 Environment Variables

**CRITICAL**: Never commit `.env` file to version control!

### Required Variables:

- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret for signing access tokens (must be strong and random)
- `JWT_REFRESH_SECRET`: Secret for signing refresh tokens (different from JWT_SECRET)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend URLs

### Optional Variables:

- `PORT`: Server port (default: 5000)
- `JWT_EXPIRES_IN`: Access token expiration (default: 15m)
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration (default: 7d)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window (default: 100)
- `AUTH_RATE_LIMIT_MAX_REQUESTS`: Max auth attempts per window (default: 5)

---

## 🛡️ Security Best Practices

### For Development:

1. ✅ Keep dependencies updated: `npm audit fix`
2. ✅ Use strong JWT secrets (minimum 32 characters)
3. ✅ Never commit `.env` file
4. ✅ Test with different user accounts to verify isolation

### For Production:

1. ✅ Use HTTPS only (never HTTP in production)
2. ✅ Generate new JWT secrets using crypto
3. ✅ Set `NODE_ENV=production` in environment
4. ✅ Use a proper database (PostgreSQL, MySQL) instead of SQLite
5. ✅ Enable database backups
6. ✅ Monitor failed login attempts
7. ✅ Implement account lockout after X failed attempts
8. ✅ Add email verification for new accounts
9. ✅ Implement 2FA (two-factor authentication)
10. ✅ Use a secret management service (AWS Secrets Manager, Azure Key Vault)
11. ✅ Enable logging and monitoring (Sentry, DataDog)
12. ✅ Regular security audits

---

## 🔍 Testing Security

### Test Authentication:

```bash
# Register a new user
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Use the returned accessToken for authenticated requests
curl -X GET http://localhost:5000/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Test Rate Limiting:

Try making 6+ login requests quickly - should get 429 Too Many Requests

### Test Token Expiration:

Wait 15 minutes after login - access token should expire and auto-refresh

---

## 📋 API Endpoints

### Public (No Authentication Required)

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /health` - Health check

### Protected (Requires Authentication)

- `GET /users/me` - Get current user profile
- `PATCH /users/me` - Update current user
- `DELETE /users/me` - Delete account
- `POST /auth/logout` - Logout user
- `GET /glucose-entries` - Get user's glucose entries
- `POST /glucose-entries` - Create glucose entry
- `GET /food-entries` - Get user's food entries
- `POST /food-entries` - Create food entry
- `PATCH /food-entries/:id` - Update food entry
- `DELETE /food-entries/:id` - Delete food entry

---

## 🐛 Common Issues

### "Invalid token" error

- Token expired (access tokens last 15 minutes)
- Solution: Refresh token automatically handled by frontend

### "Too many requests" error

- Hit rate limit
- Solution: Wait 15 minutes or reduce request frequency

### "CORS error"

- Frontend URL not in ALLOWED_ORIGINS
- Solution: Add your frontend URL to .env ALLOWED_ORIGINS

### Password requirements not met

- Password must have: 8+ chars, uppercase, lowercase, number
- Solution: Use stronger password

---

## 📞 Support

For security concerns or vulnerabilities, please contact the security team immediately.

**DO NOT** open public GitHub issues for security vulnerabilities.

---

## 📝 Changelog

### Version 2.0.0 (Security Update)

- ✅ Implemented JWT authentication
- ✅ Added bcrypt password hashing
- ✅ Added rate limiting
- ✅ Protected all API endpoints
- ✅ Removed localStorage password storage
- ✅ Added input validation
- ✅ Implemented CORS restrictions
- ✅ Added Helmet for secure headers
- ✅ Improved error handling
- ✅ Added database migrations for security fields

---

_Last Updated: December 25, 2025_
