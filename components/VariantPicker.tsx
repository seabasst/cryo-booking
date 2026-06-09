"use client";

import { useMemo } from "react";
import { getServicesForFamily } from "@/lib/services";
import type { Service, TreatmentFamily } from "@/lib/types";
import BackBar from "./BackBar";

interface VariantPickerProps {
  family: TreatmentFamily;
  onVariantSelect: (service: Service) => void;
  onBack: () => void;
}

// Try to group services by subtype (e.g. all "Deep Tissue X min" together)
function groupServices(services: Service[]) {
  const groups: Record<string, Service[]> = {};
  for (const s of services) {
    // Strip trailing duration like "25 min" / "45 min" to derive subtype name
    const subtype = s.name.replace(/\s+\d+\s*min\s*$/i, "").trim();
    if (!groups[subtype]) groups[subtype] = [];
    groups[subtype].push(s);
  }
  return groups;
}

export default function VariantPicker({
  family,
  onVariantSelect,
  onBack,
}: VariantPickerProps) {
  const services = useMemo(() => getServicesForFamily(family.id), [family.id]);
  const groups = useMemo(() => groupServices(services), [services]);
  const groupKeys = Object.keys(groups);

  return (
    <div className="animate-fade-in">
      <BackBar label="behandlingar" onBack={onBack} />
      <h2 className="text-xl font-semibold text-fsa-text mb-2">{family.name}</h2>
      <p className="text-sm text-fsa-text-muted mb-5">{family.description}</p>

      <div className="space-y-5">
        {groupKeys.map((groupName) => {
          const groupServices = groups[groupName];
          // If only one service in this group, show as a flat row.
          if (groupServices.length === 1) {
            const s = groupServices[0];
            return (
              <VariantRow
                key={s.id}
                service={s}
                onSelect={() => onVariantSelect(s)}
                showName={groupKeys.length > 1}
              />
            );
          }
          return (
            <div key={groupName}>
              <p className="text-xs font-semibold text-fsa-text-muted uppercase tracking-wider mb-2">
                {groupName}
              </p>
              <div className="space-y-2">
                {groupServices.map((s) => (
                  <VariantRow
                    key={s.id}
                    service={s}
                    onSelect={() => onVariantSelect(s)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VariantRow({
  service,
  onSelect,
  showName = true,
}: {
  service: Service;
  onSelect: () => void;
  showName?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center justify-between gap-3 p-3 rounded-lg
        bg-fsa-dark border border-fsa-gray-light hover:border-fsa-red/60
        transition-all duration-200 text-left"
    >
      <div className="min-w-0">
        <p className="text-fsa-text font-medium text-sm truncate">
          {showName ? service.name : `${service.duration} min`}
        </p>
        {service.description && (
          <p className="text-fsa-text-dim text-xs truncate">
            {service.description}
          </p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-fsa-red font-bold text-sm">
          {service.price.toLocaleString("sv-SE")} kr
        </p>
        {showName && (
          <p className="text-fsa-text-dim text-[10px]">
            {service.duration} min
          </p>
        )}
      </div>
    </button>
  );
}
