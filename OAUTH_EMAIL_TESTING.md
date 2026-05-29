# OAuth & Email Verification Testing Guide

## Test Environment Setup

### Prerequisites
- Development environment running (`pnpm dev`)
- Supabase project configured
- At least one OAuth provider configured (Google, GitHub, or Microsoft)
- Email service configured (Resend or SendGrid)
- Supabase edge function deployed

---

## Test Case 1: Google OAuth Sign-In Flow

### Setup
1. Ensure Google OAuth credentials are configured in Supabase
2. Set `VITE_GOOGLE_CLIENT_ID` in `.env.local`

### Steps
1. Navigate to `http://localhost:5173/login`
2. Click "Sign Up"
3. Click "Google" button (with magnifying glass icon)
4. You'll be redirected to Google login
5. Sign in with your Google account
6. Grant required permissions (email, profile)
7. Redirected back to app at `/auth/callback`
8. Processing screen displays with loading spinner

### Expected Results
- ✅ Callback URL matches configured value
- ✅ Authorization code exchanged for session
- ✅ User created in `auth.users` table
- ✅ Entry added to `oauth_sessions` table
- ✅ Redirect to email verification screen

### Database Verification
```sql
-- Check newly created user
SELECT id, email, created_at FROM auth.users 
WHERE email LIKE 'yourgoogleemail%' 
ORDER BY created_at DESC LIMIT 1;

-- Check OAuth session
SELECT user_id, provider, email_verified, created_at FROM oauth_sessions
WHERE provider = 'google'
ORDER BY created_at DESC LIMIT 1;
```

---

## Test Case 2: GitHub OAuth Sign-In Flow

### Setup
1. Ensure GitHub OAuth credentials configured in Supabase
2. Set `VITE_GITHUB_CLIENT_ID` in `.env.local`

### Steps
1. Navigate to `http://localhost:5173/login`
2. Click "Sign Up"
3. Click "GitHub" button (with octopus icon)
4. You'll be redirected to GitHub
5. Sign in with GitHub account
6. Authorize application
7. Redirected back to app
8. Email verification screen shown

### Expected Results
- ✅ GitHub account connected successfully
- ✅ Email extracted from GitHub profile
- ✅ OAuth session created with provider='github'
- ✅ Verification email sent to GitHub email address

---

## Test Case 3: Microsoft OAuth Sign-In Flow

### Setup
1. Ensure Microsoft OAuth credentials configured in Supabase
2. Set `VITE_MICROSOFT_CLIENT_ID` and `VITE_MICROSOFT_TENANT_ID` in `.env.local`

### Steps
1. Navigate to `http://localhost:5173/login`
2. Click "Sign Up"
3. Click "Microsoft" button (with Windows icon)
4. Redirected to Microsoft login
5. Sign in with Microsoft/Outlook account
6. Grant permissions
7. Redirected back to app
8. Email verification screen appears

### Expected Results
- ✅ Microsoft account authenticated
- ✅ OAuth session created with provider='microsoft'
- ✅ Email verification triggered

---

## Test Case 4: Email Verification - Valid Token

### Prerequisites
- Completed OAuth sign-in (Test Case 1, 2, or 3)
- Email verification screen should be displayed
- Check email (including spam) for verification code

### Steps
1. Copy 6-digit verification code from email
2. Paste into verification code input field
3. Click "Verify" button or press Enter
4. Wait for processing

### Expected Results
- ✅ Code accepted and validated
- ✅ Toast notification: "Email verified successfully"
- ✅ Redirect to dashboard
- ✅ `user_profiles.email_verified` set to `true`
- ✅ `oauth_sessions.email_verified` set to `true`

### Database Verification
```sql
SELECT user_id, email_verified, verified_at FROM user_profiles
WHERE user_id = 'your-user-id' LIMIT 1;
```

---

## Test Case 5: Email Verification - Invalid Token

### Prerequisites
- Email verification screen displayed
- Know what NOT to enter

### Steps
1. Enter incorrect 6-digit code (e.g., "000000")
2. Click "Verify"
3. Wait for response

### Expected Results
- ✅ Error message: "Invalid or expired verification code"
- ✅ Input field cleared
- ✅ Remain on verification screen
- ✅ Resend button still available
- ✅ Database shows failed attempt in `email_verifications.attempts`

### Database Verification
```sql
SELECT token, attempts, status FROM email_verifications
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC LIMIT 1;
```

---

## Test Case 6: Email Verification - Expired Token

### Prerequisites
- Email verification screen active
- Wait 24+ hours since registration (OR use database to expire token)

### Steps

**Option A - Using Database (Testing Only)**
```sql
UPDATE email_verifications 
SET expires_at = NOW() - INTERVAL '1 minute'
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC LIMIT 1;
```

Then try to verify with the original code.

