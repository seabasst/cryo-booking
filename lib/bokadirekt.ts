import type {
  TimeSlot,
  AvailableSlotsResponse,
  BookingConfirmation,
  BookingData,
} from "./types";
import { getServiceById, TREATMENT_FAMILIES } from "./services";
import mapping from "./bokadirekt-mapping.json";

// ============================================
// Bokadirekt API — real client (M3 External API)
// ============================================

const BASE_URL =
  process.env.BOKADIREKT_API_URL ||
  "https://external.api.portal.bokadirekt.se";

interface RawBooking {
  bookingId: string;
  resourceId: string;
  serviceId: string;
  startDate: string; // "2026-04-27T13:10:00"
  endDate: string;
  cancelled: boolean;
}

async function fetchBookingsForDate(date: string): Promise<RawBooking[]> {
  const key = process.env.BOKADIREKT_API_KEY;
  if (!key) {
    console.warn("BOKADIREKT_API_KEY not configured — skipping API call");
    return [];
  }

  // FilterDateType=1 = filter by scheduled start date
  const url = `${BASE_URL}/api/v1/bookings?FilterDateType=1&StartDate=${date}&EndDate=${date}`;
  const res = await fetch(url, {
    headers: { "X-API-Key": key },
    // Revalidate every 60s at the Next.js data-cache layer
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error(`Bokadirekt bookings fetch failed: ${res.status}`);
    return [];
  }

  const data = (await res.json()) as RawBooking[];
  return data.filter((b) => !b.cancelled);
}

// ============================================
// Slot computation
// ============================================

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const SLOT_GRANULARITY_MIN = 15;

function findFamilyForService(serviceId: string): string | null {
  for (const family of TREATMENT_FAMILIES) {
    if (family.serviceIds.includes(serviceId)) return family.id;
  }
  return null;
}

function parseHm(hm: string): number {
  // "HH:MM" → minutes since midnight
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function fmtHm(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function bookingInterval(b: RawBooking): [number, number] {
  const s = new Date(b.startDate);
  const e = new Date(b.endDate);
  return [
    s.getHours() * 60 + s.getMinutes(),
    e.getHours() * 60 + e.getMinutes(),
  ];
}

function overlaps(a: [number, number], b: [number, number]): boolean {
  return a[0] < b[1] && b[0] < a[1];
}

interface ResourceMapping {
  name: string;
  nickname: string;
  bookableOnline: boolean;
  hoursByWeekday: Record<string, { open: string; close: string }>;
}

interface FamilyMapping {
  bokadirektFamilyId: string;
  bokadirektServiceIds: string[];
  bokadirektResourceIds: string[];
}

interface MappingFile {
  families: Record<string, FamilyMapping>;
  resources: Record<string, ResourceMapping>;
}

const typedMapping = mapping as MappingFile;

/**
 * Compute available slots for a specific service on a specific date.
 * A slot is "available" if AT LEAST ONE capable resource is free for the
 * full service duration starting at that time.
 */
export async function getAvailableSlots(
  date: string,
  serviceId?: string
): Promise<AvailableSlotsResponse> {
  if (!serviceId) {
    // Backwards-compat: no service picked → return empty; frontend should always pass serviceId now
    return { date, slots: [] };
  }

  const svcLookup = getServiceById(serviceId);
  if (!svcLookup) return { date, slots: [] };
  const { service } = svcLookup;

  const familyId = findFamilyForService(serviceId);
  if (!familyId) return { date, slots: [] };

  const family = typedMapping.families[familyId];
  if (!family || family.bokadirektResourceIds.length === 0) {
    return { date, slots: [] };
  }

  // Which weekday?
  const jsDay = new Date(`${date}T12:00:00`).getDay(); // 0=Sun..6=Sat
  const weekday = WEEKDAYS[(jsDay + 6) % 7]; // shift to Mon=0..Sun=6

  // Fetch all bookings for the date once
  const allBookings = await fetchBookingsForDate(date);

  // Group by resource
  const bookingsByResource = new Map<string, RawBooking[]>();
  for (const b of allBookings) {
    const arr = bookingsByResource.get(b.resourceId) ?? [];
    arr.push(b);
    bookingsByResource.set(b.resourceId, arr);
  }

  const duration = service.duration;
  const availableTimes = new Set<string>();

  for (const rid of family.bokadirektResourceIds) {
    const res = typedMapping.resources[rid];
    if (!res || !res.bookableOnline) continue;

    const hours = res.hoursByWeekday[weekday];
    if (!hours) continue; // resource doesn't work this weekday

    const open = parseHm(hours.open);
    const close = parseHm(hours.close);
    if (close - open < duration) continue;

    const busy = (bookingsByResource.get(rid) ?? []).map(bookingInterval);

    for (
      let start = open;
      start + duration <= close;
      start += SLOT_GRANULARITY_MIN
    ) {
      const interval: [number, number] = [start, start + duration];
      const conflict = busy.some((b) => overlaps(interval, b));
      if (!conflict) availableTimes.add(fmtHm(start));
    }
  }

  // Also compute "shown but greyed-out" past slots so the UI still renders a full day
  // For simplicity, we only return actually-available slots.
  const sorted = Array.from(availableTimes).sort();
  const slots: TimeSlot[] = sorted.map((time) => ({
    id: `slot-${date}-${time.replace(":", "")}`,
    time,
    available: true,
  }));

  return { date, slots };
}

// ============================================
// Booking creation — still mock (Bokadirekt has no public POST /bookings)
// ============================================

export async function createBooking(
  params: BookingData
): Promise<BookingConfirmation> {
  const bookingId = `BK${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  console.log("📅 BOOKING CREATED (Bokadirekt sync via email):", {
    bookingId,
    ...params,
  });

  return {
    bookingId,
    serviceName: params.serviceName,
    date: params.date,
    time: params.time,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone,
    price: params.price,
  };
}

export async function getAvailableCount(
  date: string,
  serviceId?: string
): Promise<number> {
  const { slots } = await getAvailableSlots(date, serviceId);
  return slots.filter((s) => s.available).length;
}
