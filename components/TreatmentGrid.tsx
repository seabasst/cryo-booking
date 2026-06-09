"use client";

import Image from "next/image";
import { TREATMENT_FAMILIES } from "@/lib/services";
import type { TreatmentFamily } from "@/lib/types";

interface TreatmentGridProps {
  onFamilySelect: (family: TreatmentFamily) => void;
}

export default function TreatmentGrid({ onFamilySelect }: TreatmentGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {TREATMENT_FAMILIES.map((family) => (
        <button
          key={family.id}
          onClick={() => onFamilySelect(family)}
          className="group text-left bg-fsa-gray border border-fsa-gray-light rounded-2xl overflow-hidden
            hover:border-fsa-red/60 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]
            transition-all duration-300 flex flex-col"
        >
          {/* Image */}
          <div className="relative w-full aspect-[4/3] bg-fsa-dark overflow-hidden">
            <Image
              src={family.image}
              alt={family.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col flex-1">
            <h3 className="text-xl font-semibold text-fsa-text mb-2 tracking-tight">
              {family.name}
            </h3>
            <p className="text-fsa-text-muted text-sm leading-relaxed mb-4 flex-1">
              {family.description}
            </p>

            {/* Pricing tiers */}
            <div className="mb-5 -mx-1 flex flex-wrap gap-1.5">
              {family.priceTiers.map((tier, i) => (
                <div
                  key={i}
                  className={`
                    inline-flex items-baseline gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                    ${
                      tier.highlight
                        ? "bg-fsa-red/20 border border-fsa-red/50 text-fsa-red-light"
                        : "bg-fsa-dark border border-fsa-gray-light text-fsa-text"
                    }
                  `}
                >
                  <span
                    className={
                      tier.highlight ? "text-fsa-red-light" : "text-fsa-text-muted"
                    }
                  >
                    {tier.label}
                  </span>
                  <span className="font-bold">
                    {tier.price.toLocaleString("sv-SE")} kr
                  </span>
                </div>
              ))}
            </div>

            <span
              className="inline-flex items-center justify-center gap-2 mt-auto
                px-4 py-2.5 rounded-lg bg-fsa-red text-white text-sm font-semibold tracking-wide uppercase
                group-hover:bg-fsa-red-dark transition-colors"
            >
              Boka här
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
