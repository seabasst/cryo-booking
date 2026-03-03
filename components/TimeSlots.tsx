"use client";

import { useEffect, useState } from "react";
import type { TimeSlot } from "@/lib/types";

interface TimeSlotsProps {
  selectedDate: string;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot) => void;
}

export default function TimeSlots({
  selectedDate,
  selectedSlot,
  onSlotSelect,
}: TimeSlotsProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/available-slots?date=${selectedDate}`
        );
        const data = await response.json();
        setSlots(data.slots);
      } catch (error) {
        console.error("Error fetching slots:", error);
        setSlots([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (selectedDate) {
      fetchSlots();
    }
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-lg bg-fsa-gray-light animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="mt-4 text-center text-fsa-text-muted py-8">
        Inga tider tillgängliga för detta datum
      </div>
    );
  }

  return (
    <div className="mt-4 animate-fade-in">
      <h3 className="text-sm font-medium text-fsa-text-muted mb-3">
        Välj tid
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlot?.id === slot.id;

          return (
            <button
              key={slot.id}
              onClick={() => slot.available && onSlotSelect(slot)}
              disabled={!slot.available}
              className={`
                relative py-3 px-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${
                  isSelected
                    ? "bg-fsa-red text-white"
                    : slot.available
                    ? "bg-fsa-dark text-fsa-text hover:bg-fsa-gray-light border border-fsa-gray-light hover:border-fsa-red/50"
                    : "bg-fsa-darker text-fsa-text-dim cursor-not-allowed line-through border border-fsa-gray-light/30"
                }
              `}
            >
              {slot.time}
              {isSelected && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-fsa-red"
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
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
