import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { createBooking } from "@/lib/bokadirekt";
import {
  sendCustomerConfirmation,
  sendBusinessNotification,
} from "@/lib/email";
import Stripe from "stripe";

// Disable body parsing for webhook route
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("No Stripe signature found");
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = constructWebhookEvent(Buffer.from(body), signature);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("✅ Payment completed for session:", session.id);

      // Extract booking info from metadata
      const metadata = session.metadata;

      if (metadata) {
        const bookingData = {
          slotId: metadata.slotId,
          date: metadata.date,
          time: metadata.time,
          customerName: metadata.customerName,
          customerEmail: metadata.customerEmail,
          customerPhone: metadata.customerPhone,
          serviceId: metadata.serviceId,
          serviceName: metadata.serviceName,
          duration: parseInt(metadata.duration, 10),
          price: parseInt(metadata.price, 10),
        };

        try {
          const booking = await createBooking(bookingData);
          console.log("✅ Booking created:", booking.bookingId);
        } catch (bookingError) {
          console.error("Error creating booking:", bookingError);
        }

        const emailResults = await Promise.allSettled([
          sendCustomerConfirmation(bookingData),
          sendBusinessNotification(bookingData),
        ]);

        emailResults.forEach((result, i) => {
          const label = i === 0 ? "customer" : "business";
          if (result.status === "fulfilled") {
            console.log(`📧 Sent ${label} email`);
          } else {
            console.error(`Failed to send ${label} email:`, result.reason);
          }
        });
      } else {
        console.warn("No metadata found in checkout session");
      }
      break;
    }

    case "checkout.session.expired": {
      console.log("⏰ Checkout session expired:", event.data.object);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