**Option B - Wait 24 Hours**
1. Complete OAuth sign-in
2. Wait 24+ hours
3. Try to verify with email code

### Expected Results
- ✅ Error message: "Verification code has expired"
- ✅ "Resend code" button enabled
- ✅ Must use resend to get new code

---

## Test Case 7: Email Verification - Resend Code

### Prerequisites
- Email verification screen displayed
- Already received one code

### Steps
1. Click "Resend code" button
2. Button becomes disabled for 60-second countdown
3. Wait for email to arrive
4. Check inbox/spam for new code
5. New code should be different from first code

### Expected Results
- ✅ Button shows "Resend in 60s" countdown
- ✅ New verification email sent
- ✅ New email has different verification code
- ✅ Old token invalidated in database
- ✅ Attempt counter reset on new token
- ✅ After 60 seconds, button re-enabled

### Database Verification
```sql
SELECT token, created_at, used_at FROM email_verifications
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC LIMIT 2;
-- Should show 2 tokens, first one with used_at = NULL or old time
```

---

## Test Case 8: Email Verification - Max Attempts Exceeded

### Prerequisites
- Email verification screen displayed
- Know the verification code

### Steps
1. Enter wrong code 5 times
2. Click "Verify" after each attempt
3. On 5th attempt, observe response

### Expected Results
- ✅ First 4 invalid attempts show error, allow retry
- ✅ After 5th attempt: "Too many failed attempts. Please request a new code."
- ✅ Resend button becomes available
- ✅ Old token invalidated
- ✅ May require new resend to continue

### Database Verification
```sql
SELECT attempts, status FROM email_verifications
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC LIMIT 1;
-- Should show attempts = 5, status = 'failed' or 'expired'
```

---

## Test Case 9: Complete Registration Flow

### Steps (Execute entire flow)
1. Go to `http://localhost:5173/login`
2. Click "Sign Up"
3. Select OAuth provider (Google, GitHub, or Microsoft)
4. Complete OAuth authentication
5. Enter verification code from email
6. Should land on dashboard

### Expected Results
- ✅ User account created
- ✅ User profile created
- ✅ Email verified
- ✅ Session created
- ✅ Can access dashboard
- ✅ Logout works correctly

### Database Verification
```sql
SELECT 
  u.id, u.email, u.created_at,
  p.organization_id, p.email_verified, p.role,
  os.provider, os.email_verified as oauth_verified
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
LEFT JOIN oauth_sessions os ON u.id = os.user_id
WHERE u.email = 'your-test-email'
LIMIT 1;
```

---

## Test Case 10: Multiple OAuth Providers - Same Email

### Prerequisites
- Completed sign-up with one provider (e.g., Google)
- Email verified
- User account exists

### Steps
1. Sign out
2. Go back to login
3. Click "Sign Up"
4. Choose different provider (e.g., GitHub) using same email
5. Authorize

### Expected Results
**Expected Behavior (Design Goal):**
- ✅ Detect existing user by email
- ✅ Link new provider to existing account
- ✅ No duplicate user created
- ⚠️ May show message: "Account already exists. This provider has been linked."

**Current Implementation Note:**
Check if linking is implemented. If not, might create new entry or show error. Update based on actual behavior.

### Database Verification
```sql
SELECT user_id, provider, created_at FROM oauth_sessions
WHERE user_id = 'your-user-id'
ORDER BY created_at;
-- Should show multiple providers for same user_id
```

---

## Test Case 11: Error Handling - OAuth Provider Unavailable

### Setup (Development Only)
1. Disable internet connection, OR
2. Temporarily block provider domain in firewall, OR
3. Use invalid OAuth credentials

### Steps
1. Click OAuth provider button
2. Wait for error response
3. Check error message displayed

### Expected Results
- ✅ Error message displayed below buttons
- ✅ User remains on login page
- ✅ Can retry sign-in
- ✅ Can try different provider
- ✅ Console shows detailed error

---

## Test Case 12: Security - Token Reuse Prevention

### Prerequisites
- Email verification screen active with valid code

### Steps
1. Note the verification code
2. Verify email successfully
3. Try to use same code again
4. Go back to verification screen (logout and retry OAuth)
5. Try to use old code

### Expected Results
- ✅ Old code rejected: "Verification code has expired or already used"
- ✅ Must request new code
- ✅ Database shows `used_at` timestamp on token

### Database Verification
```sql
SELECT user_id, token_hash, used_at, status FROM email_verifications
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC LIMIT 1;
-- Should show used_at populated with timestamp
```

---

## Test Case 13: Multi-Tenant Data Isolation

### Prerequisites
- Two different users with different OAuth providers
- Both emails verified
- Both users logged in (in different browsers or incognito windows)

