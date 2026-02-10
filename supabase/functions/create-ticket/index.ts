// User-facing: create support/bug/feature ticket + first message.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const supabaseUrl = (Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL"))!;
const serviceKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY"))!;

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  try {
    const { category, subject, body, email } = await req.json();
    if (!category || !body) return new Response("category and body required", { status: 400 });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return new Response("Unauthorized", { status: 401 });
    const uid = userData.user.id;

    const { data: ticket } = await supabase
      .from("support_tickets")
      .insert({ category, subject, email: email || userData.user.email, from_user_id: uid })
      .select("id")
      .single();

    if (!ticket?.id) throw new Error("Ticket create failed");

    await supabase.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_type: "user",
      sender_user_id: uid,
      body,
    });

    // TODO: send notification / email / push
    return new Response(JSON.stringify({ ok: true, ticket_id: ticket.id }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});
