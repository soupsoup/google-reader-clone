# Deployment Guide

This guide explains how to deploy your Google Reader Clone application to production with security measures in place.

## Table of Contents

1. [Security Features](#security-features)
2. [Prerequisites](#prerequisites)
3. [Deployment Options](#deployment-options)
4. [Post-Deployment Security](#post-deployment-security)
5. [Monitoring](#monitoring)

## Security Features

This application includes the following security measures:

### Frontend Security

- **Content Security Policy (CSP)**: Restricts resource loading to prevent XSS attacks
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **HTTPS Enforcement**: Strict-Transport-Security header (HSTS)
- **Code Splitting**: Optimized bundle sizes with vendor chunking
- **Asset Caching**: Immutable cache headers for static assets

### Backend Security (Edge Functions)

- **Authentication Required**: All API calls require valid Supabase auth tokens
- **Rate Limiting**: 30 requests per minute per user
- **SSRF Protection**: Blocks requests to internal/private IP addresses
- **Input Validation**: URL validation and protocol restrictions
- **File Size Limits**: Maximum 10MB feed size
- **Request Timeouts**: 10 second timeout for feed fetching
- **CORS Configuration**: Configurable allowed origins

### Database Security

- **Row Level Security (RLS)**: All tables have RLS policies
- **User Isolation**: Users can only access their own data
- **SQL Injection Protection**: Parameterized queries via Supabase client

## Prerequisites

1. **Supabase Project**
   - Create project at [supabase.com](https://supabase.com)
   - Run database migration: `supabase/migrations/001_initial_schema.sql`
   - Deploy edge function: `supabase functions deploy fetch-feeds`
   - Configure function environment variables (see below)

2. **Domain Name** (recommended)
   - For production deployment with custom domain
   - SSL certificate (auto-provisioned by hosting platforms)

3. **Environment Variables**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Deployment Options

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Configure Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Configure CORS in Edge Function**
   Set the `ALLOWED_ORIGINS` environment variable in your Supabase edge function:
   ```bash
   supabase secrets set ALLOWED_ORIGINS=https://your-domain.vercel.app
   ```

**Features:**
- Automatic SSL/TLS certificates
- Global CDN
- Automatic deployments from Git
- Zero configuration
- Built-in analytics

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login and Link**
   ```bash
   netlify login
   netlify link
   ```

3. **Configure Environment Variables**
   ```bash
   netlify env:set VITE_SUPABASE_URL "https://your-project.supabase.co"
   netlify env:set VITE_SUPABASE_ANON_KEY "your-anon-key"
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

5. **Configure CORS in Edge Function**
   ```bash
   supabase secrets set ALLOWED_ORIGINS=https://your-domain.netlify.app
   ```

**Features:**
- Automatic SSL/TLS certificates
- Global CDN
- Automatic deployments from Git
- Built-in forms and functions
- Split testing

### Option 3: Docker (Self-Hosted)

1. **Build Docker Image**
   ```bash
   docker build -t reader-app .
   ```

2. **Create .env file for build**
   ```bash
   # .env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access Application**
   - Application runs on port 8080
   - Health check available at `/health`

5. **Setup Reverse Proxy (NGINX)**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;

       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Configure CORS in Edge Function**
   ```bash
   supabase secrets set ALLOWED_ORIGINS=https://your-domain.com
   ```

**Features:**
- Full control over hosting environment
- Custom server configuration
- Built-in health checks
- Production-ready nginx configuration

### Option 4: Static Hosting (AWS S3, CloudFlare Pages, etc.)

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Upload dist/ folder**
   - Upload contents of `dist/` folder to your static hosting
   - Configure SPA routing (redirect all routes to index.html)

3. **Configure Security Headers**
   - Use `public/_headers` file (works with Netlify/CloudFlare)
   - Or configure headers in your hosting platform

## Post-Deployment Security

### 1. Configure Edge Function CORS

Set allowed origins for your edge function to restrict access:

```bash
# Single origin
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com

# Multiple origins (comma-separated)
supabase secrets set ALLOWED_ORIGINS=https://your-domain.com,https://app.your-domain.com
```

### 2. Enable Supabase Auth Email Confirmation

1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Email Confirmations"
3. Configure email templates

### 3. Configure Supabase Rate Limiting

1. Go to Supabase Dashboard → Settings → API
2. Configure rate limits for your project
3. Consider enabling advanced rate limiting for enterprise plans

### 4. Enable Supabase Auth Security

1. **Email Rate Limiting**: Limit password reset/signup attempts
2. **Session Management**: Configure session timeout
3. **Password Requirements**: Set minimum password strength
4. **MFA**: Consider enabling multi-factor authentication

### 5. Monitor Supabase Logs

1. Go to Supabase Dashboard → Logs
2. Monitor API usage, errors, and suspicious activity
3. Set up log exports for long-term storage

### 6. Database Backups

1. Go to Supabase Dashboard → Database → Backups
2. Enable automatic backups (enabled by default)
3. Configure backup retention period

### 7. Update CSP for Your Domain

Update the Content Security Policy in `index.html` if you're using custom analytics, fonts, or other external resources:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
" />
```

## Monitoring

### Health Checks

For Docker deployments, a health check endpoint is available at `/health`.

### Application Monitoring

Consider implementing:

1. **Error Tracking**: Sentry, Rollbar, or similar
2. **Performance Monitoring**: Web Vitals, Lighthouse CI
3. **Uptime Monitoring**: UptimeRobot, Pingdom
4. **Log Aggregation**: CloudWatch, Datadog, or similar

### Supabase Monitoring

Monitor these metrics in Supabase Dashboard:

- Database CPU and memory usage
- API request rate and errors
- Edge function invocations and errors
- Storage usage
- Active connections

### Security Monitoring

1. **Monitor Auth Events**
   - Failed login attempts
   - Unusual user activity
   - Token refresh patterns

2. **Monitor API Usage**
   - Rate limit hits
   - 4xx/5xx error rates
   - Unusual traffic patterns

3. **Database Monitoring**
   - Slow queries
   - Connection pool usage
   - RLS policy violations

## Performance Optimization

### Frontend Optimization

1. **Enable Compression**: Enabled via nginx.conf or hosting platform
2. **Asset Caching**: Configured via headers
3. **Code Splitting**: Configured in vite.config.ts
4. **Image Optimization**: Use WebP format for custom images

### Database Optimization

1. **Indexes**: Already configured in migration
2. **Connection Pooling**: Managed by Supabase
3. **Query Optimization**: Use React Query for caching

### Edge Function Optimization

1. **Cold Start**: Keep functions warm with scheduled pings
2. **Caching**: Feed data cached at database level (last_fetched_at)
3. **Batch Processing**: Refresh multiple feeds efficiently

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure ALLOWED_ORIGINS is set in edge function
   - Verify domain matches exactly (including https://)

2. **Authentication Errors**
   - Verify Supabase URL and anon key are correct
   - Check if email confirmation is enabled
   - Verify RLS policies are properly configured

3. **Rate Limiting**
   - Default: 30 requests/minute per user
   - Adjust in edge function code if needed
   - Consider upgrading Supabase plan for higher limits

4. **Build Failures**
   - Ensure Node.js version 20 or higher
   - Clear node_modules and package-lock.json
   - Run `npm install` and try again

5. **Feed Fetch Failures**
   - Verify edge function is deployed
   - Check function logs in Supabase Dashboard
   - Ensure feed URL is accessible
   - Verify SSRF protection isn't blocking legitimate URLs

## Security Checklist

- [ ] Supabase RLS policies enabled
- [ ] Edge function authentication enabled
- [ ] CORS properly configured with allowed origins
- [ ] Rate limiting configured
- [ ] HTTPS/SSL certificate installed
- [ ] Security headers configured
- [ ] CSP policy properly set
- [ ] Email confirmation enabled
- [ ] Strong password policy enforced
- [ ] Database backups enabled
- [ ] Monitoring and logging configured
- [ ] Error tracking implemented
- [ ] Supabase environment variables secured
- [ ] Edge function secrets properly set
- [ ] Production environment variables set

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Docker Documentation](https://docs.docker.com)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)
