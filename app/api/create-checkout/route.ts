import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";
import type { CreateCheckoutRequest } from "@/lib/types";

// Demo mode: Skip Stripe when no API key is configured
const DEMO_MODE = !process.env.STRIPE_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutRequest = await request.json();

    // Validate required fields
    const requiredFields = [
      "serviceId",
      "serviceName",
      "duration",
      "price",
      "slotId",
      "date",
      "time",
      "customerName",
      "customerEmail",
      "customerPhone",
    ] as const;

    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customerEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate price is positive
    if (body.price <= 0) {
      return NextResponse.json(
        { error: "Invalid price" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Demo mode: Create mock session and redirect directly to confirmation
    if (DEMO_MODE) {
      const demoSessionData = {
        serviceName: body.serviceName,
        duration: body.duration,
        price: body.price,
        date: body.date,
        time: body.time,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
      };

      // Encode booking data in base64 for the demo URL
      const encodedData = Buffer.from(JSON.stringify(demoSessionData)).toString("base64");

      return NextResponse.json({
        url: `${appUrl}/tack?demo=${encodedData}`,
      });
    }

    // Production mode: Create Stripe Checkout Session
    const session = await createCheckoutSession({
      serviceId: body.serviceId,
      serviceName: body.serviceName,
      duration: body.duration,
      price: body.price,
      slotId: body.slotId,
      date: body.date,
      time: body.time,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
    });

    if (!session.url) {
      throw new Error("Failed to create checkout session URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
