import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";
import Stripe from "https://esm.sh/stripe@14.18.0?target=deno&deno-std=0.177.0";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const supabaseUrl = Deno.env.get("PROJECT_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  if (!stripeSecret) {
    return new Response(JSON.stringify({ error: "Missing Stripe secret" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!supabaseUrl || !supabaseAnon) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profErr || profile?.role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { paymentIntentId, amountCents } = body ?? {};
    if (!paymentIntentId) {
      return new Response(JSON.stringify({ error: "paymentIntentId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeSecret, {
      apiVersion: "2024-06-20",
    });

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amountCents, // omit for full refund
    });

    return new Response(JSON.stringify({ refund }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
