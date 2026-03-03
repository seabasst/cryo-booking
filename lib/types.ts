// ============================================
// Types
// ============================================

export interface Service {
  id: string;
  name: string;
  duration: number; // minuter
  price: number; // SEK
  description?: string;
  popular?: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string; // emoji eller icon-namn
  services: Service[];
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  slots: TimeSlot[];
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface BookingData {
  serviceId: string;
  serviceName: string;
  duration: number;
  price: number;
  slotId: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface CreateCheckoutRequest extends BookingData {}

export interface CreateCheckoutResponse {
  url: string;
}

export interface BookingConfirmation {
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  price: number;
}

// ============================================
// Booking Step Types
// ============================================
export type BookingStep = 1 | 2 | 3 | 4;

export interface DateOption {
  date: string; // YYYY-MM-DD
  dayName: string; // "Mån", "Tis", etc.
  dayNumber: number; // 12
  month: string; // "Feb"
  availableCount: number;
}
