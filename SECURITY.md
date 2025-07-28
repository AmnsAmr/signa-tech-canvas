# Security Implementation Guide

This document outlines the comprehensive security measures implemented across the SignaTech Canvas application.

## 🛡️ Security Features Implemented

### 1. Rate Limiting

**Purpose**: Prevent spam, abuse, and brute-force attacks

**Implementation**:
- **Authentication endpoints**: 5 attempts per 15 minutes
- **Contact form**: 3 submissions per hour
- **File uploads**: 10 uploads per 15 minutes
- **Password reset**: 3 attempts per hour
- **General API**: 100 requests per 15 minutes

**Files**:
- `server/middleware/security.js` - Rate limiting configurations
- `server/app.js` - Applied to routes

### 2. Input Sanitization

**Purpose**: Protect against XSS and injection attacks

**Implementation**:
- DOMPurify integration for HTML sanitization
- Automatic sanitization of request body, query parameters, and URL parameters
- Validation schemas for different input types
- Character limits and format validation

**Files**:
- `server/middleware/security.js` - Sanitization middleware
- Applied to all routes automatically

### 3. CSRF Protection

**Purpose**: Prevent Cross-Site Request Forgery attacks

**Implementation**:
- CSRF token generation and verification
- Token required for all POST/PUT/DELETE requests
- Frontend CSRF token management
- Automatic retry mechanism for token refresh

**Files**:
- `server/middleware/security.js` - CSRF middleware
- `src/utils/csrf.ts` - Frontend CSRF management
- Applied to all form submissions

### 4. File Upload Security

**Purpose**: Secure file handling and validation

**Implementation**:
- Strict file type validation (SVG, DXF, PDF, EPS only)
- File size limits (10MB maximum)
- Filename sanitization and security checks
- MIME type verification
- Directory traversal protection

**Files**:
- `server/middleware/fileUpload.js` - Enhanced file validation
- `server/middleware/security.js` - File validation utilities

### 5. Security Headers

**Purpose**: Protect against various web vulnerabilities

**Implementation**:
- Helmet.js integration
- Content Security Policy (CSP)
- HSTS headers
- X-Frame-Options
- X-Content-Type-Options

**Files**:
- `server/middleware/security.js` - Security headers configuration

### 6. Enhanced Input Validation

**Purpose**: Comprehensive data validation

**Implementation**:
- Email normalization and validation
- Password strength requirements
- Phone number format validation
- Name and company field validation
- Message length limits

**Files**:
- `server/middleware/security.js` - Validation schemas
- `server/routes/auth.js` - Authentication validation
- `server/routes/contact.js` - Contact form validation

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:

```env
SESSION_SECRET=your-secure-session-secret-change-in-production
NODE_ENV=production  # For production deployment
```

### Rate Limiting Configuration

Rate limits can be adjusted in `server/middleware/security.js`:

```javascript
const rateLimits = {
  auth: createRateLimit(15 * 60 * 1000, 5, 'Too many authentication attempts'),
  contact: createRateLimit(60 * 60 * 1000, 3, 'Too many contact submissions'),
  // ... other configurations
};
```

### File Upload Limits

File upload restrictions in `server/middleware/fileUpload.js`:

```javascript
const allowedExtensions = ['.svg', '.dxf', '.pdf', '.eps'];
const maxFileSize = 10 * 1024 * 1024; // 10MB
```

## 🚨 Security Best Practices

### For Developers

1. **Always use secure API requests** in frontend:
   ```typescript
   import { secureApiRequest } from '@/utils/csrf';
   const response = await secureApiRequest('/api/endpoint', { method: 'POST', ... });
   ```

2. **Validate all inputs** on both client and server side

3. **Use HTTPS** in production environments

4. **Keep dependencies updated** regularly

5. **Monitor rate limiting logs** for suspicious activity

### For Deployment

1. **Set strong session secrets** in production
2. **Enable HTTPS** and update CSP accordingly
3. **Configure proper CORS origins**
4. **Set up monitoring** for security events
5. **Regular security audits** of dependencies

## 📊 Security Monitoring

### Rate Limiting Logs

Monitor these patterns in your logs:
- Multiple 429 responses from same IP
- Rapid authentication attempts
- Unusual file upload patterns

### Error Patterns

Watch for:
- CSRF token validation failures
- File upload rejections
- Input validation errors

## 🔄 Updates and Maintenance

### Regular Tasks

1. **Update dependencies** monthly
2. **Review rate limits** based on usage patterns
3. **Audit file upload logs** for suspicious activity
4. **Test CSRF protection** after updates
5. **Validate input sanitization** effectiveness

### Security Checklist

- [ ] Rate limiting is active on all sensitive endpoints
- [ ] CSRF tokens are required for all form submissions
- [ ] File uploads are properly validated
- [ ] Input sanitization is working
- [ ] Security headers are set
- [ ] HTTPS is enabled in production
- [ ] Session secrets are secure
- [ ] Dependencies are up to date

## 🆘 Incident Response

If you detect a security issue:

1. **Immediately review logs** for the affected endpoint
2. **Check rate limiting effectiveness**
3. **Verify CSRF protection** is working
4. **Validate input sanitization**
5. **Update security measures** if needed
6. **Document the incident** and response

## 📞 Support

For security-related questions or issues:
- Review this documentation
- Check server logs for security events
- Test security measures in development
- Update configurations as needed

---

**Last Updated**: January 2025
**Security Version**: 1.0.0