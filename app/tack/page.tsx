import Link from "next/link";
import { getCheckoutSession } from "@/lib/stripe";

interface PageProps {
  searchParams: Promise<{ session_id?: string; demo?: string }>;
}

interface BookingDetails {
  serviceName: string;
  duration: number;
  price: number;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  paymentStatus: string;
  isDemo: boolean;
}

export default async function TackPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;
  const demoData = params.demo;

  // Default values
  let bookingDetails: BookingDetails = {
    serviceName: "",
    duration: 0,
    price: 0,
    date: "",
    time: "",
    customerName: "",
    customerEmail: "",
    paymentStatus: "unknown",
    isDemo: false,
  };

  // Demo mode: Decode booking data from URL
  if (demoData) {
    try {
      const decoded = JSON.parse(Buffer.from(demoData, "base64").toString("utf-8"));
      bookingDetails = {
        serviceName: decoded.serviceName || "",
        duration: decoded.duration || 0,
        price: decoded.price || 0,
        date: decoded.date || "",
        time: decoded.time || "",
        customerName: decoded.customerName || "",
        customerEmail: decoded.customerEmail || "",
        paymentStatus: "paid",
        isDemo: true,
      };
    } catch (error) {
      console.error("Error decoding demo data:", error);
    }
  }
  // Production mode: Fetch from Stripe
  else if (sessionId) {
    try {
      const session = await getCheckoutSession(sessionId);

      if (session.metadata) {
        bookingDetails = {
          serviceName: session.metadata.serviceName || "",
          duration: parseInt(session.metadata.duration || "0", 10),
          price: parseInt(session.metadata.price || "0", 10),
          date: session.metadata.date || "",
          time: session.metadata.time || "",
          customerName: session.metadata.customerName || "",
          customerEmail: session.metadata.customerEmail || "",
          paymentStatus: session.payment_status || "unknown",
          isDemo: false,
        };
      }
    } catch (error) {
      console.error("Error fetching checkout session:", error);
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="min-h-screen py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Demo Banner */}
        {bookingDetails.isDemo && (
          <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm text-center animate-fade-in">
            <span className="font-medium">Demo-läge</span> – Ingen riktig betalning har skett
          </div>
        )}

        {/* Success Animation */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 mb-6">
            <svg
              className="w-10 h-10 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-fsa-text mb-2">
            Din bokning är bekräftad!
          </h1>
          <p className="text-fsa-text-muted">
            Tack för din bokning. En bekräftelse har skickats till din e-post.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="p-6 rounded-2xl bg-fsa-gray border border-fsa-gray-light shadow-2xl animate-slide-up">
          <h2 className="text-lg font-semibold text-fsa-text mb-4">
            Bokningsdetaljer
          </h2>

          <div className="space-y-4">
            {/* Service */}
            {bookingDetails.serviceName && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-fsa-dark border border-fsa-gray-light">
                <div className="w-10 h-10 rounded-full bg-fsa-red/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-fsa-red"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-fsa-text font-medium">
                    {bookingDetails.serviceName}
                  </p>
                  <p className="text-fsa-text-muted text-sm">
                    {bookingDetails.duration} minuter
                  </p>
                </div>
              </div>
            )}

            {/* Date & Time */}
            {bookingDetails.date && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-fsa-dark border border-fsa-gray-light">
                <div className="w-10 h-10 rounded-full bg-fsa-red/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-fsa-red"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-fsa-text font-medium">
                    {formatDate(bookingDetails.date)}
                  </p>
                  <p className="text-fsa-red text-sm">
                    kl {bookingDetails.time}
                  </p>
                </div>
              </div>
            )}

            {/* Customer */}
            {bookingDetails.customerName && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-fsa-dark border border-fsa-gray-light">
                <div className="w-10 h-10 rounded-full bg-fsa-red/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-fsa-red"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-fsa-text font-medium">
                    {bookingDetails.customerName}
                  </p>
                  <p className="text-fsa-text-muted text-sm">
                    {bookingDetails.customerEmail}
                  </p>
                </div>
              </div>
            )}

            {/* Price */}
            {bookingDetails.price > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-fsa-gray-light">
                <span className="text-fsa-text font-medium">
                  {bookingDetails.isDemo ? "Att betala" : "Betalt"}
                </span>
                <span className="text-xl font-bold text-green-400">
                  {bookingDetails.price.toLocaleString("sv-SE")} kr
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-xl bg-fsa-red/10 border border-fsa-red/30 animate-slide-up">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-fsa-red flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm">
              <p className="text-fsa-text font-medium mb-1">
                Förberedelser inför din session
              </p>
              <ul className="text-fsa-text-muted space-y-1">
                <li>• Kom 10 minuter innan din bokade tid</li>
                <li>• Undvik alkohol och stora måltider innan</li>
                <li>• Ta med bekväma kläder att ha efteråt</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-fsa-red hover:text-fsa-red-light transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Boka en till behandling
          </Link>
        </div>
      </div>
    </main>
  );
}
