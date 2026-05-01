import twilio from "twilio";
import type { BookingEmailData } from "./email";

let twilioClient: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!twilioClient) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) {
      throw new Error("TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not configured");
    }
    twilioClient = twilio(sid, token);
  }
  return twilioClient;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "short",
  });
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("00")) return "+" + digits.slice(2);
  if (digits.startsWith("0")) return "+46" + digits.slice(1);
  return "+" + digits;
}

export async function sendCustomerSms(data: BookingEmailData) {
  const client = getClient();
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!from) throw new Error("TWILIO_FROM_NUMBER not configured");

  const body = [
    `Hej ${data.customerName.split(" ")[0]}!`,
    `Din bokning hos FSA Workouts är bekräftad:`,
    `${data.serviceName} ${formatDate(data.date)} kl ${data.time}.`,
    `Tack!`,
  ].join(" ");

  return client.messages.create({
    from,
    to: normalizePhone(data.customerPhone),
    body,
  });
}
