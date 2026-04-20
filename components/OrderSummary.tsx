"use client";

import { useState } from "react";
import type { CustomerInfo, TimeSlot, Service } from "@/lib/types";
import EmbeddedCheckoutModal from "./EmbeddedCheckoutModal";

interface OrderSummaryProps {
  selectedService: Service;
  selectedDate: string;
  selectedSlot: TimeSlot;
  customerInfo: CustomerInfo;
  onBack: () => void;
}

export default function OrderSummary({
  selectedService,
  selectedDate,
  selectedSlot,
  customerInfo,
  onBack,
}: OrderSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          duration: selectedService.duration,
          price: selectedService.price,
          slotId: selectedSlot.id,
          date: selectedDate,
          time: selectedSlot.time,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Något gick fel");
      }

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
        return;
      }

      // Demo mode fallback
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Ogiltigt svar från servern");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Något gick fel");
      setIsLoading(false);
    }
  };

  return (
    <>
    {clientSecret && (
      <EmbeddedCheckoutModal
        clientSecret={clientSecret}
        onClose={() => setClientSecret(null)}
      />
    )}
    <div className="animate-slide-up">
      <h3 className="text-lg font-semibold text-fsa-text mb-4">
        Bekräfta din bokning
      </h3>

      {/* Order Details */}
      <div className="space-y-4 mb-6">
        {/* Service */}
        <div className="p-4 rounded-xl bg-fsa-dark border border-fsa-gray-light">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium text-fsa-text">{selectedService.name}</p>
              <p className="text-sm text-fsa-text-muted">{selectedService.duration} minuter</p>
            </div>
            <p className="text-xl font-bold text-fsa-red">
              {selectedService.price.toLocaleString("sv-SE")} kr
            </p>
          </div>
        </div>

        {/* Date & Time */}
        <div className="p-4 rounded-xl bg-fsa-dark border border-fsa-gray-light">
          <div className="flex items-center gap-3">
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
                {formatDate(selectedDate)}
              </p>
              <p className="text-fsa-red text-sm">kl {selectedSlot.time}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-4 rounded-xl bg-fsa-dark border border-fsa-gray-light">
          <div className="flex items-center gap-3">
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
              <p className="text-fsa-text font-medium">{customerInfo.name}</p>
              <p className="text-fsa-text-muted text-sm">{customerInfo.email}</p>
              <p className="text-fsa-text-muted text-sm">{customerInfo.phone}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center py-4 border-t border-fsa-gray-light mb-6">
        <span className="text-fsa-text font-medium">Totalt att betala</span>
        <span className="text-2xl font-bold text-fsa-red">
          {selectedService.price.toLocaleString("sv-SE")} kr
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-lg border border-fsa-gray-light text-fsa-text
            hover:bg-fsa-dark transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tillbaka
        </button>
        <button
          type="button"
          onClick={handlePayment}
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-lg bg-fsa-red text-white font-semibold
            hover:bg-fsa-red-dark transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Vänta...
            </>
          ) : (
            `Betala ${selectedService.price.toLocaleString("sv-SE")} kr`
          )}
        </button>
      </div>
    </div>
    </>
  );
}
