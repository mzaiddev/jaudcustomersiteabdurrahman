// Customer-side data model. Field names and enums mirror the admin app
// (admin/jaud-admin/src/api/types.ts) so a booking made here renders in the admin as-is.
// Money is SAR in major units, VAT-inclusive. Times are ISO 8601 with offset (Asia/Riyadh).

export type L10n = { ar: string; en: string };

export type LocationId = "khobar" | "riyadh" | "jazan";

export type Location = {
  id: LocationId;
  adminId: string;
  name: L10n;
  active: boolean;
  area?: { lat: number; lng: number; radiusKm: number };
};

export type Service = {
  id: string;
  adminId: string;
  name: L10n;
  description: L10n;
  price: number;
  minutes: number;
  locationIds: LocationId[];
  vip: boolean;
  active: boolean;
};

export type SpaPackage = {
  id: string;
  adminId: string;
  name: L10n;
  description: L10n;
  price: number;
  sessions: number;
  guests: number;
  extraGuestPrice: number;
  minutes: number;
  serviceId?: string;
  validityMonths: number;
  locationIds: LocationId[];
  vip: boolean;
  active: boolean;
};

export type ScheduleDay = {
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  working: boolean;
  start: string;
  end: string;
  locationId?: LocationId;
};

export type Leave = { id: string; from: string; to: string; reason: string };

export type Specialist = {
  id: string;
  name: L10n;
  locationIds: LocationId[];
  serviceIds: string[];
  travelGapMinutes: number;
  schedule: ScheduleDay[];
  leaves: Leave[];
  active: boolean;
  /** Key into siteAssets.images when a portrait exists. */
  photo?: "specialistSara" | "specialistNoura" | "specialistMaryam";
};

export type Address = {
  id: string;
  label: string;
  district: string;
  street: string;
  building: string;
  notes?: string;
  lat?: number;
  lng?: number;
  locationId: LocationId;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  addresses: Address[];
  createdAt: string;
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";
export type BookingSource = "online" | "whatsapp" | "phone";
export type PaymentMethod = "online" | "cash" | "transfer" | "card_link";

export type HistoryEntry = { at: string; by: string; action: string; note?: string };

export type Booking = {
  id: string;
  ref: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  source: BookingSource;
  locationId: LocationId;
  serviceId?: string;
  packageId?: string;
  entitlementId?: string;
  specialistId: string;
  customerId: string;
  customer: { name: string; phone: string };
  address: Address;
  startsAt: string;
  endsAt: string;
  guests: number;
  price: number;
  notes?: string;
  followUp?: string;
  history: HistoryEntry[];
  createdAt: string;
};

export type LedgerType = "purchased" | "reserved" | "used" | "released" | "adjusted";

export type LedgerEntry = {
  id: string;
  at: string;
  type: LedgerType;
  delta: number;
  bookingId?: string;
  by: string;
  reason: string;
};

export type Entitlement = {
  id: string;
  ref: string;
  packageId: string;
  customerId: string;
  locationId: LocationId;
  purchasedAt: string;
  expiresAt: string;
  sessionsTotal: number;
  sessionsUsed: number;
  sessionsReserved: number;
  price: number;
  paymentStatus: PaymentStatus;
  ledger: LedgerEntry[];
};

export type EntitlementState = "active" | "used_up" | "expired" | "unpaid";

export type Payment = {
  id: string;
  ref: string;
  createdAt: string;
  kind: "booking" | "package";
  bookingId?: string;
  entitlementId?: string;
  customerId: string;
  locationId: LocationId;
  amount: number;
  refundedAmount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  providerRef?: string;
};

export type SlotOption = { startsAt: string; endsAt: string; specialistIds: string[] };

export type SlotQuery = {
  locationId: LocationId;
  serviceId?: string;
  packageId?: string;
  date: string;
  guests?: number;
  excludeBookingId?: string;
};

export type NewBookingInput = {
  locationId: LocationId;
  serviceId?: string;
  packageId?: string;
  entitlementId?: string;
  specialistId: string | "any";
  startsAt: string;
  guests: number;
  address: Omit<Address, "id"> & { id?: string };
  notes?: string;
};

export type Db = {
  version: number;
  customers: Customer[];
  bookings: Booking[];
  entitlements: Entitlement[];
  payments: Payment[];
  /** Customer id of the signed-in customer, if any. */
  sessionCustomerId: string | null;
};

export type EngineErrorCode =
  | "VALIDATION_FAILED"
  | "SLOT_UNAVAILABLE"
  | "OUT_OF_COVERAGE"
  | "PACKAGE_SESSIONS_EXHAUSTED"
  | "PACKAGE_EXPIRED"
  | "CONFLICT"
  | "NOT_FOUND"
  | "PAYMENT_FAILED"
  | "OTP_INVALID";

export class EngineError extends Error {
  code: EngineErrorCode;
  detail?: string;

  constructor(code: EngineErrorCode, detail?: string) {
    super(detail ? `${code}:${detail}` : code);
    this.code = code;
    this.detail = detail;
  }
}
