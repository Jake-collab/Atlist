// Returns simple revenue summary from Stripe.
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.18.0?target=deno&deno-std=0.177.0";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");

serve(async (req) => {
  if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
  if (!stripeSecret) return new Response("Missing Stripe secret", { status: 500 });
  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
  try {
    const charges = await stripe.charges.list({ limit: 100 });
    const total = charges.data.reduce((sum, c) => sum + (c.amount ?? 0), 0);
    return new Response(JSON.stringify({ total_cents: total, count: charges.data.length }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }
});
