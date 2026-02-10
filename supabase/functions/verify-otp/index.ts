// Edge Function stub for verifying an email OTP.
// Expects body: { email, code }
// TODO: integrate with your auth flow (mark 2FA verified).

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";


const supabaseUrl = (Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL"))!;
const supabaseServiceKey = (Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"))!;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    const { email, code } = await req.json();
    if (!email || !code) return new Response("email and code required", { status: 400 });
    const { data, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .order("expires_at", { ascending: false })
      .limit(1);
    if (error || !data || data.length === 0) {
      return new Response(JSON.stringify({ ok: false, reason: "invalid" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const otp = data[0];
    if (new Date(otp.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ ok: false, reason: "expired" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    await supabase.from("otp_codes").update({ used: true }).eq("id", otp.id);
    return new Response(JSON.stringify({ ok: true, user_id: otp.user_id }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});
