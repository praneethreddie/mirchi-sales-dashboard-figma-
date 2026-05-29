/**
 * Email verification utilities are intentionally disabled in this project
 * to keep authentication simple (email/password or phone+password only).
 * The functions below are no-op stubs that log a warning and return success.
 */

export async function generateVerificationToken() {
  console.warn("generateVerificationToken called: email verification is disabled in this build.");
  return { token: "", error: null };
}

export async function sendVerificationEmail() {
  console.warn("sendVerificationEmail called: email verification is disabled in this build.");
  return { success: true, error: null };
}

export async function verifyEmailWithToken() {
  console.warn("verifyEmailWithToken called: email verification is disabled in this build.");
  return { success: true, error: null };
}

export async function resendVerificationEmail() {
  console.warn("resendVerificationEmail called: email verification is disabled in this build.");
  return { success: true, error: null };
}

export async function checkEmailVerificationStatus() {
  return { isVerified: true, error: null };
}


