import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export interface BookingEmailData {
  serviceName: string;
  duration: number;
  price: number;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "FSA Workouts <onboarding@resend.dev>";
const BUSINESS_EMAIL = process.env.BUSINESS_EMAIL || "info@fsaworkouts.se";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(price: number): string {
  return `${price.toLocaleString("sv-SE")} kr`;
}

// ============================================
// Customer Confirmation Email
// ============================================
export async function sendCustomerConfirmation(data: BookingEmailData) {
  const resend = getResend();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #f5f5f5; margin: 0; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 16px; overflow: hidden;">
        <div style="background: #dc2626; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #fff; font-size: 24px;">Din bokning är bekräftad</h1>
        </div>
        <div style="padding: 32px 24px;">
          <p style="margin: 0 0 24px; font-size: 16px;">Hej ${data.customerName},</p>
          <p style="margin: 0 0 24px; color: #a0a0a0;">Tack för din bokning hos FSA Workouts. Här är detaljerna:</p>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #a0a0a0;">Behandling</td><td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; text-align: right;">${data.serviceName}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #a0a0a0;">Längd</td><td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; text-align: right;">${data.duration} min</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #a0a0a0;">Datum</td><td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; text-align: right;">${formatDate(data.date)}</td></tr>
            <tr><td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; color: #a0a0a0;">Tid</td><td style="padding: 12px 0; border-bottom: 1px solid #2a2a2a; text-align: right;">kl ${data.time}</td></tr>
            <tr><td style="padding: 12px 0; color: #a0a0a0;">Betalt</td><td style="padding: 12px 0; text-align: right; color: #22c55e; font-weight: 600;">${formatPrice(data.price)}</td></tr>
          </table>

          <div style="background: #261010; border: 1px solid #dc262640; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; color: #fca5a5; font-weight: 600;">Förberedelser inför din session</p>
            <ul style="margin: 0; padding-left: 18px; color: #d0d0d0; font-size: 14px;">
              <li>Kom 10 minuter innan din bokade tid</li>
              <li>Undvik alkohol och stora måltider innan</li>
              <li>Ta med bekväma kläder att ha efteråt</li>
            </ul>
          </div>

          <p style="margin: 0; color: #808080; font-size: 13px;">Behöver du avboka eller ändra? Hör av dig till <a href="mailto:${BUSINESS_EMAIL}" style="color: #fca5a5;">${BUSINESS_EMAIL}</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: data.customerEmail,
    subject: `Bokning bekräftad – ${data.serviceName} ${formatDate(data.date)}`,
    html,
  });
}

// ============================================
// Business Notification Email
// ============================================
export async function sendBusinessNotification(data: BookingEmailData) {
  const resend = getResend();

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #111; margin: 0; padding: 40px 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px;">
        <h2 style="margin: 0 0 8px; color: #dc2626;">Ny bokning – blocka i Bokadirekt</h2>
        <p style="margin: 0 0 24px; color: #666;">En kund har betalat för en behandling. Blocka denna tid i er Bokadirekt-kalender.</p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Behandling</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">${data.serviceName}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Längd</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${data.duration} min</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Datum</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">${formatDate(data.date)}</td></tr>
          <tr><td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666;">Tid</td><td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">kl ${data.time}</td></tr>
          <tr><td style="padding: 10px 0; color: #666;">Belopp</td><td style="padding: 10px 0; text-align: right; color: #22c55e; font-weight: 600;">${formatPrice(data.price)}</td></tr>
        </table>

        <h3 style="margin: 24px 0 12px; font-size: 16px;">Kunduppgifter</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Namn</td><td style="padding: 8px 0; text-align: right;">${data.customerName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">E-post</td><td style="padding: 8px 0; text-align: right;"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Telefon</td><td style="padding: 8px 0; text-align: right;"><a href="tel:${data.customerPhone}">${data.customerPhone}</a></td></tr>
        </table>
      </div>
    </body>
    </html>
  `;

  return resend.emails.send({
    from: FROM_ADDRESS,
    to: BUSINESS_EMAIL,
    replyTo: data.customerEmail,
    subject: `Ny bokning: ${data.serviceName} ${formatDate(data.date)} kl ${data.time}`,
    html,
  });
}
