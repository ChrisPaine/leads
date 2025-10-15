import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    logStep("ERROR: Missing signature or webhook secret");
    return new Response("Webhook Error: Missing signature or secret", { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil"
  });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    logStep("Webhook event received", { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Checkout session completed", {
          sessionId: session.id,
          mode: session.mode,
          customerId: session.customer,
          userId: session.metadata?.user_id
        });

        const userId = session.metadata?.user_id;
        const priceId = session.metadata?.price_id;

        if (!userId) {
          logStep("ERROR: No user_id in session metadata");
          break;
        }

        // Check if this is a credit pack purchase (payment mode)
        const CREDIT_PACK_PRICE_ID = 'price_1SDS5MGbEY7eE6Cc6Dgd3ovB'; // $4.99 one-time

        if (session.mode === 'payment' && priceId === CREDIT_PACK_PRICE_ID) {
          logStep("Credit pack purchase detected", { userId });

          // Add 10 credits to user's account
          const { data: profile, error: fetchError } = await supabaseClient
            .from('profiles')
            .select('search_credits')
            .eq('id', userId)
            .single();

          if (fetchError) {
            logStep("ERROR fetching profile", { error: fetchError.message });
            break;
          }

          const currentCredits = profile?.search_credits || 0;
          const newCredits = currentCredits + 10;

          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({ search_credits: newCredits })
            .eq('id', userId);

          if (updateError) {
            logStep("ERROR updating credits", { error: updateError.message });
            break;
          }

          // Record the purchase
          const { error: purchaseError } = await supabaseClient
            .from('credit_purchases')
            .insert({
              user_id: userId,
              stripe_payment_id: session.payment_intent as string,
              credits_purchased: 10,
              amount_paid: 4.99,
            });

          if (purchaseError) {
            logStep("ERROR recording purchase", { error: purchaseError.message });
          }

          logStep("Credit pack added successfully", {
            userId,
            previousCredits: currentCredits,
            newCredits
          });
        } else if (session.mode === 'subscription') {
          logStep("Subscription checkout completed (handled by subscription events)");
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription event", {
          type: event.type,
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status
        });

        // Get customer email to find user
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer || customer.deleted) {
          logStep("ERROR: Customer not found or deleted");
          break;
        }

        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) {
          logStep("ERROR: Customer has no email");
          break;
        }

        // Map product ID to subscription tier
        const productId = subscription.items.data[0].price.product as string;
        const PRODUCT_MAPPING: Record<string, string> = {
          'price_1SDS1pGbEY7eE6CcwMAsIKOH': 'starter',      // $9.99/mo
          'price_1SDS49GbEY7eE6Ccl7s1I9s7': 'professional', // $19.99/mo
          'price_1SDS4KGbEY7eE6Cc4tJxYbcj': 'agency',       // $29.99/mo
        };

        const tier = PRODUCT_MAPPING[subscription.items.data[0].price.id] || 'pro';

        // Update user's subscription status
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: tier,
            stripe_customer_id: subscription.customer as string
          })
          .eq('email', customerEmail);

        if (updateError) {
          logStep("ERROR updating subscription status", { error: updateError.message });
        } else {
          logStep("Subscription status updated", { email: customerEmail, tier });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Subscription deleted", {
          subscriptionId: subscription.id,
          customerId: subscription.customer
        });

        // Get customer email
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer || customer.deleted) {
          logStep("ERROR: Customer not found or deleted");
          break;
        }

        const customerEmail = (customer as Stripe.Customer).email;
        if (!customerEmail) {
          logStep("ERROR: Customer has no email");
          break;
        }

        // Downgrade to free tier
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({ subscription_status: 'free' })
          .eq('email', customerEmail);

        if (updateError) {
          logStep("ERROR downgrading to free", { error: updateError.message });
        } else {
          logStep("User downgraded to free tier", { email: customerEmail });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { error: errorMessage });
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
