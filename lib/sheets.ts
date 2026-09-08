import type { BookingEmailData, BokadirektHint } from "./email";

export async function logBookingToSheet(
  data: BookingEmailData,
  bokadirekt?: BokadirektHint
) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) throw new Error("GOOGLE_SHEETS_WEBHOOK_URL not configured");

  const payload = {
    date: data.date,
    time: data.time,
    serviceName: data.serviceName,
    duration: data.duration,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    price: data.price,
    bokadirektServiceName: bokadirekt?.serviceName ?? "",
    suggestedResources: bokadirekt?.suggestedResources?.join(", ") ?? "",
    fbclid: data.fbclid ?? "",
    orgNumber: data.customerOrgNumber ?? "",
  };

  // Apps Script deployments follow redirects to Google — allow it
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Google Sheets webhook failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return { ok: true };
}
