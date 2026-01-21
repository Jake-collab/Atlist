// Supabase Edge Function stub for Stripe Checkout Session creation.
// TODO: add your STRIPE_SECRET_KEY, PRICE_ID, and frontend success/cancel URLs via environment variables.
// Deploy with `supabase functions deploy create-checkout-session`.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.18.0?target=deno&deno-std=0.177.0";

const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
const priceId = Deno.env.get("STRIPE_PRICE_ID"); // e.g., price_xxx from Stripe Dashboard
const successUrl = Deno.env.get("STRIPE_SUCCESS_URL") || "https://example.com/success";
const cancelUrl = Deno.env.get("STRIPE_CANCEL_URL") || "https://example.com/cancel";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  if (!stripeKey || !priceId) {
    return new Response("Missing Stripe configuration", { status: 500 });
  }
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  try {
    const body = await req.json();
    const { email, promoCode } = body ?? {};

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      discounts: promoCode ? [{ promotion_code: promoCode }] : undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
