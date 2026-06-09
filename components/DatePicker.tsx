"use client";

import { useMemo, useState } from "react";

interface DatePickerProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

const DAYS_SV = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];
const MONTHS_SV = [
  "Januari",
  "Februari",
  "Mars",
  "April",
  "Maj",
  "Juni",
  "Juli",
  "Augusti",
  "September",
  "Oktober",
  "November",
  "December",
];

const MAX_MONTHS_AHEAD = 2;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DatePicker({
  selectedDate,
  onDateSelect,
}: DatePickerProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => {
    // Allow up to last day of (today.month + MAX_MONTHS_AHEAD)
    const lastMonthStart = addMonths(today, MAX_MONTHS_AHEAD);
    return new Date(
      lastMonthStart.getFullYear(),
      lastMonthStart.getMonth() + 1,
      0 // last day of that month
    );
  }, [today]);

  const [viewMonth, setViewMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const canGoPrev =
    viewMonth.getFullYear() > today.getFullYear() ||
    viewMonth.getMonth() > today.getMonth();

  const canGoNext =
    viewMonth.getFullYear() < maxDate.getFullYear() ||
    (viewMonth.getFullYear() === maxDate.getFullYear() &&
      viewMonth.getMonth() < maxDate.getMonth());

  // Build calendar grid: 6 rows × 7 cols, padded from previous/next month
  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // JS getDay(): Sun=0..Sat=6. We want Mon-first → shift.
    const jsWeekday = firstOfMonth.getDay();
    const leadingBlanks = (jsWeekday + 6) % 7; // Mon=0..Sun=6

    const arr: Array<{ date: Date | null; ymd: string | null }> = [];
    for (let i = 0; i < leadingBlanks; i++) {
      arr.push({ date: null, ymd: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      arr.push({ date, ymd: formatYmd(date) });
    }
    // Fill to multiple of 7
    while (arr.length % 7 !== 0) {
      arr.push({ date: null, ymd: null });
    }
    return arr;
  }, [viewMonth]);

  const handlePrev = () => {
    if (canGoPrev) setViewMonth(addMonths(viewMonth, -1));
  };
  const handleNext = () => {
    if (canGoNext) setViewMonth(addMonths(viewMonth, 1));
  };

  return (
    <div className="bg-fsa-dark border border-fsa-gray-light rounded-xl p-4 sm:p-5">
      {/* Header — month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="Föregående månad"
          className="w-9 h-9 rounded-lg flex items-center justify-center
            text-fsa-text disabled:text-fsa-text-dim
            hover:bg-fsa-gray disabled:hover:bg-transparent
            disabled:cursor-not-allowed transition-colors"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-fsa-text font-semibold text-base sm:text-lg">
          {MONTHS_SV[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </div>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          aria-label="Nästa månad"
          className="w-9 h-9 rounded-lg flex items-center justify-center
            text-fsa-text disabled:text-fsa-text-dim
            hover:bg-fsa-gray disabled:hover:bg-transparent
            disabled:cursor-not-allowed transition-colors"
        >
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_SV.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] sm:text-xs font-medium text-fsa-text-muted uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((cell, i) => {
          if (!cell.date || !cell.ymd) {
            return <div key={`blank-${i}`} className="aspect-square" />;
          }
          const isPast = cell.date < today;
          const isFuture = cell.date > maxDate;
          const isDisabled = isPast || isFuture;
          const isToday = isSameDay(cell.date, today);
          const isSelected = selectedDate === cell.ymd;

          return (
            <button
              key={cell.ymd}
              type="button"
              onClick={() => !isDisabled && onDateSelect(cell.ymd!)}
              disabled={isDisabled}
              className={`
                aspect-square rounded-lg text-sm sm:text-base font-medium
                transition-all duration-150 relative
                ${
                  isSelected
                    ? "bg-fsa-red text-white shadow-lg shadow-fsa-red/30 scale-105"
                    : isDisabled
                    ? "text-fsa-text-dim/50 cursor-not-allowed"
                    : "text-fsa-text hover:bg-fsa-gray hover:scale-105"
                }
                ${
                  isToday && !isSelected
                    ? "ring-1 ring-fsa-red/60"
                    : ""
                }
              `}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>

      <p className="text-[11px] text-fsa-text-dim mt-4 text-center">
        Boka upp till 2 månader framåt
      </p>
    </div>
  );
}
