"use client";

import { useEffect, useState } from "react";
import type { DateOption } from "@/lib/types";

interface DatePickerProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const DAYS_SV = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];
const MONTHS_SV = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Maj",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];

export default function DatePicker({
  selectedDate,
  onDateSelect,
}: DatePickerProps) {
  const [dateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDates() {
      const dates: DateOption[] = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const dateString = date.toISOString().split("T")[0];

        // Hämta antal lediga tider för varje dag
        try {
          const response = await fetch(
            `/api/available-slots?date=${dateString}`
          );
          const data = await response.json();
          const availableCount = data.slots.filter(
            (s: { available: boolean }) => s.available
          ).length;

          dates.push({
            date: dateString,
            dayName: DAYS_SV[date.getDay()],
            dayNumber: date.getDate(),
            month: MONTHS_SV[date.getMonth()],
            availableCount,
          });
        } catch (error) {
          console.error("Error fetching slots for", dateString, error);
          dates.push({
            date: dateString,
            dayName: DAYS_SV[date.getDay()],
            dayNumber: date.getDate(),
            month: MONTHS_SV[date.getMonth()],
            availableCount: 0,
          });
        }
      }

      setDateOptions(dates);
      setIsLoading(false);
    }

    fetchDates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-20 h-24 rounded-lg bg-fsa-gray-light animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {dateOptions.map((option) => {
        const isSelected = selectedDate === option.date;
        const hasSlots = option.availableCount > 0;

        return (
          <button
            key={option.date}
            onClick={() => hasSlots && onDateSelect(option.date)}
            disabled={!hasSlots}
            className={`
              flex-shrink-0 w-20 p-3 rounded-lg transition-all duration-300
              flex flex-col items-center gap-1
              ${
                isSelected
                  ? "bg-fsa-red text-white"
                  : hasSlots
                  ? "bg-fsa-dark border border-fsa-gray-light hover:border-fsa-red/50"
                  : "bg-fsa-darker border border-fsa-gray-light/50 opacity-50 cursor-not-allowed"
              }
            `}
          >
            <span
              className={`text-xs font-medium ${
                isSelected ? "text-white/80" : "text-fsa-text-muted"
              }`}
            >
              {option.dayName}
            </span>
            <span
              className={`text-2xl font-bold ${
                isSelected ? "text-white" : "text-fsa-text"
              }`}
            >
              {option.dayNumber}
            </span>
            <span
              className={`text-xs ${
                isSelected ? "text-white/80" : "text-fsa-text-muted"
              }`}
            >
              {option.month}
            </span>
            <span
              className={`text-[10px] mt-1 ${
                isSelected
                  ? "text-white/70"
                  : hasSlots
                  ? "text-fsa-red"
                  : "text-fsa-text-dim"
              }`}
            >
              {hasSlots ? `${option.availableCount} tider` : "Fullbokat"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
