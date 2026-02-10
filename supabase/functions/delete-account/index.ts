// Edge Function to delete an auth user and related rows.
// Requires SUPABASE_SERVICE_ROLE_KEY set in the function env.
// Expects Authorization: Bearer <user JWT> and deletes that user.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const supabaseUrl = (Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL"))!;
const serviceKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY"))!;

serve(async (req) => {
  if (req.method !== "DELETE") return new Response("Method Not Allowed", { status: 405 });
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, serviceKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return new Response("Unauthorized", { status: 401 });
    const uid = userData.user.id;

    // Delete related rows
    await supabase.from("user_websites").delete().eq("user_id", uid);
    await supabase.from("user_settings").delete().eq("user_id", uid);
    await supabase.from("support_tickets").delete().eq("user_id", uid);
    await supabase.from("profiles").delete().eq("id", uid);

    // Delete auth user
    const { error: delErr } = await supabase.auth.admin.deleteUser(uid);
    if (delErr) throw delErr;

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});
