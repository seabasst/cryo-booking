import Stripe from "stripe";
import type { BookingData } from "./types";

// ============================================
// Stripe Instance (Lazy Initialization)
// ============================================
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// ============================================
// Create Checkout Session
// ============================================
export async function createCheckoutSession(
  bookingData: BookingData
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: bookingData.customerEmail,
    metadata: {
      serviceId: bookingData.serviceId,
      serviceName: bookingData.serviceName,
      duration: String(bookingData.duration),
      price: String(bookingData.price),
      slotId: bookingData.slotId,
      date: bookingData.date,
      time: bookingData.time,
      customerName: bookingData.customerName,
      customerEmail: bookingData.customerEmail,
      customerPhone: bookingData.customerPhone,
    },
    line_items: [
      {
        price_data: {
          currency: "sek",
          product_data: {
            name: bookingData.serviceName,
            description: `${bookingData.duration} min | ${bookingData.date} kl ${bookingData.time}`,
          },
          unit_amount: bookingData.price * 100, // Convert to öre
        },
        quantity: 1,
      },
    ],
    return_url: `${appUrl}/tack?session_id={CHECKOUT_SESSION_ID}`,
  });

  return session;
}

// ============================================
// Retrieve Checkout Session
// ============================================
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return stripe.checkout.sessions.retrieve(sessionId);
}

// ============================================
// Verify Webhook Signature
// ============================================
export function constructWebhookEvent(
  payload: Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
