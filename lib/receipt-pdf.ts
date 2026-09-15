import PDFDocument from "pdfkit";
import { vatBreakdown } from "./pricing";

// FSA seller info — used on all receipts.
export const SELLER = {
  name: "FSA Workouts HQ AB",
  orgNumber: "559404-4876",
  vatNumber: "SE559404487601", // Sverige: SE + orgnr utan bindestreck + 01
  address: "Lokstallsgatan 7",
  postal: "113 21 Stockholm",
  email: "info@fsaworkoutshq.se",
  phone: "08-522 40 740",
};

export interface ReceiptInput {
  receiptId: string;              // unique, e.g. Stripe session id
  issuedAt: Date;                 // date of purchase
  serviceName: string;
  duration: number;
  bookingDate: string;            // YYYY-MM-DD
  bookingTime: string;            // HH:MM
  price: number;                  // gross incl VAT
  customerName: string;
  customerEmail: string;
  customerOrgNumber?: string;
  customerPersonalNumber?: string;
}

function fmtKr(n: number) {
  return `${new Intl.NumberFormat("sv-SE").format(n)} kr`;
}

function fmtSvDate(d: Date) {
  return d.toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function shortId(id: string) {
  // Take last 10 non-punct chars, uppercase — human-readable but unique
  return id.replace(/[^a-zA-Z0-9]/g, "").slice(-10).toUpperCase();
}

/**
 * Generate a Swedish receipt PDF compliant with förenklad faktura
 * requirements (SFS 2011:1244 5 kap 8 §).
 */
export function generateReceiptPdf(data: ReceiptInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const b = vatBreakdown(data.price);
    const receiptNo = shortId(data.receiptId);

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text("KVITTO", { align: "right" });
    doc.moveDown(0.2);
    doc.fontSize(10).font("Helvetica").text(`Kvittonr: ${receiptNo}`, { align: "right" });
    doc.text(`Datum: ${fmtSvDate(data.issuedAt)}`, { align: "right" });

    doc.moveDown(1.5);

    // Seller block
    doc.fontSize(11).font("Helvetica-Bold").text(SELLER.name);
    doc.font("Helvetica").fontSize(10);
    doc.text(SELLER.address);
    doc.text(SELLER.postal);
    doc.text(`Org.nr: ${SELLER.orgNumber}`);
    doc.text(`Momsregnr: ${SELLER.vatNumber}`);
    doc.text(`${SELLER.email}  ·  ${SELLER.phone}`);

    doc.moveDown(1);

    // Customer block
    doc.fontSize(10).font("Helvetica-Bold").text("Köpare");
    doc.font("Helvetica").text(data.customerName);
    doc.text(data.customerEmail);
    if (data.customerPersonalNumber) {
      doc.text(`Personnr: ${data.customerPersonalNumber}`);
    }
    if (data.customerOrgNumber) {
      doc.text(`Org.nr: ${data.customerOrgNumber}`);
    }

    doc.moveDown(1.5);

    // Line item table
    const tableTop = doc.y;
    const colX = { desc: 50, qty: 340, unit: 400, total: 480 };
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("Beskrivning", colX.desc, tableTop);
    doc.text("Antal", colX.qty, tableTop, { width: 55, align: "right" });
    doc.text("À-pris", colX.unit, tableTop, { width: 70, align: "right" });
    doc.text("Summa", colX.total, tableTop, { width: 65, align: "right" });
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    const rowY = tableTop + 22;
    doc.font("Helvetica").fontSize(10);
    doc.text(
      `${data.serviceName} — ${data.duration} min\n${data.bookingDate} kl ${data.bookingTime}`,
      colX.desc,
      rowY,
      { width: 280 }
    );
    doc.text("1", colX.qty, rowY, { width: 55, align: "right" });
    doc.text(fmtKr(data.price), colX.unit, rowY, { width: 70, align: "right" });
    doc.text(fmtKr(data.price), colX.total, rowY, { width: 65, align: "right" });

    // Totals block
    doc.moveDown(4);
    const totalsX = 340;
    const valX = 480;
    const valW = 65;

    const yStart = doc.y;
    doc.font("Helvetica").fontSize(10);
    doc.text("Netto (exkl. moms):", totalsX, yStart);
    doc.text(fmtKr(b.net), valX, yStart, { width: valW, align: "right" });

    doc.text("Moms 25%:", totalsX, doc.y + 4);
    doc.text(fmtKr(b.vat), valX, doc.y - 12, { width: valW, align: "right" });

    doc.moveTo(totalsX, doc.y + 8).lineTo(545, doc.y + 8).stroke();
    doc.moveDown(0.6);

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Totalt att betala:", totalsX, doc.y);
    doc.text(fmtKr(b.gross), valX, doc.y - 14, { width: valW, align: "right" });

    // Footer
    doc.moveDown(4);
    doc.font("Helvetica-Oblique").fontSize(9).fillColor("#555");
    doc.text(
      `Betalt via Stripe. F-skattsedel innehas. Kvittot kan användas för friskvårdsbidrag.`,
      50,
      doc.y,
      { width: 495, align: "center" }
    );

    doc.end();
  });
}
