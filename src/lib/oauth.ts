/**
 * OAuth is intentionally disabled in this build.
 * Authentication is email/phone + password only.
 */

export type OAuthProvider = never;

export interface OAuthConfig {
  provider: OAuthProvider;
  redirectTo: string;
  scopes?: string[];
}

export interface OAuthSession {
  provider: OAuthProvider;
  user_id: string;
  email: string;
  email_verified: boolean;
  verified_at: string | null;
  provider_id: string;
  created_at: string;
}

export async function signInWithOAuth() {
  return {
    data: null,
    error: new Error("OAuth sign-in is disabled. Use email/phone and password."),
  };
}

export async function handleOAuthCallback() {
  return {
    success: false,
    session: null,
    user: null,
    error: new Error("OAuth callback is disabled."),
  };
}

export async function sendEmailVerification() {
  return { success: true, error: null };
}

export async function verifyEmail() {
  return { success: true, error: null };
}

export async function isEmailVerified(): Promise<boolean> {
  return true;
}

export async function getOAuthProvider(): Promise<OAuthProvider | null> {
  return null;
}

export async function unlinkOAuthProvider() {
  return { success: false, error: new Error("OAuth is disabled") };
}

export const OAUTH_PROVIDERS = {} as const;
