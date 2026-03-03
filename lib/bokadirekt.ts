import type { TimeSlot, AvailableSlotsResponse, BookingConfirmation, BookingData } from "./types";

// ============================================
// Bokadirekt API Client (Mock Implementation)
// ============================================

/**
 * Hämtar tillgängliga tider för ett specifikt datum
 */
export async function getAvailableSlots(
  date: string
): Promise<AvailableSlotsResponse> {
  // TODO: Ersätt med Bokadirekt M3 API
  // const response = await fetch(
  //   `${process.env.BOKADIREKT_API_URL}/api/v1/availability?date=${date}&businessId=${process.env.BOKADIREKT_BUSINESS_ID}`,
  //   {
  //     headers: {
  //       'Authorization': `Bearer ${process.env.BOKADIREKT_API_KEY}`,
  //       'Content-Type': 'application/json',
  //     },
  //   }
  // );
  //
  // if (!response.ok) {
  //   throw new Error(`Bokadirekt API error: ${response.status}`);
  // }
  //
  // const data = await response.json();
  // return {
  //   date,
  //   slots: data.availableSlots.map((slot: any) => ({
  //     id: slot.id,
  //     time: slot.startTime,
  //     available: slot.isAvailable,
  //   })),
  // };

  return {
    date,
    slots: generateMockSlots(date),
  };
}

/**
 * Skapar en bokning i Bokadirekt-systemet
 */
export async function createBooking(params: BookingData): Promise<BookingConfirmation> {
  // TODO: Ersätt med Bokadirekt M3 API
  // const response = await fetch(
  //   `${process.env.BOKADIREKT_API_URL}/api/v1/bookings`,
  //   {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${process.env.BOKADIREKT_API_KEY}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       businessId: process.env.BOKADIREKT_BUSINESS_ID,
  //       serviceId: params.serviceId,
  //       slotId: params.slotId,
  //       date: params.date,
  //       customer: {
  //         name: params.customerName,
  //         email: params.customerEmail,
  //         phone: params.customerPhone,
  //       },
  //     }),
  //   }
  // );
  //
  // if (!response.ok) {
  //   throw new Error(`Bokadirekt booking error: ${response.status}`);
  // }
  //
  // const data = await response.json();
  // return {
  //   bookingId: data.bookingId,
  //   serviceName: data.serviceName,
  //   date: data.date,
  //   time: data.time,
  //   customerName: data.customer.name,
  //   customerEmail: data.customer.email,
  //   customerPhone: data.customer.phone,
  //   price: data.price,
  // };

  // Mock implementation - logga och returnera mock-data
  const bookingId = `BK${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  console.log("📅 MOCK BOOKING CREATED:", {
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

// ============================================
// Mock Data Generator
// ============================================

/**
 * Genererar mock-tidsluckor för ett datum
 * Tidsluckor var 30:e minut från 09:00 till 18:00
 * ~20% av tiderna markeras som unavailable för realism
 */
function generateMockSlots(date: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 18;

  // Använd datumet som seed för konsistent "randomness" per dag
  const dateSeed = date.split("-").join("");
  const seedNumber = parseInt(dateSeed, 10);

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const slotIndex = (hour - startHour) * 2 + minute / 30;

      // Pseudo-random baserat på datum och slot för konsistent beteende
      const pseudoRandom =
        ((seedNumber * (slotIndex + 1) * 17) % 100) / 100;
      const isAvailable = pseudoRandom > 0.2; // ~80% available, ~20% unavailable

      slots.push({
        id: `slot-${date}-${timeString.replace(":", "")}`,
        time: timeString,
        available: isAvailable,
      });
    }
  }

  return slots;
}

// ============================================
// Helper: Hämta antal lediga tider för ett datum
// ============================================
export async function getAvailableCount(date: string): Promise<number> {
  const { slots } = await getAvailableSlots(date);
  return slots.filter((slot) => slot.available).length;
}
