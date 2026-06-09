"use client";

interface BackBarProps {
  label: string;
  onBack: () => void;
}

export default function BackBar({ label, onBack }: BackBarProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="group inline-flex items-center gap-2 mb-4 -ml-1 px-2 py-1.5 rounded-md
        text-sm font-medium text-fsa-text-muted hover:text-fsa-red
        hover:bg-fsa-gray-light/40 transition-colors"
    >
      <svg
        className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
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
      Tillbaka till {label}
    </button>
  );
}
