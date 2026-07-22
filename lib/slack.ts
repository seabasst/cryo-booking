import type { BookingEmailData, BokadirektHint } from "./email";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function sendBookingSlackNotification(
  data: BookingEmailData,
  bokadirekt?: BokadirektHint
) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) throw new Error("SLACK_WEBHOOK_URL not configured");

  const bdName = bokadirekt?.serviceName ?? data.serviceName;
  const suggested =
    bokadirekt && bokadirekt.suggestedResources.length > 0
      ? bokadirekt.suggestedResources.join(" eller ")
      : null;

  const payload = {
    text: `Ny bokning: ${bdName} ${formatDate(data.date)} kl ${data.time}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🟢 Ny bokning — blocka i Bokadirekt" },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Tjänst i Bokadirekt*\n${bdName}` },
          {
            type: "mrkdwn",
            text: `*Datum & tid*\n${formatDate(data.date)}\nkl ${data.time} (${data.duration} min)`,
          },
          ...(suggested
            ? [{ type: "mrkdwn", text: `*Föreslagen resurs*\n${suggested}` }]
            : []),
          {
            type: "mrkdwn",
            text: `*Belopp*\n${data.price.toLocaleString("sv-SE")} kr`,
          },
        ],
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Kund*\n${data.customerName}` },
          {
            type: "mrkdwn",
            text: `*Kontakt*\n<mailto:${data.customerEmail}|${data.customerEmail}>\n<tel:${data.customerPhone}|${data.customerPhone}>`,
          },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Öppna Bokadirekt" },
            url: "https://business.bokadirekt.se/",
            style: "primary",
          },
        ],
      },
    ],
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Slack webhook failed: ${res.status} ${body}`);
  }
  return { ok: true };
}
