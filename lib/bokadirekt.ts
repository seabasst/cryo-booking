import type {
  TimeSlot,
  AvailableSlotsResponse,
  BookingConfirmation,
  BookingData,
} from "./types";
import { getServiceById, TREATMENT_FAMILIES } from "./services";
import { getActiveOwnBookingsForDate } from "./stripe";
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

interface RawAvailability {
  date: string;
  bookableMinutes: number;
  bookedMinutes: number;
  absenceMinutes: number;
  lunchMinutes: number;
  attendanceMinutes: number;
}

interface RawResource {
  resourceId: string;
  resourceName: string;
  bookableOnline: boolean;
  availabilities: RawAvailability[] | null;
}

async function fetchResourceAvailability(
  startDate: string,
  endDate: string
): Promise<RawResource[]> {
  const key = process.env.BOKADIREKT_API_KEY;
  if (!key) return [];

  // EndDate is exclusive too — add 1 day
  const next = new Date(`${endDate}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const endExclusive = next.toISOString().slice(0, 10);

  const url = `${BASE_URL}/api/v1/resources?StartDate=${startDate}&EndDate=${endExclusive}`;
  const res = await fetch(url, {
    headers: { "X-API-Key": key },
    next: { revalidate: 300 }, // 5 min cache — resource schedules change infrequently
  });
  if (!res.ok) {
    console.error(`Bokadirekt resources fetch failed: ${res.status}`);
    return [];
  }
  return (await res.json()) as RawResource[];
}

async function fetchBookingsForDate(
  date: string,
  strict = false // throw instead of returning [] — callers that must not mistake an outage for "no bookings"
): Promise<RawBooking[]> {
  const key = process.env.BOKADIREKT_API_KEY;
  if (!key) {
    if (strict) throw new Error("BOKADIREKT_API_KEY not configured");
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
    if (strict) throw new Error(`Bokadirekt bookings fetch failed: ${res.status}`);
    return [];
  }

  const data = (await res.json()) as RawBooking[];
  return data.filter((b) => !b.cancelled);
}

// ============================================
// Slot computation
// ============================================

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
    {
      bokadirektServiceId: string;
      bokadirektServiceName: string;
      publicServiceId?: number;
    }
  >;
}

const typedMapping = mapping as MappingFile;

// Bokadirekt's public booking page computes real bookable times from staff
// shifts, absence and per-service buffer time. The documented external API
// only exposes minutes per day, so slot times come from here.
// ponytail: undocumented endpoint (what bokadirekt.se itself calls). If it
// changes or fails we show no times rather than wrong ones.
const PUBLIC_PLACE_ID = 55818;

interface PublicSlot {
  start: string; // "2026-10-21T09:00:00+02:00"
  duration: number; // minutes, incl. Bokadirekt buffer
  employeeId: number;
}

async function fetchPublicSlots(
  publicServiceId: number,
  date: string
): Promise<PublicSlot[]> {
  // Returns the Mon-Sun week containing this timestamp
  const weekMs = Date.parse(`${date}T00:00:00Z`);
  const res = await fetch(
    `https://www.bokadirekt.se/api/book/${publicServiceId}/${PUBLIC_PLACE_ID}/${weekMs}/0?reborn=true`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`Bokadirekt public slots failed: ${res.status}`);
  const data = await res.json();
  const all: PublicSlot[] = data?.availability?.fromErp ?? [];
  return all.filter((s) => s.start.slice(0, 10) === date);
}

/**
 * Slots for a service on a date = Bokadirekt's own free times, minus our
 * paid/in-checkout bookings that staff have not entered in Bokadirekt yet.
 */
export async function getAvailableSlots(
  date: string,
  serviceId?: string
): Promise<AvailableSlotsResponse> {
  if (!serviceId) return { date, slots: [] };

  const publicServiceId = typedMapping.serviceMap[serviceId]?.publicServiceId;
  const familyId = findFamilyForService(serviceId);
  if (!publicServiceId || !familyId) return { date, slots: [] };

  const [publicSlots, ownBookings, bdBookings] = await Promise.all([
    fetchPublicSlots(publicServiceId, date).catch((err) => {
      console.error(err);
      return [] as PublicSlot[];
    }),
    getActiveOwnBookingsForDate(date),
    fetchBookingsForDate(date),
  ]);

  // Own bookings already in Bokadirekt are already gone from publicSlots
  const pendingOwn = findUnsynced(
    ownBookings
      .filter((b) => findFamilyForService(b.serviceId) === familyId)
      .map((b) => ({ ...b, date })),
    bdBookings
  ).map((b) => [parseHm(b.time), parseHm(b.time) + b.duration] as [number, number]);

  // Capacity per start time = number of staff/resources offering it
  const byTime = new Map<string, { employees: Set<number>; duration: number }>();
  for (const s of publicSlots) {
    const time = s.start.slice(11, 16);
    const entry = byTime.get(time) ?? { employees: new Set(), duration: s.duration };
    entry.employees.add(s.employeeId);
    byTime.set(time, entry);
  }

  const slots: TimeSlot[] = Array.from(byTime.keys())
    .sort()
    .map((time) => {
      const { employees, duration } = byTime.get(time)!;
      const interval: [number, number] = [parseHm(time), parseHm(time) + duration];
      const conflicts = pendingOwn.filter((b) => overlaps(interval, b)).length;
      return {
        id: `slot-${date}-${time.replace(":", "")}`,
        time,
        available: employees.size > conflicts,
      };
    });

  return { date, slots };
}

// ============================================
// Availability by date range (for calendar)
// ============================================

/**
 * For a given service and date range, return which dates have at least one
 * capable resource with bookableMinutes > 0 (i.e. not on vacation/sick).
 * Returns { "2026-07-14": true, "2026-07-15": false, ... }
 */
export async function getOpenDaysForService(
  serviceId: string,
  startDate: string,
  endDate: string
): Promise<Record<string, boolean>> {
  const familyId = findFamilyForService(serviceId);
  if (!familyId) return {};

  const family = typedMapping.families[familyId];
  if (!family) return {};

  const capableResourceIds = new Set(family.bokadirektResourceIds);

  const resources = await fetchResourceAvailability(startDate, endDate);

  // Build set of dates where at least one capable resource has capacity
  const openDates = new Set<string>();
  for (const r of resources) {
    if (!capableResourceIds.has(r.resourceId)) continue;
    if (!r.bookableOnline) continue;
    for (const a of r.availabilities ?? []) {
      if (a.bookableMinutes > 0) openDates.add(a.date.slice(0, 10));
    }
  }

  // Iterate every date in the requested range — dates without an entry
  // are treated as closed (resource not scheduled that day)
  const byDate: Record<string, boolean> = {};
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  for (
    let d = new Date(start);
    d.getTime() <= end.getTime();
    d.setUTCDate(d.getUTCDate() + 1)
  ) {
    const ymd = d.toISOString().slice(0, 10);
    byDate[ymd] = openDates.has(ymd);
  }
  return byDate;
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

// ============================================
// Sync check: paid online bookings not yet entered in Bokadirekt
// ============================================

export interface PaidBooking {
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  customerName: string;
}

const SYNC_TOLERANCE_MIN = 15;

/**
 * A paid booking counts as entered when Bokadirekt has a non-cancelled
 * booking on one of the family's resources starting within ±15 min.
 */
export function findUnsynced<
  T extends Pick<PaidBooking, "serviceId" | "date" | "time">
>(
  paid: T[],
  bdBookings: Pick<RawBooking, "resourceId" | "startDate" | "cancelled">[]
): T[] {
  return paid.filter((p) => {
    const familyId = findFamilyForService(p.serviceId);
    const resources = familyId
      ? typedMapping.families[familyId]?.bokadirektResourceIds ?? []
      : [];
    const start = parseHm(p.time);
    return !bdBookings.some(
      (b) =>
        !b.cancelled &&
        resources.includes(b.resourceId) &&
        b.startDate.slice(0, 10) === p.date &&
        Math.abs(parseHm(b.startDate.slice(11, 16)) - start) <=
          SYNC_TOLERANCE_MIN
    );
  });
}
// ponytail: a member booking on the same resource+time also counts as
// "entered" — that case is a double booking anyway and staff will see it.

export async function getUnsyncedPaidBookings(
  paid: PaidBooking[]
): Promise<PaidBooking[]> {
  const dates = Array.from(new Set(paid.map((p) => p.date)));
  const perDate = await Promise.all(
    dates.map((d) => fetchBookingsForDate(d, true))
  );
  return findUnsynced(paid, perDate.flat());
}
