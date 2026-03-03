"use client";

import { useState, useEffect } from "react";
import type { BookingStep, TimeSlot, CustomerInfo, Service } from "@/lib/types";
import ServiceSelector from "./ServiceSelector";
import DatePicker from "./DatePicker";
import TimeSlots from "./TimeSlots";
import CustomerForm from "./CustomerForm";
import OrderSummary from "./OrderSummary";

interface BookingWidgetProps {
  cancelled?: boolean;
  initialCategory?: string;
}

export default function BookingWidget({
  cancelled,
  initialCategory,
}: BookingWidgetProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [showCancelledMessage, setShowCancelledMessage] = useState(cancelled);

  useEffect(() => {
    if (cancelled) {
      const timer = setTimeout(() => setShowCancelledMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [cancelled]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleContinueToStep3 = () => {
    if (selectedDate && selectedSlot) {
      setCurrentStep(3);
    }
  };

  const handleCustomerSubmit = (info: CustomerInfo) => {
    setCustomerInfo(info);
    setCurrentStep(4);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
  };

  const handleBackToStep3 = () => {
    setCurrentStep(3);
  };

  const steps = [
    { number: 1, label: "Behandling" },
    { number: 2, label: "Tid" },
    { number: 3, label: "Uppgifter" },
    { number: 4, label: "Bekräfta" },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Cancelled Message */}
      {showCancelledMessage && (
        <div className="mb-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 text-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Betalningen avbröts. Välj behandling igen för att boka.
          </div>
        </div>
      )}

      {/* Container */}
      <div className="relative p-6 rounded-xl bg-fsa-gray border border-fsa-gray-light">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold
                  transition-all duration-300
                  ${
                    currentStep >= step.number
                      ? "bg-fsa-red text-white"
                      : "bg-fsa-gray-light text-fsa-text-muted border border-fsa-text-dim/30"
                  }
                `}
              >
                {currentStep > step.number ? (
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`
                  ml-1 text-[10px] font-medium hidden sm:inline
                  ${
                    currentStep >= step.number
                      ? "text-fsa-text"
                      : "text-fsa-text-muted"
                  }
                `}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-4 sm:w-6 h-0.5 mx-1
                    transition-all duration-300
                    ${
                      currentStep > step.number
                        ? "bg-fsa-red"
                        : "bg-fsa-gray-light"
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Select Service */}
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-xl font-semibold text-fsa-text mb-4">
                Välj behandling
              </h2>
              <ServiceSelector
                initialCategory={initialCategory}
                onServiceSelect={handleServiceSelect}
              />
            </div>
          )}

          {/* Step 2: Select Date & Time */}
          {currentStep === 2 && selectedService && (
            <div className="animate-fade-in">
              {/* Selected Service Summary */}
              <div className="mb-4 p-3 rounded-lg bg-fsa-red/10 border border-fsa-red/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-fsa-text font-medium">
                      {selectedService.name}
                    </p>
                    <p className="text-fsa-text-muted text-sm">
                      {selectedService.duration} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-fsa-red font-bold">
                      {selectedService.price.toLocaleString("sv-SE")} kr
                    </p>
                    <button
                      onClick={handleBackToStep1}
                      className="text-xs text-fsa-text-muted hover:text-fsa-red transition-colors"
                    >
                      Ändra
                    </button>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-fsa-text mb-4">
                Välj datum och tid
              </h2>
              <DatePicker
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />
              {selectedDate && (
                <TimeSlots
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSlotSelect={handleSlotSelect}
                />
              )}
              {selectedDate && selectedSlot && (
                <button
                  onClick={handleContinueToStep3}
                  className="w-full mt-6 py-3 px-4 rounded-lg bg-fsa-red text-white font-semibold
                    hover:bg-fsa-red-dark transition-all duration-200 animate-slide-up"
                >
                  Fortsätt
                </button>
              )}
            </div>
          )}

          {/* Step 3: Customer Form */}
          {currentStep === 3 &&
            selectedService &&
            selectedDate &&
            selectedSlot && (
              <CustomerForm
                selectedService={selectedService}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onSubmit={handleCustomerSubmit}
                onBack={handleBackToStep2}
              />
            )}

          {/* Step 4: Order Summary */}
          {currentStep === 4 &&
            selectedService &&
            selectedDate &&
            selectedSlot &&
            customerInfo && (
              <OrderSummary
                selectedService={selectedService}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                customerInfo={customerInfo}
                onBack={handleBackToStep3}
              />
            )}
        </div>
      </div>
    </div>
  );
}
