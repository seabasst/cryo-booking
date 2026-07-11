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

  // Default filter is by scheduled start date. FilterDateType=1 would filter
  // by created date and miss future bookings — do NOT set it.
  // EndDate is EXCLUSIVE — StartDate=X EndDate=X returns 0. Use next day.
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const endDate = next.toISOString().slice(0, 10);
  const url = `${BASE_URL}/api/v1/bookings?StartDate=${date}&EndDate=${endDate}`;
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
  serviceMap: Record<
    string,
    { bokadirektServiceId: string; bokadirektServiceName: string }
  >;
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

  // For each candidate slot time, track: is it within ANY capable resource's
  // working hours (i.e. worth showing), and is at least one such resource free?
  const timeState = new Map<string, { withinHours: boolean; anyFree: boolean }>();

  for (const rid of family.bokadirektResourceIds) {
    const res = typedMapping.resources[rid];
    if (!res || !res.bookableOnline) continue;

    const hours = res.hoursByWeekday[weekday];
    if (!hours) continue;

    const open = parseHm(hours.open);
    const close = parseHm(hours.close);
    if (close - open < duration) continue;

    const busy = (bookingsByResource.get(rid) ?? []).map(bookingInterval);

    for (
      let start = open;
      start + duration <= close;
      start += SLOT_GRANULARITY_MIN
    ) {
      const key = fmtHm(start);
      const state = timeState.get(key) ?? { withinHours: false, anyFree: false };
      state.withinHours = true;
      if (!state.anyFree) {
        const interval: [number, number] = [start, start + duration];
        state.anyFree = !busy.some((b) => overlaps(interval, b));
      }
      timeState.set(key, state);
    }
  }

  const sortedTimes = Array.from(timeState.keys()).sort();
  const slots: TimeSlot[] = sortedTimes
    .filter((t) => timeState.get(t)!.withinHours)
    .map((time) => ({
      id: `slot-${date}-${time.replace(":", "")}`,
      time,
      available: timeState.get(time)!.anyFree,
    }));

  return { date, slots };
}

// ============================================
// Bokadirekt lookup helpers (for enriching business email)
// ============================================

export function getBokadirektServiceInfo(ourServiceId: string) {
  return typedMapping.serviceMap[ourServiceId] ?? null;
}

/**
 * Suggest which capable resources are free for a specific service at a
 * specific date+time. Returns resource display names in the order most
 * likely to be assigned (first: the primary resource for that family).
 */
export async function suggestAvailableResources(
  date: string,
  time: string,
  ourServiceId: string
): Promise<string[]> {
  const svcLookup = getServiceById(ourServiceId);
  if (!svcLookup) return [];
  const { service } = svcLookup;

  const familyId = findFamilyForService(ourServiceId);
  if (!familyId) return [];

  const family = typedMapping.families[familyId];
  if (!family) return [];

  const startMin = parseHm(time);
  const endMin = startMin + service.duration;
  const target: [number, number] = [startMin, endMin];

  const allBookings = await fetchBookingsForDate(date);
  const bookingsByResource = new Map<string, RawBooking[]>();
  for (const b of allBookings) {
    const arr = bookingsByResource.get(b.resourceId) ?? [];
    arr.push(b);
    bookingsByResource.set(b.resourceId, arr);
  }

  const free: string[] = [];
  for (const rid of family.bokadirektResourceIds) {
    const res = typedMapping.resources[rid];
    if (!res) continue;
    const busy = (bookingsByResource.get(rid) ?? []).map(bookingInterval);
    const conflict = busy.some((b) => overlaps(target, b));
    if (!conflict) {
      free.push(res.nickname || res.name);
    }
  }
  return free;
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
