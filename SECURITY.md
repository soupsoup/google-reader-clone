# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |

## Security Features

### Authentication & Authorization

- **Supabase Auth**: Industry-standard authentication with JWT tokens
- **Session Management**: Secure session handling with automatic token refresh
- **Protected Routes**: Client-side route protection for authenticated users
- **Row Level Security**: Database-level user data isolation

### API Security

- **Rate Limiting**: 30 requests per minute per user on Edge Functions
- **Authentication Required**: All API endpoints require valid auth tokens
- **CORS Protection**: Configurable allowed origins
- **Request Validation**: Input validation and sanitization
- **SSRF Protection**: Blocks requests to internal/private IP ranges
- **Protocol Restrictions**: Only HTTP/HTTPS protocols allowed
- **File Size Limits**: 10MB maximum for feed content
- **Request Timeouts**: 10 second timeout on external requests

### Frontend Security

- **Content Security Policy (CSP)**: Restricts resource loading
  - Scripts: Self-hosted only
  - Styles: Self + inline (required for dynamic styles) + Google Fonts
  - Images: Self + data URIs + HTTPS origins
  - Connections: Self + Supabase domains
  - Frames: Blocked entirely

- **HTTP Security Headers**:
  - `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
  - `X-Frame-Options: DENY` - Prevents clickjacking
  - `X-XSS-Protection: 1; mode=block` - Browser XSS protection
  - `Referrer-Policy: strict-origin-when-cross-origin` - Limits referrer info
  - `Strict-Transport-Security` - Forces HTTPS
  - `Permissions-Policy` - Disables unnecessary browser features

### Database Security

- **Row Level Security (RLS)**: Enabled on all tables
  - Users can only access their own feeds, folders, and articles
  - Read/write permissions enforced at database level

- **SQL Injection Protection**: Parameterized queries via Supabase SDK
- **Secure Functions**: `SECURITY DEFINER` for bulk operations with proper checks

### Build & Deployment Security

- **No Source Maps in Production**: Prevents code inspection
- **Minification**: Code minified to reduce attack surface
- **Code Splitting**: Reduces bundle size and limits exposure
- **Environment Variable Validation**: Required variables checked at startup
- **Dependency Security**: Regular updates and vulnerability scanning recommended

## Security Best Practices for Deployment

### 1. Environment Variables

Never commit these to version control:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Any Supabase service role keys (backend only)

Store in:
- Hosting platform environment variables (Vercel, Netlify)
- Docker secrets
- CI/CD secrets (GitHub Actions, GitLab CI)

### 2. Supabase Configuration

**Required Settings:**
1. Enable email confirmation
2. Set password complexity requirements
3. Configure rate limiting
4. Enable database backups
5. Review and test RLS policies
6. Rotate service role keys regularly

**Edge Function Configuration:**
```bash
# Set allowed origins (production domains only)
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com

# Never use '*' in production!
```

### 3. Database Security

**Review RLS Policies:**
```sql
-- Verify user isolation
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Test RLS as different users
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub": "user-id-here"}';
```

**Monitor for Suspicious Activity:**
- Failed authentication attempts
- Unusual query patterns
- RLS policy violations (check logs)

### 4. Network Security

**HTTPS Only:**
- Enable HSTS header (configured by default)
- Redirect HTTP to HTTPS
- Use HTTPS for all external resources

**CORS Configuration:**
- Set specific allowed origins in production
- Never use wildcard (*) in production
- Verify preflight request handling

### 5. Monitoring

**Set Up Monitoring For:**
- Failed authentication attempts
- Rate limit hits
- 4xx/5xx error rates
- Edge function errors
- Database connection issues
- Unusual traffic patterns

**Recommended Tools:**
- Supabase Dashboard logs
- Sentry or Rollbar for error tracking
- UptimeRobot for availability monitoring
- CloudWatch or Datadog for metrics

## Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

1. **DO NOT** open a public issue
2. Email security concerns to your security team
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-30 days
  - Medium: 30-90 days
  - Low: 90+ days

## Security Checklist for Deployment

Use this checklist before deploying to production:

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Supabase email confirmation enabled
- [ ] Strong password policy configured
- [ ] RLS policies tested
- [ ] Edge function authentication tested
- [ ] CORS properly configured (no wildcards)
- [ ] Rate limiting tested
- [ ] CSP policy validated
- [ ] SSL/TLS certificate ready

### Post-Deployment
- [ ] HTTPS working correctly
- [ ] Security headers present (check with securityheaders.com)
- [ ] Authentication flow working
- [ ] Rate limiting working
- [ ] Feed fetching working with auth
- [ ] Error tracking configured
- [ ] Monitoring and alerts set up
- [ ] Database backups enabled
- [ ] Logs being collected
- [ ] Security scan performed

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Rotate API keys quarterly
- [ ] Test backups monthly
- [ ] Review RLS policies quarterly
- [ ] Security audit annually
- [ ] Update documentation as needed

## Security Testing

### Manual Testing

**Authentication:**
```bash
# Test unauthorized access
curl https://your-api.com/edge-function -X POST

# Should return 401 Unauthorized
```

**Rate Limiting:**
```bash
# Test rate limits (send 31+ requests rapidly)
for i in {1..35}; do
  curl https://your-api.com/edge-function \
    -H "Authorization: Bearer $TOKEN" \
    -X POST
done

# Should see 429 after 30 requests
```

**SSRF Protection:**
```bash
# Try to fetch internal URLs (should fail)
curl https://your-api.com/edge-function \
  -H "Authorization: Bearer $TOKEN" \
  -X POST \
  -d '{"feed_url": "http://localhost:8080/internal"}'

# Should return error about invalid URL
```

### Automated Testing

Use these tools for security scanning:

- **OWASP ZAP**: Web application security scanner
- **npm audit**: Check for vulnerable dependencies
- **Snyk**: Automated vulnerability scanning
- **Lighthouse**: Security audit in Chrome DevTools

```bash
# Check for vulnerable dependencies
npm audit

# Fix automatically if possible
npm audit fix
```

## Common Vulnerabilities Addressed

### XSS (Cross-Site Scripting)
- **Mitigation**: CSP headers, React's built-in XSS protection, no `dangerouslySetInnerHTML`

### SQL Injection
- **Mitigation**: Supabase SDK with parameterized queries, RLS policies

### CSRF (Cross-Site Request Forgery)
- **Mitigation**: Supabase JWT tokens, SameSite cookies

### SSRF (Server-Side Request Forgery)
- **Mitigation**: URL validation, internal IP blocking, protocol restrictions

### Authentication Bypass
- **Mitigation**: Required authentication on all endpoints, RLS enforcement

### Rate Limiting Bypass
- **Mitigation**: Per-user rate limiting, session-based tracking

### Clickjacking
- **Mitigation**: X-Frame-Options: DENY, CSP frame-ancestors

### Information Disclosure
- **Mitigation**: No source maps, minified code, secure error messages

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Content Security Policy Guide](https://content-security-policy.com/)
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security)
