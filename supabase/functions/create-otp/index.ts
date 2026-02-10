// Edge Function stub for creating an email OTP.
// TODO: provide an email sender (SMTP/API) and set env vars:
// EMAIL_API_KEY / SMTP_HOST / SMTP_USER / SMTP_PASS, etc.
// Expects body: { email, user_id }

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";


const supabaseUrl = (Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL"))!;
const supabaseServiceKey = (Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))!;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const { email, user_id } = await req.json();
    if (!email || !user_id) return new Response("email and user_id required", { status: 400 });
    const code = crypto.randomUUID().split("-")[0]; // simple short code
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
    await supabase.from("otp_codes").insert({ user_id, email, code, expires_at, used: false });
    // TODO: send email with the code using your email provider/API
    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});
