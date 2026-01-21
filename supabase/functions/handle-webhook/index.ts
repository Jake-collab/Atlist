// Supabase Edge Function stub for Stripe webhooks (subscription events).
// Set STRIPE_WEBHOOK_SECRET and STRIPE_SECRET_KEY in env.
// Deploy with `supabase functions deploy handle-webhook`.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.18.0?target=deno&deno-std=0.177.0";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  if (!stripeSecret || !webhookSecret) {
    return new Response("Missing Stripe secrets", { status: 500 });
  }
  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response("Missing Supabase service credentials", { status: 500 });
  }
  const supabaseClient = (await import("https://esm.sh/@supabase/supabase-js@2.42.8")).createClient(
    supabaseUrl,
    supabaseServiceKey
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const customerEmail = session.customer_details?.email;
        if (customerEmail) {
          await supabaseClient.from("profiles").update({ membership_active: true }).eq("email", customerEmail);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as any;
        const customerEmail = (sub as any).customer_email; // may need lookup
        if (customerEmail) {
          await supabaseClient.from("profiles").update({ membership_active: false }).eq("email", customerEmail);
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    return new Response(`Handler error: ${(e as Error).message}`, { status: 400 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
