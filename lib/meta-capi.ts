import crypto from "crypto";

const GRAPH_VERSION = "v21.0";

function sha256(v: string): string {
  return crypto.createHash("sha256").update(v).digest("hex");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  // Meta wants digits only, country code included
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits.slice(1);
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return "46" + digits.slice(1); // Sverige default
  return digits;
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

export interface CapiPurchaseInput {
  eventId: string; // deduplication with client-side pixel
  eventSourceUrl: string;
  value: number;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
}

export async function sendCapiPurchase(input: CapiPurchaseInput) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!pixelId || !token) {
    console.warn("Meta CAPI: missing pixel id or access token — skipping");
    return { skipped: true };
  }

  const userData: Record<string, string | string[]> = {};
  if (input.customerEmail) {
    userData.em = [sha256(normalizeEmail(input.customerEmail))];
  }
  if (input.customerPhone) {
    userData.ph = [sha256(normalizePhone(input.customerPhone))];
  }
  if (input.customerName) {
    const parts = input.customerName.trim().split(/\s+/);
    if (parts.length > 0) userData.fn = [sha256(normalizeName(parts[0]))];
    if (parts.length > 1)
      userData.ln = [sha256(normalizeName(parts[parts.length - 1]))];
  }
  userData.country = [sha256("se")];

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: {
          currency: input.currency ?? "SEK",
          value: input.value,
          content_ids: input.contentIds ?? [],
          content_name: input.contentName,
          content_type: "product",
          num_items: 1,
        },
      },
    ],
  };

  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${pixelId}/events?access_token=${token}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error("Meta CAPI Purchase failed:", res.status, json);
    return { ok: false, status: res.status, response: json };
  }
  return { ok: true, response: json };
}
