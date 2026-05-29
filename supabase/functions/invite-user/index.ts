// @ts-nocheck
// Supabase Edge Function for org admin invites.

/// <reference types="https://deno.land/std@0.208.0/http/server.ts" />

// @deno-types="https://deno.land/std@0.208.0/http/server.ts"
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

// @deno-types="https://esm.sh/@supabase/supabase-js@2.38.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

type InviteRequest = {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  role?: string;
  organizationId?: string;
  organizationName?: string;
  inviterName?: string;
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return json({ error: "method_not_allowed" }, { status: 405 });
    }

    const body = (await req.json()) as InviteRequest;
    const email = body.email?.trim();
    const password = body.password?.trim();
    const name = body.name?.trim() || email?.split("@")[0] || "User";
    const phone = body.phone?.trim() || null;
    const role = body.role?.trim();
    const organizationId = body.organizationId?.trim();
    const inviterName = body.inviterName?.trim() || "Admin";

    if (!email || !password || !role || !organizationId) {
      return json({ error: "missing_fields" }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    const callerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!callerToken) {
      return json({ error: "unauthorized" }, { status: 401 });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: "server_misconfigured" }, { status: 500 });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: callerData, error: callerError } = await supabaseAdmin.auth.getUser(callerToken);
    if (callerError || !callerData.user) {
      return json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: callerProfile, error: callerProfileError } = await supabaseAdmin
      .from("user_profiles")
      .select("organization_id, full_name, role")
      .eq("id", callerData.user.id)
      .maybeSingle();

    if (callerProfileError || !callerProfile) {
      return json({ error: "caller_profile_not_found" }, { status: 404 });
    }

    const callerOrganizationId = callerProfile.organization_id?.trim?.() || callerProfile.organization_id;

    if (!callerOrganizationId || callerOrganizationId !== organizationId) {
      return json({ error: "forbidden_wrong_organization" }, { status: 403 });
    }

    const callerRole = (callerProfile.role || "").toLowerCase();
    if (callerRole !== "admin") {
      return json({ error: "forbidden_admin_only" }, { status: 403 });
    }

    const { data: existingOrg, error: orgLookupError } = await supabaseAdmin
      .from("organizations")
      .select("id, name")
      .eq("id", organizationId)
      .maybeSingle();

    if (orgLookupError) {
      console.error("organization lookup error:", orgLookupError);
      return json({ error: orgLookupError.message }, { status: 500 });
    }

    if (!existingOrg) {
      return json({ error: "organization_not_found" }, { status: 404 });
    }

    const requestedOrganizationName = body.organizationName?.trim();
    if (requestedOrganizationName && requestedOrganizationName !== existingOrg.name) {
      return json({ error: "organization_mismatch" }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        organizationId,
        organizationName: body.organizationName?.trim() || "Organization",
        role,
        name,
        phone,
      },
      app_metadata: {
        organizationId,
        organizationName: body.organizationName?.trim() || "Organization",
        role,
        name,
      },
    });

    if (error) {
      console.error("createUser error:", error);
      return json({ error: error.message }, { status: 500 });
    }

    const profileInsert = await supabaseAdmin.from("user_profiles").upsert({
      id: data.user!.id,
      email,
      organization_id: organizationId,
      full_name: name,
      phone_number: phone,
      role: role.toLowerCase(),
      is_email_verified: true,
      preferences: {},
    });

    if (profileInsert.error) {
      console.error("user_profiles insert error:", profileInsert.error);
      return json({ error: profileInsert.error.message }, { status: 500 });
    }

    console.log("Invitation created for:", email);

    return json({ 
      success: true, 
      user: data.user,
      message: `User created for ${email}`,
    }, { status: 200 });
  } catch (err) {
    console.error(err);
    return json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
});
