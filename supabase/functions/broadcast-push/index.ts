// Admin broadcast push stub.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const supabaseUrl = (Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL"))!;
const serviceKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY"))!;
const PUSH_SERVER_KEY = Deno.env.get("PUSH_SERVER_KEY") || ""; // for future push integration

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return new Response("Unauthorized", { status: 401 });
    const uid = userData.user.id;
    const { data: prof, error: profErr } = await supabase.from("profiles").select("role").eq("id", uid).single();
    if (profErr || prof?.role !== "admin") return new Response("Forbidden", { status: 403 });

    const { message, membersOnly } = await req.json();
    if (!message) return new Response("message required", { status: 400 });

    // audience: all or members only
    let tokens: { token: string }[] | null = null;
    if (membersOnly) {
      const { data: memberIds } = await supabase.from("profiles").select("id").eq("membership_active", true);
      const ids = memberIds?.map((m) => m.id) || [];
      if (ids.length) {
        const { data: tokData } = await supabase.from("push_tokens").select("token").in("user_id", ids);
        tokens = tokData as any;
      } else {
        tokens = [];
      }
    } else {
      const { data: tokData } = await supabase.from("push_tokens").select("token");
      tokens = tokData as any;
    }

    if (tokens && tokens.length > 0) {
      const msgs = tokens.map((t) => ({
        to: t.token,
        sound: "default",
        title: "Atlist",
        body: message,
        data: { broadcast: true },
      }));
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgs),
      });
    }

    await supabase.from("notifications").insert({
      user_id: null,
      type: membersOnly ? "broadcast_members" : "broadcast_all",
      payload: { message },
    });

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});
