# 🔒 TINNY Security Checklist

## ✅ Before Deployment

### Environment Variables
- [ ] All API keys are in environment variables (not hardcoded)
- [ ] `.env` file is in `.gitignore`
- [ ] `.env.example` created (without real values)
- [ ] Production environment variables set in Vercel

### Authentication & Authorization
- [ ] Row Level Security (RLS) enabled on all Supabase tables
- [ ] User authentication required for all protected routes
- [ ] API routes validate user authentication
- [ ] Email verification enabled in Supabase
- [ ] Password requirements: minimum 6 characters

### Input Validation
- [ ] All user inputs are validated
- [ ] String inputs are sanitized (HTML tags removed)
- [ ] Length limits enforced on all text fields
- [ ] Email validation in place
- [ ] Username validation (alphanumeric + underscore)
- [ ] Event data validation before saving

### Rate Limiting
- [ ] API rate limiting implemented (100 req/min)
- [ ] Rate limiting per IP address
- [ ] OpenAI API usage monitored
- [ ] Supabase query limits understood

### Security Headers
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Content-Security-Policy configured
- [ ] Referrer-Policy set
- [ ] Permissions-Policy configured

### Database Security
- [ ] RLS policies tested for all tables
- [ ] No direct database access without authentication
- [ ] Service role key only used server-side
- [ ] Database backups enabled in Supabase
- [ ] Read-only access for anon key

### API Security
- [ ] All API routes check authentication
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] SQL injection protection (using Supabase client)
- [ ] XSS protection (React escaping + sanitization)

### Third-Party Services
- [ ] OpenAI API key has spending limits
- [ ] Supabase project has reasonable limits
- [ ] OAuth providers properly configured
- [ ] Webhook secrets stored securely

## 🔍 Post-Deployment Monitoring

### Regular Checks
- [ ] Monitor API usage and costs
- [ ] Check for failed authentication attempts
- [ ] Review error logs weekly
- [ ] Monitor database growth
- [ ] Check rate limit hits

### Updates
- [ ] Keep dependencies updated
- [ ] Review Supabase security advisories
- [ ] Update Node.js when needed
- [ ] Review and update CSP as needed

## 🚨 Incident Response

If security issue detected:
1. Rotate compromised API keys immediately
2. Review access logs
3. Notify affected users if needed
4. Document the incident
5. Implement additional safeguards

## 📞 Security Contacts

- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
- **OpenAI Support**: https://help.openai.com/

## 🎯 Security Best Practices

1. **Never** commit `.env` files
2. **Always** validate user input
3. **Use** parameterized queries (Supabase client does this)
4. **Enable** 2FA on all service accounts
5. **Monitor** API usage and costs
6. **Update** dependencies regularly
7. **Test** RLS policies thoroughly
8. **Limit** data exposure in API responses
9. **Log** security events
10. **Review** access permissions quarterly

---

**Security is an ongoing process. Review this checklist regularly!**
