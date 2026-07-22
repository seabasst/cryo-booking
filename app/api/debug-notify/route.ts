import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  sendCustomerConfirmation,
  sendBusinessNotification,
  type BokadirektHint,
} from "@/lib/email";
import {
  getBokadirektServiceInfo,
  suggestAvailableResources,
} from "@/lib/bokadirekt";

export const runtime = "nodejs";

/**
 * Debug endpoint: replay the notification pipeline for a given Checkout Session
 * without needing Stripe to hit the webhook. Returns detailed success/error
 * info for each notification step. Requires ?token=... matching DEBUG_TOKEN.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const sessionId = params.get("session");
  const token = params.get("token");

  if (!process.env.DEBUG_TOKEN || token !== process.env.DEBUG_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!sessionId) {
    return NextResponse.json(
      { error: "session query param required" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadata = session.metadata ?? {};

    const bookingData = {
      slotId: metadata.slotId,
      date: metadata.date,
      time: metadata.time,
      customerName: metadata.customerName,
      customerEmail: metadata.customerEmail,
      customerPhone: metadata.customerPhone,
      serviceId: metadata.serviceId,
      serviceName: metadata.serviceName,
      duration: parseInt(metadata.duration ?? "0", 10),
      price: parseInt(metadata.price ?? "0", 10),
    };

    // Bokadirekt hint
    let bokadirektHint: BokadirektHint | undefined;
    const info = getBokadirektServiceInfo(bookingData.serviceId);
    const resources = await suggestAvailableResources(
      bookingData.date,
      bookingData.time,
      bookingData.serviceId
    );
    if (info) {
      bokadirektHint = {
        serviceName: info.bokadirektServiceName,
        suggestedResources: resources,
      };
    }

    const [customerResult, businessResult] = await Promise.allSettled([
      sendCustomerConfirmation(bookingData),
      sendBusinessNotification(bookingData, bokadirektHint),
    ]);

    function summarize(r: PromiseSettledResult<unknown>) {
      if (r.status === "fulfilled") {
        return { ok: true, response: r.value };
      }
      const err = r.reason;
      return {
        ok: false,
        errorMessage: err instanceof Error ? err.message : String(err),
        errorName: err instanceof Error ? err.name : undefined,
        stack: err instanceof Error ? err.stack?.split("\n").slice(0, 6) : undefined,
      };
    }

    return NextResponse.json({
      bookingData,
      bokadirektHint,
      env: {
        emailFrom: process.env.EMAIL_FROM,
        businessEmail: process.env.BUSINESS_EMAIL,
        hasResendKey: !!process.env.RESEND_API_KEY,
        resendKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 8),
      },
      customerNotification: summarize(customerResult),
      businessNotification: summarize(businessResult),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack?.split("\n").slice(0, 6) : undefined,
      },
      { status: 500 }
    );
  }
}
