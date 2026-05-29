import { useState } from "react";
import { Mail, Loader } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onResend: () => Promise<void>;
}

export function EmailVerificationScreen({
  email,
  onVerified,
  onResend,
}: EmailVerificationProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [verificationSent, setVerificationSent] = useState(true);
  const [timeToResend, setTimeToResend] = useState(0);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    try {
      // In production, verify the code with your backend
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    }
  }

  async function handleResend() {
    setIsResending(true);
    setError("");

    try {
      await onResend();
      setVerificationSent(true);
      setTimeToResend(60); // 60 second cooldown

      // Countdown timer
      const interval = setInterval(() => {
        setTimeToResend((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to resend verification"
      );
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Mail size={48} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
            <p className="text-muted-foreground">
              We've sent a verification code to:
            </p>
            <p className="font-semibold text-sm mt-1">{email}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {verificationSent && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              ✓ Check your email inbox (and spam folder)
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Verification Code
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={!code || code.length < 6}
              className="w-full"
              style={{ backgroundColor: "#B91C1C" }}
            >
              Verify Email
            </Button>
          </form>

          <div className="mt-6 text-center text-sm space-y-2">
            <p className="text-muted-foreground">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              disabled={isResending || timeToResend > 0}
              className="text-red-600 hover:text-red-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
              style={{ color: "#B91C1C" }}
            >
              {isResending ? (
                <span className="flex items-center justify-center gap-1">
                  <Loader size={14} className="animate-spin" /> Resending...
                </span>
              ) : timeToResend > 0 ? (
                `Resend in ${timeToResend}s`
              ) : (
                "Resend Code"
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="text-blue-900 font-semibold mb-2">💡 Tip:</p>
            <p className="text-blue-800">
              The code is valid for 24 hours. Use it to verify your email and
              secure your account.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
