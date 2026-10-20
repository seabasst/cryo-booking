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
    customerOrgNumber: bookingData.customerOrgNumber ?? "",
    customerPersonalNumber: bookingData.customerPersonalNumber ?? "",
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

const LOCK_TTL_SEC = 15 * 60; // in-flight checkout holds a slot for 15 min

/**
 * Returns bookings our system currently holds for a given date. Includes:
 *  - fully paid (status=succeeded) — hard block until Bokadirekt entry
 *  - in-flight (any non-canceled/failed status, created within LOCK_TTL) —
 *    prevents two customers grabbing the same slot mid-checkout
 */
export async function getActiveOwnBookingsForDate(
  date: string
): Promise<OwnBooking[]> {
  const stripe = getStripe();
  const now = Math.floor(Date.now() / 1000);
  try {
    const res = await stripe.paymentIntents.search({
      query: `metadata['date']:'${date}'`,
      limit: 100,
    });
    return res.data
      .filter((pi) => {
        if (pi.status === "succeeded") return true;
        if (pi.status === "canceled") return false;
        // Any other status only counts as lock while fresh
        return pi.created > now - LOCK_TTL_SEC;
      })
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

/**
 * True if this customer (matched by email or phone) has already succeeded
 * with the given service. Used to enforce one-per-person on "prova på".
 */
export async function hasCustomerAlreadyPurchased(
  serviceId: string,
  email: string,
  phone: string
): Promise<boolean> {
  const stripe = getStripe();
  const q = (field: string, value: string) =>
    stripe.paymentIntents.search({
      query: `metadata['serviceId']:'${serviceId}' AND metadata['${field}']:'${value}' AND status:'succeeded'`,
      limit: 1,
    });
  try {
    const [byEmail, byPhone] = await Promise.all([
      q("customerEmail", email.trim()),
      q("customerPhone", phone.trim()),
    ]);
    return byEmail.data.length > 0 || byPhone.data.length > 0;
  } catch (err) {
    console.error("Prova-på duplicate check failed:", err);
    return false; // fail open — don't block on error
  }
}
// ponytail: matches only exact-typed metadata. Different casing/formatting
// of the same customer slips through. Upgrade path: normalize both on write
// and query, or move to a proper KV/DB store keyed by canonical email.

// ============================================
// Upcoming paid bookings (for Bokadirekt sync reminder)
// ============================================

/**
 * Succeeded payments whose booking date+time is still ahead (Stockholm time)
 * and that were paid more than `minAgeMin` minutes ago.
 */
export async function getUpcomingPaidBookings(minAgeMin = 15) {
  const stripe = getStripe();
  const now = Math.floor(Date.now() / 1000);
  const nowLocal = new Date()
    .toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })
    .slice(0, 16); // "YYYY-MM-DD HH:MM"
  const result = [];
  for await (const pi of stripe.paymentIntents.search({
    query: `status:'succeeded' AND created>${now - 60 * 86400}`,
    limit: 100,
    expand: ["data.latest_charge"],
  })) {
    const m = pi.metadata ?? {};
    if (!m.serviceId || !m.date || !m.time) continue;
    const charge = pi.latest_charge as Stripe.Charge | null;
    if (charge?.refunded) continue; // cancelled + refunded, nothing to enter
    if (pi.created > now - minAgeMin * 60) continue;
    if (`${m.date} ${m.time}` < nowLocal) continue;
    result.push({
      serviceId: m.serviceId,
      serviceName: m.serviceName ?? m.serviceId,
      date: m.date,
      time: m.time,
      customerName: m.customerName ?? "",
    });
  }
  return result;
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
