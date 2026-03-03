"use client";

import { useState } from "react";
import type { CustomerInfo, TimeSlot, Service } from "@/lib/types";

interface CustomerFormProps {
  selectedService: Service;
  selectedDate: string;
  selectedSlot: TimeSlot;
  onSubmit: (customerInfo: CustomerInfo) => void;
  onBack: () => void;
}

export default function CustomerForm({
  selectedService,
  selectedDate,
  selectedSlot,
  onSubmit,
  onBack,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Partial<CustomerInfo> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Namn krävs";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-post krävs";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Ogiltig e-postadress";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefon krävs";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("sv-SE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  return (
    <div className="animate-slide-up">
      {/* Booking Summary */}
      <div className="mb-6 p-4 rounded-xl bg-fsa-red/10 border border-fsa-red/30">
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
              {selectedService.name} – {selectedService.duration} min
            </p>
            <p className="text-fsa-red text-sm">
              {formatDate(selectedDate)} kl {selectedSlot.time}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-fsa-text mb-1.5"
          >
            Namn
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-fsa-dark border
              text-fsa-text placeholder-fsa-text-dim
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-fsa-red/50
              ${
                errors.name
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-fsa-gray-light focus:border-fsa-red"
              }
            `}
            placeholder="Ditt fullständiga namn"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-fsa-text mb-1.5"
          >
            E-post
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-fsa-dark border
              text-fsa-text placeholder-fsa-text-dim
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-fsa-red/50
              ${
                errors.email
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-fsa-gray-light focus:border-fsa-red"
              }
            `}
            placeholder="din@email.se"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-fsa-text mb-1.5"
          >
            Telefon
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={`
              w-full px-4 py-3 rounded-lg
              bg-fsa-dark border
              text-fsa-text placeholder-fsa-text-dim
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-fsa-red/50
              ${
                errors.phone
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-fsa-gray-light focus:border-fsa-red"
              }
            `}
            placeholder="07X XXX XX XX"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-3 px-4 rounded-lg border border-fsa-gray-light text-fsa-text
              hover:bg-fsa-dark transition-all duration-200"
          >
            Tillbaka
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 rounded-lg bg-fsa-red text-white font-semibold
              hover:bg-fsa-red-dark transition-all duration-200"
          >
            Fortsätt
          </button>
        </div>
      </form>
    </div>
  );
}