### Steps
1. User A: Log in with Google
2. Create supplier entry as User A
3. User B: Log in with GitHub (different email)
4. Check if User B can see User A's suppliers

### Expected Results
- ✅ User A sees only their organization's data
- ✅ User B sees only their organization's data
- ✅ User B CANNOT see User A's suppliers
- ✅ RLS policies prevent cross-org access

### Database Verification
```sql
-- As User A (get user_id from session)
SELECT organization_id FROM user_profiles WHERE user_id = 'user-a-id';
-- Then verify suppliers are filtered by org

-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('suppliers', 'customers', 'sales')
AND schemaname = 'public';
-- All should show 'on' (true)
```

---

## Test Case 14: Email Log Tracking

### Prerequisites
- Completed at least 2 email verifications (sign-ups or resends)

### Steps
1. Open Supabase dashboard → SQL Editor
2. Run email log query
3. Verify all email sends are tracked

### Query
```sql
SELECT 
  id, user_id, recipient, subject, status, 
  message_id, error_message, sent_at
FROM email_logs
ORDER BY sent_at DESC
LIMIT 20;
```

### Expected Results
- ✅ Each verification email appears as row
- ✅ Status = 'sent' for successful sends
- ✅ Status = 'failed' for failed sends
- ✅ message_id populated from email service
- ✅ error_message populated only for failures
- ✅ sent_at timestamp accurate

---

## Test Case 15: Callback URL Mismatch Error

### Prerequisites
- Intentionally misconfigure callback URL

### Steps
1. In .env.local, change `VITE_OAUTH_CALLBACK_URL` to wrong value
2. Click OAuth provider button
3. Try to complete OAuth flow

### Expected Results
- ✅ OAuth provider rejects callback URL
- ✅ Error page with message about redirect URI mismatch
- ✅ No database entries created
- ✅ Instructions to configure correct callback URL

---

## Performance Testing

### Test Case 16: Email Verification Performance

### Steps
1. Complete 10 successive OAuth sign-ups
2. Verify emails for all 10
3. Measure response times

### Expected Results
- ✅ OAuth callback completes in < 2 seconds
- ✅ Email verification completes in < 1 second
- ✅ Email sends within 5 seconds (via edge function)
- ✅ No database locks or timeouts
- ✅ RLS policies don't cause performance issues

---

## Regression Testing Checklist

After any changes to OAuth or email verification:

- [ ] OAuth sign-in works with all 3 providers
- [ ] Email verification code is valid and unique
- [ ] Resend code generates new token
- [ ] Token expiry enforced at 24 hours
- [ ] Attempt limiting prevents brute force
- [ ] Database RLS policies prevent data leaks
- [ ] Multi-tenant isolation works
- [ ] Email logs track all sends
- [ ] Error messages are user-friendly
- [ ] Callback URL validation works

---

## Browser Developer Tools Checklist

When testing, check:

### Network Tab
- [ ] OAuth redirect request successful (302)
- [ ] Callback URL request successful (302)
- [ ] Email verification API call successful (200/201)
- [ ] No CORS errors
- [ ] No 401/403 errors

### Console Tab
- [ ] No JavaScript errors
- [ ] No TypeScript warnings
- [ ] OAuth state parameter logged (debug only)
- [ ] Session token logged (debug only)

### Application Tab (Cookies/Storage)
- [ ] Supabase session cookie set
- [ ] JWT token in localStorage
- [ ] Organization ID stored correctly
- [ ] No sensitive data exposed

### Performance Tab
- [ ] OAuth flow completes in reasonable time
- [ ] Email verification doesn't block UI
- [ ] No memory leaks during repeated attempts

---

## Summary

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Google OAuth | ✅ OAuth session created | ⏳ Pending |
| GitHub OAuth | ✅ OAuth session created | ⏳ Pending |
| Microsoft OAuth | ✅ OAuth session created | ⏳ Pending |
| Email Verify (Valid) | ✅ Email verified | ⏳ Pending |
| Email Verify (Invalid) | ✅ Error shown | ⏳ Pending |
| Email Verify (Expired) | ✅ Resend needed | ⏳ Pending |
| Resend Code | ✅ New code sent | ⏳ Pending |
| Max Attempts | ✅ Locked after 5 | ⏳ Pending |
| Full Registration | ✅ Complete flow | ⏳ Pending |
| Multiple Providers | ✅ Account linked | ⏳ Pending |
| Provider Error | ✅ Error handled | ⏳ Pending |
| Token Reuse | ✅ Prevented | ⏳ Pending |
| Multi-Tenant | ✅ Data isolated | ⏳ Pending |
| Email Logs | ✅ All tracked | ⏳ Pending |
| Callback Mismatch | ✅ Error shown | ⏳ Pending |

---

**Last Updated:** December 2024  
**Version:** 1.0  
**Test Coverage:** 15 test cases
