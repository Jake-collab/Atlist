// Admin reply to ticket: inserts message and TODO send email/push.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

const supabaseUrl = (Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL"))!;
const serviceKey = (Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY"))!;
const EMAIL_API_KEY = Deno.env.get("EMAIL_API_KEY") || "";
const SUPPORT_FROM = "support@atlist.it.com";
const CONTACT_FROM = "contact@atlist.it.com";

async function sendEmail({ from, to, subject, body }: { from: string; to: string; subject: string; body: string }) {
  // TODO: wire to your provider. This is a stub that just logs.
  if (!EMAIL_API_KEY) {
    console.log("sendEmail stub", { from, to, subject, body });
    return;
  }
  // Implement provider call here using EMAIL_API_KEY
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { Authorization: `Bearer ${token}` } } });
  try {
    const { ticket_id, body } = await req.json();
    if (!ticket_id || !body) return new Response("ticket_id and body required", { status: 400 });
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) return new Response("Unauthorized", { status: 401 });
    const uid = userData.user.id;

    // check admin
    const { data: prof, error: profErr } = await supabase.from("profiles").select("role").eq("id", uid).single();
    if (profErr || prof?.role !== "admin") return new Response("Forbidden", { status: 403 });

    // get ticket + user email
    const { data: ticket, error: tErr } = await supabase
      .from("support_tickets")
      .select("id, category, email, from_user_id")
      .eq("id", ticket_id)
      .single();
    if (tErr || !ticket) return new Response("Ticket not found", { status: 404 });

    await supabase.from("support_messages").insert({
      ticket_id,
      sender_type: "admin",
      sender_user_id: uid,
      body,
    });

    // Email routing
    const fromAddr = ticket.category === "feature" ? CONTACT_FROM : SUPPORT_FROM;
    if (ticket.email) {
      await sendEmail({
        from: fromAddr,
        to: ticket.email,
        subject: `[Atlist] Reply to your ${ticket.category} ticket`,
        body,
      });
    }

    // Notification + push
    if (ticket.from_user_id) {
      await supabase.from("notifications").insert({
        user_id: ticket.from_user_id,
        type: "ticket_reply",
        payload: { ticket_id, category: ticket.category },
      });
      const { data: tokens } = await supabase.from("push_tokens").select("token").eq("user_id", ticket.from_user_id);
      if (tokens && tokens.length > 0) {
        const msgs = tokens.map((t) => ({
          to: t.token,
          sound: "default",
          title: "Support replied",
          body: "Check your email for details.",
          data: { ticket_id: ticket.id },
        }));
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msgs),
        });
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});
