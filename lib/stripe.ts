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

  const meta = {
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
    fbclid: bookingData.fbclid ?? "",
  };
  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: bookingData.customerEmail,
    metadata: meta,
    // Forward to PaymentIntent so we can search by metadata['date']
    payment_intent_data: { metadata: meta },
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
// Our own paid bookings for a date (double-booking guard)
// ============================================

export interface OwnBooking {
  serviceId: string;
  time: string; // "HH:MM"
  duration: number; // minutes
}

/**
 * Returns bookings paid via our system for a given date. Used to close the
 * gap between payment and FSA's manual Bokadirekt entry — a slot our system
 * has sold is treated as busy even before it lands in Bokadirekt.
 */
export async function getPaidOwnBookingsForDate(
  date: string
): Promise<OwnBooking[]> {
  const stripe = getStripe();
  try {
    const res = await stripe.paymentIntents.search({
      query: `metadata['date']:'${date}' AND status:'succeeded'`,
      limit: 100,
    });
    return res.data
      .map((pi) => {
        const m = pi.metadata ?? {};
        if (!m.serviceId || !m.time || !m.duration) return null;
        return {
          serviceId: m.serviceId,
          time: m.time,
          duration: parseInt(m.duration, 10),
        } as OwnBooking;
      })
      .filter((x): x is OwnBooking => x !== null);
  } catch (err) {
    console.error("Stripe search for own bookings failed:", err);
    return [];
  }
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
