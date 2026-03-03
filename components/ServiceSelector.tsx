"use client";

import { useState } from "react";
import type { Service } from "@/lib/types";
import { SERVICE_CATEGORIES } from "@/lib/services";

interface ServiceSelectorProps {
  initialCategory?: string;
  onServiceSelect: (service: Service) => void;
}

export default function ServiceSelector({
  initialCategory,
  onServiceSelect,
}: ServiceSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || SERVICE_CATEGORIES[0].id
  );

  const currentCategory = SERVICE_CATEGORIES.find(
    (c) => c.id === activeCategory
  );

  return (
    <div className="animate-fade-in">
      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
        {SERVICE_CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-300 flex items-center gap-2
                ${
                  isActive
                    ? "bg-fsa-red text-white"
                    : "bg-fsa-gray-light text-fsa-text-muted hover:text-fsa-text hover:bg-fsa-dark"
                }
              `}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Services List */}
      <div className="space-y-2">
        {currentCategory?.services.map((service) => (
          <button
            key={service.id}
            onClick={() => onServiceSelect(service)}
            className="w-full p-4 rounded-lg bg-fsa-dark border border-fsa-gray-light
              hover:border-fsa-red/50 hover:bg-fsa-gray transition-all duration-200
              text-left group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-fsa-text group-hover:text-fsa-red transition-colors">
                    {service.name}
                  </h3>
                  {service.popular && (
                    <span className="px-2 py-0.5 rounded-full bg-fsa-red/20 text-fsa-red text-xs">
                      Populär
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-fsa-text-muted">
                    {service.duration} min
                  </span>
                  {service.description && (
                    <>
                      <span className="text-fsa-text-dim">•</span>
                      <span className="text-sm text-fsa-text-muted">
                        {service.description}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-fsa-red">
                  {service.price.toLocaleString("sv-SE")} kr
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
