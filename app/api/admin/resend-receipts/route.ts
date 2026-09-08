import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendCustomerConfirmation } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Resend the customer confirmation email (now with VAT breakdown) to every
 * succeeded checkout between `from` and `to`. Guarded by DEBUG_TOKEN.
 *
 * GET /api/admin/resend-receipts?token=...&from=2026-07-15&to=2026-09-08[&dryRun=1][&only=email]
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const token = q.get("token");
  const from = q.get("from"); // YYYY-MM-DD
  const to = q.get("to");
  const dryRun = q.get("dryRun") === "1";
  const only = q.get("only"); // optional: only send to this email

  if (!process.env.DEBUG_TOKEN || token !== process.env.DEBUG_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!from || !to) {
    return NextResponse.json(
      { error: "from and to (YYYY-MM-DD) required" },
      { status: 400 }
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
  });

  const fromTs = Math.floor(new Date(`${from}T00:00:00Z`).getTime() / 1000);
  const toTs = Math.floor(new Date(`${to}T23:59:59Z`).getTime() / 1000);

  const sent: string[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];
  const failed: Array<{ id: string; error: string }> = [];

  // Paginate through succeeded PIs in the window
  let startingAfter: string | undefined;
  while (true) {
    const page = await stripe.paymentIntents.list({
      created: { gte: fromTs, lte: toTs },
      limit: 100,
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    });

    for (const pi of page.data) {
      if (pi.status !== "succeeded") {
        skipped.push({ id: pi.id, reason: `status=${pi.status}` });
        continue;
      }
      const m = pi.metadata ?? {};
      if (!m.customerEmail || !m.serviceName || !m.date || !m.time) {
        skipped.push({ id: pi.id, reason: "missing metadata" });
        continue;
      }
      if (only && m.customerEmail !== only) {
        skipped.push({ id: pi.id, reason: "not matching only=" });
        continue;
      }

      if (dryRun) {
        sent.push(`[dry] ${m.customerEmail} — ${m.serviceName} ${m.date} ${m.time}`);
        continue;
      }

      try {
        await sendCustomerConfirmation({
          serviceName: m.serviceName,
          duration: parseInt(m.duration ?? "0", 10),
          price: parseInt(m.price ?? "0", 10),
          date: m.date,
          time: m.time,
          customerName: m.customerName ?? "",
          customerEmail: m.customerEmail,
          customerPhone: m.customerPhone ?? "",
          customerOrgNumber: m.customerOrgNumber || undefined,
        });
        sent.push(`${m.customerEmail} — ${m.serviceName} ${m.date} ${m.time}`);
      } catch (err) {
        failed.push({
          id: pi.id,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (!page.has_more) break;
    startingAfter = page.data[page.data.length - 1]?.id;
    if (!startingAfter) break;
  }

  return NextResponse.json({
    dryRun,
    range: { from, to },
    sentCount: sent.length,
    skippedCount: skipped.length,
    failedCount: failed.length,
    sent,
    skipped: skipped.slice(0, 20),
    failed,
  });
}
