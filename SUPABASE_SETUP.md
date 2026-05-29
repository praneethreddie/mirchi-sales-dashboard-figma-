# Supabase OAuth & Database Integration Guide

## Overview

This guide covers the complete setup for OAuth authentication with email verification and the multi-tenant database schema for the Sales and Inventory Management System.

---

## Part 1: Supabase Project Setup

### Prerequisites
- Supabase account (https://supabase.com)
- Supabase CLI installed (`npm install -g supabase`)
- Node.js and pnpm installed

### 1.1 Initialize Supabase Project

```bash
cd "d:\Downloads\Sales and Inventory Management System"

# Initialize Supabase
supabase init

# Create new project in Supabase dashboard
# Get project URL and anon key from Supabase dashboard
```

### 1.2 Environment Variables

Create or update `.env.local` with:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Development OAuth Callback (update for production)
VITE_OAUTH_CALLBACK_URL=http://localhost:5173/auth/callback

# Email Verification
VITE_EMAIL_VERIFICATION_EXPIRY=24h
```

Update `.env` for edge functions:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email Service (Resend recommended)
RESEND_API_KEY=your-resend-api-key
# OR
SENDGRID_API_KEY=your-sendgrid-api-key
```

---

## Part 2: OAuth Provider Configuration

### 2.1 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Sales & Inventory Management"
3. Enable OAuth 2.0:
   - APIs & Services → Library
   - Search "Google+ API"
   - Click Enable
4. Create OAuth Consent Screen:
   - OAuth consent screen → External → Fill required fields
   - Add scopes: `email`, `profile`, `openid`
5. Create OAuth Credentials:
   - Credentials → Create OAuth 2.0 Client ID
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:5173`
     - `https://your-production-domain.com`
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/callback`
     - `https://your-production-domain.com/auth/callback`
     - `https://your-project.supabase.co/auth/v1/callback` (for Supabase)
6. Copy Client ID and Secret

### 2.2 Configure Google in Supabase

1. Supabase Dashboard → Authentication → Providers
2. Google:
   - Enable Google provider
   - Add Client ID from Google Cloud Console
   - Add Client Secret
   - Save

Environment variable:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### 2.3 GitHub OAuth Setup

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create New OAuth App:
   - Application name: "Sales & Inventory"
   - Homepage URL: `http://localhost:5173` (or your domain)
   - Authorization callback URL: `http://localhost:5173/auth/callback`
3. Generate new client secret
4. Copy Client ID and Secret

### 2.4 Configure GitHub in Supabase

1. Supabase Dashboard → Authentication → Providers
2. GitHub:
   - Enable GitHub provider
   - Add Client ID
   - Add Client Secret
   - Save

Environment variable:
```env
VITE_GITHUB_CLIENT_ID=your-client-id
```

### 2.5 Microsoft OAuth Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Azure Active Directory → App registrations → New registration
   - Name: "Sales & Inventory Management"
   - Supported account types: Accounts in any organizational directory
3. Certificates & secrets:
   - Create new client secret
   - Copy secret value (won't show again!)
4. Authentication:
   - Platform configuration → Web
   - Redirect URI: `http://localhost:5173/auth/callback`
5. API permissions:
   - Add Microsoft Graph:
     - `email` (delegated)
     - `openid` (delegated)
     - `profile` (delegated)

### 2.6 Configure Microsoft in Supabase

1. Supabase Dashboard → Authentication → Providers
2. Azure (Microsoft):
   - Enable Azure provider
   - Add Tenant ID (from Azure Portal → Directory properties)
   - Add Client ID (Application ID)
   - Add Client Secret
   - Save

Environment variable:
```env
VITE_MICROSOFT_CLIENT_ID=your-client-id
VITE_MICROSOFT_TENANT_ID=your-tenant-id
```

---

## Part 3: Database Setup

### 3.1 Execute Migration

**Option A: Using Supabase CLI**

```bash
# Push migration to Supabase
supabase db push

# Verify migration
supabase db remote set
```

**Option B: Using Supabase Dashboard**

1. Go to Supabase Dashboard → SQL Editor
2. Create new query
3. Copy contents of `supabase/migrations/20260529_create_schema.sql`
4. Paste into SQL editor
5. Click "Run"

### 3.2 Verify Schema

Check that all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- organizations
- oauth_sessions
- email_verifications
- user_profiles
- suppliers
- customers
- batches
- sales
- payments
- activity_logs
- email_logs
- organization_invitations

---

## Part 4: Email Service Setup

### Option A: Resend (Recommended)

**Advantages:**
- Free tier (100 emails/day)
- Easy integration
- Works with Deno edge functions
- No additional configuration

**Setup:**

1. Go to https://resend.com
2. Sign up for free account
3. Create API key in dashboard
4. Set environment variable:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
5. Verify sender domain (or use Resend domain for testing)

### Option B: SendGrid

**Setup:**

1. Go to https://sendgrid.com
2. Create free account
3. Create API key in Settings → API Keys
4. Verify sender email in Settings → Sender Authentication
5. Set environment variable:
   ```env
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

### Option C: Gmail SMTP (Development Only)

Not recommended for production, but works for testing.

---

## Part 5: Deploy Edge Functions

### 5.1 Deploy Email Function

```bash
# From project root
supabase functions deploy send-verification-email

# Test locally first
supabase start  # Start local Supabase

# In another terminal
supabase functions invoke send-verification-email --local \
  --body '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test</p>",
    "type": "verification"
  }'
```

### 5.2 Set Edge Function Secrets

```bash
# Set Resend API key
supabase secrets set RESEND_API_KEY=your-key --project-id your-project-id

# OR Set SendGrid API key
supabase secrets set SENDGRID_API_KEY=your-key --project-id your-project-id
```

Or via Supabase Dashboard:
- Project Settings → Edge Functions → Secrets
- Add RESEND_API_KEY or SENDGRID_API_KEY

---

## Part 6: Application Setup

### 6.1 Update Supabase Client

File: `src/lib/supabase.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

Ensure file exists and is properly configured.

### 6.2 Verify Components Integration

Check that the following files exist:
- ✅ `src/lib/oauth.ts` - OAuth implementation
- ✅ `src/lib/emailVerification.ts` - Email verification flow
- ✅ `src/app/components/OAuthLoginButtons.tsx` - OAuth UI
- ✅ `src/app/components/EmailVerificationScreen.tsx` - Verification UI
- ✅ `src/app/components/OAuthCallback.tsx` - Callback handler
- ✅ `src/app/components/LoginPage.tsx` - Updated with OAuth

### 6.3 Route Configuration

Add OAuth callback route in your router. Example for TanStack Router or React Router:

```typescript
// If using React Router
import { OAuthCallback } from "./components/OAuthCallback";

const routes = [
  {
    path: "/auth/callback",
    element: <OAuthCallback />
  },
  {
    path: "/login",
    element: <LoginPage />
  }
];
```

---

## Part 7: Testing the Complete Flow

### 7.1 Local Development Testing

```bash
# Start development server
pnpm dev

# Start local Supabase (optional)
supabase start

# Visit http://localhost:5173
```

### 7.2 Test OAuth Sign In

1. Click "Sign Up" on login page
2. Choose OAuth provider (Google, GitHub, or Microsoft)
3. You'll be redirected to provider
4. Grant permissions
5. You'll be redirected to `/auth/callback`
6. Email verification screen should appear
7. Check email for verification code
8. Enter code to complete signup

### 7.3 Test Email Verification

1. Check browser console for any errors
2. Verify email was sent (check spam folder)
3. Copy verification code from email
4. Paste into verification screen
5. Should see success message

### 7.4 Check Database

In Supabase Dashboard SQL Editor:

```sql
-- Check users
SELECT id, email FROM auth.users;

-- Check profiles
SELECT user_id, organization_id, email_verified, created_at 
FROM user_profiles;

-- Check OAuth sessions
SELECT user_id, provider, email_verified, created_at 
FROM oauth_sessions;

-- Check email logs
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 10;
```

---

## Part 8: Production Deployment

### 8.1 Environment Variables

Add to production environment (.env.production or deployment platform):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_OAUTH_CALLBACK_URL=https://yourdomain.com/auth/callback
```

### 8.2 Update OAuth Callback URLs

For each OAuth provider (Google, GitHub, Microsoft), add production callback URL:
```
https://yourdomain.com/auth/callback
```

Also add to Supabase if using Supabase Auth redirect:
```
https://your-project.supabase.co/auth/v1/callback
```

### 8.3 Deploy Edge Functions

```bash
supabase functions deploy send-verification-email --project-id your-prod-project-id
```

### 8.4 Set Production Secrets

```bash
supabase secrets set RESEND_API_KEY=your-key --project-id your-prod-project-id
```

### 8.5 Enable RLS Policies

Verify RLS is enabled on all tables:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('organizations', 'user_profiles', 'oauth_sessions', 'email_verifications');
```

All should show `rowsecurity = true`.

---

## Part 9: Security Considerations

### 9.1 Row Level Security (RLS)

The database includes RLS policies that:
- Prevent users from accessing other organizations' data
- Allow only authorized users to update records
- Enforce organization_id in all queries

✅ **Enabled on all 12 tables**

### 9.2 Email Verification

- Tokens expire after 24 hours
- Tokens are hashed in the database
- 5 attempt limit per token
- Resend cooldown to prevent spam

### 9.3 OAuth Security

- PKCE flow for code exchange
- State parameter validation
- Secure token storage in HttpOnly cookies
- Provider-specific scope validation

### 9.4 Environment Variables

Never commit `.env` files. Use:
- `.env.local` for development (git ignored)
- Platform secrets for production deployment
- Supabase dashboard for edge function secrets

---

## Part 10: Troubleshooting

### OAuth redirect not working

**Issue:** Callback URL mismatch
**Solution:** 
- Verify callback URL in OAuth provider matches exactly
- Check `VITE_OAUTH_CALLBACK_URL` environment variable
- Ensure callback route exists in router

### Email not sending

**Issue:** RESEND_API_KEY or SENDGRID_API_KEY not set
**Solution:**
- Set edge function secrets in Supabase dashboard
- Verify API key is valid in provider dashboard
- Check email logs in database for error messages

### Database migration failed

**Issue:** SQL syntax errors or missing dependencies
**Solution:**
- Verify auth.users table exists (Supabase Auth)
- Check RLS is enabled on auth schema
- Run migration in SQL editor for more detailed error messages

### Authentication not persisting

**Issue:** Session not being stored
**Solution:**
- Check browser cookies are enabled
- Verify Supabase session configuration
- Check browser console for CORS errors

### Test credentials not working

**Issue:** Demo login fails
**Solution:**
- Demo accounts are in local AuthContext only
- Switch to OAuth for production
- Create account with OAuth provider

---

## Part 11: API Reference

### OAuth Functions

**src/lib/oauth.ts**

```typescript
// Initiate OAuth sign-in
async function signInWithOAuth(
  provider: "google" | "github" | "microsoft",
  options?: { redirectTo?: string }
): Promise<void>

// Handle OAuth callback
async function handleOAuthCallback(
  code: string,
  options?: { provider?: string; state?: string }
): Promise<{ success: boolean; error?: string }>

// Check if email verified
async function isEmailVerified(userId: string): Promise<boolean>

// Get user's OAuth provider
async function getOAuthProvider(userId: string): Promise<string | null>
```

### Email Verification Functions

**src/lib/emailVerification.ts**

```typescript
// Generate token and send verification email
async function generateVerificationToken(
  userId: string,
  email: string,
  verificationUrl: string
): Promise<{ token: string; error?: string }>

// Verify email with token
async function verifyEmailWithToken(
  userId: string,
  token: string
): Promise<{ success: boolean; error?: string }>

// Resend verification email
async function resendVerificationEmail(
  userId: string,
  email: string,
  verificationUrl: string
): Promise<{ success: boolean; error?: string }>

// Check verification status
async function checkEmailVerificationStatus(
  userId: string
): Promise<boolean>
```

---

## Part 12: Next Steps

1. **Create custom Supabase Auth UI** if needed
2. **Implement password reset flow** using similar email verification
3. **Add two-factor authentication** for enhanced security
4. **Set up database backups** in Supabase dashboard
5. **Configure custom domains** for emails (e.g., noreply@yourdomain.com)
6. **Implement user profile management** screen
7. **Add organization member management** with invitations

---

## Support & Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase Auth Guides](https://supabase.io/docs/guides/auth)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [Resend Documentation](https://resend.com/docs)
- [SendGrid Documentation](https://docs.sendgrid.com)

---

**Created:** December 2024  
**Last Updated:** December 2024  
**Version:** 1.0  
**Status:** Production Ready
