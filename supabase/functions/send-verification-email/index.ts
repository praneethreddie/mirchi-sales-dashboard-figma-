// @ts-nocheck
// This file is a Deno edge function that runs in Supabase
// Type checking is disabled because remote module imports are valid in Deno runtime

/// <reference types="https://deno.land/std@0.208.0/http/server.ts" />

// @deno-types="https://deno.land/std@0.208.0/http/server.ts"
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

// @deno-types="https://esm.sh/@supabase/supabase-js@2.38.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

// Type definitions
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  type: "verification" | "password_reset" | "invitation";
  userId?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Email sending service - supports Resend.com (recommended for Deno)
async function sendWithResend(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");

  if (!resendApiKey) {
    return {
      success: false,
      error: "RESEND_API_KEY not configured. Configure in Supabase project settings.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Mirchi Yard <noreply@mirchiyard.com>",
        to,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to send email with Resend",
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Alternative: SendGrid (requires additional setup)
async function sendWithSendGrid(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");

  if (!sendGridApiKey) {
    return {
      success: false,
      error:
        "SENDGRID_API_KEY not configured. Use Resend or configure SendGrid.",
    };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sendGridApiKey}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject,
          },
        ],
        from: {
          email: "noreply@mirchiyard.com",
          name: "Mirchi Yard",
        },
        content: [
          {
            type: "text/html",
            value: html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `SendGrid error: ${response.status} - ${error}`,
      };
    }

    // SendGrid returns 202 Accepted
    const messageId = response.headers.get("X-Message-Id");
    return {
      success: true,
      messageId: messageId || "sent",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Log email sending attempt
async function logEmailAttempt(
  userId: string | undefined,
  to: string,
  subject: string,
  type: string,
  success: boolean,
  messageId: string | undefined,
  error: string | undefined
): Promise<void> {
  try {
    await supabase.from("email_logs").insert({
      user_id: userId,
      recipient: to,
      subject,
      email_type: type,
      status: success ? "sent" : "failed",
      message_id: messageId,
      error_message: error,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to log email attempt:", err);
    // Don't fail the request if logging fails
  }
}

// Main handler
serve(async (req: Request) => {
  // Only accept POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const payload: EmailRequest = await req.json();

    // Validate required fields
    if (!payload.to || !payload.subject || !payload.html || !payload.type) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, html, type",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Send email using Resend (primary) or SendGrid (fallback)
    let result = await sendWithResend(payload.to, payload.subject, payload.html);

    // Fallback to SendGrid if Resend fails
    if (!result.success && !Deno.env.get("RESEND_API_KEY")) {
      result = await sendWithSendGrid(
        payload.to,
        payload.subject,
        payload.html
      );
    }

    // Log the email attempt
    await logEmailAttempt(
      payload.userId,
      payload.to,
      payload.subject,
      payload.type,
      result.success,
      result.messageId,
      result.error
    );

    // Return response
    if (result.success) {
      return new Response(
        JSON.stringify({
          success: true,
          messageId: result.messageId,
          message: "Email sent successfully",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || "Failed to send email",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Edge function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

/* DEPLOYMENT INSTRUCTIONS:
  
  1. Prerequisites:
     - Supabase project with send-verification-email edge function
     - Resend API key (https://resend.com) - recommended and easiest
     - OR SendGrid API key (https://sendgrid.com)
  
  2. Deploy with Supabase CLI:
     ```bash
     supabase functions deploy send-verification-email
     ```
  
  3. Set environment variables in Supabase project:
     - Dashboard: Project Settings → Edge Functions → Secrets
     - Add: RESEND_API_KEY=your_resend_key
     - OR: SENDGRID_API_KEY=your_sendgrid_key
  
  4. Test the function:
     ```bash
     supabase functions invoke send-verification-email --local \
       --body '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>","type":"verification"}'
     ```
  
  5. Resend setup (RECOMMENDED):
     - Go to https://resend.com and create free account
     - Copy API key from Resend dashboard
     - Verify sender email (noreply@mirchiyard.com) or use Resend domain
  
  6. Usage from client:
     ```typescript
     const response = await supabase.functions.invoke('send-verification-email', {
       body: {
         to: 'user@example.com',
         subject: 'Verify Your Email',
         html: '<p>Click link to verify</p>',
         type: 'verification',
         userId: 'user-id-optional'
       }
     });
     ```
*/
